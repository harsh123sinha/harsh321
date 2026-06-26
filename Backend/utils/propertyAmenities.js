export function parseOptionalInt(value) {
  if (value === undefined || value === null || String(value).trim() === '') return null;
  const n = parseInt(String(value), 10);
  return Number.isFinite(n) ? n : null;
}

export function parseBool01(value, defaultValue = 0) {
  if (value === undefined || value === null || value === '') return defaultValue;
  if (value === true || value === 'true' || value === '1' || value === 1) return 1;
  return 0;
}

/** For PATCH-style updates from multipart: undefined = keep existing */
export function mergeOptionalInt(incoming, existing) {
  if (incoming === undefined) return existing;
  return parseOptionalInt(incoming);
}

export function mergeBool01(incoming, existing) {
  if (incoming === undefined) return existing ? 1 : 0;
  return parseBool01(incoming, 0);
}

export function mergeFloorNo(incoming, existing) {
  if (incoming === undefined) return existing;
  const s = String(incoming).trim();
  return s === '' ? null : s;
}

export function mergeShopSqftRange(incoming, existing) {
  if (incoming === undefined) return existing;
  const s = String(incoming).trim();
  return s === '' ? null : s;
}

/** Distance from main road (shop listings); undefined = keep existing */
export function mergeShopRoadDistance(incoming, existing) {
  if (incoming === undefined) return existing ?? null;
  const t = String(incoming ?? '').trim();
  return t === '' ? null : t;
}

/** Token / advance amount in ₹ for shop; undefined = keep existing */
export function mergeShopTokenAmount(incoming, existing) {
  if (incoming === undefined) return existing ?? null;
  const s = String(incoming ?? '').trim();
  if (s === '') return null;
  const n = parseFloat(s);
  return Number.isFinite(n) ? n : existing ?? null;
}

export function mergeFurnishingStatus(incoming, existing) {
  if (incoming === undefined) return existing ?? null;
  const s = String(incoming ?? '').trim();
  return s === '' ? null : s;
}

/** Road number 1–999; undefined = keep existing on update */
export function parseRoadNo(value) {
  if (value === undefined || value === null || String(value).trim() === '') return null;
  const s = String(value).trim();
  if (!/^[1-9]\d{0,2}$/.test(s)) return null;
  const n = parseInt(s, 10);
  return n >= 1 && n <= 999 ? n : null;
}

export function mergeRoadNo(incoming, existing) {
  if (incoming === undefined) return existing ?? null;
  if (String(incoming).trim() === '') return null;
  return parseRoadNo(incoming) ?? existing ?? null;
}
