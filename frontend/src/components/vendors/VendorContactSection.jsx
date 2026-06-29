import EmployeeIdBadge from './EmployeeIdBadge';
import MaskedPhoneActionButton from '../properties/MaskedPhoneActionButton';
import VendorWhatsAppInquiryButton from './VendorWhatsAppInquiryButton';
import { getContactOfficePhones } from '../../utils/helpers';

/**
 * Public vendor contact — office numbers + WhatsApp (never employee personal phone).
 * Compact: full-width stacked actions on mobile, 2-col phones on sm+.
 */
export default function VendorContactSection({
  vendor,
  listing = null,
  categoryLabel = '',
  compact = false,
  hideTopBorder = false,
}) {
  const phones = getContactOfficePhones();

  return (
    <div
      className={
        compact
          ? `w-full space-y-1 sm:space-y-2 ${hideTopBorder ? '' : 'pt-1 sm:pt-2 border-t border-stone-100'}`
          : 'space-y-1.5 sm:space-y-2 pt-3'
      }
    >
      <EmployeeIdBadge
        employeeId={vendor?.employee_id}
        workerId={vendor?.id}
        className="!text-[8px] sm:!text-[11px] !px-1 sm:!px-2 !py-px sm:!py-0.5 max-[499px]:!text-[6px] max-[499px]:!px-0.5 max-[399px]:!text-[5px] max-[399px]:!leading-none lg:!text-sm lg:!px-3 lg:!py-1"
      />
      <p className="hidden sm:block text-[9px] sm:text-[11px] text-stone-500 leading-snug">
        Contact Harsh To Let Services — employee numbers stay private.
      </p>
      <div className={`flex w-full flex-col gap-1 max-[499px]:gap-0.5 max-[399px]:gap-px ${compact ? '' : 'sm:grid sm:grid-cols-2 sm:gap-2'}`}>
        {phones.map((phone, index) => (
          <div key={phone} className={index > 0 ? 'max-[399px]:hidden w-full' : 'w-full'}>
            <MaskedPhoneActionButton phoneRaw={phone} dense className="w-full" />
          </div>
        ))}
      </div>
      <VendorWhatsAppInquiryButton
        vendor={vendor}
        listing={listing}
        categoryLabel={categoryLabel}
        compact={compact}
        className="!w-full !min-h-[26px] !py-0.5 !text-[8px] max-[499px]:!min-h-[20px] max-[499px]:!py-px max-[499px]:!text-[7px] max-[399px]:!min-h-[18px] max-[399px]:!text-[6px] sm:!min-h-[32px] sm:!py-1 sm:!text-[10px] md:!min-h-[36px] md:!text-xs lg:!min-h-[44px] lg:!py-2.5 lg:!text-sm"
      />
    </div>
  );
}
