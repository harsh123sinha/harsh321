import { Link, Navigate, useParams } from 'react-router-dom';
import { MapPin } from 'lucide-react';
import PaginatedPropertyListing from '../components/properties/PaginatedPropertyListing';
import SearchBar from '../components/search/SearchBar';
import { usePageSeo } from '../hooks/usePageSeo';
import {
  buildAreaRentSeo,
  FEATURED_PATNA_AREAS,
  getAreaBySlug,
  PATNA_AREA_PAGES,
} from '../constants/areaPages';

const AreaFlatsForRent = () => {
  const { areaSlug } = useParams();
  const area = getAreaBySlug(areaSlug);

  const seo = area ? buildAreaRentSeo(area) : null;
  usePageSeo(seo);

  if (!area) {
    return <Navigate to="/patna" replace />;
  }
  const otherAreas = FEATURED_PATNA_AREAS.filter((item) => item.slug !== area.slug).slice(0, 6);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-[#0a1020] text-white pb-8 pt-8 sm:pb-10 sm:pt-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs sm:text-sm text-white/55 mb-2 flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            <Link to="/patna" className="hover:text-gold transition-colors">
              Patna areas
            </Link>
            <span aria-hidden>/</span>
            <span>{area.name}</span>
          </p>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4">
            Flats for Rent in {area.name}, Patna
          </h1>
          <p className="text-base sm:text-lg text-white/75 max-w-3xl">
            Verified rental flats, apartments and houses in {area.name} — browse by BHK, budget and
            furnishing on Harsh To Let Services.
          </p>
          <div className="mt-6 sm:mt-8">
            <SearchBar variant="underline" presetLocation={area.searchLocation} presetType="rent" />
          </div>
        </div>
      </div>

      <div className="py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
          <p className="text-gray text-sm sm:text-base leading-relaxed max-w-4xl">
            Looking for a flat or house for rent in {area.name}, Patna? Harsh To Let Services lists
            verified to-let properties across {area.name} and nearby neighbourhoods in Bihar. Whether
            you need a 1 BHK, 2 BHK, 3 BHK flat or a family home, explore current listings below or{' '}
            <Link to="/rent" className="text-gold font-medium hover:underline">
              view all rentals in Patna
            </Link>
            . You can also{' '}
            <Link to="/broker" className="text-gold font-medium hover:underline">
              connect with a local broker
            </Link>
            .
          </p>
        </div>

        <PaginatedPropertyListing
          listKey={`/patna/${area.slug}`}
          queryKey={['area-rent', area.searchLocation]}
          enabled={Boolean(area?.searchLocation)}
          buildUrl={(limit, offset) => {
            const params = new URLSearchParams({
              type: 'rent',
              location: area.searchLocation,
              limit: String(limit),
              offset: String(offset),
            });
            return `/properties/search?${params.toString()}`;
          }}
          emptyTitle={`No listings in ${area.name} right now`}
          emptyMessage="New rentals are added regularly. Browse all Patna properties or check a nearby area."
          countLabel={({ total, showing }) => (
            <p>
              Showing <span className="font-semibold text-navy">{showing}</span> of{' '}
              <span className="font-semibold text-navy">{total}</span> properties for rent in{' '}
              {area.name}, Patna
            </p>
          )}
        />
        {otherAreas.length > 0 && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 sm:mt-16 pt-8 border-t border-stone-200">
            <h2 className="text-lg sm:text-xl font-bold text-navy mb-4">
              Flats for rent in other Patna areas
            </h2>
            <ul className="flex flex-wrap gap-2 sm:gap-3">
              {otherAreas.map((item) => (
                <li key={item.slug}>
                  <Link
                    to={item.path}
                    className="inline-block rounded-full border border-stone-200 bg-white px-3 py-1.5 text-sm text-navy hover:border-gold hover:text-gold transition-colors"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  to="/patna"
                  className="inline-block rounded-full border border-gold/40 bg-gold/10 px-3 py-1.5 text-sm font-medium text-navy hover:bg-gold/20 transition-colors"
                >
                  View all areas
                </Link>
              </li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default AreaFlatsForRent;
