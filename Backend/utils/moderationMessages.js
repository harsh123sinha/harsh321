/** User-facing copy for image moderation rejections. */

export const REJECTION_REASONS = {
  nudity: 'nudity',
  contact_info: 'contact_info',
  advertising: 'advertising',
  invalid_image: 'invalid_image',
};

const IMAGE_REASON_PHRASES = {
  nudity: 'inappropriate or explicit content (nudity)',
  contact_info: 'phone numbers or other contact details',
  advertising: 'advertising or promotional content',
  invalid_image: 'an invalid or unreadable image format',
};

/** Short label for per-image UI (overlay list). */
export function getImageRejectionLabel(reason) {
  switch (reason) {
    case 'nudity':
    case 'explicit_content':
      return 'Rejected — inappropriate content (nudity)';
    case 'contact_info':
    case 'phone_number':
      return 'Rejected — phone number or contact details';
    case 'advertising':
      return 'Rejected — advertising or promotional content';
    case 'invalid_image':
      return 'Rejected — invalid image format';
    default:
      return 'Rejected — policy violation';
  }
}

/** One-line explanation for a single rejected image. */
export function getImageRejectionMessage(reason) {
  switch (reason) {
    case 'nudity':
    case 'explicit_content':
      return 'This photo contains inappropriate or explicit content and cannot be used.';
    case 'contact_info':
    case 'phone_number':
      return 'This photo contains a phone number or contact details. Use the platform contact options instead.';
    case 'advertising':
      return 'This photo contains advertising or promotional text and cannot be used.';
    case 'invalid_image':
      return 'This image file could not be verified. Please upload a clear JPEG or PNG photo.';
    default:
      return 'This image was rejected by our verification system.';
  }
}

/** Build the main API error/success message when images are rejected. */
export function buildPropertyRejectionMessage(moderation, { action = 'add' } = {}) {
  if (!moderation?.rejected) return null;

  const reasonsFound = new Set();
  for (const r of moderation.results || []) {
    if (r.status === 'rejected' && r.reason) {
      reasonsFound.add(r.reason === 'explicit_content' ? 'nudity' : r.reason === 'phone_number' ? 'contact_info' : r.reason);
    }
  }

  const phrases = [...reasonsFound]
    .map((code) => IMAGE_REASON_PHRASES[code])
    .filter(Boolean);

  const verb = action === 'add' ? 'was not added' : 'was not updated';

  if (phrases.length === 0) {
    return `Your property ${verb} because one or more images were rejected. Please upload property photos only.`;
  }

  if (phrases.length === 1) {
    return `Your property ${verb} because an image contains ${phrases[0]}. Please upload clear property photos only — no phone numbers, ads, or inappropriate content.`;
  }

  return `Your property ${verb} because images contain: ${phrases.join('; ')}. Please remove those photos and try again.`;
}

/** Summary counts message for partial update success. */
export function buildPartialRejectionSummary(moderation) {
  if (!moderation?.rejected) return null;
  const parts = [];
  if (moderation.nudityCount > 0) parts.push(`${moderation.nudityCount} with inappropriate content`);
  if (moderation.contactCount > 0) parts.push(`${moderation.contactCount} with contact details`);
  if (moderation.advertisingCount > 0) parts.push(`${moderation.advertisingCount} with advertising`);
  if (moderation.invalidCount > 0) parts.push(`${moderation.invalidCount} invalid`);
  return `${moderation.rejected} image(s) rejected (${parts.join(', ')}).`;
}
