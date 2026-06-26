import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bell, CheckCheck } from 'lucide-react';
import api from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';
import NotificationItem from './NotificationItem';
import { getNotificationPropertyPath } from '../../utils/notifications';

const NotificationBell = () => {
  const { isAuthenticated } = useAuth();
  const [open, setOpen] = useState(false);
  const panelRef = useRef(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: countData } = useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: async () => {
      const res = await api.get('/notifications/unread-count');
      return res.data;
    },
    enabled: isAuthenticated,
    refetchInterval: 30000,
  });

  const { data: listData, isLoading } = useQuery({
    queryKey: ['notifications', 'list'],
    queryFn: async () => {
      const res = await api.get('/notifications?limit=15');
      return res.data;
    },
    enabled: isAuthenticated && open,
  });

  const markReadMutation = useMutation({
    mutationFn: (id) => api.patch(`/notifications/${id}/read`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const markAllMutation = useMutation({
    mutationFn: () => api.patch('/notifications/read-all'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  useEffect(() => {
    const onClickOutside = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [open]);

  if (!isAuthenticated) return null;

  const unread = countData?.count ?? 0;

  const handleNotificationClick = (n) => {
    if (!n.is_read) {
      markReadMutation.mutate(n.id);
    }
    setOpen(false);
    const path = getNotificationPropertyPath(n.data);
    if (path) {
      navigate(path);
    } else {
      navigate('/notifications');
    }
  };

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="relative text-white hover:text-gold transition-colors p-2 touch-target"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full bg-gold text-navy text-[10px] font-bold">
            {unread > 99 ? '99+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 max-h-[70vh] overflow-hidden rounded-xl bg-white shadow-xl border border-gray-100 z-50">
          <div className="flex items-center justify-between px-4 py-3 border-b bg-navy text-white">
            <span className="font-semibold">Notifications</span>
            {unread > 0 && (
              <button
                type="button"
                onClick={() => markAllMutation.mutate()}
                className="text-xs text-gold hover:text-gold/80 flex items-center gap-1"
              >
                <CheckCheck className="h-3.5 w-3.5" />
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {isLoading ? (
              <div className="p-6 text-center text-gray text-sm">Loading…</div>
            ) : listData?.notifications?.length ? (
              listData.notifications.map((n) => (
                <NotificationItem
                  key={n.id}
                  notification={n}
                  compact
                  onClick={() => handleNotificationClick(n)}
                />
              ))
            ) : (
              <div className="p-6 text-center text-gray text-sm">No notifications yet</div>
            )}
          </div>

          <div className="px-4 py-2 border-t bg-gray-50">
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                navigate('/notifications');
              }}
              className="text-xs font-medium text-navy hover:text-gold w-full text-center py-1"
            >
              View all notifications
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
