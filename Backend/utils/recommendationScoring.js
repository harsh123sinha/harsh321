/**
 * Modular relevance scoring for property recommendations.
 * Add or adjust rules here without touching query / service orchestration.
 */

export const SCORE_WEIGHTS = {
  locationExact: 50,
  locationPartial: 25,
  bhk: 25,
  propertyType: 20,
  priceInRange: 20,
  priceNearRange: 10,
  furnishing: 10,
  amenity: 5,
};

/** Minimum score — avoids surfacing unrelated listings */
export const MIN_RELEVANCE_SCORE = 20;

const PLOT_TYPES = ['plot', 'plot_lease', 'plot_buy'];

const PRICE_SLACK_BY_RELAX = [0, 0.15, 0.25, 0.35];

export function getPriceSlackForRelax(relaxLevel = 0) {
  return PRICE_SLACK_BY_RELAX[Math.min(relaxLevel, PRICE_SLACK_BY_RELAX.length - 1)];
}

export function isPlotRow(propertyOrType) {
  if (typeof propertyOrType === 'string') {
    return PLOT_TYPES.includes(propertyOrType);
  }
  const type = String(propertyOrType?.type ?? '').trim();
  const katha = String(propertyOrType?.katha ?? '').trim();
  return PLOT_TYPES.includes(type) || (type === '' && katha !== '');
}

export function normalizeRecommendationFilters(raw = {}) {
  const toStr = (v) => (v == null ? '' : String(v).trim());

  return {
    location: toStr(raw.location),
    city: toStr(raw.city),
    type: toStr(raw.type),
    bhk: raw.bhk != null && raw.bhk !== '' ? Number(raw.bhk) : null,
    katha: toStr(raw.katha),
    other_type: toStr(raw.other_type),
    shop_sqft_range: toStr(raw.shop_sqft_range),
    minPrice: raw.minPrice != null && raw.minPrice !== '' ? Number(raw.minPrice) : null,
    maxPrice: raw.maxPrice != null && raw.maxPrice !== '' ? Number(raw.maxPrice) : null,
    furnishing_status: toStr(raw.furnishing_status),
    garden: parseBoolFilter(raw.garden),
    car_parking: parseBoolFilter(raw.car_parking),
    bike_parking: parseBoolFilter(raw.bike_parking),
  };
}

function parseBoolFilter(value) {
  if (value == null || value === '') return null;
  if (value === true || value === 1 || value === '1' || value === 'true') return true;
  if (value === false || value === 0 || value === '0' || value === 'false') return false;
  return null;
}

export function hasRecommendationContext(filters) {
  const f = normalizeRecommendationFilters(filters);
  return Boolean(
    f.location ||
      f.city ||
      f.type ||
      f.bhk != null ||
      f.katha ||
      f.other_type ||
      f.shop_sqft_range ||
      f.minPrice != null ||
      f.maxPrice != null ||
      f.furnishing_status ||
      f.garden != null ||
      f.car_parking != null ||
      f.bike_parking != null
  );
}

/** Derive search-like filters from a property (detail-page recommendations). */
export function buildFiltersFromProperty(property) {
  if (!property) return {};

  const price = Number(property.price);
  const slack = 0.15;

  return normalizeRecommendationFilters({
    location: property.location || property.city || '',
    city: property.city || '',
    type: property.type || '',
    bhk: property.bhk,
    katha: property.katha,
    other_type: property.other_type,
    shop_sqft_range: property.shop_sqft_range,
    minPrice: Number.isFinite(price) ? Math.floor(price * (1 - slack)) : null,
    maxPrice: Number.isFinite(price) ? Math.ceil(price * (1 + slack)) : null,
    furnishing_status: property.furnishing_status,
    garden: property.garden,
    car_parking: property.car_parking,
    bike_parking: property.bike_parking,
  });
}

function locationNeedle(filters) {
  return String(filters.location || filters.city || '')
    .trim()
    .toLowerCase();
}

export function scoreLocation(property, filters) {
  const needle = locationNeedle(filters);
  if (!needle) return 0;

  const loc = String(property.location || '').toLowerCase();
  const city = String(property.city || '').toLowerCase();
  const district = String(property.district || '').toLowerCase();

  if ((loc && (loc.includes(needle) || needle.includes(loc))) || (city && city.includes(needle))) {
    return SCORE_WEIGHTS.locationExact;
  }
  if (district && district.includes(needle)) {
    return SCORE_WEIGHTS.locationPartial;
  }
  return 0;
}

export function scoreBhk(property, filters) {
  if (filters.bhk == null || isPlotRow(property) || isPlotRow(filters.type)) return 0;
  if (property.bhk == null) return 0;
  return Number(property.bhk) === Number(filters.bhk) ? SCORE_WEIGHTS.bhk : 0;
}

export function scorePropertyType(property, filters) {
  if (!filters.type) return 0;

  const filterPlot = isPlotRow(filters.type);
  const propertyPlot = isPlotRow(property);

  if (filterPlot && propertyPlot) return SCORE_WEIGHTS.propertyType;
  if (!filterPlot && !propertyPlot && property.type === filters.type) {
    return SCORE_WEIGHTS.propertyType;
  }
  return 0;
}

export function scorePrice(property, filters, tier = {}) {
  const price = Number(property.price);
  if (!Number.isFinite(price)) return 0;

  const min = filters.minPrice;
  const max = filters.maxPrice;
  if (min == null && max == null) return 0;

  const slack = tier.priceSlack ?? 0;
  const minBound = min != null ? min * (1 - slack) : 0;
  const maxBound = max != null ? max * (1 + slack) : Number.POSITIVE_INFINITY;

  if (price >= (min ?? 0) && price <= (max ?? Number.POSITIVE_INFINITY)) {
    return SCORE_WEIGHTS.priceInRange;
  }
  if (price >= minBound && price <= maxBound) {
    return SCORE_WEIGHTS.priceNearRange;
  }
  return 0;
}

export function scoreFurnishing(property, filters) {
  if (!filters.furnishing_status || !property.furnishing_status) return 0;
  return String(property.furnishing_status) === String(filters.furnishing_status)
    ? SCORE_WEIGHTS.furnishing
    : 0;
}

export function scoreAmenities(property, filters) {
  let score = 0;
  const amenityPairs = [
    ['garden', 'garden'],
    ['car_parking', 'car_parking'],
    ['bike_parking', 'bike_parking'],
  ];

  for (const [filterKey, propKey] of amenityPairs) {
    if (filters[filterKey] == null) continue;
    const wanted = Boolean(filters[filterKey]);
    const has = Boolean(property[propKey]);
    if (wanted && has) score += SCORE_WEIGHTS.amenity;
  }

  return score;
}

export function scoreKatha(property, filters) {
  if (!filters.katha) return 0;
  const k = String(property.katha || '').trim();
  return k && k === filters.katha ? SCORE_WEIGHTS.bhk : 0;
}

export function scoreOtherType(property, filters) {
  if (!filters.other_type) return 0;
  const wanted = filters.other_type.toLowerCase();
  const got = String(property.other_type || '').toLowerCase();
  if (!got) return 0;
  return got.includes(wanted) || wanted.includes(got) ? SCORE_WEIGHTS.propertyType / 2 : 0;
}

/**
 * Sum all active scoring rules. Future signals (browsing history, ML, etc.)
 * can be added as additional functions and included here.
 */
export function computeRelevanceScore(property, filters, tier = {}) {
  const normalized = normalizeRecommendationFilters(filters);

  return (
    scoreLocation(property, normalized) +
    scoreBhk(property, normalized) +
    scoreKatha(property, normalized) +
    scorePropertyType(property, normalized) +
    scoreOtherType(property, normalized) +
    scorePrice(property, normalized, tier) +
    scoreFurnishing(property, normalized) +
    scoreAmenities(property, normalized)
  );
}
