import { useQuery } from '@tanstack/react-query';
import { Building2, Bookmark } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';
import PropertyListRow from '../../components/properties/PropertyListRow';

const BuyerDashboard = () => {
  const { user } = useAuth();

  const { data: homeData } = useQuery({
    queryKey: ['buyerDashboard'],
    queryFn: async () => {
      const response = await api.get('/public/home');
      return response.data;
    },
  });

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-navy mb-2">Buyer Dashboard</h1>
          <p className="text-gray">Welcome back, {user?.name}!</p>
        </div>

        {homeData?.stats && (
          <div className="bg-white rounded-xl shadow-md p-6 mb-8">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-2xl sm:text-3xl font-bold text-gold">{homeData.stats.totalProperties}+</p>
                <p className="text-sm text-gray">Properties</p>
              </div>
              <div className="text-center">
                <p className="text-2xl sm:text-3xl font-bold text-gold">{homeData.stats.totalUsers}+</p>
                <p className="text-sm text-gray">Users</p>
              </div>
              <div className="text-center">
                <p className="text-2xl sm:text-3xl font-bold text-gold">{homeData.stats.yearsOfExperience}+</p>
                <p className="text-sm text-gray">Years</p>
              </div>
            </div>
          </div>
        )}

        <Link
          to="/saved"
          className="flex items-center gap-3 bg-white rounded-xl shadow-md p-5 mb-8 border border-gold/20 hover:border-gold/50 transition-colors"
        >
          <Bookmark className="h-8 w-8 text-gold flex-shrink-0" />
          <div>
            <p className="font-bold text-navy">Saved properties</p>
            <p className="text-sm text-gray">View listings you bookmarked</p>
          </div>
        </Link>

        <h2 className="text-2xl font-bold text-navy mb-6">Featured Properties</h2>
        {homeData?.featuredProperties?.length > 0 ? (
          <PropertyListRow properties={homeData.featuredProperties.slice(0, 6)} />
        ) : (
          <div className="text-center py-12">
            <Building2 className="h-16 w-16 text-gray mx-auto mb-4" />
            <p className="text-gray">No featured properties available</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BuyerDashboard;
