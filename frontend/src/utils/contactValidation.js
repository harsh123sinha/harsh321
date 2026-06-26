const MESSAGES = {
  phone: 'Phone numbers are not allowed.',
  email: 'Email addresses are not allowed.',
  website: 'External website links are not allowed.',
  social: 'Social media or off-platform contact details are not allowed.',
  contact_phrase: 'External contact details are not allowed.',
};

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
  'whatsapp', 'whats app', 'wa me', 'telegram', 'instagram', 'insta', 'facebook', 'fb',
  'linkedin', 'twitter', 'snapchat', 'youtube', 'discord', 'signal', 'wechat',
];

const CONTACT_PHRASES = [
  'dm me', 'inbox me', 'message me', 'whatsapp me', 'call me', 'telegram me',
  'instagram me', 'follow me', 'contact me directly', 'reach me on', 'reach me at',
  'my number', 'my mobile', 'my phone', 'qr code', 'scan qr',
];

const URL_SHORTENERS = ['bit.ly', 'tinyurl', 'goo.gl', 't.co', 'shorturl', 'rb.gy', 'ow.ly'];

const TLD_PATTERN =
  /\.(com|in|net|org|co|io|ai|dev|store|online|site|xyz|tech|live|me|info|biz|app|us|uk)(\/|\s|$)/i;

export function normalizeContactText(input) {
  if (input == null) return '';
  let s = String(input).toLowerCase();
  s = s.replace(/\b(d\s*){1,3}o\s*t\b/gi, '.');
  s = s.replace(/\s+at\s+/g, '@');
  s = s.replace(/[\u2013\u2014]/g, '-');
  s = s.replace(/[()[\]{}]/g, ' ');
  const wordPattern = new RegExp(`\\b(${Object.keys(NUMBER_WORDS).join('|')})\\b`, 'gi');
  s = s.replace(wordPattern, (m) => NUMBER_WORDS[m.toLowerCase()] || m);
  s = s.replace(/(?<=[a-z])(?=\d)|(?<=\d)(?=[a-z])/gi, ' ');
  return s.replace(/\s+/g, ' ').trim();
}

function digitsOnly(s) {
  return String(s || '').replace(/\D/g, '');
}

function hasIndianPhone(digits) {
  if (!digits || digits.length < 10) return false;
  if (/(?:^|\D)(?:\+?91)?[6-9]\d{9}(?:\D|$)/.test(digits)) return true;
  if (/(?:^|\D)0[6-9]\d{9}(?:\D|$)/.test(digits)) return true;
  if (digits.length >= 10) {
    for (let i = 0; i <= digits.length - 10; i++) {
      const chunk = digits.slice(i, i + 10);
      if (/^[6-9]\d{9}$/.test(chunk)) return true;
    }
  }
  return false;
}

function detectPhone(text, normalized) {
  const rawDigits = digitsOnly(text);
  const normDigits = digitsOnly(normalized);
  if (hasIndianPhone(rawDigits) || hasIndianPhone(normDigits)) return 'phone';
  const loose = normalized.replace(/\s/g, '');
  if (/(?:\+91|91)?[6-9]\d{9}/.test(loose) || /0[6-9]\d{9}/.test(loose)) return 'phone';
  return null;
}

function detectEmail(normalized) {
  const compact = normalized.replace(/\s+/g, '');
  if (/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i.test(compact)) return 'email';
  return null;
}

function detectWebsite(normalized) {
  const s = normalized.replace(/\s+/g, '');
  if (/https?:\/\//i.test(s) || /www\./i.test(s)) return 'website';
  for (const short of URL_SHORTENERS) {
    if (s.includes(short.replace(/\./g, '')) || normalized.includes(short)) return 'website';
  }
  if (TLD_PATTERN.test(normalized) && !/@/.test(s)) return 'website';
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

export function scanContactViolations(text) {
  if (!text || !String(text).trim()) return { codes: [] };
  const raw = String(text);
  const normalized = normalizeContactText(raw);
  const codes = [];
  for (const code of [
    detectPhone(raw, normalized),
    detectEmail(normalized),
    detectWebsite(normalized),
    detectSocial(normalized),
  ]) {
    if (code && !codes.includes(code)) codes.push(code);
  }
  return { codes };
}

export function getContactFieldError(text) {
  const { codes } = scanContactViolations(text);
  if (!codes.length) return '';
  return MESSAGES[codes[0]] || 'This content is not allowed.';
}

/** Fields scanned for contact info while typing (not title/description — those use no-numbers rule). */
export const CONTACT_VALIDATED_FIELDS = new Set([
  'location',
  'city',
  'otherDescription',
  'floor_no',
  'shopRoadDistance',
]);

const fieldErrorClass = (err) =>
  err ? 'border-red-400 focus:border-red-500' : 'border-gray-light focus:border-gold';

export { fieldErrorClass };
