/**
 * User-facing messages for contact / moderation violations.
 * Do not expose internal rule names or regex details.
 */
const MESSAGES = {
  no_numbers: 'Numbers are not allowed in the title or description.',
  phone: 'Phone numbers are not allowed in property listings.',
  email: 'Email addresses are not allowed in property listings.',
  website: 'External website links are not allowed.',
  social: 'Social media or off-platform contact details are not allowed.',
  contact_phrase: 'Listings containing external contact details cannot be published.',
  image_contact: 'Please remove contact information from images.',
  image_explicit: 'This image cannot be published. Please upload appropriate property photos only.',
  image_pending: 'Your listing is under review. We will notify you after admin approval.',
  generic: 'This content cannot be published. Please contact Harsh To Let Services for assistance.',
};

export function messageForViolationCode(code) {
  return MESSAGES[code] || MESSAGES.generic;
}

export function buildTextValidationError(codes) {
  const code = codes?.[0] || 'generic';
  return {
    error: messageForViolationCode(code),
    contactValidation: { codes },
  };
}

export function buildImageModerationError(result) {
  return {
    error: result.userMessage || messageForViolationCode(result.code || 'generic'),
    imageModeration: {
      rejected: true,
      userMessage: result.userMessage || messageForViolationCode(result.code || 'generic'),
      code: result.code,
    },
  };
}

export function buildPendingReviewSuccess() {
  return {
    success: true,
    pendingReview: true,
    message:
      'Your listing has been submitted for review. It will appear publicly after admin approval.',
  };
}
