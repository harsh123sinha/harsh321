import { validateListingContactText, validateTitleDescriptionNoNumbers } from './contactValidation.js';
import { moderatePropertyImage } from './moderation.js';
import { applyListingWatermark } from './watermark.js';
import { compressImageForStorage } from './imagePrep.js';
import {
  buildTextValidationError,
  buildImageModerationError,
  messageForViolationCode,
} from './moderationMessages.js';

/**
 * Validate all text fields before DB insert/update.
 */
export function assertListingTextAllowed(body) {
  const noNumbers = validateTitleDescriptionNoNumbers(body);
  if (noNumbers.invalid) {
    const err = new Error(messageForViolationCode('no_numbers'));
    err.status = 400;
    err.payload = buildTextValidationError(['no_numbers']);
    throw err;
  }

  const scan = validateListingContactText(body);
  if (scan.codes.length > 0) {
    const err = new Error(messageForViolationCode(scan.codes[0]));
    err.status = 400;
    err.payload = buildTextValidationError(scan.codes);
    throw err;
  }
}

/**
 * Moderate + watermark each uploaded image (before S3).
 * @returns {{ files: Array<{buffer,mimetype,originalname}>, needsReview: boolean, rejected: Array }}
 */
export async function processPropertyImagesForUpload(files) {
  if (!files?.length) {
    return { files: [], needsReview: false, rejected: [] };
  }

  const processed = [];
  const rejected = [];
  let needsReview = false;

  for (const file of files) {
    const mod = await moderatePropertyImage(file.buffer, file.mimetype);

    if (mod.rejected) {
      rejected.push({
        filename: file.originalname,
        code: mod.code,
        userMessage: mod.userMessage,
        confidence: mod.confidence,
        reason: mod.reason,
      });
      continue;
    }

    if (mod.pending) {
      needsReview = true;
    }

    const watermarked = await applyListingWatermark(mod.bytes);
    const compressed = await compressImageForStorage(watermarked);
    processed.push({
      buffer: compressed,
      mimetype: 'image/jpeg',
      originalname: file.originalname.replace(/\.[^.]+$/, '.jpg'),
    });
  }

  return { files: processed, needsReview, rejected };
}

/**
 * On create: any rejected image blocks the entire listing.
 */
export function assertNoRejectedImagesOnCreate(rejected) {
  if (!rejected?.length) return;

  const first = rejected[0];
  const err = new Error(first.userMessage || messageForViolationCode('image_contact'));
  err.status = 400;
  err.payload = {
    ...buildImageModerationError(first),
    imageModeration: {
      ...buildImageModerationError(first).imageModeration,
      rejectedImages: rejected,
    },
  };
  throw err;
}

export function resolveListingStatus(needsReview) {
  return needsReview ? 'pending_review' : 'active';
}
