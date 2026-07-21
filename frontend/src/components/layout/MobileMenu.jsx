import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { X, LogIn, LogOut, User, Bookmark, Briefcase, MessageCircle } from 'lucide-react';
import NotificationBell from '../notifications/NotificationBell';
import { useFocusTrap } from '../../hooks/useFocusTrap';

const JOB_APPLY_COLOR = 'bg-[rgb(149,0,0)] hover:bg-[rgb(120,0,0)]';

const navItemClass =
  'block rounded-lg px-3 py-3 text-base font-medium text-white transition-colors hover:bg-white/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/60';

/**
 * Right slide-in navigation drawer for viewports below the desktop nav breakpoint.
 */
export default function MobileMenu({
  isOpen,
  onClose,
  mainNavLinks,
  brokersLink,
  isAuthenticated,
  getDashboardLink,
  onLogout,
}) {
  const panelRef = useRef(null);
  const [isRendered, setIsRendered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useFocusTrap(panelRef, isOpen && isVisible);

  useEffect(() => {
    if (isOpen) {
      setIsRendered(true);
      const frame = requestAnimationFrame(() => setIsVisible(true));
      return () => cancelAnimationFrame(frame);
    }

    setIsVisible(false);
    const timer = setTimeout(() => setIsRendered(false), 300);
    return () => clearTimeout(timer);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return undefined;

    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  if (!isRendered) return null;

  return (
    <div className="xl:hidden fixed inset-0 z-[60]" role="presentation">
      <button
        type="button"
        className={`htls-mobile-menu-overlay absolute inset-0 bg-black/55 transition-opacity duration-300 ease-out ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
        aria-label="Close menu"
        onClick={onClose}
        tabIndex={-1}
      />

      <div
        ref={panelRef}
        id="mobile-nav-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        className={`htls-mobile-menu-panel absolute right-0 top-0 flex h-full w-[min(100%,20rem)] flex-col border-l border-gold/20 bg-navy shadow-2xl transition-transform duration-300 ease-out sm:w-80 ${
          isVisible ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between border-b border-gold/15 px-4 py-4">
          <span className="text-sm font-semibold uppercase tracking-wider text-gold">Menu</span>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-white transition-colors hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/60"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain px-3 py-4">
          <div className="space-y-0.5">
            {mainNavLinks.map((link) => (
              <Link key={link.to} to={link.to} onClick={onClose} className={navItemClass}>
                {link.label}
              </Link>
            ))}
          </div>

          <div className="my-4 border-t border-gold/15" />

          <div className="space-y-2">
            {isAuthenticated ? (
              <>
                <div className="flex items-center justify-between rounded-lg px-3 py-2">
                  <span className="text-sm font-medium text-white">Alerts</span>
                  <NotificationBell />
                </div>
                <Link
                  to="/saved"
                  onClick={onClose}
                  className={`${navItemClass} flex items-center gap-2`}
                >
                  <Bookmark className="h-4 w-4 shrink-0 text-gold" />
                  Saved properties
                </Link>
                <Link
                  to="/chats"
                  onClick={onClose}
                  className={`${navItemClass} flex items-center gap-2`}
                >
                  <MessageCircle className="h-4 w-4 shrink-0 text-gold" />
                  Property chats
                </Link>
                <Link
                  to={getDashboardLink()}
                  onClick={onClose}
                  className={`${navItemClass} flex items-center gap-2`}
                >
                  <User className="h-4 w-4 shrink-0 text-gold" />
                  Dashboard
                </Link>
                <button
                  type="button"
                  onClick={onLogout}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-gold px-4 py-3 text-sm font-semibold text-navy transition-colors hover:bg-gold/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/60"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </>
            ) : (
              <Link
                to="/login"
                onClick={onClose}
                className={`${navItemClass} flex items-center gap-2`}
              >
                <LogIn className="h-4 w-4 shrink-0 text-gold" />
                Login
              </Link>
            )}

            <Link
              to={brokersLink.to}
              onClick={onClose}
              className="inline-flex w-full items-center justify-center rounded-lg border-2 border-gold bg-gold/15 px-4 py-3 text-sm font-semibold text-gold transition-colors hover:bg-gold/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/60"
            >
              {brokersLink.label}
            </Link>

            <Link
              to="/job-apply"
              onClick={onClose}
              className={`htls-job-apply-btn inline-flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-bold text-white transition focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/60 ${JOB_APPLY_COLOR}`}
            >
              <Briefcase className="relative z-[2] h-4 w-4 shrink-0" />
              <span className="relative z-[2]">Job Apply</span>
            </Link>

            <Link
              to="/add-property"
              onClick={onClose}
              className="inline-flex w-full flex-nowrap items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-gold px-4 py-3 text-sm font-bold text-navy shadow-sm transition hover:bg-gold/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/60"
            >
              Post Property
              <span className="rounded bg-red-600 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-white">
                Free
              </span>
            </Link>
          </div>
        </nav>
      </div>
    </div>
  );
}
