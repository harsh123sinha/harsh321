import { Link } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { usePropertyChatUnread } from '../../hooks/usePropertyChatUnread';

export default function PropertyChatNavLink({ compact = false, className = '', iconOnly = false }) {
  const { isAuthenticated } = useAuth();
  const count = usePropertyChatUnread();

  if (!isAuthenticated) return null;

  const iconClass = compact
    ? 'h-3 w-3 shrink-0 2xl:h-3.5 2xl:w-3.5'
    : iconOnly
      ? 'h-4 w-4'
      : 'h-3.5 w-3.5 shrink-0 2xl:h-4 2xl:w-4';
  const textClass = compact
    ? 'text-[11px] xl:text-xs 2xl:text-sm font-medium'
    : 'text-xs xl:text-sm 2xl:text-base font-medium';

  if (iconOnly) {
    return (
      <Link
        to="/chats"
        className={`relative inline-flex h-8 w-8 items-center justify-center rounded-lg text-white transition-colors hover:bg-white/10 hover:text-gold touch-target ${className}`}
        title="Property chats"
        aria-label={count > 0 ? `Property chats, ${count} unread` : 'Property chats'}
      >
        <MessageCircle className={iconClass} />
        {count > 0 ? (
          <span
            className="absolute top-1 right-1 h-2 w-2 rounded-full bg-gold ring-2 ring-navy"
            aria-hidden
          />
        ) : null}
      </Link>
    );
  }

  return (
    <Link
      to="/chats"
      className={`relative flex shrink-0 items-center gap-1 whitespace-nowrap text-white transition-colors hover:text-gold ${textClass} ${className}`}
      title="Property chats"
      aria-label={count > 0 ? `Chats, ${count} unread` : 'Chats'}
    >
      <span className="relative inline-flex">
        <MessageCircle className={iconClass} />
        {count > 0 ? (
          <span
            className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-gold ring-1 ring-navy"
            aria-hidden
          />
        ) : null}
      </span>
      <span>Chats</span>
    </Link>
  );
}
