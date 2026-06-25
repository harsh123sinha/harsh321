import sharp from 'sharp';
import path from 'path';

/**
 * Rekognition only supports JPEG and PNG. Convert WEBP (and normalize) before moderation.
 */
export async function prepareForRekognition(buffer, mimetype) {
  if (!buffer?.length) {
    throw new Error('Empty image buffer');
  }

  if (mimetype === 'image/jpeg' || mimetype === 'image/png') {
    return buffer;
  }

  if (mimetype === 'image/webp') {
    return sharp(buffer).jpeg({ quality: 92 }).toBuffer();
  }

  throw new Error(`Unsupported image type for moderation: ${mimetype}`);
}

/** Normalize storage payload — WEBP is stored as JPEG on S3. */
export async function prepareForStorage(buffer, mimetype, originalFilename) {
  if (mimetype === 'image/webp') {
    const jpegBuffer = await sharp(buffer).jpeg({ quality: 92 }).toBuffer();
    const base = path.basename(originalFilename, path.extname(originalFilename)) || 'image';
    return {
      buffer: jpegBuffer,
      mimetype: 'image/jpeg',
      filename: `${base}.jpg`,
    };
  }

  return {
    buffer,
    mimetype,
    filename: originalFilename,
  };
}
