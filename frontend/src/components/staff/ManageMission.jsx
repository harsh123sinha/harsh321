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

export default function ManageMission({ variant }) {
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
      const { data } = await api.get(`${prefix}/mission/registrations`, { params });
      setRows(data.registrations || []);
    } catch (e) {
      toast.error(e.response?.data?.error || 'Failed to load mission registrations');
    }
    setLoading(false);
  }, [prefix, search, statusFilter]);

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [load]);

  const updateStatus = async (id, status) => {
    try {
      await api.patch(`${prefix}/mission/registrations/${id}`, { status });
      toast.success('Status updated');
      load();
    } catch (e) {
      toast.error(e.response?.data?.error || 'Update failed');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-navy mb-2">Mission registrations</h1>
      <p className="text-sm text-gray mb-6 max-w-2xl">
        1 Zameen, Char Parivar, 4 Floor — interest forms from the public site.
        {/* Future: group-matching backend will link rows with the same group_code. */}
      </p>

      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray" />
          <input
            type="search"
            placeholder="Search name, mobile, area, group code…"
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
                <th className="px-3 py-3">Name</th>
                <th className="px-3 py-3">Mobile</th>
                <th className="px-3 py-3">Email</th>
                <th className="px-3 py-3">Group</th>
                <th className="px-3 py-3">Code</th>
                <th className="px-3 py-3">Area</th>
                <th className="px-3 py-3">BHK</th>
                <th className="px-3 py-3">Funds</th>
                <th className="px-3 py-3">Status</th>
                <th className="px-3 py-3">Joined</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={11} className="px-4 py-8 text-center text-gray">
                    No registrations yet
                  </td>
                </tr>
              ) : (
                rows.map((r) => (
                  <tr key={r.id} className="border-t border-gray-light hover:bg-gray-50">
                    <td className="px-3 py-2">{r.id}</td>
                    <td className="px-3 py-2 font-medium text-navy">{r.name}</td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <a href={`tel:${r.mobile}`} className="text-navy font-semibold hover:underline">
                        {r.mobile}
                      </a>
                    </td>
                    <td className="px-3 py-2">{r.email || '—'}</td>
                    <td className="px-3 py-2 capitalize">
                      {r.group_mode === 'group' ? 'Own group' : 'Match me'}
                    </td>
                    <td className="px-3 py-2 font-mono text-xs">{r.group_code || '—'}</td>
                    <td className="px-3 py-2">
                      {[r.area, r.pincode].filter(Boolean).join(', ') || '—'}
                    </td>
                    <td className="px-3 py-2">{r.bhk}</td>
                    <td className="px-3 py-2 whitespace-nowrap">{r.funds_range}</td>
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
