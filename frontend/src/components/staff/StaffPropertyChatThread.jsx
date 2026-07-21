import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../utils/api';
import BrandLoader from '../ui/BrandLoader';
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

export default function StaffPropertyChatThread({ variant }) {
  const prefix = variant === 'admin' ? '/admin' : '/subadmin';
  const listPath = `${prefix}/property-chats`;
  const { id } = useParams();
  const navigate = useNavigate();
  const [chat, setChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  const load = useCallback(async () => {
    try {
      const { data } = await api.get(`${prefix}/property-chats/${id}`);
      setChat(data.chat);
      setMessages(data.messages || []);
    } catch (e) {
      toast.error(e.response?.data?.error || 'Chat not found');
      navigate(listPath, { replace: true });
    }
    setLoading(false);
  }, [id, navigate, listPath, prefix]);

  useEffect(() => {
    setLoading(true);
    load();
    const t = setInterval(load, 5000);
    return () => clearInterval(t);
  }, [load]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async (e) => {
    e.preventDefault();
    const body = text.trim();
    if (!body || sending) return;
    setSending(true);
    try {
      const { data } = await api.post(`${prefix}/property-chats/${id}/messages`, { body });
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

  return (
    <div className="max-w-3xl mx-auto flex flex-col min-h-[60vh] border border-gray-light rounded-xl bg-white overflow-hidden">
      <header className="flex items-center gap-3 border-b border-gray-light px-4 py-3 bg-white">
        <Link to={listPath} className="text-navy hover:text-gold p-1">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        {img ? (
          <img src={getImageUrl(img)} alt="" className="h-10 w-10 rounded-lg object-cover" />
        ) : (
          <div className="h-10 w-10 rounded-lg bg-navy/10" />
        )}
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-navy truncate">{property?.title || 'Property'}</p>
          <p className="text-xs text-gray truncate">
            {chat?.buyerName || 'Buyer'}
            {chat?.buyerPhone ? ` · ${chat.buyerPhone}` : ''}
          </p>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-stone-50 min-h-[320px] max-h-[60vh]">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.isMine ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm shadow-sm ${
                msg.isMine
                  ? 'bg-navy text-white rounded-br-md'
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

      <form onSubmit={send} className="border-t border-gray-light bg-white p-3 flex gap-2">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Reply as Harsh To Let Services…"
          maxLength={2000}
          className="flex-1 rounded-xl border-2 border-gray-light px-4 py-2.5 text-sm focus:border-gold outline-none"
        />
        <button
          type="submit"
          disabled={sending || !text.trim()}
          className="shrink-0 rounded-xl bg-navy text-white px-4 py-2.5 disabled:opacity-50 hover:bg-navy-light"
        >
          <Send className="h-5 w-5" />
        </button>
      </form>
    </div>
  );
}
