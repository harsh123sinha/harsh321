import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Bookmark, Building2 } from 'lucide-react';
import api from '../utils/api';
import PropertyCard from '../components/properties/PropertyCard';
import BrandLoader from '../components/ui/BrandLoader';

const SavedProperties = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['bookmarks', 'list'],
    queryFn: async () => {
      const res = await api.get('/saved-properties');
      return res.data;
    },
  });

  const properties = data?.properties || [];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-start gap-3">
          <Bookmark className="h-8 w-8 text-gold flex-shrink-0 mt-1" aria-hidden />
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-navy mb-2">Saved Properties</h1>
            <p className="text-gray">Properties you bookmarked for later</p>
          </div>
        </div>

        {isLoading ? (
          <BrandLoader />
        ) : properties.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-xl shadow-md">
            <Building2 className="h-16 w-16 text-gray mx-auto mb-4" />
            <h2 className="text-xl font-bold text-navy mb-2">No saved properties yet</h2>
            <p className="text-gray mb-6 max-w-md mx-auto">
              Tap the bookmark icon on any listing to save it here.
            </p>
            <Link
              to="/search"
              className="inline-block bg-gold text-navy px-6 py-3 rounded-lg font-semibold hover:bg-gold/90"
            >
              Browse properties
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default SavedProperties;
