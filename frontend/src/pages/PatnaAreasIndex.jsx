import { Link } from 'react-router-dom';
import { MapPin } from 'lucide-react';
import { FEATURED_PATNA_AREAS, PATNA_AREA_PAGES } from '../constants/areaPages';

const PatnaAreasIndex = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-[#0a1020] text-white pb-8 pt-8 sm:pb-10 sm:pt-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4">
            Flats for Rent in Patna by Area
          </h1>
          <p className="text-base sm:text-lg text-white/75 max-w-3xl">
            Choose a Patna locality to find verified rental flats, apartments and houses near you.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <section className="mb-10">
          <h2 className="text-xl font-bold text-navy mb-4 flex items-center gap-2">
            <MapPin className="h-5 w-5 text-gold" />
            Popular areas
          </h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {FEATURED_PATNA_AREAS.map((area) => (
              <li key={area.slug}>
                <Link
                  to={area.path}
                  className="block rounded-xl border border-stone-200 bg-white px-4 py-3 text-navy hover:border-gold hover:shadow-sm transition-all"
                >
                  <span className="font-semibold">Flats for rent in {area.name}</span>
                  <span className="block text-sm text-gray mt-0.5">Patna, Bihar</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-navy mb-4">All Patna localities</h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
            {PATNA_AREA_PAGES.map((area) => (
              <li key={area.slug}>
                <Link
                  to={area.path}
                  className="block rounded-lg px-3 py-2 text-sm text-navy hover:text-gold hover:bg-white transition-colors"
                >
                  {area.name}
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <p className="mt-10 text-sm text-gray">
          Also browse{' '}
          <Link to="/rent" className="text-gold font-medium hover:underline">
            all properties for rent in Patna
          </Link>
          ,{' '}
          <Link to="/shop" className="text-gold font-medium hover:underline">
            shops for rent
          </Link>
          , or{' '}
          <Link to="/plots" className="text-gold font-medium hover:underline">
            plots for sale
          </Link>
          .
        </p>
      </div>
    </div>
  );
};

export default PatnaAreasIndex;
