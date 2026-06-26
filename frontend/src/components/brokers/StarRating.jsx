import { Star } from 'lucide-react';

export function StarRatingDisplay({ value, max = 5, size = 'sm', label }) {
  const n = value != null && Number.isFinite(Number(value)) ? Number(value) : null;
  const iconClass = size === 'lg' ? 'h-5 w-5' : 'h-4 w-4';

  return (
    <div className="flex flex-col gap-0.5">
      {label && <span className="text-[10px] uppercase tracking-wide text-gray font-semibold">{label}</span>}
      <div className="flex items-center gap-0.5" aria-label={n != null ? `${n} out of ${max} stars` : 'No rating yet'}>
        {Array.from({ length: max }, (_, i) => (
          <Star
            key={i}
            className={`${iconClass} ${n != null && i < Math.round(n) ? 'fill-gold text-gold' : 'text-gray-light'}`}
            aria-hidden
          />
        ))}
        <span className="ml-1 text-xs font-semibold text-navy tabular-nums">
          {n != null ? n.toFixed(1) : '—'}
        </span>
      </div>
    </div>
  );
}

export function StarRatingInput({ value, onChange, max = 5 }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: max }, (_, i) => {
        const star = i + 1;
        const active = star <= value;
        return (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className="p-0.5 touch-target"
            aria-label={`${star} star${star > 1 ? 's' : ''}`}
          >
            <Star
              className={`h-7 w-7 ${active ? 'fill-gold text-gold' : 'text-gray-light hover:text-gold/60'}`}
            />
          </button>
        );
      })}
    </div>
  );
}
