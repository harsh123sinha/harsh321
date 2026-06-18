import { useEffect } from 'react';
import { X } from 'lucide-react';

/**
 * Full-screen overlay with a scrollable panel (mobile-friendly sheet).
 * @param {{ open: boolean; onClose: () => void; title: string; children: import('react').ReactNode }} props
 */
export default function ScrollableLegalModal({ open, onClose, title, children }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center sm:p-4 bg-navy/60 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="legal-modal-title"
      onClick={onClose}
    >
      <div
        className="flex w-full max-h-[92vh] sm:max-h-[88vh] sm:max-w-2xl flex-col rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl transition-transform"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-gray-light px-4 py-3 sm:px-5">
          <h2 id="legal-modal-title" className="text-lg font-bold text-navy sm:text-xl pr-2">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-navy hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold touch-target"
            aria-label="Close"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 sm:px-6 sm:py-5 [-webkit-overflow-scrolling:touch]">
          {children}
        </div>
      </div>
    </div>
  );
}
