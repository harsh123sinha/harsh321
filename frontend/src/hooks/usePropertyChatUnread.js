import { useCallback, useEffect, useState } from 'react';
import api from '../utils/api';
import { useAuth } from '../contexts/AuthContext';

/** Unread property-chat count for the logged-in user (polls while authenticated). */
export function usePropertyChatUnread(pollMs = 15000) {
  const { isAuthenticated } = useAuth();
  const [count, setCount] = useState(0);

  const load = useCallback(async () => {
    if (!isAuthenticated) {
      setCount(0);
      return;
    }
    try {
      const { data } = await api.get('/chats/unread-count');
      setCount(Number(data.count) || 0);
    } catch {
      setCount(0);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) {
      setCount(0);
      return undefined;
    }
    load();
    const t = setInterval(load, pollMs);
    const onRefresh = () => load();
    window.addEventListener('hts:property-chat-unread-refresh', onRefresh);
    window.addEventListener('focus', onRefresh);
    return () => {
      clearInterval(t);
      window.removeEventListener('hts:property-chat-unread-refresh', onRefresh);
      window.removeEventListener('focus', onRefresh);
    };
  }, [isAuthenticated, pollMs, load]);

  return count;
}

export function refreshPropertyChatUnread() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('hts:property-chat-unread-refresh'));
  }
}
