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
 */
const MaskedPhoneActionButton = ({ phoneRaw, className = '' }) => {
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

  if (loading) {
    return (
      <div
        className={`flex min-h-[52px] items-center space-x-2 rounded-lg bg-navy/60 p-3 lg:min-h-[56px] lg:space-x-3 lg:p-4 ${className}`}
      >
        <Phone className="h-5 w-5 flex-shrink-0 text-gold/50 lg:h-6 lg:w-6" aria-hidden />
        <span className="text-sm font-semibold text-white/50 lg:text-base">Loading…</span>
      </div>
    );
  }

  if (token && ten) {
    return (
      <a
        href={toTelHref(ten)}
        className={`flex min-h-[52px] items-center space-x-2 rounded-lg bg-navy p-3 transition-colors hover:bg-navy-light touch-target lg:min-h-[56px] lg:space-x-3 lg:p-4 ${className}`}
      >
        <Phone className="h-5 w-5 flex-shrink-0 text-gold lg:h-6 lg:w-6" aria-hidden />
        <span className="text-sm font-semibold text-white lg:text-base">{displayFull}</span>
      </a>
    );
  }

  return (
    <button
      type="button"
      onClick={goLogin}
      className={`relative flex w-full min-h-[52px] flex-col gap-1.5 overflow-hidden rounded-lg bg-navy p-3 text-left ring-1 ring-white/10 touch-target lg:min-h-[56px] lg:gap-2 lg:p-4 ${className}`}
      aria-label="Get number — sign in to view full phone number"
    >
      <div className="relative z-10 flex items-center gap-2 lg:gap-3">
        <Phone className="h-5 w-5 flex-shrink-0 text-gold lg:h-6 lg:w-6" aria-hidden />
        <span className="font-mono text-sm font-semibold tracking-wide text-white/90 lg:text-base">{masked}</span>
      </div>

      <div className="relative z-10 flex min-h-[1.5rem] items-center justify-center overflow-hidden rounded-md bg-navy-light/40 py-1">
        <span className="relative z-20 text-xs font-bold uppercase tracking-widest text-gold/90 lg:text-sm">
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
