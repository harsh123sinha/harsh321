import { useEffect, useRef, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import api from '../utils/api';
import {
  isFirebaseClientConfigured,
  requestFcmToken,
  subscribeForegroundMessages,
} from '../config/firebase';
import {
  showBrowserNotification,
  getNotificationImage,
  getNotificationPropertyPath,
} from '../utils/notifications';

const FCM_TOKEN_KEY = 'fcmToken';

export function useFcm(isAuthenticated) {
  const registeredRef = useRef(false);
  const queryClient = useQueryClient();

  const registerToken = useCallback(async () => {
    if (!isAuthenticated || !isFirebaseClientConfigured()) return;
    if (!('serviceWorker' in navigator) || !('Notification' in window)) return;

    try {
      const token = await requestFcmToken();
      if (!token) return;

      const prev = localStorage.getItem(FCM_TOKEN_KEY);
      if (prev === token && registeredRef.current) return;

      await api.post('/notifications/fcm/register', {
        fcmToken: token,
        deviceLabel: 'web',
      });
      localStorage.setItem(FCM_TOKEN_KEY, token);
      registeredRef.current = true;
    } catch (err) {
      console.warn('FCM registration failed:', err?.message || err);
    }
  }, [isAuthenticated]);

  const unregisterToken = useCallback(async () => {
    const token = localStorage.getItem(FCM_TOKEN_KEY);
    if (!token) return;
    try {
      await api.delete('/notifications/fcm', { data: { fcmToken: token } });
    } catch {
      // ignore on logout
    }
    localStorage.removeItem(FCM_TOKEN_KEY);
    registeredRef.current = false;
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return undefined;

    registerToken();

    let unsubscribe = () => {};
    subscribeForegroundMessages((payload) => {
      const n = payload.notification || {};
      const d = payload.data || {};
      const title = n.title || 'Harsh To Let Services';
      const body = n.body || '';
      const image = getNotificationImage(d);
      const path = getNotificationPropertyPath(d);
      const url = d.absolutePropertyUrl || (path ? `${window.location.origin}${path}` : window.location.origin);

      queryClient.invalidateQueries({ queryKey: ['notifications'] });

      showBrowserNotification({
        title,
        body,
        image,
        url,
        tag: d.propertyId ? `property-${d.propertyId}` : undefined,
      });
    }).then((unsub) => {
      unsubscribe = unsub || (() => {});
    });

    return () => unsubscribe();
  }, [isAuthenticated, registerToken, queryClient]);

  return { registerToken, unregisterToken };
}

export default useFcm;
