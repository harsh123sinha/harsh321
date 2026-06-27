import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import {
  formatPhoneMaskedDisplay,
  getSafeInternalReturnPath,
  toTelHref,
  toTenDigitIndianMobile,
} from '../../utils/helpers';

/**
 * Call row: logged-in → `tel:` link; guest → masked digits + sweep + “Get number”, tap → login.
 * @param {boolean} dense — smaller layout for vendor cards on mobile (same structure as desktop).
 */
const MaskedPhoneActionButton = ({ phoneRaw, className = '', dense = false }) => {
  const { token, loading } = useAuth();
  const navigate = useNavigate();
  const ten = useMemo(() => toTenDigitIndianMobile(phoneRaw), [phoneRaw]);
  const masked = useMemo(() => formatPhoneMaskedDisplay(phoneRaw), [phoneRaw]);
  const displayFull = ten ? `+91 ${ten}` : '';

  const goLogin = () => {
    const next = getSafeInternalReturnPath(
      `${window.location.pathname}${window.location.search || ''}`
    );
    const q = new URLSearchParams({ from: 'contact' });
    if (next) q.set('next', next);
    navigate(`/login?${q.toString()}`);
  };

  const sizeClass = dense
    ? 'min-h-[40px] p-1.5 gap-1'
    : 'min-h-[52px] p-3 lg:min-h-[56px] lg:p-4';
  const iconClass = dense ? 'h-3.5 w-3.5' : 'h-5 w-5 lg:h-6 lg:w-6';
  const textClass = dense ? 'text-[10px] leading-tight' : 'text-sm lg:text-base';

  if (loading) {
    return (
      <div
        className={`flex items-center space-x-1.5 rounded-lg bg-navy/60 ${sizeClass} ${className}`}
      >
        <Phone className={`${iconClass} shrink-0 text-gold/50`} aria-hidden />
        <span className={`font-semibold text-white/50 ${textClass}`}>…</span>
      </div>
    );
  }

  if (token && ten) {
    return (
      <a
        href={toTelHref(ten)}
        className={`flex items-center space-x-1.5 rounded-lg bg-navy transition-colors hover:bg-navy-light touch-target ${sizeClass} ${className}`}
      >
        <Phone className={`${iconClass} shrink-0 text-gold`} aria-hidden />
        <span className={`font-semibold text-white ${textClass}`}>{displayFull}</span>
      </a>
    );
  }

  return (
    <button
      type="button"
      onClick={goLogin}
      className={`relative flex w-full flex-col overflow-hidden rounded-lg bg-navy text-left ring-1 ring-white/10 touch-target ${dense ? 'min-h-[40px] gap-0.5 p-1.5' : 'min-h-[52px] gap-1.5 p-3 lg:min-h-[56px] lg:gap-2 lg:p-4'} ${className}`}
      aria-label="Get number — sign in to view full phone number"
    >
      <div className="relative z-10 flex items-center gap-1 sm:gap-2">
        <Phone className={`${iconClass} shrink-0 text-gold`} aria-hidden />
        <span className={`font-mono font-semibold tracking-wide text-white/90 ${textClass}`}>{masked}</span>
      </div>

      <div className={`relative z-10 flex items-center justify-center overflow-hidden rounded-md bg-navy-light/40 ${dense ? 'min-h-[1rem] py-0.5' : 'min-h-[1.5rem] py-1'}`}>
        <span className={`relative z-20 font-bold uppercase tracking-wider text-gold/90 ${dense ? 'text-[8px]' : 'text-xs lg:text-sm'}`}>
          Get number
        </span>
        <div
          className="htls-phone-sweep-bar pointer-events-none absolute inset-y-0 left-0 w-[55%] bg-gradient-to-r from-transparent via-gold/75 to-transparent blur-[0.5px]"
          aria-hidden
        />
      </div>
    </button>
  );
};

export default MaskedPhoneActionButton;
