export const NO_NUMBERS_MESSAGE = 'Numbers are not allowed in this field.';

/** Title and description must be text-only (no digits). */
export const NO_NUMBERS_FIELDS = new Set(['title', 'description']);

const DIGIT_RE = /\d/;

export function containsDigit(text) {
  return DIGIT_RE.test(String(text || ''));
}

export function stripDigits(text) {
  return String(text || '').replace(/\d/g, '');
}

export function getNoNumbersFieldError(text) {
  return containsDigit(text) ? NO_NUMBERS_MESSAGE : '';
}

export function isDigitKey(key) {
  return key.length === 1 && DIGIT_RE.test(key);
}
