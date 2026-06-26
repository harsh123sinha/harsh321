import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, Star } from 'lucide-react';
import api from '../../utils/api';
import { brokerInitials } from '../../utils/brokerHelpers';
import BrandLoader from '../../components/ui/BrandLoader';
import { formatTimeAgo } from '../../utils/notifications';

const BrokerReviews = () => {
  const { brokerId } = useParams();

  const { data, isLoading } = useQuery({
    queryKey: ['broker-reviews', brokerId],
    queryFn: async () => {
      const res = await api.get(`/brokers/${brokerId}/reviews`);
      return res.data;
    },
  });

  const broker = data?.broker;
  const reviews = data?.reviews || [];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link to="/broker" className="inline-flex items-center gap-1 text-sm text-gold hover:underline mb-6">
          <ChevronLeft className="h-4 w-4" />
          Back to broker search
        </Link>

        {isLoading ? (
          <BrandLoader />
        ) : !broker ? (
          <p className="text-center text-gray">Broker not found.</p>
        ) : (
          <>
            <div className="bg-white rounded-xl shadow-md p-6 mb-8 flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-navy text-gold flex items-center justify-center text-lg font-bold">
                {broker.photoUrl ? (
                  <img src={broker.photoUrl} alt="" className="h-full w-full rounded-full object-cover" />
                ) : (
                  brokerInitials(broker.name)
                )}
              </div>
              <div>
                <h1 className="text-xl font-bold text-navy">{broker.name}</h1>
                <p className="text-sm font-mono text-gray">{broker.brokerId}</p>
              </div>
            </div>

            <h2 className="text-lg font-bold text-navy mb-4">Customer reviews</h2>
            {reviews.length === 0 ? (
              <p className="text-gray text-center py-12 bg-white rounded-xl">No reviews yet.</p>
            ) : (
              <div className="space-y-4">
                {reviews.map((r) => (
                  <div key={r.id} className="bg-white rounded-xl shadow-sm border border-gray-light/60 p-5">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <p className="font-semibold text-navy">{r.customerName}</p>
                      <p className="text-xs text-gray">{formatTimeAgo(r.createdAt)}</p>
                    </div>
                    <div className="flex gap-0.5 mb-3">
                      {Array.from({ length: 5 }, (_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${i < Math.round(r.rating) ? 'fill-gold text-gold' : 'text-gray-light'}`}
                        />
                      ))}
                      <span className="ml-1 text-sm font-medium text-navy">{r.rating.toFixed(1)}</span>
                    </div>
                    <p className="text-sm text-gray-darker whitespace-pre-line">{r.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default BrokerReviews;
