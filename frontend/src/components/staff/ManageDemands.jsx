import { useCallback, useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import BrandLoader from '../ui/BrandLoader';

const STATUS_OPTS = ['new', 'contacted', 'matched', 'closed'];

function formatDate(value) {
  if (!value) return '—';
  try {
    return new Date(value).toLocaleString('en-IN');
  } catch {
    return String(value);
  }
}

function formatBudget(min, max) {
  const a = min != null && min !== '' ? Number(min) : null;
  const b = max != null && max !== '' ? Number(max) : null;
  if (a == null && b == null) return '—';
  const fmt = (n) => `₹${Number(n).toLocaleString('en-IN')}`;
  if (a != null && b != null) return `${fmt(a)} – ${fmt(b)}`;
  if (a != null) return `from ${fmt(a)}`;
  return `upto ${fmt(b)}`;
}

function categoryLabel(cat) {
  const map = {
    homes: 'House',
    flat: 'Flat',
    apartment: 'Apartment',
    shop: 'Shop',
    commercial: 'Commercial space',
    plot: 'Plot',
    other: 'Other',
  };
  return map[cat] || cat || '—';
}

export default function ManageDemands({ variant }) {
  const prefix = variant === 'admin' ? '/admin' : '/subadmin';
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (search.trim()) params.q = search.trim();
      if (statusFilter) params.status = statusFilter;
      const { data } = await api.get(`${prefix}/demands`, { params });
      setRows(data.demands || []);
    } catch (e) {
      toast.error(e.response?.data?.error || 'Failed to load user demands');
    }
    setLoading(false);
  }, [prefix, search, statusFilter]);

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [load]);

  const updateStatus = async (id, status) => {
    try {
      await api.patch(`${prefix}/demands/${id}`, { status });
      toast.success('Status updated');
      load();
    } catch (e) {
      toast.error(e.response?.data?.error || 'Update failed');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-navy mb-2">User demands</h1>
      <p className="text-sm text-gray mb-6 max-w-2xl">
        Property requirements submitted by visitors when no matching listing was found. No login required.
      </p>

      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray" />
          <input
            type="search"
            placeholder="Search phone, name, area, category…"
            className="w-full pl-10 pr-3 py-2 border-2 border-gray-light rounded-lg text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="border-2 border-gray-light rounded-lg px-3 py-2 text-sm"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All statuses</option>
          {STATUS_OPTS.map((s) => (
            <option key={s} value={s}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <BrandLoader size="sm" />
      ) : (
        <div className="bg-white rounded-xl shadow overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-navy text-white text-left">
              <tr>
                <th className="px-3 py-3">ID</th>
                <th className="px-3 py-3">Contact</th>
                <th className="px-3 py-3">Category</th>
                <th className="px-3 py-3">Type</th>
                <th className="px-3 py-3">Area</th>
                <th className="px-3 py-3">Details</th>
                <th className="px-3 py-3">Budget</th>
                <th className="px-3 py-3">Requirements</th>
                <th className="px-3 py-3">Status</th>
                <th className="px-3 py-3">Submitted</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-8 text-center text-gray">
                    No demands yet
                  </td>
                </tr>
              ) : (
                rows.map((r) => (
                  <tr key={r.id} className="border-t border-gray-light hover:bg-gray-50 align-top">
                    <td className="px-3 py-2">{r.id}</td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      {r.contact_name ? (
                        <div className="font-medium text-navy">{r.contact_name}</div>
                      ) : null}
                      <a
                        href={`tel:${r.contact_phone}`}
                        className="text-navy font-semibold hover:underline"
                      >
                        {r.contact_phone}
                      </a>
                    </td>
                    <td className="px-3 py-2">{categoryLabel(r.category)}</td>
                    <td className="px-3 py-2 capitalize whitespace-nowrap">
                      {String(r.listing_type || '—').replace('_', ' ')}
                    </td>
                    <td className="px-3 py-2">
                      {[r.location, r.city].filter(Boolean).join(', ') || '—'}
                    </td>
                    <td className="px-3 py-2 text-xs text-stone-700 max-w-[180px]">
                      {[
                        r.bhk ? `${r.bhk} BHK` : null,
                        r.floor_pref ? `Floor: ${r.floor_pref}` : null,
                        r.facing ? `Facing: ${r.facing}` : null,
                        r.furnishing ? `Furnish: ${r.furnishing}` : null,
                        r.shop_sqft_range ? `Shop: ${r.shop_sqft_range}` : null,
                        r.katha ? `Katha: ${r.katha}` : null,
                      ]
                        .filter(Boolean)
                        .join(' · ') || '—'}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-xs">
                      {formatBudget(r.budget_min, r.budget_max)}
                    </td>
                    <td className="px-3 py-2 max-w-[240px]">
                      <p className="line-clamp-3 whitespace-pre-wrap text-xs text-stone-700">
                        {r.requirements || '—'}
                      </p>
                    </td>
                    <td className="px-3 py-2">
                      <select
                        className="text-xs border border-gray-light rounded px-2 py-1 capitalize"
                        value={r.status || 'new'}
                        onChange={(e) => updateStatus(r.id, e.target.value)}
                      >
                        {STATUS_OPTS.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-3 py-2 text-xs whitespace-nowrap">{formatDate(r.created_at)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
