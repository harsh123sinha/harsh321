import { Link } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { usePropertyChatUnread } from '../../hooks/usePropertyChatUnread';

function UnreadBadge({ count, className = '' }) {
  if (!count || count < 1) return null;
  const label = count > 99 ? '99+' : String(count);
  return (
    <span
      className={`absolute -right-1.5 -top-1.5 flex h-[1.1rem] min-w-[1.1rem] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold leading-none text-white ring-2 ring-navy ${className}`}
      aria-hidden
    >
      {label}
    </span>
  );
}

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
        className={`relative inline-flex h-7 w-7 items-center justify-center rounded-md text-white transition-colors hover:bg-white/10 hover:text-gold ${className}`}
        title="Property chats"
        aria-label={count > 0 ? `Property chats, ${count} unread` : 'Property chats'}
      >
        <MessageCircle className="h-4 w-4" />
        <UnreadBadge count={count} />
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
        <UnreadBadge count={count} className="-right-2 -top-2" />
      </span>
      <span>Chats</span>
    </Link>
  );
}
