import { useRef } from 'react';
import { X } from 'lucide-react';
import { ToastBar, toast } from 'react-hot-toast';

/** Site-wide toast — scroll long text, dismiss with × or horizontal swipe. */
export default function DismissibleToastBar({ t }) {
  const touchRef = useRef({ x: 0, time: 0 });

  const dismiss = () => toast.dismiss(t.id);

  const onTouchStart = (e) => {
    touchRef.current = { x: e.touches[0].clientX, time: Date.now() };
  };

  const onTouchEnd = (e) => {
    const dx = e.changedTouches[0].clientX - touchRef.current.x;
    const dt = Date.now() - touchRef.current.time;
    if (dt < 400 && Math.abs(dx) > 48) dismiss();
  };

  return (
    <ToastBar toast={t}>
      {({ icon, message }) => (
        <div
          className="flex w-full min-w-0 items-start gap-2 pr-0.5"
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          {icon ? <span className="shrink-0 mt-0.5">{icon}</span> : null}
          <div
            className="min-w-0 flex-1 overflow-x-auto overscroll-x-contain touch-pan-x [-webkit-overflow-scrolling:touch]"
            title={typeof message === 'string' ? message : undefined}
          >
            <span className="block text-sm font-medium leading-snug whitespace-nowrap sm:whitespace-normal">
              {message}
            </span>
          </div>
          <button
            type="button"
            onClick={dismiss}
            className="shrink-0 rounded p-1 opacity-80 hover:opacity-100 hover:bg-white/10 touch-target"
            aria-label="Dismiss notification"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
    </ToastBar>
  );
}
