import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import api from '../../utils/api';
import BrandLoader from '../../components/ui/BrandLoader';
import { getImageUrl } from '../../utils/api';

function formatWhen(value) {
  if (!value) return '';
  try {
    const d = new Date(value);
    const now = new Date();
    const sameDay = d.toDateString() === now.toDateString();
    return sameDay
      ? d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
      : d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  } catch {
    return '';
  }
}

export default function ChatsInbox() {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/chats');
      setChats(data.chats || []);
    } catch {
      setChats([]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
    const t = setInterval(load, 15000);
    return () => clearInterval(t);
  }, [load]);

  if (loading) return <BrandLoader fullScreen />;

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 sm:py-8">
      <h1 className="text-2xl font-bold text-navy mb-6 flex items-center gap-2">
        <MessageCircle className="h-7 w-7" />
        My chats
      </h1>

      {chats.length === 0 ? (
        <div className="rounded-xl border border-gray-light bg-white p-8 text-center text-gray">
          <MessageCircle className="h-12 w-12 mx-auto mb-3 text-gray-light" />
          <p className="font-medium text-navy">No conversations yet</p>
          <p className="text-sm mt-1">Tap Chat on a property to ask if it is still available.</p>
        </div>
      ) : (
        <ul className="divide-y divide-gray-light rounded-xl border border-gray-light bg-white overflow-hidden">
          {chats.map((chat) => {
            const img = chat.property?.imageUrl;
            const thumb = img ? String(img).split(',')[0].trim() : '';
            const title = chat.property?.title || 'Property';
            const subtitle =
              chat.viewerRole === 'recipient'
                ? `${chat.buyerName || 'Buyer'}${chat.buyerPhone ? ` · ${chat.buyerPhone}` : ''}`
                : chat.recipientLabel || 'Seller';
            return (
              <li key={chat.id}>
                <Link
                  to={`/chats/${chat.id}`}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-gray-light/30 transition-colors"
                >
                  <div className="h-14 w-14 shrink-0 rounded-lg overflow-hidden bg-navy/10">
                    {thumb ? (
                      <img src={getImageUrl(thumb)} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-navy/40 text-xs">—</div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-semibold text-navy truncate">{title}</p>
                      <span className="text-[11px] text-gray shrink-0">{formatWhen(chat.updatedAt)}</span>
                    </div>
                    <p className="text-xs text-gray truncate">{subtitle}</p>
                    <p className="text-sm text-gray-darker truncate mt-0.5">
                      {chat.lastMessagePreview || '—'}
                    </p>
                  </div>
                  {chat.unreadCount > 0 ? (
                    <span className="shrink-0 min-w-[1.25rem] h-5 px-1.5 rounded-full bg-gold text-navy text-xs font-bold flex items-center justify-center">
                      {chat.unreadCount > 9 ? '9+' : chat.unreadCount}
                    </span>
                  ) : null}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
