import { useNavigate } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';
import { buildChatLoginUrl } from '../../utils/authReturn';
import {
  getPropertyChatButtonLabel,
  getPropertyChatCompactLabel,
} from '../../utils/propertyChatLabels';

function isOwnListing(property, user) {
  if (!property?.owner_id || !user?.id) return false;
  return Number(property.owner_id) === Number(user.id);
}

/**
 * @param {'detail' | 'card' | 'list'} size
 */
const PropertyChatButton = ({
  property,
  className = '',
  size = 'detail',
  variant = 'primary',
}) => {
  const { token, user, loading } = useAuth();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);

  if (!property?.id) return null;
  if (isOwnListing(property, user)) return null;

  const title = getPropertyChatButtonLabel(property);
  const displayLabel = busy
    ? 'Opening…'
    : size === 'list'
      ? getPropertyChatCompactLabel(property)
      : title;

  const sizeClass =
    size === 'list'
      ? 'inline-flex w-full items-center justify-center gap-1 rounded-md min-h-[1.75rem] lg:min-h-9 px-1.5 py-1 text-[10px] sm:text-[11px] font-semibold leading-tight shadow-sm transition-colors'
      : size === 'card'
        ? 'inline-flex w-full items-center justify-center gap-1.5 rounded-lg min-h-[2.25rem] sm:min-h-[2.75rem] px-3 py-2 text-xs sm:text-sm font-semibold shadow-sm transition-colors'
        : 'inline-flex w-full items-center justify-center gap-2 rounded-lg sm:rounded-xl touch-target min-h-[44px] px-4 py-2.5 text-sm sm:text-base font-semibold shadow-sm transition-colors';

  const iconClass =
    size === 'list'
      ? 'h-3 w-3 shrink-0'
      : size === 'card'
        ? 'h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0'
        : 'h-5 w-5 shrink-0';

  const colorClass =
    variant === 'outline'
      ? 'border border-navy/25 bg-white text-navy hover:bg-navy/5 hover:border-navy/40'
      : 'bg-navy text-white hover:bg-navy-light';

  const startChat = async (e) => {
    e?.stopPropagation?.();
    if (busy) return;
    setBusy(true);
    try {
      const { data } = await api.post('/chats/start', { propertyId: property.id });
      const chatId = data?.chat?.id;
      if (!chatId) throw new Error('Chat not created');
      navigate(`/chats/${chatId}`);
    } catch (err) {
      toast.error(err.response?.data?.error || err.message || 'Could not open chat');
    } finally {
      setBusy(false);
    }
  };

  const goLogin = (e) => {
    e?.stopPropagation?.();
    navigate(buildChatLoginUrl(property.id));
  };

  const content = (
    <>
      <MessageCircle className={iconClass} aria-hidden />
      <span className="truncate">{displayLabel}</span>
    </>
  );

  if (loading) {
    return (
      <div
        className={`${sizeClass} ${colorClass} cursor-wait opacity-70 ${className}`}
        aria-busy
        aria-label={title}
      >
        <MessageCircle className={iconClass} />
        <span className="truncate">…</span>
      </div>
    );
  }

  if (!token) {
    return (
      <button
        type="button"
        onClick={goLogin}
        title={title}
        aria-label={title}
        className={`${sizeClass} ${colorClass} ${className}`}
      >
        {content}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={startChat}
      disabled={busy}
      title={title}
      aria-label={title}
      className={`${sizeClass} ${colorClass} disabled:opacity-60 ${className}`}
    >
      {content}
    </button>
  );
};

export default PropertyChatButton;
