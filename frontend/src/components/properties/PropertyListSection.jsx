import { PROPERTY_LIST_PAGE_SIZE } from '../../constants/propertyList';
import PropertyListGrid from './PropertyListGrid';

const PropertyListSection = ({
  listKey,
  properties = [],
  total = 0,
  loadedPages = 1,
  isLoadingMore = false,
  hasMore = false,
  onLoadMore,
  countLabel,
  className = '',
}) => {
  const totalPages = Math.max(1, Math.ceil(total / PROPERTY_LIST_PAGE_SIZE));

  return (
    <div className={className}>
      <div className="mb-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-2">
          {countLabel ? <div className="text-gray">{countLabel}</div> : null}
          {total > PROPERTY_LIST_PAGE_SIZE ? (
            <p className="text-sm font-semibold text-navy">
              Page {loadedPages} / {totalPages}
            </p>
          ) : null}
        </div>
      </div>

      <PropertyListGrid properties={properties} listKey={listKey} />

      {hasMore ? (
        <div className="mt-8 flex justify-center px-4">
          <button
            type="button"
            onClick={onLoadMore}
            disabled={isLoadingMore}
            className="min-h-[44px] rounded-xl border border-navy/20 bg-white px-8 py-2.5 text-sm font-semibold text-navy shadow-sm transition hover:border-gold hover:bg-gold/5 disabled:opacity-60"
          >
            {isLoadingMore ? 'Loading…' : 'Load more'}
          </button>
        </div>
      ) : null}
    </div>
  );
};

export default PropertyListSection;
