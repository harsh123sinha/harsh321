import sharp from 'sharp';

const JPEG_QUALITY = 88;
const STORAGE_MAX_WIDTH = 1920;
const STORAGE_MAX_HEIGHT = 1920;
const STORAGE_JPEG_QUALITY = 78;

/**
 * Rekognition accepts JPEG/PNG; convert WEBP and normalize for OCR/moderation.
 */
export async function prepareImageBytes(buffer, mimetype) {
  if (!buffer?.length) {
    const err = new Error('Empty image');
    err.code = 'INVALID_IMAGE';
    throw err;
  }

  const mt = String(mimetype || '').toLowerCase();
  if (mt === 'image/webp' || mt === 'image/png' || mt === 'image/jpeg' || mt === 'image/jpg') {
    try {
      const out = await sharp(buffer)
        .rotate()
        .resize(STORAGE_MAX_WIDTH, STORAGE_MAX_HEIGHT, {
          fit: 'inside',
          withoutEnlargement: true,
        })
        .jpeg({ quality: JPEG_QUALITY, mozjpeg: true })
        .toBuffer();
      return { bytes: out, mimetype: 'image/jpeg' };
    } catch (e) {
      const err = new Error('Unreadable image file');
      err.code = 'INVALID_IMAGE';
      throw err;
    }
  }

  const err = new Error('Unsupported image format');
  err.code = 'INVALID_IMAGE';
  throw err;
}

/**
 * Resize and compress listing photos before S3 upload (after moderation + watermark).
 */
export async function compressImageForStorage(buffer) {
  if (!buffer?.length) {
    const err = new Error('Empty image');
    err.code = 'INVALID_IMAGE';
    throw err;
  }

  try {
    return await sharp(buffer)
      .rotate()
      .resize(STORAGE_MAX_WIDTH, STORAGE_MAX_HEIGHT, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .jpeg({ quality: STORAGE_JPEG_QUALITY, mozjpeg: true })
      .toBuffer();
  } catch (e) {
    const err = new Error('Failed to process image');
    err.code = 'INVALID_IMAGE';
    throw err;
  }
}
