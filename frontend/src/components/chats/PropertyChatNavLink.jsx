import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import api from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';

export default function PropertyChatNavLink({ compact = false, className = '' }) {
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
    const t = setInterval(load, 30000);
    return () => {
      cancelled = true;
      clearInterval(t);
    };
  }, [isAuthenticated]);

  if (!isAuthenticated) return null;

  const iconClass = compact ? 'h-3 w-3 shrink-0 2xl:h-3.5 2xl:w-3.5' : 'h-3.5 w-3.5 shrink-0 2xl:h-4 2xl:w-4';
  const textClass = compact
    ? 'text-[11px] xl:text-xs 2xl:text-sm font-medium'
    : 'text-xs xl:text-sm 2xl:text-base font-medium';

  return (
    <Link
      to="/chats"
      className={`relative flex shrink-0 items-center gap-1 whitespace-nowrap text-white transition-colors hover:text-gold ${textClass} ${className}`}
      title="Property chats"
    >
      <MessageCircle className={iconClass} />
      <span>Chats</span>
      {count > 0 ? (
        <span className="absolute -top-1.5 -right-2 min-w-[1rem] h-4 px-1 rounded-full bg-gold text-navy text-[10px] font-bold flex items-center justify-center">
          {count > 9 ? '9+' : count}
        </span>
      ) : null}
    </Link>
  );
}
