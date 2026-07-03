/** Max words allowed in listing title (enforced on create/edit). */
export const LISTING_TITLE_MAX_WORDS = 15;

export function countWords(text) {
  return String(text || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}

export function getTitleWordLimitError(text) {
  const n = countWords(text);
  if (n > LISTING_TITLE_MAX_WORDS) {
    return `Title must be ${LISTING_TITLE_MAX_WORDS} words or fewer (currently ${n}). Put BHK, price, area, and pincode in their own fields.`;
  }
  return '';
}

/** Card display — wrap naturally, no ellipsis; cap at max words if needed. */
export function formatListingCardTitle(title, maxWords = LISTING_TITLE_MAX_WORDS) {
  const words = String(title || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (words.length <= maxWords) return words.join(' ');
  return words.slice(0, maxWords).join(' ');
}
