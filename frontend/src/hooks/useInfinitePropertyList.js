import { useInfiniteQuery } from '@tanstack/react-query';
import api from '../utils/api';
import { PROPERTY_LIST_PAGE_SIZE } from '../constants/propertyList';

/**
 * Paginated property list with "load more" (20 per page).
 * @param {{ queryKey: unknown[], buildUrl: (limit: number, offset: number) => string, enabled?: boolean }} opts
 */
export function useInfinitePropertyList({ queryKey, buildUrl, enabled = true }) {
  return useInfiniteQuery({
    queryKey,
    enabled,
    initialPageParam: 0,
    staleTime: 0,
    refetchOnMount: 'always',
    queryFn: async ({ pageParam = 0 }) => {
      const response = await api.get(buildUrl(PROPERTY_LIST_PAGE_SIZE, pageParam));
      const data = response.data || {};
      return {
        properties: data.properties || [],
        total: Number(data.total) || (data.properties?.length ?? 0),
      };
    },
    getNextPageParam: (lastPage, allPages) => {
      const loaded = allPages.reduce((n, page) => n + page.properties.length, 0);
      if (loaded >= lastPage.total) return undefined;
      return loaded;
    },
  });
}

export function flattenInfinitePropertyPages(pages) {
  return pages?.flatMap((page) => page.properties) ?? [];
}
