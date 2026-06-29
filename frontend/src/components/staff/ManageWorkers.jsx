import { useEffect, useState, Fragment } from 'react';
import { ChevronDown, ChevronUp, Search } from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import BrandLoader from '../ui/BrandLoader';
import { formatWorkerPrice, getCategoryLabelByProfession } from '../../constants/workerProfessions';
import { formatEmployeeId } from '../../utils/helpers';
import { StarRatingDisplay } from '../brokers/StarRating';
import WorkerDoneModal from '../workers/WorkerDoneModal';

function DetailItem({ label, value, className = '' }) {
  if (value === null || value === undefined || value === '') return null;
  return (
    <div className={className}>
      <dt className="text-[11px] font-semibold uppercase tracking-wide text-stone-500">{label}</dt>
      <dd className="mt-0.5 text-sm text-navy break-words">{value}</dd>
    </div>
  );
}

function formatBool(value) {
  if (value === null || value === undefined) return null;
  return value ? 'Yes' : 'No';
}

function formatDate(value) {
  if (!value) return null;
  try {
    return new Date(value).toLocaleString('en-IN');
  } catch {
    return String(value);
  }
}

function formatReviewOption(review) {
  const date = review.created_at
    ? new Date(review.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : '';
  const snippet = String(review.comment || '').replace(/\s+/g, ' ').trim();
  const short = snippet.length > 72 ? `${snippet.slice(0, 72)}…` : snippet;
  const who = review.customer_name || review.customerName || 'Customer';
  return `★${Number(review.rating).toFixed(1)} · ${who}: ${short}${date ? ` (${date})` : ''}`;
}

function WorkerReviewsDropdown({ reviews }) {
  if (!reviews?.length) {
    return (
      <select
        disabled
        className="mt-1 w-full max-w-[220px] text-xs border border-stone-200 rounded-md px-2 py-1.5 bg-stone-50 text-stone-500"
      >
        <option>No customer reviews yet</option>
      </select>
    );
  }

  const listSize = Math.min(reviews.length, 4);

  return (
    <select
      size={listSize}
      className="mt-1 w-full max-w-[300px] text-xs border border-stone-200 rounded-md px-2 py-1 bg-white text-navy max-h-28 overflow-y-auto"
      defaultValue={reviews[0]?.id}
      onClick={(e) => e.stopPropagation()}
      onChange={(e) => e.stopPropagation()}
    >
      {reviews.map((r) => (
        <option key={r.id} value={r.id} title={r.comment}>
          {formatReviewOption(r)}
        </option>
      ))}
    </select>
  );
}

function WorkerListings({ listings }) {
  if (!listings?.length) {
    return <p className="text-sm text-stone-500">No listings.</p>;
  }

  return (
    <div className="space-y-3">
      {listings.map((listing) => (
        <div key={listing.id} className="rounded-lg border border-stone-200 bg-stone-50 p-3 text-sm">
          <p className="font-semibold text-navy">{listing.title || listing.material_type || `Listing #${listing.id}`}</p>
          <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-stone-700">
            {listing.listing_kind && <span>Kind: {listing.listing_kind}</span>}
            {listing.rate_amount != null && (
              <span>
                Rate: ₹{Number(listing.rate_amount).toLocaleString('en-IN')} ({listing.price_type})
              </span>
            )}
            {listing.vehicle_type && <span>Vehicle: {listing.vehicle_type}</span>}
            {listing.rental_mode && <span>Mode: {String(listing.rental_mode).replace('_', ' ')}</span>}
            {listing.model_year && <span>Year: {listing.model_year}</span>}
            {listing.material_type && <span>Material: {listing.material_type}</span>}
            {listing.description && <span className="sm:col-span-2 lg:col-span-3">{listing.description}</span>}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function ManageWorkers() {
  const [workers, setWorkers] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [doneWorker, setDoneWorker] = useState(null);

  const load = async (q = search) => {
    setLoading(true);
    try {
      const params = q.trim() ? { q: q.trim() } : {};
      const { data } = await api.get('/admin/workers', { params });
      setWorkers(data.workers || []);
    } catch (e) {
      toast.error(e.response?.data?.error || 'Failed to load workers');
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
    api.get('/admin/users').then(({ data }) => setUsers(data.users || [])).catch(() => {});
  }, []);

  const toggleExpand = (id) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-navy">Workers &amp; vendors</h1>
          <p className="text-sm text-stone-600 mt-1">Full worker profiles including employee ID, phone numbers, and reviews.</p>
        </div>
        <form
          className="relative w-full sm:max-w-xs"
          onSubmit={(e) => {
            e.preventDefault();
            load(search);
          }}
        >
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, phone, ID…"
            className="w-full pl-9 pr-3 py-2 text-sm border border-stone-200 rounded-lg focus:outline-none focus:border-gold"
          />
        </form>
      </div>

      {loading ? (
        <BrandLoader size="sm" />
      ) : (
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-navy text-white text-left">
                <tr>
                  <th className="px-4 py-3 w-10" />
                  <th className="px-4 py-3">Employee ID</th>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Phone</th>
                  <th className="px-4 py-3">Rating</th>
                  <th className="px-4 py-3 min-w-[200px]">Reviews</th>
                  <th className="px-4 py-3">Profession</th>
                  <th className="px-4 py-3">Profile</th>
                </tr>
              </thead>
              <tbody>
                {workers.map((w) => {
                  const employeeId = w.employee_id || formatEmployeeId(w.id);
                  const open = expandedId === w.id;
                  const reviews = w.reviews || [];
                  return (
                    <Fragment key={w.id}>
                      <tr className="border-t border-gray-light hover:bg-gray-50">
                        <td
                          className="px-4 py-3 text-stone-500 cursor-pointer"
                          onClick={() => toggleExpand(w.id)}
                        >
                          {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </td>
                        <td
                          className="px-4 py-3 font-mono text-xs font-semibold text-gold cursor-pointer"
                          onClick={() => toggleExpand(w.id)}
                        >
                          {employeeId}
                        </td>
                        <td
                          className="px-4 py-3 font-medium text-navy cursor-pointer"
                          onClick={() => toggleExpand(w.id)}
                        >
                          {w.name}
                        </td>
                        <td
                          className="px-4 py-3 font-mono cursor-pointer"
                          onClick={() => toggleExpand(w.id)}
                        >
                          {w.phone_number || '—'}
                        </td>
                        <td className="px-4 py-3" onClick={() => toggleExpand(w.id)}>
                          <StarRatingDisplay value={w.harsh_rating_avg} size="sm" />
                        </td>
                        <td className="px-4 py-3 align-top" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => setDoneWorker(w)}
                            className="inline-flex items-center rounded-md bg-gold px-2 py-1 text-xs font-bold text-navy hover:bg-gold/90"
                          >
                            Done
                          </button>
                          <WorkerReviewsDropdown reviews={reviews} />
                        </td>
                        <td
                          className="px-4 py-3 cursor-pointer"
                          onClick={() => toggleExpand(w.id)}
                        >
                          {w.profession}
                        </td>
                        <td className="px-4 py-3 cursor-pointer" onClick={() => toggleExpand(w.id)}>
                          <span
                            className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                              w.profile_complete ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {w.profile_complete ? 'Complete' : 'Incomplete'}
                          </span>
                        </td>
                      </tr>
                      {open && (
                        <tr className="border-t border-stone-100 bg-stone-50/80">
                          <td colSpan={8} className="px-4 py-4">
                            <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                              <DetailItem label="Worker ID" value={w.id} />
                              <DetailItem label="User ID" value={w.user_id} />
                              <DetailItem label="Employee ID" value={employeeId} />
                              <DetailItem label="Account name" value={w.user_name} />
                              <DetailItem label="Account email" value={w.user_account_email} />
                              <DetailItem label="Account phone" value={w.user_phone} />
                              <DetailItem label="Worker phone" value={w.phone_number} />
                              <DetailItem label="Worker email" value={w.email} />
                              <DetailItem label="Profession" value={w.profession} />
                              <DetailItem label="Category" value={getCategoryLabelByProfession(w.profession)} />
                              <DetailItem label="Profile type" value={w.profile_type} />
                              <DetailItem label="Description" value={w.description} className="sm:col-span-2 lg:col-span-3" />
                              <DetailItem label="Working hours/day" value={w.working_hours_per_day} />
                              <DetailItem label="Off day" value={w.off_day} />
                              <DetailItem label="Pricing" value={formatWorkerPrice(w) || '—'} />
                              <DetailItem label="Price type" value={w.price_type} />
                              <DetailItem label="Price amount" value={w.price_amount != null ? `₹${Number(w.price_amount).toLocaleString('en-IN')}` : null} />
                              <DetailItem label="Hall area (sq ft)" value={w.area_sqft != null ? Number(w.area_sqft).toLocaleString('en-IN') : null} />
                              <DetailItem label="Outside caterers" value={formatBool(w.outside_caterers_allowed)} />
                              <DetailItem label="Catering type" value={w.catering_type} />
                              <DetailItem label="Hall booking cost" value={w.hall_booking_cost != null ? `₹${Number(w.hall_booking_cost).toLocaleString('en-IN')}` : null} />
                              <DetailItem label="Veg platter" value={w.veg_platter_cost != null ? `₹${Number(w.veg_platter_cost).toLocaleString('en-IN')}` : null} />
                              <DetailItem label="Non-veg platter" value={w.nonveg_platter_cost != null ? `₹${Number(w.nonveg_platter_cost).toLocaleString('en-IN')}` : null} />
                              <DetailItem label="Created" value={formatDate(w.created_at)} />
                              <DetailItem label="Updated" value={formatDate(w.updated_at)} />
                            </dl>

                            {reviews.length > 0 && (
                              <div className="mt-5">
                                <h3 className="text-sm font-bold text-navy mb-2">Customer reviews ({reviews.length})</h3>
                                <div className="space-y-2">
                                  {reviews.map((r) => (
                                    <div key={r.id} className="rounded-lg border border-stone-200 bg-white p-3 text-sm">
                                      <div className="flex flex-wrap items-center gap-2 mb-1">
                                        <StarRatingDisplay value={r.rating} size="sm" />
                                        <span className="text-xs text-stone-500">
                                          {formatDate(r.created_at)}
                                          {(r.customer_name || r.customerName) ? ` · ${r.customer_name || r.customerName}` : ''}
                                        </span>
                                      </div>
                                      <p className="text-stone-700 whitespace-pre-wrap">{r.comment}</p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            <div className="mt-4 flex flex-wrap gap-4">
                              {w.worker_image_url && (
                                <a href={w.worker_image_url} target="_blank" rel="noopener noreferrer" className="text-sm text-gold font-medium hover:underline">
                                  Profile photo
                                </a>
                              )}
                              {w.aadhar_image_url && (
                                <a href={w.aadhar_image_url} target="_blank" rel="noopener noreferrer" className="text-sm text-gold font-medium hover:underline">
                                  Aadhar image
                                </a>
                              )}
                              {w.hall_image_url && (
                                <a href={w.hall_image_url} target="_blank" rel="noopener noreferrer" className="text-sm text-gold font-medium hover:underline">
                                  Hall image
                                </a>
                              )}
                            </div>

                            <div className="mt-5">
                              <h3 className="text-sm font-bold text-navy mb-2">Listings ({w.listings?.length || 0})</h3>
                              <WorkerListings listings={w.listings} />
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
          {workers.length === 0 && <p className="p-6 text-gray text-center">No workers found.</p>}
        </div>
      )}

      <WorkerDoneModal
        open={Boolean(doneWorker)}
        worker={doneWorker}
        users={users}
        onClose={(saved) => {
          setDoneWorker(null);
          if (saved) load();
        }}
      />
    </div>
  );
}
