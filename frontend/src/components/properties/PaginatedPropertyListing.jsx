import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import {
  useInfinitePropertyList,
  flattenInfinitePropertyPages,
} from '../../hooks/useInfinitePropertyList';
import { consumeListScroll } from '../../utils/listScrollRestore';
import PropertyListSection from './PropertyListSection';
import BrandLoader from '../ui/BrandLoader';
import { Building2 } from 'lucide-react';

/**
 * Shared paginated property listing block (20 per page, load more, scroll restore).
 */
const PaginatedPropertyListing = ({
  listKey,
  queryKey,
  buildUrl,
  enabled = true,
  emptyTitle = 'No Properties Found',
  emptyMessage = 'Try adjusting your search filters',
  countLabel,
  onPropertiesChange,
}) => {
  const location = useLocation();
  const scrollKey = listKey || location.pathname;
  const restoreRef = useRef(null);
  const restoredRef = useRef(false);

  const {
    data,
    isLoading,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
  } = useInfinitePropertyList({ queryKey, buildUrl, enabled });

  const properties = flattenInfinitePropertyPages(data?.pages);
  const total = data?.pages?.[0]?.total ?? properties.length;
  const loadedPages = data?.pages?.length ?? 0;

  useEffect(() => {
    onPropertiesChange?.(properties);
  }, [properties, onPropertiesChange]);

  useEffect(() => {
    if (!restoreRef.current && !restoredRef.current) {
      const saved = consumeListScroll(scrollKey);
      if (saved) restoreRef.current = saved;
    }
  }, [scrollKey]);

  useEffect(() => {
    const saved = restoreRef.current;
    if (!saved || restoredRef.current || isLoading) return;

    const pagesNeeded = saved.pagesNeeded || 1;
    if (loadedPages < pagesNeeded && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
      return;
    }

    if (!properties.length || loadedPages < pagesNeeded) return;

    restoredRef.current = true;
    restoreRef.current = null;

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const el = document.querySelector(`[data-property-id="${saved.propertyId}"]`);
        if (el) {
          el.scrollIntoView({ block: 'center', behavior: 'auto' });
          return;
        }
        if (typeof saved.scrollY === 'number') {
          window.scrollTo(0, saved.scrollY);
        }
      });
    });
  }, [
    properties.length,
    loadedPages,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    fetchNextPage,
  ]);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <BrandLoader />
      </div>
    );
  }

  if (!properties.length) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-12 sm:py-20">
        <Building2 className="h-16 w-16 sm:h-20 sm:w-20 text-gray mx-auto mb-4" />
        <h3 className="text-xl sm:text-2xl font-bold text-navy mb-2">{emptyTitle}</h3>
        <p className="text-gray mb-6">{emptyMessage}</p>
      </div>
    );
  }

  const resolvedCountLabel =
    typeof countLabel === 'function'
      ? countLabel({ total, showing: properties.length })
      : countLabel;

  return (
    <PropertyListSection
      listKey={scrollKey}
      properties={properties}
      total={total}
      loadedPages={loadedPages}
      isLoadingMore={isFetchingNextPage}
      hasMore={Boolean(hasNextPage)}
      onLoadMore={() => fetchNextPage()}
      countLabel={resolvedCountLabel}
    />
  );
};

export default PaginatedPropertyListing;
