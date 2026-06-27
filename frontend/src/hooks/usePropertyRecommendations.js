import { useQuery } from '@tanstack/react-query';
import api from '../utils/api';
import { buildRecommendationParams, hasSearchContext } from '../utils/searchSession';

/**
 * Fetch scored property recommendations for the current search context.
 */
export function usePropertyRecommendations(filters = {}, options = {}) {
  const {
    excludeIds = [],
    limit = 8,
    basedOnPropertyId,
    enabled = true,
  } = options;

  const hasContext = basedOnPropertyId || hasSearchContext(filters);

  return useQuery({
    queryKey: ['property-recommendations', filters, excludeIds, basedOnPropertyId, limit],
    queryFn: async () => {
      const params = buildRecommendationParams(filters, {
        excludeIds,
        limit,
        basedOnPropertyId,
      });
      const response = await api.get(`/properties/recommendations?${params.toString()}`);
      return response.data;
    },
    enabled: enabled && hasContext,
    staleTime: 60_000,
  });
}
