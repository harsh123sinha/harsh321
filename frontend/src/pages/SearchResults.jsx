import { useEffect, useMemo, useState } from 'react';
import { useSearchParams, Navigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../utils/api';
import PropertyListGrid from '../components/properties/PropertyListGrid';
import SearchBar from '../components/search/SearchBar';
import { Building2 } from 'lucide-react';
import BrandLoader from '../components/ui/BrandLoader';
import { usePropertyRecommendations } from '../hooks/usePropertyRecommendations';
import { hasSearchContext, saveSearchSession } from '../utils/searchSession';

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const [filters, setFilters] = useState({});

  useEffect(() => {
    const location = searchParams.get('location') || '';
    const type = searchParams.get('type') || '';
    const bhk = searchParams.get('bhk') || '';
    const shop_sqft_range = searchParams.get('shop_sqft_range') || '';
    const katha = searchParams.get('katha') || '';
    const other_type = searchParams.get('other_type') || '';
    const minPrice = searchParams.get('minPrice') || '';
    const maxPrice = searchParams.get('maxPrice') || '';

    const nextFilters = {
      location,
      type,
      bhk,
      shop_sqft_range,
      katha,
      other_type,
      minPrice,
      maxPrice,
    };

    setFilters(nextFilters);
    if (hasSearchContext(nextFilters)) {
      saveSearchSession(nextFilters);
    }
  }, [searchParams]);

  const { data, isLoading } = useQuery({
    queryKey: ['search', filters],
    queryFn: async () => {
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
      params.append('limit', '200');

      const response = await api.get(`/properties/search?${params.toString()}`);
      return response.data;
    },
    enabled: true,
    staleTime: 0,
    refetchOnMount: 'always',
  });

  const mainPropertyIds = useMemo(
    () => (data?.properties || []).map((property) => property.id),
    [data?.properties]
  );

  const { data: recommendationData, isLoading: recommendationsLoading } = usePropertyRecommendations(
    filters,
    {
      excludeIds: mainPropertyIds,
      limit: 8,
      enabled: hasSearchContext(filters),
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

  return (
    <div className="min-h-screen bg-gray-50">
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

      <div className="py-8 sm:py-12">
        {isLoading ? (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <BrandLoader />
          </div>
        ) : data?.properties?.length > 0 ? (
          <>
            <div className="mb-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <p className="text-gray">
                Found <span className="font-semibold text-navy">{data.properties.length}</span> properties
                {filters.location && <span> in <span className="font-semibold">{filters.location}</span></span>}
              </p>
            </div>
            <PropertyListGrid properties={data.properties} />
          </>
        ) : (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-12 sm:py-20">
            <Building2 className="h-16 w-16 sm:h-20 sm:w-20 text-gray mx-auto mb-4" />
            <h3 className="text-xl sm:text-2xl font-bold text-navy mb-2">No Properties Found</h3>
            <p className="text-gray mb-6">Try different search criteria</p>
          </div>
        )}

        {hasSearchContext(filters) && (
          <div className="mt-12 sm:mt-16">
            <h2 className="mb-6 max-w-7xl mx-auto px-4 text-2xl font-bold text-navy sm:mb-8 sm:px-6 sm:text-3xl lg:px-8">
              Recommended For You
            </h2>
            {recommendationsLoading ? (
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <BrandLoader />
              </div>
            ) : recommendedProperties.length > 0 ? (
              <PropertyListGrid properties={recommendedProperties} />
            ) : (
              <p className="max-w-7xl mx-auto px-4 text-gray sm:px-6 lg:px-8">
                No close matches yet. Try widening your budget or location.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchResults;
