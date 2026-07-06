import { Link, useLocation } from 'react-router-dom';

const LINKS = [
  { to: '/rent', label: 'Rent' },
  { to: '/buy', label: 'Buy' },
  { to: '/shop', label: 'Shop' },
  { to: '/other', label: 'Other' },
];

/**
 * Compact Rent / Buy / Shop / Other strip for mobile — below main header.
 */
export default function MobilePropertyQuickLinks({ variant = 'dark' }) {
  const { pathname } = useLocation();
  const isDark = variant === 'dark';

  return (
    <div
      className={
        isDark
          ? 'flex items-center justify-center gap-4 border-t border-white/10 px-2 py-1.5'
          : 'flex items-center justify-center gap-4 border-t border-stone-100 bg-white px-2 py-1.5'
      }
    >
      {LINKS.map((link) => {
        const active = pathname === link.to || pathname.startsWith(`${link.to}/`);
        return (
          <Link
            key={link.to}
            to={link.to}
            className={
              isDark
                ? `text-[10px] font-semibold uppercase tracking-wide touch-manipulation ${
                    active ? 'text-gold' : 'text-white/85 hover:text-gold'
                  }`
                : `text-[10px] font-semibold uppercase tracking-wide touch-manipulation ${
                    active ? 'font-bold text-gold' : 'text-stone-600 hover:text-navy'
                  }`
            }
          >
            {link.label}
          </Link>
        );
      })}
    </div>
  );
}
