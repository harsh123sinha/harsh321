import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Bell, CheckCheck } from 'lucide-react';
import api from '../utils/api';
import NotificationItem from '../components/notifications/NotificationItem';
import BrokerReviewModal from '../components/brokers/BrokerReviewModal';
import WorkerCustomerReviewModal from '../components/workers/WorkerCustomerReviewModal';
import { getNotificationPropertyPath } from '../utils/notifications';
import BrandLoader from '../components/ui/BrandLoader';

const Notifications = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [brokerReviewModal, setBrokerReviewModal] = useState(null);
  const [workerReviewModal, setWorkerReviewModal] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['notifications', 'list', 'full'],
    queryFn: async () => {
      const res = await api.get('/notifications?limit=50');
      return res.data;
    },
  });

  const markReadMutation = useMutation({
    mutationFn: (id) => api.patch(`/notifications/${id}/read`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const markAllMutation = useMutation({
    mutationFn: () => api.patch('/notifications/read-all'),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const closeModals = () => {
    setBrokerReviewModal(null);
    setWorkerReviewModal(null);
    queryClient.invalidateQueries({ queryKey: ['notifications'] });
  };

  const handleClick = (n) => {
    if (n.type === 'broker_review_request' || (n.data?.openReviewModal && n.data?.brokerId)) {
      if (!n.is_read) markReadMutation.mutate(n.id);
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
      if (!n.is_read) markReadMutation.mutate(n.id);
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

    if (!n.is_read) markReadMutation.mutate(n.id);
    const path = getNotificationPropertyPath(n.data);
    if (path) navigate(path);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Bell className="h-8 w-8 text-gold" />
            <h1 className="text-2xl sm:text-3xl font-bold text-navy">Notifications</h1>
          </div>
          {(data?.notifications || []).some((n) => !n.is_read) && (
            <button
              type="button"
              onClick={() => markAllMutation.mutate()}
              className="flex items-center gap-1 text-sm text-navy hover:text-gold font-medium"
            >
              <CheckCheck className="h-4 w-4" />
              Mark all read
            </button>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {isLoading ? (
            <BrandLoader size="sm" />
          ) : data?.notifications?.length ? (
            <ul>
              {data.notifications.map((n) => (
                <li key={n.id}>
                  <NotificationItem notification={n} onClick={() => handleClick(n)} />
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-12 text-center text-gray">No notifications yet</div>
          )}
        </div>
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
    </div>
  );
};

export default Notifications;
