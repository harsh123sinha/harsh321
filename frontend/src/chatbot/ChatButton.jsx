import { MessageCircle, X } from 'lucide-react';

const ChatButton = ({ onClick, open, label = 'Open chat assistant' }) => (
  <button
    type="button"
    aria-label={open ? 'Close chat assistant' : label}
    aria-expanded={open}
    onClick={onClick}
    className="group fixed bottom-5 right-5 z-[70] flex h-14 w-14 items-center justify-center rounded-full bg-navy text-white shadow-lg ring-2 ring-white/30 transition hover:scale-110 hover:shadow-xl active:scale-95 motion-reduce:transition-none sm:bottom-6 sm:right-6 sm:h-16 sm:w-16"
  >
    {open ? (
      <X className="h-7 w-7 sm:h-8 sm:w-8" />
    ) : (
      <MessageCircle className="h-7 w-7 transition-transform duration-300 group-hover:-translate-y-0.5 sm:h-8 sm:w-8" />
    )}
  </button>
);

export default ChatButton;
