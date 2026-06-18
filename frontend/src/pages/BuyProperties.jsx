import { useQuery } from '@tanstack/react-query';
import api from '../utils/api';
import PropertyCard from '../components/properties/PropertyCard';
import SearchBar from '../components/search/SearchBar';
import { Building2 } from 'lucide-react';

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
      <div className="bg-navy text-white py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4">
            Properties for Sale
          </h1>
          <p className="text-base sm:text-lg text-gray-light">
            Find your dream property to buy across Patna
          </p>
        </div>
      </div>

      <div className="bg-white border-b py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SearchBar expanded />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold"></div>
          </div>
        ) : data?.properties?.length > 0 ? (
          <>
            <div className="mb-6">
              <p className="text-gray">
                Showing <span className="font-semibold text-navy">{data.properties.length}</span> properties
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.properties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-12 sm:py-20">
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
