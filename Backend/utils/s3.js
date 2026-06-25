import { randomUUID } from 'crypto';
import path from 'path';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { checkExplicitContent, analyzeImageText } from './moderation.js';
import { prepareForRekognition, prepareForStorage } from './imagePrep.js';
import {
  getImageRejectionLabel,
  getImageRejectionMessage,
  buildPropertyRejectionMessage,
  buildPartialRejectionSummary,
} from './moderationMessages.js';

const FOLDER_PREFIX = 'properties/';
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

let s3Client;

function getS3Client() {
  if (!s3Client) {
    s3Client = new S3Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });
  }
  return s3Client;
}

function getExtension(originalFilename) {
  const ext = path.extname(originalFilename).toLowerCase();
  if (['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) {
    return ext === '.jpeg' ? '.jpg' : ext;
  }
  return '.jpg';
}

function buildPublicUrl(key) {
  const bucket = process.env.AWS_BUCKET;
  const region = process.env.AWS_REGION;
  return `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
}

function extractS3KeyFromUrl(imageUrl) {
  if (!imageUrl || typeof imageUrl !== 'string') return null;
  const trimmed = imageUrl.trim();
  if (!/^https?:\/\//i.test(trimmed)) return null;
  try {
    const url = new URL(trimmed);
    const key = decodeURIComponent(url.pathname.replace(/^\//, ''));
    return key || null;
  } catch {
    return null;
  }
}

/**
 * Upload a single image buffer to S3.
 * @returns {{ url: string, bucket: string, key: string }}
 */
export async function uploadImageToS3(fileBuffer, originalFilename, mimetype) {
  if (!fileBuffer?.length) {
    throw new Error('Empty file upload');
  }
  if (!ALLOWED_MIME_TYPES.includes(mimetype)) {
    throw new Error('Only image files are allowed (jpeg, jpg, png, webp)');
  }
  if (!process.env.AWS_BUCKET || !process.env.AWS_REGION) {
    throw new Error(
      'Image upload is not configured. Add AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION, and AWS_BUCKET to Backend/.env, then restart the server.'
    );
  }

  const bucket = process.env.AWS_BUCKET;
  const ext = getExtension(originalFilename);
  const key = `${FOLDER_PREFIX}${randomUUID()}${ext}`;

  try {
    await getS3Client().send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: fileBuffer,
        ContentType: mimetype,
      })
    );
    return { url: buildPublicUrl(key), bucket, key };
  } catch (error) {
    console.error('S3 upload failed:', error);
    throw new Error('Image upload failed. Please try again.');
  }
}

/**
 * Delete a single object from S3 by its public URL. Logs failures; does not throw.
 */
export async function deleteImageFromS3(imageUrl) {
  const key = extractS3KeyFromUrl(imageUrl);
  if (!key || !process.env.AWS_BUCKET) return;

  try {
    await getS3Client().send(
      new DeleteObjectCommand({
        Bucket: process.env.AWS_BUCKET,
        Key: key,
      })
    );
  } catch (error) {
    console.error('S3 delete failed:', { imageUrl, error });
  }
}

async function moderateSingleUpload(file, index) {
  const filename = file.originalname;

  let rekognitionBytes;
  try {
    rekognitionBytes = await prepareForRekognition(file.buffer, file.mimetype);
  } catch (prepError) {
    console.error('Image prep for moderation failed:', prepError);
    return {
      index,
      filename,
      status: 'rejected',
      reason: 'invalid_image',
    };
  }

  const explicit = await checkExplicitContent(rekognitionBytes);
  if (explicit.flagged) {
    return {
      index,
      filename,
      status: 'rejected',
      reason: 'nudity',
      labels: explicit.labels,
    };
  }

  const textAnalysis = await analyzeImageText(rekognitionBytes);
  if (textAnalysis.contact.flagged) {
    return {
      index,
      filename,
      status: 'rejected',
      reason: 'contact_info',
      matchedText: textAnalysis.contact.matchedText,
    };
  }
  if (textAnalysis.advertising.flagged) {
    return {
      index,
      filename,
      status: 'rejected',
      reason: 'advertising',
      matchedText: textAnalysis.advertising.matchedText,
    };
  }

  if (explicit.error || textAnalysis.error) {
    console.warn('Rekognition unavailable — allowing image after prep succeeded:', filename);
  }

  let storagePayload;
  try {
    storagePayload = await prepareForStorage(file.buffer, file.mimetype, file.originalname);
  } catch (storageError) {
    console.error('Image prep for storage failed:', storageError);
    return {
      index,
      filename,
      status: 'rejected',
      reason: 'invalid_image',
    };
  }

  const uploaded = await uploadImageToS3(
    storagePayload.buffer,
    storagePayload.filename,
    storagePayload.mimetype
  );

  return {
    index,
    filename,
    status: 'accepted',
    url: uploaded.url,
    moderationSkipped: Boolean(explicit.error || textAnalysis.error),
  };
}

function countByReason(rejected, reason) {
  return rejected.filter((r) => r.reason === reason).length;
}

function buildModerationReport(fileResults) {
  if (!fileResults.length) return null;

  const rejected = fileResults.filter((r) => r.status === 'rejected');
  const nudityCount = countByReason(rejected, 'nudity');
  const contactCount = countByReason(rejected, 'contact_info');
  const advertisingCount = countByReason(rejected, 'advertising');
  const invalidCount = countByReason(rejected, 'invalid_image');
  const accepted = fileResults.filter((r) => r.status === 'accepted').length;

  const report = {
    totalUploaded: fileResults.length,
    accepted,
    rejected: rejected.length,
    nudityCount,
    contactCount,
    advertisingCount,
    invalidCount,
    // legacy aliases for frontend compatibility
    explicitCount: nudityCount,
    phoneCount: contactCount,
    results: fileResults.map((r) => ({
      index: r.index,
      filename: r.filename,
      status: r.status,
      reason: r.reason || null,
      userMessage: r.status === 'rejected' ? getImageRejectionMessage(r.reason) : null,
      userLabel: r.status === 'rejected' ? getImageRejectionLabel(r.reason) : null,
      ...(r.labels ? { labels: r.labels } : {}),
      ...(r.matchedText ? { matchedText: r.matchedText } : {}),
    })),
  };

  report.rejectionMessage = buildPartialRejectionSummary(report);
  report.userMessage = buildPropertyRejectionMessage(report, { action: 'add' });

  return report;
}

export { buildPropertyRejectionMessage };

/** Upload and moderate multer files; returns accepted URLs and per-image moderation report. */
export async function uploadAndModerateMulterFiles(files) {
  if (!files?.length) return { urls: [], moderation: null };

  const fileResults = [];
  const acceptedUrls = [];

  try {
    for (let i = 0; i < files.length; i++) {
      const result = await moderateSingleUpload(files[i], i);
      fileResults.push(result);
      if (result.status === 'accepted') {
        acceptedUrls.push(result.url);
      }
    }
  } catch (error) {
    await deleteImagesFromS3(acceptedUrls);
    throw error;
  }

  return {
    urls: acceptedUrls,
    moderation: buildModerationReport(fileResults),
  };
}

/** @deprecated Use uploadAndModerateMulterFiles */
export async function uploadMulterFilesToS3(files) {
  const { urls } = await uploadAndModerateMulterFiles(files);
  return urls;
}

/** Delete many S3 objects; never throws. */
export async function deleteImagesFromS3(imageUrls) {
  if (!imageUrls?.length) return;
  await Promise.all(imageUrls.map((url) => deleteImageFromS3(url)));
}

/** Parse removeImages from multipart body (string JSON, array, or single value). */
export function parseRemoveImagesInput(removeImages) {
  if (removeImages == null || removeImages === '') return [];

  if (typeof removeImages === 'string') {
    try {
      const parsed = JSON.parse(removeImages);
      return Array.isArray(parsed) ? parsed : [removeImages];
    } catch {
      return [removeImages];
    }
  }

  if (Array.isArray(removeImages)) return removeImages;
  return [removeImages];
}

/**
 * Apply create/update image changes: upload + moderate new files, then delete removed from S3.
 * @returns {{ urls: string[], moderation: object|null }}
 */
export async function resolvePropertyImageUrls({
  existingImages,
  reqFiles,
  removeAllImages,
  removeImages,
}) {
  let images = [...existingImages];
  let moderation = null;

  if (reqFiles?.length) {
    const uploadResult = await uploadAndModerateMulterFiles(reqFiles);
    moderation = uploadResult.moderation;
    images = [...images, ...uploadResult.urls];
  }

  if (removeAllImages === 'true' || removeAllImages === true) {
    await deleteImagesFromS3(images);
    images = [];
  }

  if (removeImages) {
    const toRemove = parseRemoveImagesInput(removeImages);
    await deleteImagesFromS3(toRemove);
    images = images.filter((img) => !toRemove.includes(img));
  }

  return { urls: images, moderation };
}

/** Delete all images for a property (or list of URLs). */
export async function deleteAllPropertyImages(imageUrls) {
  await deleteImagesFromS3(imageUrls);
}
