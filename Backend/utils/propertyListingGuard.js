import { containsPhoneNumber } from './containsPhoneNumber.js';
import { validateListingContactTextExcludingProse } from './contactValidation.js';
import { moderatePropertyImage } from './moderation.js';
import { applyListingWatermark } from './watermark.js';
import { compressImageForStorage } from './imagePrep.js';
import {
  buildTextValidationError,
  buildImageModerationError,
  messageForViolationCode,
} from './moderationMessages.js';

/** Scan title + description together for phones / contact phrases. */
export function assessListingProse(body = {}) {
  const combined = [body.title, body.description]
    .filter((p) => p != null && String(p).trim() !== '')
    .map((p) => String(p))
    .join(' ');
  return containsPhoneNumber(combined);
}

export function getProseReviewFlag(body = {}) {
  const prose = assessListingProse(body);
  return prose.reviewOnly ? prose : null;
}

/**
 * Validate listing text before DB insert/update.
 * Title/description: smart phone detection (8+ digit runs, spelled digits).
 * Other fields: email / website / social hard-block.
 */
export function assertListingTextAllowed(body) {
  const prose = assessListingProse(body);
  if (prose.blocked) {
    const err = new Error(prose.reason || messageForViolationCode('phone'));
    err.status = 400;
    err.payload = {
      error: prose.reason,
      listingProse: { matchedText: prose.matchedText },
    };
    throw err;
  }

  const scan = validateListingContactTextExcludingProse(body);
  if (scan.codes.length > 0) {
    const err = new Error(messageForViolationCode(scan.codes[0]));
    err.status = 400;
    err.payload = buildTextValidationError(scan.codes);
    throw err;
  }
}

export function buildReviewReasons({ imageNeedsReview = false, proseReview = null } = {}) {
  const parts = [];
  if (imageNeedsReview) parts.push('Image flagged by moderation');
  if (proseReview?.matchedText) {
    parts.push(`Contact phrase: "${proseReview.matchedText}"`);
  }
  return parts.length ? parts.join(' · ') : null;
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
