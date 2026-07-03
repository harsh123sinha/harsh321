/**
 * Detect phone numbers and contact-intent phrases in listing title/description prose.
 * Structured fields (BHK, price, pincode, floor, sqft) should live outside free text.
 */

const NUMBER_WORDS = {
  zero: '0',
  oh: '0',
  one: '1',
  two: '2',
  three: '3',
  four: '4',
  five: '5',
  six: '6',
  seven: '7',
  eight: '8',
  nine: '9',
};

const CONTACT_PHRASES = [
  'call me',
  'whatsapp me',
  'whats app me',
  'contact number',
  'direct number',
  'reach me at',
  'reach me on',
  'my number',
  'my mobile',
  'my phone',
  'contact me directly',
  'dm me',
  'message me on',
];

function normalizeSpelledDigits(input) {
  let s = String(input || '').toLowerCase();
  s = s.replace(/[\u2013\u2014]/g, '-');
  s = s.replace(/[()[\]{}]/g, ' ');
  const wordPattern = new RegExp(`\\b(${Object.keys(NUMBER_WORDS).join('|')})\\b`, 'gi');
  s = s.replace(wordPattern, (m) => NUMBER_WORDS[m.toLowerCase()] || m);
  return s;
}

/** Strip spaces, dashes, dots, parentheses for digit-run detection. */
export function stripPhoneFormatting(text) {
  return String(text || '').replace(/[\s.\-()+]/g, '');
}

function collapseDigits(text) {
  return String(text || '').replace(/\D/g, '');
}

function findLongDigitRun(text, minLen = 8) {
  const collapsed = collapseDigits(text);
  if (collapsed.length >= minLen) {
    return collapsed.slice(0, Math.min(collapsed.length, 16));
  }

  const stripped = stripPhoneFormatting(text);
  const fromStripped = collapseDigits(stripped);
  if (fromStripped.length >= minLen) {
    return fromStripped.slice(0, Math.min(fromStripped.length, 16));
  }

  return null;
}

function findContactPhrase(text) {
  const lower = String(text || '').toLowerCase();
  for (const phrase of CONTACT_PHRASES) {
    if (lower.includes(phrase)) return phrase;
  }
  return null;
}

/**
 * @param {string} text
 * @returns {{ blocked: boolean, reviewOnly: boolean, reason: string, matchedText: string }}
 */
export function containsPhoneNumber(text) {
  const raw = String(text || '').trim();
  if (!raw) {
    return { blocked: false, reviewOnly: false, reason: '', matchedText: '' };
  }

  const spelled = normalizeSpelledDigits(raw);
  const digitMatch =
    findLongDigitRun(raw) ||
    findLongDigitRun(spelled) ||
    findLongDigitRun(stripPhoneFormatting(raw));

  if (digitMatch) {
    return {
      blocked: true,
      reviewOnly: false,
      reason:
        'You have added a phone number in the title or description. Please remove it — buyers must contact you through the platform Call button.',
      matchedText: digitMatch,
    };
  }

  const phrase = findContactPhrase(raw);
  if (phrase) {
    return {
      blocked: false,
      reviewOnly: true,
      reason: 'This listing will be reviewed because it mentions direct contact.',
      matchedText: phrase,
    };
  }

  return { blocked: false, reviewOnly: false, reason: '', matchedText: '' };
}
