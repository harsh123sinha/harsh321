import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft } from 'lucide-react';
import api from '../../utils/api';
import PropertyCard from '../../components/properties/PropertyCard';
import { StarRatingDisplay } from '../../components/brokers/StarRating';
import { brokerInitials } from '../../utils/brokerHelpers';

const BrokerProperties = () => {
  const { brokerId } = useParams();

  const { data, isLoading } = useQuery({
    queryKey: ['broker-properties-page', brokerId],
    queryFn: async () => {
      const res = await api.get(`/brokers/${brokerId}/properties`);
      return res.data;
    },
  });

  const broker = data?.broker;
  const properties = data?.properties || [];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link to="/broker" className="inline-flex items-center gap-1 text-sm text-gold hover:underline mb-6">
          <ChevronLeft className="h-4 w-4" />
          Back to broker search
        </Link>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold" />
          </div>
        ) : !broker ? (
          <p className="text-center text-gray">Broker not found.</p>
        ) : (
          <>
            <div className="bg-white rounded-xl shadow-md p-6 mb-8 flex flex-col sm:flex-row gap-4 items-start">
              <div className="h-20 w-20 rounded-full bg-navy text-gold flex items-center justify-center text-2xl font-bold flex-shrink-0">
                {broker.photoUrl ? (
                  <img src={broker.photoUrl} alt="" className="h-full w-full rounded-full object-cover" />
                ) : (
                  brokerInitials(broker.name)
                )}
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-navy">{broker.name}</h1>
                <p className="text-sm font-mono text-gray">{broker.brokerId}</p>
                <p className="text-gray mt-1">{broker.areaOfWork}</p>
                <div className="flex flex-wrap gap-6 mt-4">
                  <StarRatingDisplay value={broker.harshRating} label="Harsh To Let rating" size="lg" />
                  <StarRatingDisplay value={broker.customerRating} label="Customer rating" size="lg" />
                </div>
              </div>
              <Link
                to={`/broker/${brokerId}/reviews`}
                className="text-sm font-semibold text-gold hover:underline whitespace-nowrap"
              >
                Show all comments
              </Link>
            </div>

            <h2 className="text-xl font-bold text-navy mb-6">All listings ({properties.length})</h2>
            {properties.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {properties.map((p) => (
                  <Link key={p.id} to={`/property/${p.id}`}>
                    <PropertyCard property={p} />
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray py-12 bg-white rounded-xl">No listings available.</p>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default BrokerProperties;
