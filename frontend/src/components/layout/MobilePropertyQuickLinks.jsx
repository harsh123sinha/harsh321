import { Link, useLocation } from 'react-router-dom';

const LINKS = [
  { to: '/rent', label: 'Rent' },
  { to: '/buy', label: 'Buy' },
  { to: '/shop', label: 'Shop' },
  { to: '/other', label: 'Other' },
];

/**
 * Compact Rent / Buy / Shop / Other strip — sits below the header, over page background (not inside navbar).
 */
export default function MobilePropertyQuickLinks({ variant = 'overlay-dark' }) {
  const { pathname } = useLocation();

  const toneClass =
    variant === 'overlay-dark'
      ? 'text-[10px] font-semibold uppercase tracking-wide touch-manipulation'
      : variant === 'catalog'
        ? 'text-[10px] font-semibold uppercase tracking-wide touch-manipulation'
        : 'text-[10px] font-semibold uppercase tracking-wide touch-manipulation';

  const activeClass =
    variant === 'overlay-dark'
      ? 'text-gold'
      : variant === 'catalog'
        ? 'font-bold text-gold'
        : 'font-bold text-gold';

  const idleClass =
    variant === 'overlay-dark'
      ? 'text-white/90 hover:text-gold'
      : variant === 'catalog'
        ? 'text-stone-600 hover:text-navy'
        : 'text-stone-700 hover:text-navy';

  return (
    <nav
      aria-label="Property categories"
      className="flex items-center justify-center gap-4 bg-transparent px-2 py-1.5"
    >
      {LINKS.map((link) => {
        const active = pathname === link.to || pathname.startsWith(`${link.to}/`);
        return (
          <Link
            key={link.to}
            to={link.to}
            className={`${toneClass} ${active ? activeClass : idleClass}`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
