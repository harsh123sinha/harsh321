import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../utils/api';
import PropertyListRow from '../components/properties/PropertyListRow';
import SearchBar from '../components/search/SearchBar';
import { Building2 } from 'lucide-react';
import BrandLoader from '../components/ui/BrandLoader';

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

    setFilters({ location, type, bhk, shop_sqft_range, katha, other_type, minPrice, maxPrice });
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

      const response = await api.get(`/properties/search?${params.toString()}`);
      return response.data;
    },
    enabled: true,
    staleTime: 0,
    refetchOnMount: 'always',
  });

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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {isLoading ? (
          <BrandLoader />
        ) : data?.properties?.length > 0 ? (
          <>
            <div className="mb-6">
              <p className="text-gray">
                Found <span className="font-semibold text-navy">{data.properties.length}</span> properties
                {filters.location && <span> in <span className="font-semibold">{filters.location}</span></span>}
              </p>
            </div>
            <PropertyListRow properties={data.properties} />
          </>
        ) : (
          <div className="text-center py-12 sm:py-20">
            <Building2 className="h-16 w-16 sm:h-20 sm:w-20 text-gray mx-auto mb-4" />
            <h3 className="text-xl sm:text-2xl font-bold text-navy mb-2">No Properties Found</h3>
            <p className="text-gray mb-6">Try different search criteria</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchResults;
