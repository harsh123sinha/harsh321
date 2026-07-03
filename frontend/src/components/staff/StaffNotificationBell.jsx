import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../../utils/api';

const CATEGORY_LABELS = {
  worker: 'Worker',
  owner: 'Owner',
  agent: 'Broker',
  buyer: 'Buyer',
  mission: 'Mission',
  property: 'Property',
};

function formatWhen(iso) {
  try {
    return new Date(iso).toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '';
  }
}

export default function StaffNotificationBell({ variant }) {
  const prefix = variant === 'admin' ? '/admin' : '/subadmin';
  const [open, setOpen] = useState(false);
  const panelRef = useRef(null);
  const queryClient = useQueryClient();

  const { data } = useQuery({
    queryKey: ['staff-alerts', variant],
    queryFn: async () => {
      const { data: res } = await api.get(`${prefix}/staff-alerts`);
      return res;
    },
    refetchInterval: 30000,
    staleTime: 15000,
  });

  const alerts = data?.alerts || [];
  const unreadCount = data?.unreadCount || 0;

  useEffect(() => {
    const onDoc = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) setOpen(false);
    };
    if (open) document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  const markRead = async (id) => {
    try {
      await api.patch(`${prefix}/staff-alerts/${id}/read`);
      queryClient.invalidateQueries({ queryKey: ['staff-alerts', variant] });
    } catch {
      /* ignore */
    }
  };

  const markAllRead = async () => {
    try {
      await api.patch(`${prefix}/staff-alerts/read-all`);
      queryClient.invalidateQueries({ queryKey: ['staff-alerts', variant] });
    } catch {
      /* ignore */
    }
  };

  const resolveLink = (alert) => {
    const path = alert.link_path || '';
    if (path.startsWith('/admin') && variant === 'subadmin') {
      return path.replace('/admin/', '/subadmin/');
    }
    return path || `${prefix}/dashboard`;
  };

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="relative p-2 rounded-lg text-navy hover:bg-gray-light/80 transition-colors"
        aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ''}`}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[1.1rem] h-[1.1rem] px-0.5 rounded-full bg-red-600 text-white text-[10px] font-bold flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-[min(22rem,calc(100vw-2rem))] bg-white rounded-xl shadow-xl border border-gray-light z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-light bg-navy text-white">
            <span className="font-semibold text-sm">New activity</span>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllRead}
                className="text-xs text-gold hover:underline"
              >
                Mark all read
              </button>
            )}
          </div>
          <ul className="max-h-80 overflow-y-auto divide-y divide-gray-light">
            {alerts.length === 0 ? (
              <li className="px-4 py-6 text-sm text-gray text-center">No alerts yet</li>
            ) : (
              alerts.map((a) => (
                <li key={a.id}>
                  <Link
                    to={resolveLink(a)}
                    onClick={() => {
                      if (!a.is_read) markRead(a.id);
                      setOpen(false);
                    }}
                    className={`block px-4 py-3 hover:bg-gray-50 transition-colors ${a.is_read ? 'opacity-70' : 'bg-gold/5'}`}
                  >
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded bg-navy text-gold">
                        {CATEGORY_LABELS[a.category] || a.category}
                      </span>
                      {!a.is_read && (
                        <span className="w-1.5 h-1.5 rounded-full bg-gold shrink-0" aria-hidden />
                      )}
                    </div>
                    <p className="text-sm font-semibold text-navy">{a.title}</p>
                    {a.body && <p className="text-xs text-gray mt-0.5 line-clamp-2">{a.body}</p>}
                    <p className="text-[10px] text-stone-400 mt-1">{formatWhen(a.created_at)}</p>
                  </Link>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
