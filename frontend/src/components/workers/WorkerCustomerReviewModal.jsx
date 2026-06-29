import { useState } from 'react';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';
import { useQueryClient } from '@tanstack/react-query';
import api from '../../utils/api';
import { StarRatingInput } from '../brokers/StarRating';
import { formatEmployeeId } from '../../utils/helpers';

function workerInitials(name) {
  return String(name || '?')
    .split(/\s+/)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

const WorkerCustomerReviewModal = ({
  open,
  onClose,
  workerId,
  employeeId,
  workerName,
  workerPhoto,
  workerProfession,
  notificationId,
}) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  if (!open) return null;

  const submit = async (e) => {
    e.preventDefault();
    if (rating < 1) {
      toast.error('Please select a star rating');
      return;
    }
    if (!comment.trim()) {
      toast.error('Please add a short comment');
      return;
    }
    setLoading(true);
    try {
      await api.post('/worker-customer-reviews', {
        workerId,
        employeeId,
        rating,
        comment: comment.trim(),
        notificationId,
      });
      queryClient.invalidateQueries({ queryKey: ['publicVendors'] });
      toast.success('Thank you for your review!');
      onClose(true);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Could not submit review');
    }
    setLoading(false);
  };

  const displayId = employeeId || (workerId ? formatEmployeeId(workerId) : '');

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-navy/60 backdrop-blur-sm px-4">
      <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
        <button
          type="button"
          onClick={() => onClose(false)}
          className="absolute top-4 right-4 p-1 rounded-full text-gray hover:bg-gray-100"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-4 mb-4 pr-8">
          <div className="h-14 w-14 rounded-full bg-navy text-gold flex items-center justify-center font-bold overflow-hidden flex-shrink-0">
            {workerPhoto ? (
              <img src={workerPhoto} alt="" className="h-full w-full object-cover" />
            ) : (
              workerInitials(workerName)
            )}
          </div>
          <div>
            <h2 className="text-lg font-bold text-navy">Rate your service provider</h2>
            <p className="text-sm text-gray">
              How was your experience with <strong className="text-navy">{workerName}</strong>?
            </p>
            {displayId && <p className="text-xs font-mono text-gold mt-0.5">{displayId}</p>}
            {workerProfession && <p className="text-xs text-stone-500">{workerProfession}</p>}
          </div>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <p className="text-sm font-medium text-navy mb-2">Your rating</p>
            <StarRatingInput value={rating} onChange={setRating} />
          </div>
          <div>
            <label className="block text-sm font-medium text-navy mb-2">Comment</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              required
              className="w-full border-2 border-gray-light rounded-lg px-3 py-2 focus:border-gold focus:outline-none"
              placeholder="Share your experience…"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gold text-navy py-3 rounded-lg font-bold hover:bg-gold/90 disabled:opacity-50"
          >
            {loading ? 'Submitting…' : 'Submit review'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default WorkerCustomerReviewModal;
