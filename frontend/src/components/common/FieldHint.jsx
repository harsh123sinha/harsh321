import { useRef, useState, useEffect } from 'react';
import { X } from 'lucide-react';

/**
 * Inline field error — horizontally scrollable on small screens, dismiss via × or swipe.
 */
const FieldHint = ({ error, onDismiss }) => {
  const [hidden, setHidden] = useState(false);
  const touchRef = useRef({ x: 0, t: 0 });

  useEffect(() => { setHidden(false); }, [error]);

  if (!error || hidden) return null;

  const dismiss = () => {
    setHidden(true);
    onDismiss?.();
  };

  const onTouchStart = (e) => {
    touchRef.current = { x: e.touches[0].clientX, t: Date.now() };
  };

  const onTouchEnd = (e) => {
    const dx = e.changedTouches[0].clientX - touchRef.current.x;
    const dt = Date.now() - touchRef.current.t;
    if (dt < 400 && Math.abs(dx) > 48) dismiss();
  };

  return (
    <div
      className="mt-1 flex items-start gap-1.5 rounded-md border border-red-200/80 bg-red-50/90 px-2 py-1.5"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <div
        className="min-w-0 flex-1 overflow-x-auto overscroll-x-contain touch-pan-x [-webkit-overflow-scrolling:touch]"
        title={error}
      >
        <p className="text-xs text-red-700 font-medium leading-snug pr-1 whitespace-nowrap sm:whitespace-normal">
          {error}
        </p>
      </div>
      <button
        type="button"
        onClick={dismiss}
        className="shrink-0 rounded p-0.5 text-red-600 hover:bg-red-100 touch-target"
        aria-label="Dismiss error"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
};

export default FieldHint;
