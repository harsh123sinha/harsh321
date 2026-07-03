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

const SOCIAL_KEYWORDS = [
  'whatsapp',
  'whats app',
  'wa me',
  'telegram',
  'instagram',
  'insta',
  'facebook',
  'fb',
  'linkedin',
  'twitter',
  'snapchat',
  'youtube',
  'discord',
  'signal',
  'wechat',
];

const CONTACT_PHRASES = [
  'dm me',
  'inbox me',
  'message me',
  'whatsapp me',
  'call me',
  'telegram me',
  'instagram me',
  'follow me',
  'contact me directly',
  'reach me on',
  'reach me at',
  'my number',
  'my mobile',
  'my phone',
  'qr code',
  'scan qr',
];

const URL_SHORTENERS = ['bit.ly', 'tinyurl', 'goo.gl', 't.co', 'shorturl', 'rb.gy', 'ow.ly'];

const TLD_PATTERN =
  /\.(com|in|net|org|co|io|ai|dev|store|online|site|xyz|tech|live|me|info|biz|app|us|uk)(\/|\s|$)/i;

/**
 * Normalize obfuscated contact text before scanning.
 */
export function normalizeContactText(input) {
  if (input == null) return '';
  let s = String(input).toLowerCase();

  s = s.replace(/\b(d\s*){1,3}o\s*t\b/gi, '.');
  s = s.replace(/\s+at\s+/g, '@');
  s = s.replace(/[\u2013\u2014]/g, '-');
  s = s.replace(/[()[\]{}]/g, ' ');

  const wordPattern = new RegExp(
    `\\b(${Object.keys(NUMBER_WORDS).join('|')})\\b`,
    'gi'
  );
  s = s.replace(wordPattern, (m) => NUMBER_WORDS[m.toLowerCase()] || m);

  s = s.replace(/(?<=[a-z])(?=\d)|(?<=\d)(?=[a-z])/gi, ' ');
  s = s.replace(/\s+/g, ' ').trim();

  return s;
}

function digitsOnly(s) {
  return String(s || '').replace(/\D/g, '');
}

function hasIndianPhone(digits) {
  if (!digits || digits.length < 10) return false;

  const patterns = [
    /(?:^|\D)(?:\+?91)?[6-9]\d{9}(?:\D|$)/,
    /(?:^|\D)0[6-9]\d{9}(?:\D|$)/,
    /(?:^|\D)[6-9]\d{9}(?:\D|$)/,
  ];

  for (const re of patterns) {
    if (re.test(digits)) return true;
  }

  if (digits.length >= 10) {
    for (let i = 0; i <= digits.length - 10; i++) {
      const chunk = digits.slice(i, i + 10);
      if (/^[6-9]\d{9}$/.test(chunk)) return true;
      if (chunk.length === 11 && chunk.startsWith('0') && /^0[6-9]\d{9}$/.test(chunk)) return true;
    }
  }

  return false;
}

function detectPhone(text, normalized) {
  const rawDigits = digitsOnly(text);
  const normDigits = digitsOnly(normalized);

  if (hasIndianPhone(rawDigits) || hasIndianPhone(normDigits)) {
    return 'phone';
  }

  const loose = normalized.replace(/\s/g, '');
  if (/(?:\+91|91)?[6-9]\d{9}/.test(loose) || /0[6-9]\d{9}/.test(loose)) {
    return 'phone';
  }

  return null;
}

function detectEmail(normalized) {
  const compact = normalized.replace(/\s+/g, '');
  if (/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i.test(compact)) return 'email';
  if (/[a-z0-9._%+-]+\s*@\s*[a-z0-9.-]+\s*\.\s*[a-z]{2,}/i.test(normalized)) return 'email';
  return null;
}

function detectWebsite(normalized) {
  const s = normalized.replace(/\s+/g, '');

  if (/https?:\/\//i.test(s) || /www\./i.test(s)) return 'website';

  for (const short of URL_SHORTENERS) {
    if (s.includes(short.replace(/\./g, '')) || normalized.includes(short)) return 'website';
  }

  if (TLD_PATTERN.test(normalized) || TLD_PATTERN.test(s)) {
    if (!/@/.test(s)) return 'website';
  }

  return null;
}

function detectSocial(normalized) {
  for (const kw of SOCIAL_KEYWORDS) {
    if (normalized.includes(kw)) return 'social';
  }

  for (const phrase of CONTACT_PHRASES) {
    if (normalized.includes(phrase)) return 'contact_phrase';
  }

  if (/(?:^|\s)@[a-z0-9._]{3,}/i.test(normalized)) return 'social';

  return null;
}

/**
 * Scan text for prohibited contact / bypass content.
 * @returns {{ violations: string[], codes: string[] }}
 */
export function scanContactViolations(text) {
  if (!text || !String(text).trim()) {
    return { violations: [], codes: [] };
  }

  const raw = String(text);
  const normalized = normalizeContactText(raw);
  const codes = [];

  const checks = [
    detectPhone(raw, normalized),
    detectEmail(normalized),
    detectWebsite(normalized),
    detectSocial(normalized),
  ];

  for (const code of checks) {
    if (code && !codes.includes(code)) codes.push(code);
  }

  return {
    violations: codes.map((c) => c),
    codes,
  };
}

/**
 * Collect all user-entered text from a property create/update body.
 */
export function collectListingTextFields(body = {}) {
  const parts = [
    body.location,
    body.city,
    body.district,
    body.state,
    body.pincode,
    body.other_type,
    body.floor_no,
    body.shop_road_distance,
    body.katha,
    body.furnishing_status,
  ];
  return parts
    .filter((p) => p != null && String(p).trim() !== '')
    .map((p) => String(p))
    .join('\n');
}

/** Title/description are validated separately via containsPhoneNumber. */
export function validateListingContactTextExcludingProse(body) {
  const combined = collectListingTextFields(body);
  return scanContactViolations(combined);
}

export function validateListingContactText(body) {
  const combined = collectListingTextFields(body);
  return scanContactViolations(combined);
}
