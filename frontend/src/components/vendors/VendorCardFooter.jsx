import VendorContactSection from './VendorContactSection';
import VendorProfileRating from './VendorProfileRating';

/** Bottom of every vendor/listing card — employee profile rating + contact (not per-upload). */
export default function VendorCardFooter({ vendor, categoryLabel, listing = null, compact = true }) {
  return (
    <div className="vendor-card-footer mt-auto pt-1 sm:pt-2 space-y-1 sm:space-y-2 border-t border-stone-100 max-[499px]:pt-0.5 max-[499px]:space-y-0.5 max-[399px]:space-y-px max-[399px]:pt-px lg:pt-4 lg:space-y-3">
      <VendorProfileRating vendor={vendor} compact={compact} />
      <VendorContactSection
        vendor={vendor}
        listing={listing}
        categoryLabel={categoryLabel}
        compact={compact}
        hideTopBorder
      />
    </div>
  );
}
