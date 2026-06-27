import EmployeeIdBadge from './EmployeeIdBadge';
import MaskedPhoneActionButton from '../properties/MaskedPhoneActionButton';
import VendorWhatsAppInquiryButton from './VendorWhatsAppInquiryButton';
import { getContactOfficePhones } from '../../utils/helpers';

/**
 * Public vendor contact — office numbers + WhatsApp (never employee personal phone).
 * Same layout on mobile and desktop; mobile uses smaller sizing only.
 */
export default function VendorContactSection({ vendor, listing = null, categoryLabel = '', compact = false }) {
  const phones = getContactOfficePhones();

  return (
    <div className={`space-y-1.5 sm:space-y-2 ${compact ? 'pt-1.5 sm:pt-2 border-t border-stone-100' : 'pt-3'}`}>
      <EmployeeIdBadge
        employeeId={vendor?.employee_id}
        workerId={vendor?.id}
        className="!text-[9px] sm:!text-[11px] !px-1.5 sm:!px-2"
      />
      <p className="text-[9px] sm:text-[11px] text-stone-500 leading-snug">
        Contact Harsh To Let Services — employee numbers stay private.
      </p>
      <div className="grid grid-cols-2 gap-1 sm:gap-2">
        {phones.map((phone) => (
          <MaskedPhoneActionButton key={phone} phoneRaw={phone} dense />
        ))}
      </div>
      <VendorWhatsAppInquiryButton
        vendor={vendor}
        listing={listing}
        categoryLabel={categoryLabel}
        className="!min-h-[36px] !py-1.5 !text-[10px] sm:!min-h-[44px] sm:!py-2 sm:!text-sm"
      />
    </div>
  );
}
