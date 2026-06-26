export const ROAD_NO_MAX = 999;
export const ROAD_NO_REQUIRED = 'Road no. is required.';
export const ROAD_NO_INVALID =
  'Enter a valid road number (1–999, numbers only, max 3 digits).';

export function sanitizeRoadNoInput(value) {
  return String(value || '').replace(/\D/g, '').slice(0, 3);
}

export function getRoadNoFieldError(value) {
  const s = String(value || '').trim();
  if (!s) return ROAD_NO_REQUIRED;
  if (!/^[1-9]\d{0,2}$/.test(s)) return ROAD_NO_INVALID;
  const n = parseInt(s, 10);
  if (n < 1 || n > ROAD_NO_MAX) return ROAD_NO_INVALID;
  return '';
}

export function isDigitKey(key) {
  return key.length === 1 && /\d/.test(key);
}
