import { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bell, CheckCheck } from 'lucide-react';
import api from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';
import NotificationItem from './NotificationItem';
import BrokerReviewModal from '../brokers/BrokerReviewModal';
import WorkerCustomerReviewModal from '../workers/WorkerCustomerReviewModal';
import { getNotificationPropertyPath } from '../../utils/notifications';
import BrandLoader from '../ui/BrandLoader';

const NotificationBell = ({ compact = false, small = false }) => {
  const { isAuthenticated } = useAuth();
  const [open, setOpen] = useState(false);
  const [panelStyle, setPanelStyle] = useState(null);
  const [brokerReviewModal, setBrokerReviewModal] = useState(null);
  const [workerReviewModal, setWorkerReviewModal] = useState(null);
  const triggerRef = useRef(null);
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

  const { data: listData, isLoading, isError, refetch } = useQuery({
    queryKey: ['notifications', 'list'],
    queryFn: async () => {
      const res = await api.get('/notifications?limit=15');
      return res.data;
    },
    enabled: isAuthenticated && open,
    retry: 1,
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

  const updatePanelPosition = () => {
    const trigger = triggerRef.current;
    if (!trigger) return;
    const rect = trigger.getBoundingClientRect();
    const margin = 12;
    const viewportW = window.innerWidth;
    const isMobile = viewportW < 640;
    const width = isMobile ? viewportW - margin * 2 : Math.min(384, viewportW - margin * 2);
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
    const onClickOutside = (e) => {
      if (triggerRef.current?.contains(e.target)) return;
      if (panelRef.current?.contains(e.target)) return;
      setOpen(false);
    };
    if (open) document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [open]);

  const unread = isAuthenticated ? (countData?.count ?? 0) : 0;

  const handleBellClick = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setOpen((v) => !v);
  };

  const handleNotificationClick = (n) => {
    if (n.type === 'broker_review_request' || (n.data?.openReviewModal && n.data?.brokerId)) {
      if (!n.is_read) {
        markReadMutation.mutate(n.id);
      }
      setOpen(false);
      setBrokerReviewModal({
        brokerId: n.data?.brokerId,
        brokerName: n.data?.brokerName,
        brokerPhoto: n.data?.brokerPhoto,
        propertyId: n.data?.propertyId,
        notificationId: n.id,
      });
      return;
    }

    if (n.type === 'worker_review_request' || n.data?.openWorkerReviewModal) {
      if (!n.is_read) {
        markReadMutation.mutate(n.id);
      }
      setOpen(false);
      setWorkerReviewModal({
        workerId: n.data?.workerId,
        employeeId: n.data?.employeeId,
        workerName: n.data?.workerName,
        workerPhoto: n.data?.workerPhoto,
        workerProfession: n.data?.workerProfession,
        notificationId: n.id,
      });
      return;
    }

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

  const closeModals = () => {
    setBrokerReviewModal(null);
    setWorkerReviewModal(null);
    queryClient.invalidateQueries({ queryKey: ['notifications'] });
  };

  return (
    <>
      <div className="relative">
        <button
          ref={triggerRef}
          type="button"
          onClick={handleBellClick}
          className={`relative inline-flex items-center justify-center text-white hover:text-gold transition-colors touch-target ${
            compact ? 'h-8 w-8' : 'h-10 w-10'
          } ${compact ? '' : 'p-2'}`}
          aria-label="Notifications"
        >
          <Bell
            className={
              small ? 'h-4 w-4' : compact ? 'h-4 w-4 2xl:h-5 2xl:w-5' : 'h-5 w-5'
            }
          />
          {unread > 0 && (
            <span
              className={`absolute -top-0.5 -right-0.5 flex items-center justify-center rounded-full bg-gold font-bold text-navy ${
                small
                  ? 'h-3.5 min-w-[14px] px-0.5 text-[8px]'
                  : 'h-[18px] min-w-[18px] px-1 text-[10px]'
              }`}
            >
              {unread > 99 ? '99+' : unread}
            </span>
          )}
        </button>

        {open && isAuthenticated && panelStyle &&
          createPortal(
            <div
              ref={panelRef}
              className="fixed z-[10050] max-h-[70vh] overflow-hidden rounded-xl border border-gray-100 bg-white shadow-xl"
              style={{
                top: panelStyle.top,
                left: panelStyle.left,
                width: panelStyle.width,
              }}
            >
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
                <BrandLoader size="sm" className="!py-4" />
              ) : isError ? (
                <div className="p-6 text-center text-sm">
                  <p className="text-gray">Could not load notifications.</p>
                  <button
                    type="button"
                    onClick={() => refetch()}
                    className="mt-2 text-xs font-semibold text-gold hover:underline"
                  >
                    Try again
                  </button>
                </div>
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
          </div>,
          document.body,
          )}
      </div>

      <BrokerReviewModal
        open={Boolean(brokerReviewModal)}
        brokerId={brokerReviewModal?.brokerId}
        brokerName={brokerReviewModal?.brokerName}
        brokerPhoto={brokerReviewModal?.brokerPhoto}
        propertyId={brokerReviewModal?.propertyId}
        notificationId={brokerReviewModal?.notificationId}
        onClose={closeModals}
      />

      <WorkerCustomerReviewModal
        open={Boolean(workerReviewModal)}
        workerId={workerReviewModal?.workerId}
        employeeId={workerReviewModal?.employeeId}
        workerName={workerReviewModal?.workerName}
        workerPhoto={workerReviewModal?.workerPhoto}
        workerProfession={workerReviewModal?.workerProfession}
        notificationId={workerReviewModal?.notificationId}
        onClose={closeModals}
      />
    </>
  );
};

export default NotificationBell;
