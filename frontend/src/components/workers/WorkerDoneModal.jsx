import { useState } from 'react';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../utils/api';
import { StarRatingInput } from '../brokers/StarRating';
import { formatEmployeeId } from '../../utils/helpers';

const WorkerDoneModal = ({ open, onClose, worker, users }) => {
  const [rating, setRating] = useState(0);
  const [customerUserId, setCustomerUserId] = useState('');
  const [loading, setLoading] = useState(false);

  if (!open || !worker) return null;

  const employeeId = worker.employee_id || formatEmployeeId(worker.id);
  const buyers = (users || []).filter((u) => u.role === 'buyer');

  const submit = async (e) => {
    e.preventDefault();
    if (rating < 1) {
      toast.error('Select an internal rating (1–5)');
      return;
    }
    if (!customerUserId) {
      toast.error('Select the customer to notify');
      return;
    }
    setLoading(true);
    try {
      await api.post(`/admin/workers/${worker.id}/reviews`, {
        rating,
        customerUserId: Number(customerUserId),
      });
      toast.success('Rating saved — customer notified to review');
      setRating(0);
      setCustomerUserId('');
      onClose(true);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save rating');
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full my-8 p-6 relative">
        <button type="button" onClick={() => onClose(false)} className="absolute top-4 right-4 p-1 rounded hover:bg-gray-100">
          <X className="h-5 w-5" />
        </button>
        <h2 className="text-lg font-bold text-navy mb-1">Mark work done</h2>
        <p className="text-sm text-gray mb-4">
          {worker.name} · <span className="font-mono text-gold">{employeeId}</span>
        </p>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <p className="text-sm font-medium text-navy mb-2">Review by Harsh To Let Services</p>
            <StarRatingInput value={rating} onChange={setRating} />
          </div>

          <div className="rounded-lg border border-stone-200 bg-stone-50 p-3 text-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">Worker ID</p>
            <p className="font-mono font-semibold text-gold mt-0.5">{employeeId}</p>
            <p className="text-navy font-medium mt-2">{worker.name}</p>
            <p className="text-xs text-stone-500">{worker.profession}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-navy mb-1">Customer to review *</label>
            <select
              required
              value={customerUserId}
              onChange={(e) => setCustomerUserId(e.target.value)}
              className="w-full border-2 border-gray-light rounded-lg px-3 py-2"
            >
              <option value="">Select customer who used this service</option>
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
            {loading ? 'Sending…' : 'Send to customer for review'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default WorkerDoneModal;
