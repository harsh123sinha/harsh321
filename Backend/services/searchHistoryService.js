import { searchHistoryModel } from '../models/searchHistoryModel.js';

export async function logSearchHistory(userId, filters, source = 'api') {
  if (!userId) return null;

  return searchHistoryModel.insert({
    userId,
    location: filters.location || null,
    city: filters.city || null,
    propertyType: filters.type || null,
    bhk: filters.bhk || null,
    katha: filters.katha || null,
    otherType: filters.other_type || null,
    shopSqftRange: filters.shop_sqft_range || null,
    minPrice: filters.minPrice || null,
    maxPrice: filters.maxPrice || null,
    source,
  });
}
