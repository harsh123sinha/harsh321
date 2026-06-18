import { ChevronLeft, X } from 'lucide-react';

const ChatWindow = ({
  open,
  isMobile,
  onClose,
  children,
  footer,
}) => {
  if (!open) return null;

  return (
    <>
      {!isMobile ? (
        <button
          type="button"
          aria-label="Close chat"
          className="htls-chat-backdrop fixed inset-0 z-[55] bg-slate-900/20 backdrop-blur-[1px]"
          onClick={onClose}
        />
      ) : null}
      <div
        className={`htls-chat-panel fixed z-[60] flex flex-col overflow-hidden bg-slate-50 shadow-2xl ring-1 ring-slate-200/80 ${
          isMobile
            ? 'inset-0'
            : 'bottom-24 right-5 h-[min(560px,calc(100vh-7rem))] w-[min(400px,calc(100vw-2.5rem))] rounded-2xl sm:right-6 sm:bottom-28'
        }`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="chat-assistant-title"
      >
        {isMobile ? (
          <header className="flex flex-shrink-0 items-center gap-2 border-b border-slate-200 bg-white px-2 py-3">
            <button
              type="button"
              onClick={onClose}
              className="flex h-11 w-11 items-center justify-center rounded-full text-navy touch-manipulation"
              aria-label="Back"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <h2 id="chat-assistant-title" className="flex-1 text-center text-base font-semibold text-navy pr-9">
              Harsh To Let Assistant
            </h2>
          </header>
        ) : (
          <header className="flex flex-shrink-0 items-center justify-between border-b border-slate-200 bg-white px-3 py-2.5">
            <h2 id="chat-assistant-title" className="text-sm font-semibold text-navy">
              Harsh To Let Assistant
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full p-2 text-slate-500 hover:bg-slate-100"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </header>
        )}

        <div className="relative flex min-h-0 min-w-0 flex-1 flex-col">
          <div
            className="pointer-events-none absolute inset-0 flex items-center justify-center text-4xl font-bold text-navy/[0.04] sm:text-5xl"
            aria-hidden
          >
            Harsh To Let Services
          </div>
          {children}
        </div>

        {footer ? (
          <div className="relative z-20 flex-shrink-0 overflow-visible border-t border-slate-200 bg-white px-3 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
            {footer}
          </div>
        ) : null}
      </div>
    </>
  );
};

export default ChatWindow;
