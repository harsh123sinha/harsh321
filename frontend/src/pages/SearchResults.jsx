import { useEffect, useMemo, useState } from 'react';
import { useSearchParams, Navigate } from 'react-router-dom';
import PaginatedPropertyListing from '../components/properties/PaginatedPropertyListing';
import PropertyCatalogShell from '../components/layout/PropertyCatalogShell';
import RecommendedPropertyRow from '../components/properties/RecommendedPropertyRow';
import SearchBar from '../components/search/SearchBar';
import BrandLoader from '../components/ui/BrandLoader';
import { usePropertyRecommendations } from '../hooks/usePropertyRecommendations';
import { hasSearchContext, saveSearchSession } from '../utils/searchSession';
import { buildCatalogHeaderTitle } from '../utils/catalogTitles';

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const [filters, setFilters] = useState({});
  const [mainProperties, setMainProperties] = useState([]);

  useEffect(() => {
    const location = searchParams.get('location') || '';
    const type = searchParams.get('type') || '';
    const bhk = searchParams.get('bhk') || '';
    const shop_sqft_range = searchParams.get('shop_sqft_range') || '';
    const katha = searchParams.get('katha') || '';
    const other_type = searchParams.get('other_type') || '';
    const minPrice = searchParams.get('minPrice') || '';
    const maxPrice = searchParams.get('maxPrice') || '';
    const bathrooms = searchParams.get('bathrooms') || '';
    const facing = searchParams.get('facing') || '';
    const furnishing_status = searchParams.get('furnishing_status') || '';
    const car_parking = searchParams.get('car_parking') || '';
    const sort = searchParams.get('sort') || '';

    const nextFilters = {
      location,
      type,
      bhk,
      shop_sqft_range,
      katha,
      other_type,
      minPrice,
      maxPrice,
      bathrooms,
      facing,
      furnishing_status,
      car_parking,
      sort,
    };

    setFilters(nextFilters);
    if (hasSearchContext(nextFilters)) {
      saveSearchSession(nextFilters);
    }
  }, [searchParams]);

  const searchListKey = `/search?${searchParams.toString()}`;
  const headerTitle = buildCatalogHeaderTitle(filters, 'search');

  const buildSearchUrl = (limit, offset) => {
    const params = new URLSearchParams();
    if (filters.location) params.append('location', filters.location);
    if (filters.type) params.append('type', filters.type);
    const plotKind =
      filters.type === 'plot' ||
      filters.type === 'plot_lease' ||
      filters.type === 'plot_buy';
    if (filters.bhk && !plotKind) params.append('bhk', filters.bhk);
    if (filters.shop_sqft_range && !plotKind) params.append('shop_sqft_range', filters.shop_sqft_range);
    if (filters.katha) params.append('katha', filters.katha);
    if (filters.other_type) params.append('other_type', filters.other_type);
    if (filters.minPrice) params.append('minPrice', filters.minPrice);
    if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
    if (filters.bathrooms) params.append('bathrooms', filters.bathrooms);
    if (filters.facing) params.append('facing', filters.facing);
    if (filters.furnishing_status) params.append('furnishing_status', filters.furnishing_status);
    if (filters.car_parking) params.append('car_parking', filters.car_parking);
    if (filters.sort) params.append('sort', filters.sort);
    params.append('limit', String(limit));
    params.append('offset', String(offset));
    return `/properties/search?${params.toString()}`;
  };

  const mainPropertyIds = useMemo(
    () => mainProperties.map((property) => property.id),
    [mainProperties]
  );

  const { data: recommendationData, isLoading: recommendationsLoading } = usePropertyRecommendations(
    filters,
    {
      excludeIds: mainPropertyIds,
      limit: 8,
      enabled: hasSearchContext(filters) && mainPropertyIds.length > 0,
    }
  );

  const recommendedProperties = recommendationData?.properties || [];

  const isShopCatalogOnly =
    searchParams.get('type') === 'rent' &&
    searchParams.get('other_type') === 'Shop' &&
    !searchParams.get('location') &&
    !searchParams.get('bhk') &&
    !searchParams.get('shop_sqft_range') &&
    !searchParams.get('katha') &&
    !searchParams.get('minPrice') &&
    !searchParams.get('maxPrice');

  if (isShopCatalogOnly) {
    return <Navigate to="/shop" replace />;
  }

  const desktopHero = (
    <div className="bg-[#0a1020] text-white pb-8 pt-8 sm:pb-10 sm:pt-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4">
          Search Results
        </h1>
        <p className="text-base sm:text-lg text-white/75">
          Find properties matching your criteria
        </p>
        <div className="mt-6 sm:mt-8">
          <SearchBar variant="underline" />
        </div>
      </div>
    </div>
  );

  return (
    <PropertyCatalogShell
      catalogKind="search"
      filters={filters}
      headerTitle={headerTitle}
      presetLocation={filters.location}
      presetType={filters.type}
      desktopHero={desktopHero}
    >
      <PaginatedPropertyListing
        listKey={searchListKey}
        queryKey={['search', filters]}
        buildUrl={buildSearchUrl}
        emptyTitle="No Properties Found"
        emptyMessage="Try different search criteria"
        onPropertiesChange={setMainProperties}
        countLabel={({ total, showing }) => (
          <p>
            <span className="font-semibold text-navy">{total.toLocaleString('en-IN')}</span> results
            {filters.location ? (
              <span className="text-stone-500">
                {' '}
                in <span className="font-medium text-navy">{filters.location}</span>
              </span>
            ) : null}
            {total > showing ? (
              <span className="text-stone-500"> · showing {showing.toLocaleString('en-IN')}</span>
            ) : null}
          </p>
        )}
      />

      {hasSearchContext(filters) && mainProperties.length > 0 && (
        <div className="mt-10 sm:mt-12">
          <h2 className="mb-4 max-w-7xl mx-auto px-3 text-lg font-bold text-navy sm:px-4 lg:px-8 lg:text-2xl">
            Recommended For You
          </h2>
          {recommendationsLoading ? (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <BrandLoader />
            </div>
          ) : recommendedProperties.length > 0 ? (
            <RecommendedPropertyRow
              properties={recommendedProperties}
              listKey={`${searchListKey}-rec`}
            />
          ) : (
            <p className="max-w-7xl mx-auto px-4 text-gray sm:px-6 lg:px-8">
              No close matches yet. Try widening your budget or location.
            </p>
          )}
        </div>
      )}
    </PropertyCatalogShell>
  );
};

export default SearchResults;
