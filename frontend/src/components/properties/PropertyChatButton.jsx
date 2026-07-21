import { useNavigate } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';
import { buildChatLoginUrl } from '../../utils/authReturn';

function isOwnListing(property, user) {
  if (!property?.owner_id || !user?.id) return false;
  return Number(property.owner_id) === Number(user.id);
}

const PropertyChatButton = ({
  property,
  className = '',
  iconOnly = false,
  compact = false,
  variant = 'primary',
}) => {
  const { token, user, loading } = useAuth();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);

  if (!property?.id) return null;
  if (isOwnListing(property, user)) return null;

  const baseClass = iconOnly
    ? `inline-flex w-full items-center justify-center rounded-lg p-0 font-semibold shadow-sm transition-colors ${className}`
    : `inline-flex w-full items-center justify-center gap-1.5 rounded-lg sm:rounded-xl font-semibold touch-target min-h-[36px] px-3 py-2 text-xs sm:min-h-[48px] sm:gap-2 sm:px-4 sm:py-3 sm:text-sm shadow-sm transition-colors ${className}`;

  const iconClass = compact ? 'h-3.5 w-3.5' : iconOnly ? 'h-[18px] w-[18px]' : 'h-4 w-4 sm:h-[22px] sm:w-[22px]';

  const colorClass =
    variant === 'outline'
      ? 'border-2 border-navy bg-white text-navy hover:bg-navy/5'
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

  if (loading) {
    return (
      <div className={`${baseClass} ${colorClass} cursor-wait opacity-70`} aria-busy aria-label="Loading chat">
        <MessageCircle className={iconClass} />
      </div>
    );
  }

  if (!token) {
    return (
      <button
        type="button"
        onClick={goLogin}
        title="Chat with seller about this listing"
        aria-label="Chat about listing"
        className={`${baseClass} ${colorClass}`}
      >
        <MessageCircle className={iconClass} />
        {!iconOnly && <span>Chat</span>}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={startChat}
      disabled={busy}
      title="Chat with seller about this listing"
      aria-label="Chat about listing"
      className={`${baseClass} ${colorClass} disabled:opacity-60`}
    >
      <MessageCircle className={iconClass} />
      {!iconOnly && <span>{busy ? 'Opening…' : 'Chat'}</span>}
    </button>
  );
};

export default PropertyChatButton;
