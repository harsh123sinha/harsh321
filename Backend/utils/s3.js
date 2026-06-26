import { randomUUID } from 'crypto';
import path from 'path';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import {
  processPropertyImagesForUpload,
  assertNoRejectedImagesOnCreate,
} from './propertyListingGuard.js';

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
 * Upload a single image buffer to S3. Returns the public object URL.
 */
export async function uploadImageToS3(fileBuffer, originalFilename, mimetype, folderPrefix = FOLDER_PREFIX) {
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

  const ext = getExtension(originalFilename);
  const key = `${folderPrefix}${randomUUID()}${ext}`;

  try {
    await getS3Client().send(
      new PutObjectCommand({
        Bucket: process.env.AWS_BUCKET,
        Key: key,
        Body: fileBuffer,
        ContentType: mimetype,
      })
    );
    return buildPublicUrl(key);
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

/** Upload broker profile photo (compressed JPEG buffer). */
export async function uploadBrokerPhotoToS3(fileBuffer, originalFilename) {
  return uploadImageToS3(fileBuffer, originalFilename, 'image/jpeg', 'brokers/');
}
export async function uploadProcessedFilesToS3(files) {
  if (!files?.length) return [];

  const uploadedUrls = [];
  try {
    for (const file of files) {
      const url = await uploadImageToS3(file.buffer, file.originalname, file.mimetype || 'image/jpeg');
      uploadedUrls.push(url);
    }
    return uploadedUrls;
  } catch (error) {
    for (const url of uploadedUrls) {
      await deleteImageFromS3(url);
    }
    throw error;
  }
}

/** Upload all multer memory files; rolls back successful uploads if any later one fails. */
export async function uploadMulterFilesToS3(files) {
  if (!files?.length) return [];

  const uploadedUrls = [];
  try {
    for (const file of files) {
      const url = await uploadImageToS3(file.buffer, file.originalname, file.mimetype);
      uploadedUrls.push(url);
    }
    return uploadedUrls;
  } catch (error) {
    for (const url of uploadedUrls) {
      await deleteImageFromS3(url);
    }
    throw error;

  }
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
 * Apply create/update image changes: moderate + watermark new files, upload, then delete removed.
 */
export async function resolvePropertyImageUrls({
  existingImages,
  reqFiles,
  removeAllImages,
  removeImages,
}) {
  let images = [...existingImages];
  let needsReview = false;

  if (reqFiles?.length) {
    const processed = await processPropertyImagesForUpload(reqFiles);
    assertNoRejectedImagesOnCreate(processed.rejected);
    needsReview = processed.needsReview;
    const newUrls = await uploadProcessedFilesToS3(processed.files);
    images = [...images, ...newUrls];
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

  return { images, needsReview };
}

/** Delete all images for a property (or list of URLs). */
export async function deleteAllPropertyImages(imageUrls) {
  await deleteImagesFromS3(imageUrls);
}
