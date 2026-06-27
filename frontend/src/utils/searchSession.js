const SESSION_KEY = 'htls_last_search';
const SESSION_TTL_MS = 24 * 60 * 60 * 1000;

/** Persist the latest search filters for this browser tab session. */
export function saveSearchSession(filters = {}) {
  try {
    sessionStorage.setItem(
      SESSION_KEY,
      JSON.stringify({
        ...filters,
        savedAt: Date.now(),
      })
    );
  } catch {
    // sessionStorage may be unavailable in private mode
  }
}

/** Read the last saved search filters (or null if expired / missing). */
export function getSearchSession() {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    if (!parsed?.savedAt || Date.now() - parsed.savedAt > SESSION_TTL_MS) {
      sessionStorage.removeItem(SESSION_KEY);
      return null;
    }

    const { savedAt, ...filters } = parsed;
    return filters;
  } catch {
    return null;
  }
}

export function buildRecommendationParams(filters = {}, { excludeIds = [], limit = 8, basedOnPropertyId } = {}) {
  const params = new URLSearchParams();

  const append = (key, value) => {
    if (value != null && value !== '') params.append(key, String(value));
  };

  append('location', filters.location);
  append('city', filters.city);
  append('type', filters.type);
  append('bhk', filters.bhk);
  append('katha', filters.katha);
  append('other_type', filters.other_type);
  append('shop_sqft_range', filters.shop_sqft_range);
  append('minPrice', filters.minPrice);
  append('maxPrice', filters.maxPrice);
  append('furnishing_status', filters.furnishing_status);
  append('garden', filters.garden);
  append('car_parking', filters.car_parking);
  append('bike_parking', filters.bike_parking);

  if (basedOnPropertyId) append('basedOnPropertyId', basedOnPropertyId);
  if (limit) append('limit', limit);
  if (excludeIds?.length) append('excludeIds', excludeIds.join(','));

  return params;
}

export function hasSearchContext(filters = {}) {
  return Boolean(
    filters.location ||
      filters.city ||
      filters.type ||
      filters.bhk ||
      filters.katha ||
      filters.other_type ||
      filters.shop_sqft_range ||
      filters.minPrice ||
      filters.maxPrice ||
      filters.furnishing_status
  );
}
