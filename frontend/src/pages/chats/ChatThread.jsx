import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../utils/api';
import BrandLoader from '../../components/ui/BrandLoader';
import { getImageUrl } from '../../utils/api';

function formatTime(value) {
  if (!value) return '';
  try {
    return new Date(value).toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '';
  }
}

export default function ChatThread() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [chat, setChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);
  const listRef = useRef(null);
  const lastMsgIdRef = useRef(null);
  const didInitialScrollRef = useRef(false);
  const stickToBottomRef = useRef(true);

  const scrollToBottom = useCallback((behavior = 'auto') => {
    const el = listRef.current;
    if (!el) return;
    if (behavior === 'smooth') {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    } else {
      el.scrollTop = el.scrollHeight;
    }
  }, []);

  const onListScroll = () => {
    const el = listRef.current;
    if (!el) return;
    const distance = el.scrollHeight - el.scrollTop - el.clientHeight;
    stickToBottomRef.current = distance < 80;
  };

  const load = useCallback(async () => {
    try {
      const { data } = await api.get(`/chats/${id}`);
      setChat(data.chat);
      setMessages(data.messages || []);
    } catch (e) {
      toast.error(e.response?.data?.error || 'Chat not found');
      navigate('/chats', { replace: true });
    }
    setLoading(false);
  }, [id, navigate]);

  useEffect(() => {
    setLoading(true);
    didInitialScrollRef.current = false;
    lastMsgIdRef.current = null;
    stickToBottomRef.current = true;
    load();
    const t = setInterval(load, 5000);
    return () => clearInterval(t);
  }, [load]);

  useEffect(() => {
    if (!messages.length) return;
    const lastId = messages[messages.length - 1]?.id;
    const isNew = lastId !== lastMsgIdRef.current;
    const prev = lastMsgIdRef.current;
    lastMsgIdRef.current = lastId;

    if (!didInitialScrollRef.current) {
      didInitialScrollRef.current = true;
      // Jump once after open — no smooth scroll fighting the page
      requestAnimationFrame(() => scrollToBottom('auto'));
      return;
    }

    // Poll refresh with same last message: do not yank scroll
    if (!isNew) return;

    // Only follow new messages if user is already near bottom (or they just sent)
    if (stickToBottomRef.current || messages[messages.length - 1]?.isMine) {
      requestAnimationFrame(() => scrollToBottom(prev == null ? 'auto' : 'smooth'));
    }
  }, [messages, scrollToBottom]);

  const send = async (e) => {
    e.preventDefault();
    const body = text.trim();
    if (!body || sending) return;
    setSending(true);
    stickToBottomRef.current = true;
    try {
      const { data } = await api.post(`/chats/${id}/messages`, { body });
      setMessages(data.messages || []);
      setText('');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to send');
    }
    setSending(false);
  };

  if (loading) return <BrandLoader fullScreen />;

  const property = chat?.property;
  const img = property?.imageUrl ? String(property.imageUrl).split(',')[0].trim() : '';
  const propertyPath =
    property?.listingKind === 'project' ? `/projects/${property.id}` : `/property/${property.id}`;
  const isStaffChannel = chat?.channel === 'staff';
  const canReply = !(isStaffChannel && chat?.viewerRole === 'recipient');

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)] max-w-3xl mx-auto">
      <header className="sticky top-0 z-10 flex items-center gap-3 border-b border-gray-light bg-white px-4 py-3">
        <Link to="/chats" className="text-navy hover:text-gold p-1" aria-label="Back to chats">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        {img ? (
          <img src={getImageUrl(img)} alt="" className="h-10 w-10 rounded-lg object-cover" />
        ) : (
          <div className="h-10 w-10 rounded-lg bg-navy/10" />
        )}
        <div className="min-w-0 flex-1">
          <Link to={propertyPath} className="font-semibold text-navy truncate block hover:underline">
            {property?.title || 'Property'}
          </Link>
          <p className="text-xs text-gray truncate">
            {chat?.viewerRole === 'recipient'
              ? `${chat.buyerName || 'Buyer'}${chat.buyerPhone ? ` · ${chat.buyerPhone}` : ''}`
              : chat?.recipientLabel || (isStaffChannel ? 'Harsh To Let Services' : 'Seller')}
          </p>
        </div>
      </header>

      <div
        ref={listRef}
        onScroll={onListScroll}
        className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-stone-50"
      >
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.isMine ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm shadow-sm ${
                msg.isMine
                  ? 'bg-navy text-white rounded-br-md'
                  : msg.isStaff
                    ? 'bg-gold/20 text-navy border border-gold/40 rounded-bl-md'
                    : 'bg-white text-navy border border-gray-light rounded-bl-md'
              }`}
            >
              <p className="whitespace-pre-wrap break-words">{msg.body}</p>
              <p className={`text-[10px] mt-1 ${msg.isMine ? 'text-white/70' : 'text-gray'}`}>
                {formatTime(msg.createdAt)}
              </p>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {canReply ? (
        <form onSubmit={send} className="border-t border-gray-light bg-white p-3 flex gap-2">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type a message…"
            maxLength={2000}
            className="flex-1 rounded-xl border-2 border-gray-light px-4 py-2.5 text-sm focus:border-gold outline-none"
          />
          <button
            type="submit"
            disabled={sending || !text.trim()}
            className="shrink-0 rounded-xl bg-navy text-white px-4 py-2.5 disabled:opacity-50 hover:bg-navy-light"
            aria-label="Send"
          >
            <Send className="h-5 w-5" />
          </button>
        </form>
      ) : (
        <div className="border-t border-gray-light bg-stone-50 px-4 py-3 text-center text-sm text-gray">
          Harsh To Let Services will reply to this inquiry.
        </div>
      )}
    </div>
  );
}
