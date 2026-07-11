import { Link } from 'react-router-dom';
import PaginatedPropertyListing from '../components/properties/PaginatedPropertyListing';
import PropertyCatalogShell from '../components/layout/PropertyCatalogShell';
import SearchBar from '../components/search/SearchBar';

const ShopProperties = () => {
  const desktopHero = (
    <div className="bg-[#0a1020] text-white pb-8 pt-8 sm:pb-10 sm:pt-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4">
          Shops for Rent in Patna
        </h1>
        <p className="text-base sm:text-lg text-white/75 max-w-3xl">
          Browse commercial shops and retail spaces for rent across Patna
        </p>
        <div className="mt-6 sm:mt-8">
          <SearchBar variant="underline" />
        </div>
      </div>
    </div>
  );

  return (
    <PropertyCatalogShell catalogKind="shop" presetType="rent" desktopHero={desktopHero}>
      <div className="hidden lg:block max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <p className="text-gray text-sm sm:text-base leading-relaxed max-w-4xl">
          Harsh To Let Services lists verified shops for rent in Patna. You can also{' '}
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
        emptyMessage="Try adjusting your filters — or tell us what you need"
        demandPrefill={{ category: 'shop', listing_type: 'rent' }}
        countLabel={({ total, showing }) => (
          <p>
            <span className="font-semibold text-navy">{total.toLocaleString('en-IN')}</span> shops
            {total > showing ? (
              <span className="text-stone-500"> · showing {showing.toLocaleString('en-IN')}</span>
            ) : null}
          </p>
        )}
      />
    </PropertyCatalogShell>
  );
};

export default ShopProperties;
