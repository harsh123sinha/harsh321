import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
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
  demand: 'Demand',
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
  const [panelStyle, setPanelStyle] = useState(null);
  const triggerRef = useRef(null);
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

  const updatePanelPosition = () => {
    const trigger = triggerRef.current;
    if (!trigger) return;
    const rect = trigger.getBoundingClientRect();
    const margin = 12;
    const viewportW = window.innerWidth;
    const isMobile = viewportW < 640;
    const width = isMobile ? viewportW - margin * 2 : Math.min(352, viewportW - margin * 2);
    const left = isMobile
      ? margin
      : Math.max(margin, Math.min(rect.right - width, viewportW - width - margin));
    setPanelStyle({
      top: rect.bottom + 8,
      left,
      width,
    });
  };

  useLayoutEffect(() => {
    if (!open) {
      setPanelStyle(null);
      return;
    }
    updatePanelPosition();
    const onReflow = () => updatePanelPosition();
    window.addEventListener('resize', onReflow);
    window.addEventListener('scroll', onReflow, true);
    return () => {
      window.removeEventListener('resize', onReflow);
      window.removeEventListener('scroll', onReflow, true);
    };
  }, [open]);

  useEffect(() => {
    const onDoc = (e) => {
      if (triggerRef.current?.contains(e.target)) return;
      if (panelRef.current?.contains(e.target)) return;
      setOpen(false);
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

  const panel =
    open &&
    panelStyle &&
    typeof document !== 'undefined' &&
    createPortal(
      <div
        ref={panelRef}
        className="fixed z-[10050] overflow-hidden rounded-xl border border-gray-light bg-white shadow-xl"
        style={{
          top: panelStyle.top,
          left: panelStyle.left,
          width: panelStyle.width,
          maxHeight: 'min(70vh, 24rem)',
        }}
      >
        <div className="flex items-center justify-between border-b border-gray-light bg-navy px-4 py-3 text-white">
          <span className="text-sm font-semibold">New activity</span>
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
        <ul className="max-h-80 divide-y divide-gray-light overflow-y-auto">
          {alerts.length === 0 ? (
            <li className="px-4 py-6 text-center text-sm text-gray">No alerts yet</li>
          ) : (
            alerts.map((a) => (
              <li key={a.id}>
                <Link
                  to={resolveLink(a)}
                  onClick={() => {
                    if (!a.is_read) markRead(a.id);
                    setOpen(false);
                  }}
                  className={`block px-4 py-3 transition-colors hover:bg-gray-50 ${a.is_read ? 'opacity-70' : 'bg-gold/5'}`}
                >
                  <div className="mb-0.5 flex items-center gap-2">
                    <span className="rounded bg-navy px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-gold">
                      {CATEGORY_LABELS[a.category] || a.category}
                    </span>
                    {!a.is_read && (
                      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-gold" aria-hidden />
                    )}
                  </div>
                  <p className="text-sm font-semibold text-navy">{a.title}</p>
                  {a.body && <p className="mt-0.5 line-clamp-2 text-xs text-gray">{a.body}</p>}
                  <p className="mt-1 text-[10px] text-stone-400">{formatWhen(a.created_at)}</p>
                </Link>
              </li>
            ))
          )}
        </ul>
      </div>,
      document.body,
    );

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="relative rounded-lg p-2 text-navy transition-colors hover:bg-gray-light/80"
        aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ''}`}
        aria-expanded={open}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-[1.1rem] min-w-[1.1rem] items-center justify-center rounded-full bg-red-600 px-0.5 text-[10px] font-bold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>
      {panel}
    </div>
  );
}
