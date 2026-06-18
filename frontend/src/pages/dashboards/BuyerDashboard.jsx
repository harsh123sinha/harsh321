import { useQuery } from '@tanstack/react-query';
import { Building2 } from 'lucide-react';
import api from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';
import PropertyCard from '../../components/properties/PropertyCard';

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

        <h2 className="text-2xl font-bold text-navy mb-6">Featured Properties</h2>
        {homeData?.featuredProperties?.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {homeData.featuredProperties.slice(0, 6).map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
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
