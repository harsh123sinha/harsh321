import { useState } from 'react';
import { X, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../utils/api';
import { StarRatingInput } from './StarRating';
import { brokerInitials } from '../../utils/brokerHelpers';

const BrokerDoneModal = ({ open, onClose, property, apiPrefix, users }) => {
  const [rating, setRating] = useState(0);
  const [brokerIdInput, setBrokerIdInput] = useState('');
  const [brokerPreview, setBrokerPreview] = useState(null);
  const [customerUserId, setCustomerUserId] = useState('');
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);

  if (!open || !property) return null;

  const searchBroker = async () => {
    const id = brokerIdInput.trim();
    if (!id) {
      toast.error('Enter a broker ID');
      return;
    }
    setSearching(true);
    try {
      const res = await api.get(`${apiPrefix}/brokers/lookup`, { params: { brokerId: id } });
      setBrokerPreview(res.data.broker);
    } catch {
      setBrokerPreview(null);
      toast.error('Broker not found');
    }
    setSearching(false);
  };

  const submit = async (e) => {
    e.preventDefault();
    if (rating < 1) {
      toast.error('Select an internal rating (1–5)');
      return;
    }
    if (!brokerPreview) {
      toast.error('Search and confirm a broker first');
      return;
    }
    if (!customerUserId) {
      toast.error('Select the customer to notify');
      return;
    }
    setLoading(true);
    try {
      await api.post(`${apiPrefix}/broker-ratings`, {
        brokerId: brokerPreview.brokerId,
        propertyId: property.id,
        rating,
        customerUserId: Number(customerUserId),
      });
      toast.success('Rating saved and customer notified');
      onClose(true);
      setRating(0);
      setBrokerIdInput('');
      setBrokerPreview(null);
      setCustomerUserId('');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save rating');
    }
    setLoading(false);
  };

  const buyers = (users || []).filter((u) => u.role === 'buyer');

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full my-8 p-6 relative">
        <button type="button" onClick={() => onClose(false)} className="absolute top-4 right-4 p-1 rounded hover:bg-gray-100">
          <X className="h-5 w-5" />
        </button>
        <h2 className="text-lg font-bold text-navy mb-1">Mark listing done</h2>
        <p className="text-sm text-gray mb-4 truncate">{property.title}</p>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <p className="text-sm font-medium text-navy mb-2">Harsh To Let Services rating</p>
            <StarRatingInput value={rating} onChange={setRating} />
          </div>

          <div>
            <label className="block text-sm font-medium text-navy mb-1">Broker ID</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={brokerIdInput}
                onChange={(e) => setBrokerIdInput(e.target.value)}
                placeholder="e.g. HTL-1001"
                className="flex-1 border-2 border-gray-light rounded-lg px-3 py-2"
              />
              <button
                type="button"
                onClick={searchBroker}
                disabled={searching}
                className="px-3 py-2 bg-navy text-white rounded-lg hover:bg-navy/90"
                aria-label="Search broker"
              >
                <Search className="h-5 w-5" />
              </button>
            </div>
            {brokerPreview && (
              <div className="mt-3 flex items-center gap-3 p-3 rounded-lg bg-green-50 border border-green-200">
                <div className="h-10 w-10 rounded-full bg-navy text-gold flex items-center justify-center text-sm font-bold">
                  {brokerPreview.photoUrl ? (
                    <img src={brokerPreview.photoUrl} alt="" className="h-full w-full rounded-full object-cover" />
                  ) : (
                    brokerInitials(brokerPreview.name)
                  )}
                </div>
                <div>
                  <p className="font-semibold text-navy text-sm">{brokerPreview.name}</p>
                  <p className="text-xs text-gray font-mono">{brokerPreview.brokerId}</p>
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-navy mb-1">Notify customer *</label>
            <select
              required
              value={customerUserId}
              onChange={(e) => setCustomerUserId(e.target.value)}
              className="w-full border-2 border-gray-light rounded-lg px-3 py-2"
            >
              <option value="">Select buyer to review broker</option>
              {buyers.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} — {u.email}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gold text-navy py-3 rounded-lg font-bold hover:bg-gold/90 disabled:opacity-50"
          >
            {loading ? 'Sending…' : 'Send to User'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default BrokerDoneModal;
