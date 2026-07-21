import { useEffect, useState } from 'react';
import api from '../utils/api';
import { useAuth } from '../contexts/AuthContext';

/** Unread property-chat count for the logged-in user (polls while authenticated). */
export function usePropertyChatUnread(pollMs = 30000) {
  const { isAuthenticated } = useAuth();
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isAuthenticated) {
      setCount(0);
      return undefined;
    }
    let cancelled = false;
    const load = async () => {
      try {
        const { data } = await api.get('/chats/unread-count');
        if (!cancelled) setCount(Number(data.count) || 0);
      } catch {
        if (!cancelled) setCount(0);
      }
    };
    load();
    const t = setInterval(load, pollMs);
    return () => {
      cancelled = true;
      clearInterval(t);
    };
  }, [isAuthenticated, pollMs]);

  return count;
}
