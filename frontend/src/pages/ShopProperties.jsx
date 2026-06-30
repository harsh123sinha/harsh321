import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import PropertyListRow from '../components/properties/PropertyListRow';
import SearchBar from '../components/search/SearchBar';
import { Building2 } from 'lucide-react';
import BrandLoader from '../components/ui/BrandLoader';

const ShopProperties = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['properties', 'shop', 'rent'],
    queryFn: async () => {
      const params = new URLSearchParams({ type: 'rent', other_type: 'Shop' });
      const response = await api.get(`/properties/search?${params.toString()}`);
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
            Shops for Rent in Patna
          </h1>
          <p className="text-base sm:text-lg text-white/75 max-w-3xl">
            Browse commercial shops and retail spaces for rent across Patna — Boring Road, Bailey Road,
            Kankarbagh, Rajendra Nagar and more.
          </p>
          <div className="mt-6 sm:mt-8">
            <SearchBar variant="underline" />
          </div>
        </div>
      </div>

      <div className="py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
          <p className="text-gray text-sm sm:text-base leading-relaxed max-w-4xl">
            Harsh To Let Services lists verified shops for rent in Patna, Bihar. Whether you need a
            retail storefront, commercial unit, or small business space, explore listings by area,
            size and budget. You can also{' '}
            <Link to="/rent" className="text-gold font-medium hover:underline">
              view all rental properties
            </Link>{' '}
            or{' '}
            <Link to="/broker" className="text-gold font-medium hover:underline">
              find a property broker in Patna
            </Link>
            .
          </p>
        </div>

        {isLoading ? (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <BrandLoader />
          </div>
        ) : data?.properties?.length > 0 ? (
          <>
            <div className="mb-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <p className="text-gray">
                Showing <span className="font-semibold text-navy">{data.properties.length}</span> shops
                for rent in Patna
              </p>
            </div>
            <PropertyListRow properties={data.properties} />
          </>
        ) : (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-12 sm:py-16">
            <Building2 className="h-16 w-16 sm:h-20 sm:w-20 text-gray mx-auto mb-4" />
            <h2 className="text-xl sm:text-2xl font-bold text-navy mb-2">No shop listings right now</h2>
            <p className="text-gray mb-6 max-w-lg mx-auto">
              New commercial listings are added regularly. Check back soon or browse other property types in Patna.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link to="/rent" className="btn-primary px-5 py-2.5 text-sm">
                View rentals
              </Link>
              <Link to="/other" className="btn-secondary px-5 py-2.5 text-sm">
                Other properties
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShopProperties;
