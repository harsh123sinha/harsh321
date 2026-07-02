import { useState } from 'react';
import { Search, Users } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import api from '../../utils/api';
import BrokerCard from '../../components/brokers/BrokerCard';
import BrokerFigureAnimation from '../../components/brokers/BrokerFigureAnimation';
import BrandLoader from '../../components/ui/BrandLoader';

const BrokerSearch = () => {
  const [area, setArea] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['brokers', searchTerm],
    queryFn: async () => {
      const res = await api.get('/brokers', { params: searchTerm ? { area: searchTerm } : {} });
      return res.data;
    },
  });

  const brokers = data?.brokers || [];

  const onSearch = (e) => {
    e.preventDefault();
    setSearchTerm(area.trim());
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-navy text-white py-10 sm:py-14 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-10 text-center sm:text-left">
            <BrokerFigureAnimation className="h-32 w-32 sm:h-40 sm:w-40" />
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold mb-3">Find a Verified Broker</h1>
              <p className="text-gray-light max-w-xl">
                Trusted brokers across Patna — rated by Harsh To Let Services and real customers.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
        <form
          onSubmit={onSearch}
          className="bg-white rounded-xl shadow-lg p-4 sm:p-6 flex flex-col sm:flex-row gap-3 border border-gray-light/50"
        >
          <div className="flex-1">
            <label className="block text-sm font-medium text-navy mb-1">Find the best broker in your area</label>
            <input
              type="text"
              value={area}
              onChange={(e) => setArea(e.target.value)}
              placeholder="e.g. Boring Road, Kankarbagh, Patna"
              className="w-full border-2 border-gray-light rounded-lg px-4 py-3 focus:border-gold focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="sm:self-end bg-gold text-navy px-8 py-3 rounded-lg font-bold hover:bg-gold/90 flex items-center justify-center gap-2"
          >
            <Search className="h-5 w-5" />
            Search
          </button>
        </form>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {isLoading || isFetching ? (
          <BrandLoader />
        ) : brokers.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl shadow-md">
            <Users className="h-16 w-16 text-gray mx-auto mb-4" />
            <p className="text-navy font-semibold">No brokers found for this area</p>
            <p className="text-gray text-sm mt-2">Try a broader area name or leave empty to see top brokers.</p>
          </div>
        ) : (
          <div>
            <h2 className="text-lg font-bold text-navy mb-6">
              {searchTerm ? `Brokers in “${searchTerm}”` : 'All brokers'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {brokers.map((b) => (
                <BrokerCard key={b.brokerId} broker={b} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BrokerSearch;
