import { StarRatingDisplay } from '../brokers/StarRating';

function formatReviewLabel(review) {
  const date = review.createdAt || review.created_at;
  const dateStr = date
    ? new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : '';
  const snippet = String(review.comment || '').replace(/\s+/g, ' ').trim();
  const short = snippet.length > 60 ? `${snippet.slice(0, 60)}…` : snippet;
  const who = review.customerName || review.customer_name || 'Customer';
  return `★${Number(review.rating).toFixed(1)} · ${who}: ${short}${dateStr ? ` (${dateStr})` : ''}`;
}

/** Worker/employee profile rating — same for all listings under that vendor. */
export function VendorProfileRating({ vendor, compact = false }) {
  const list = vendor?.reviews || [];
  const harshRating = vendor?.harsh_rating_avg;
  const customerRating = vendor?.customer_rating_avg;
  const listSize = Math.min(Math.max(list.length, 1), compact ? 3 : 4);

  return (
    <div className={compact ? 'space-y-0.5 max-[499px]:space-y-px lg:space-y-2' : 'space-y-1'}>
      <p
        className={`font-semibold uppercase tracking-wide text-stone-500 ${
          compact ? 'text-[6px] max-[499px]:text-[5px] sm:text-[8px] lg:text-xs' : 'text-[10px]'
        }`}
      >
        Employee profile rating
      </p>
      <div
        className={`grid grid-cols-2 gap-x-1 gap-y-0.5 max-[499px]:gap-x-0.5 max-[499px]:[&_svg]:h-2 max-[499px]:[&_svg]:w-2 max-[399px]:[&_svg]:h-1.5 max-[399px]:[&_svg]:w-1.5 max-[499px]:[&_span]:text-[6px] max-[399px]:[&_span]:text-[5px] lg:[&_svg]:h-4 lg:[&_svg]:w-4 lg:[&_span]:text-sm ${
          compact ? 'text-[7px] max-[499px]:text-[6px] max-[399px]:text-[5px] sm:text-[9px] lg:text-sm' : 'text-xs'
        }`}
      >
        <StarRatingDisplay value={harshRating} size="sm" label={compact ? 'HTL' : 'Harsh To Let'} />
        <StarRatingDisplay value={customerRating} size="sm" label={compact ? 'Users' : 'Customers'} />
      </div>

      {!list.length ? (
        <select
          disabled
          className={`w-full border border-stone-200 rounded-md bg-stone-50 text-stone-500 ${
            compact ? 'text-[7px] max-[499px]:text-[6px] max-[399px]:text-[5px] px-1 py-0.5 max-[399px]:py-px' : 'text-xs px-2 py-1.5'
          }`}
        >
          <option>No customer comments yet</option>
        </select>
      ) : (
        <select
          size={listSize}
          className={`w-full border border-stone-200 rounded-md bg-white text-navy overflow-y-auto ${
            compact
              ? 'text-[7px] max-[499px]:text-[6px] max-[399px]:text-[5px] px-1 py-0.5 max-h-14 max-[499px]:max-h-10 max-[399px]:max-h-8 sm:max-h-20'
              : 'text-xs px-2 py-1 max-h-28'
          }`}
          defaultValue={list[0]?.id}
          onClick={(e) => e.stopPropagation()}
          onChange={(e) => e.stopPropagation()}
          aria-label="Employee profile reviews"
        >
          {list.map((r) => (
            <option key={r.id} value={r.id} title={r.comment}>
              {formatReviewLabel(r)}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}

export default VendorProfileRating;
