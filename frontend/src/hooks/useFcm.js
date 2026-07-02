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
const FCM_PROMPT_SESSION_KEY = 'htls_fcm_prompted_session';
const LOGIN_PROMPT_DELAY_MS = 1200;

async function saveTokenWithBackend(token) {
  const prev = localStorage.getItem(FCM_TOKEN_KEY);
  if (prev === token) return token;

  await api.post('/notifications/fcm/register', {
    fcmToken: token,
    deviceLabel: 'web',
  });
  localStorage.setItem(FCM_TOKEN_KEY, token);
  return token;
}

export async function registerFcmTokenWithBackend(apiClient, { promptIfNeeded = false } = {}) {
  const token = await requestFcmToken({ promptForPermission: promptIfNeeded });
  if (!token) return null;
  return saveTokenWithBackend(token);
}

export async function enablePushNotifications(apiClient) {
  sessionStorage.removeItem(FCM_PROMPT_SESSION_KEY);
  const token = await requestFcmToken({ promptForPermission: true });
  if (!token) {
    return {
      ok: false,
      permission: typeof Notification !== 'undefined' ? Notification.permission : 'unsupported',
    };
  }

  await saveTokenWithBackend(token);
  return { ok: true, token };
}

export function useFcm(isAuthenticated) {
  const registeredRef = useRef(false);
  const promptAttemptedRef = useRef(false);
  const queryClient = useQueryClient();

  const registerToken = useCallback(async () => {
    if (!isAuthenticated || !isFirebaseClientConfigured()) return;
    if (!('serviceWorker' in navigator) || !('Notification' in window)) return;

    const permission = Notification.permission;
    if (permission === 'denied') return;

    try {
      if (permission === 'granted') {
        const token = await registerFcmTokenWithBackend(api);
        if (token) registeredRef.current = true;
        return;
      }

      // permission === 'default' — ask once per login session (straightforward on login)
      if (promptAttemptedRef.current) return;
      if (sessionStorage.getItem(FCM_PROMPT_SESSION_KEY) === '1') return;

      promptAttemptedRef.current = true;
      sessionStorage.setItem(FCM_PROMPT_SESSION_KEY, '1');

      await new Promise((resolve) => {
        window.setTimeout(resolve, LOGIN_PROMPT_DELAY_MS);
      });

      if (!isAuthenticated || Notification.permission === 'denied') return;

      const token = await requestFcmToken({ promptForPermission: true });
      if (token) {
        await saveTokenWithBackend(token);
        registeredRef.current = true;
      }
    } catch (err) {
      console.warn('FCM registration failed:', err?.message || err);
    }
  }, [isAuthenticated]);

  const unregisterToken = useCallback(async () => {
    const token = localStorage.getItem(FCM_TOKEN_KEY);
    if (token) {
      try {
        await api.delete('/notifications/fcm', { data: { fcmToken: token } });
      } catch {
        // ignore on logout
      }
    }
    localStorage.removeItem(FCM_TOKEN_KEY);
    sessionStorage.removeItem(FCM_PROMPT_SESSION_KEY);
    registeredRef.current = false;
    promptAttemptedRef.current = false;
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      promptAttemptedRef.current = false;
      sessionStorage.removeItem(FCM_PROMPT_SESSION_KEY);
      return undefined;
    }

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

  return { registerToken, unregisterToken, enablePushNotifications: () => enablePushNotifications(api) };
}

export default useFcm;
