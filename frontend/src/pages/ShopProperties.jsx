import { Link } from 'react-router-dom';
import PaginatedPropertyListing from '../components/properties/PaginatedPropertyListing';
import SearchBar from '../components/search/SearchBar';

const ShopProperties = () => {
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

        <PaginatedPropertyListing
          listKey="/shop"
          queryKey={['properties', 'shop', 'rent']}
          buildUrl={(limit, offset) =>
            `/properties/search?type=rent&other_type=Shop&limit=${limit}&offset=${offset}`
          }
          emptyTitle="No Shops Found"
          emptyMessage="Try adjusting your search filters or check back later."
          countLabel={({ total, showing }) => (
            <p>
              Showing <span className="font-semibold text-navy">{showing}</span> of{' '}
              <span className="font-semibold text-navy">{total}</span> shops for rent in Patna
            </p>
          )}
        />
      </div>
    </div>
  );
};

export default ShopProperties;
