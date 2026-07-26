import { Star } from 'lucide-react';
import { GOOGLE_REVIEWS_URL } from '../../constants/offices';

/**
 * Opens Google reviews for Harsh To-let Services.
 */
export default function ReviewUsLink({
  variant = 'pill',
  className = '',
  onClick,
}) {
  const base =
    variant === 'menu'
      ? 'flex items-center gap-2 rounded-lg px-3 py-3 text-base font-medium text-white transition-colors hover:bg-white/5'
      : variant === 'bar'
        ? 'inline-flex items-center justify-center gap-1.5 rounded-full border border-amber-300/50 bg-amber-50 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide text-amber-900 shadow-sm transition hover:bg-amber-100'
        : 'inline-flex items-center gap-1.5 rounded-full bg-gold/15 px-3 py-1.5 text-xs font-bold text-gold ring-1 ring-gold/40 transition hover:bg-gold/25';

  return (
    <a
      href={GOOGLE_REVIEWS_URL}
      target="_blank"
      rel="noopener noreferrer"
      onClick={onClick}
      className={`${base} ${className}`}
    >
      <Star className="h-3.5 w-3.5 fill-current" aria-hidden />
      Review Us
    </a>
  );
}
