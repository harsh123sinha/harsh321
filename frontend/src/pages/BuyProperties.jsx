import { useQuery } from '@tanstack/react-query';
import api from '../utils/api';
import PropertyListRow from '../components/properties/PropertyListRow';
import SearchBar from '../components/search/SearchBar';
import { Building2 } from 'lucide-react';
import BrandLoader from '../components/ui/BrandLoader';

const BuyProperties = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['properties', 'buy'],
    queryFn: async () => {
      const response = await api.get('/properties/type/buy');
      return response.data;
    },
    staleTime: 0,
    refetchOnMount: 'always',
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-[#0a1020] text-white pb-8 pt-8 sm:pb-10 sm:pt-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4">
            Properties for Sale
          </h1>
          <p className="text-base sm:text-lg text-white/75">
            Find your dream property to buy across Patna
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
                Showing <span className="font-semibold text-navy">{data.properties.length}</span> properties
              </p>
            </div>
            <PropertyListRow properties={data.properties} />
          </>
        ) : (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-12 sm:py-20">
            <Building2 className="h-16 w-16 sm:h-20 sm:w-20 text-gray mx-auto mb-4" />
            <h3 className="text-xl sm:text-2xl font-bold text-navy mb-2">No Properties Found</h3>
            <p className="text-gray mb-6">Try adjusting your search filters</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BuyProperties;
