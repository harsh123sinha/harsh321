import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import BrandLoader from '../ui/BrandLoader';
import { getImageUrl } from '../../utils/api';

function formatWhen(value) {
  if (!value) return '';
  try {
    return new Date(value).toLocaleString('en-IN');
  } catch {
    return '';
  }
}

export default function ManagePropertyChats({ variant }) {
  const prefix = variant === 'admin' ? '/admin' : '/subadmin';
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`${prefix}/property-chats`);
      setRows(data.chats || []);
    } catch (e) {
      toast.error(e.response?.data?.error || 'Failed to load property chats');
    }
    setLoading(false);
  }, [prefix]);

  useEffect(() => {
    load();
    const t = setInterval(load, 15000);
    return () => clearInterval(t);
  }, [load]);

  if (loading) return <BrandLoader fullScreen />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-navy mb-2 flex items-center gap-2">
        <MessageCircle className="h-7 w-7" />
        Property chats
      </h1>
      <p className="text-sm text-gray mb-6 max-w-2xl">
        Buyer inquiries on listings added by Harsh To Let Services (staff-listed properties).
      </p>

      <div className="overflow-x-auto rounded-xl border border-gray-light bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-light/40 text-left text-navy">
            <tr>
              <th className="px-4 py-3 font-semibold">Property</th>
              <th className="px-4 py-3 font-semibold">Buyer</th>
              <th className="px-4 py-3 font-semibold">Last message</th>
              <th className="px-4 py-3 font-semibold">Updated</th>
              <th className="px-4 py-3 font-semibold" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-light">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-gray">
                  No property chats yet
                </td>
              </tr>
            ) : (
              rows.map((row) => {
                const thumb = row.property?.imageUrl
                  ? String(row.property.imageUrl).split(',')[0].trim()
                  : '';
                return (
                  <tr key={row.id} className="hover:bg-gray-light/20">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-10 w-10 rounded overflow-hidden bg-navy/10 shrink-0">
                          {thumb ? (
                            <img src={getImageUrl(thumb)} alt="" className="h-full w-full object-cover" />
                          ) : null}
                        </div>
                        <span className="font-medium text-navy line-clamp-2 max-w-[200px]">
                          {row.property?.title || '—'}
                        </span>
                        {row.unreadCount > 0 ? (
                          <span className="shrink-0 rounded-full bg-gold text-navy text-xs font-bold px-2 py-0.5">
                            {row.unreadCount}
                          </span>
                        ) : null}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-darker">
                      {row.buyerName || '—'}
                      <br />
                      <span className="text-xs text-gray">{row.buyerPhone || ''}</span>
                    </td>
                    <td className="px-4 py-3 text-gray max-w-xs truncate">{row.lastMessagePreview || '—'}</td>
                    <td className="px-4 py-3 text-gray text-xs whitespace-nowrap">{formatWhen(row.updatedAt)}</td>
                    <td className="px-4 py-3">
                      <Link
                        to={`${prefix}/property-chats/${row.id}`}
                        className="inline-flex rounded-lg bg-navy px-3 py-1.5 text-xs font-semibold text-white hover:bg-navy-light"
                      >
                        Open
                      </Link>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
