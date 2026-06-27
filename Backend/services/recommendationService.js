import { propertyModel } from '../models/propertyModel.js';
import {
  buildFiltersFromProperty,
  computeRelevanceScore,
  getPriceSlackForRelax,
  hasRecommendationContext,
  MIN_RELEVANCE_SCORE,
  normalizeRecommendationFilters,
} from '../utils/recommendationScoring.js';

const DEFAULT_LIMIT = 8;
const MAX_LIMIT = 10;
const RELAX_LEVELS = [0, 1, 2, 3];

function parseLimit(value) {
  const n = parseInt(value, 10);
  if (!Number.isFinite(n)) return DEFAULT_LIMIT;
  return Math.min(Math.max(n, 1), MAX_LIMIT);
}

function parseExcludeIds(value) {
  if (!value) return [];
  const raw = Array.isArray(value) ? value : String(value).split(',');
  return raw
    .map((id) => parseInt(String(id).trim(), 10))
    .filter((id) => Number.isFinite(id) && id > 0);
}

/**
 * Smart property recommendations from search filters or a reference property.
 *
 * Future extensions (plug in alongside computeRelevanceScore):
 * - browsingHistoryService.boostScore()
 * - savedPropertiesService.boostScore()
 * - trendingService.boostScore()
 * - mlRecommendationService.rank()
 */
export async function getRecommendations(rawFilters = {}, options = {}) {
  const limit = parseLimit(options.limit);
  const excludeIds = [...parseExcludeIds(options.excludeIds)];

  let filters = normalizeRecommendationFilters(rawFilters);

  if (options.basedOnPropertyId) {
    const propertyId = parseInt(options.basedOnPropertyId, 10);
    if (!Number.isFinite(propertyId)) {
      return [];
    }
    const property = await propertyModel.findById(propertyId);
    if (!property) return [];
    filters = buildFiltersFromProperty(property);
    if (!excludeIds.includes(propertyId)) {
      excludeIds.push(propertyId);
    }
  }

  if (!hasRecommendationContext(filters)) {
    return [];
  }

  const scored = new Map();

  for (const relaxLevel of RELAX_LEVELS) {
    if (scored.size >= limit) break;

    const candidates = await propertyModel.findRecommendationCandidates(filters, {
      excludeIds,
      relaxLevel,
      candidateLimit: 120,
    });

    const tier = { priceSlack: getPriceSlackForRelax(relaxLevel) };

    for (const row of candidates) {
      if (scored.has(row.id)) continue;

      const relevanceScore = computeRelevanceScore(row, filters, tier);
      if (relevanceScore < MIN_RELEVANCE_SCORE) continue;

      scored.set(row.id, { ...row, relevanceScore });
    }
  }

  return Array.from(scored.values())
    .sort((a, b) => b.relevanceScore - a.relevanceScore || b.id - a.id)
    .slice(0, limit);
}

export function parseRecommendationQuery(query = {}) {
  return {
    filters: normalizeRecommendationFilters({
      location: query.location,
      city: query.city,
      type: query.type,
      bhk: query.bhk,
      katha: query.katha,
      other_type: query.other_type,
      shop_sqft_range: query.shop_sqft_range,
      minPrice: query.minPrice,
      maxPrice: query.maxPrice,
      furnishing_status: query.furnishing_status,
      garden: query.garden,
      car_parking: query.car_parking,
      bike_parking: query.bike_parking,
    }),
    limit: parseLimit(query.limit),
    excludeIds: parseExcludeIds(query.excludeIds),
    basedOnPropertyId: query.basedOnPropertyId,
  };
}
