import BrandLogo, { NAVBAR_LOGO_CLASS, NAVBAR_DESKTOP_LOGO_CLASS } from './BrandLogo';

/** Compact mobile navbar emblem — smaller so brand name fits beside icons */
export const NAVBAR_COMPACT_LOGO_CLASS = 'h-8 w-8 shrink-0 xs:h-9 xs:w-9 sm:h-11 sm:w-11';

const brandNameSize = (compact, footer, desktop, fullMobileName) => {
  if (footer) {
    return 'text-lg leading-none xs:text-xl sm:text-2xl md:text-3xl lg:text-[2.25rem] xl:text-4xl';
  }
  if (desktop) {
    return 'text-lg leading-none xl:text-xl 2xl:text-2xl';
  }
  if (compact) {
    if (fullMobileName) {
      return 'text-[10px] leading-tight xs:text-[11px] sm:text-sm sm:leading-none';
    }
    return 'text-[11px] leading-tight xs:text-xs sm:text-sm sm:leading-none';
  }
  return 'text-sm leading-tight xs:text-base sm:text-lg md:text-2xl lg:text-[1.75rem] sm:leading-none';
};

/**
 * Navbar brand lockup — gold emblem + brand name in Times New Roman.
 * @param {boolean} shortName — mobile-only short label "Harsh To Let" (non-home pages)
 */
export default function BrandMark({
  compact = false,
  desktop = false,
  logoClassName,
  footer = false,
  shortName = false,
}) {
  const resolvedLogoClass =
    logoClassName ??
    (desktop ? NAVBAR_DESKTOP_LOGO_CLASS : compact ? NAVBAR_COMPACT_LOGO_CLASS : NAVBAR_LOGO_CLASS);

  const useShort = Boolean(shortName && compact && !footer && !desktop);
  const fullMobileName = Boolean(compact && !useShort && !footer);
  const brandLabel = useShort ? 'Harsh To Let' : 'Harsh To Let Services';
  const nameClass =
    footer || compact ? 'whitespace-nowrap' : 'truncate whitespace-nowrap';

  return (
    <div
      className={`flex items-center ${
        desktop ? 'gap-2' : compact ? 'gap-1.5 xs:gap-2' : 'gap-2.5 sm:gap-3 md:gap-4'
      } ${footer ? 'w-full min-w-0' : compact ? 'w-auto max-w-none shrink-0' : 'w-full min-w-0'}`}
    >
      <BrandLogo className={resolvedLogoClass} alt="" aria-hidden />
      <span
        className={
          footer
            ? 'min-w-0 flex-1'
            : compact
              ? 'shrink-0'
              : `min-w-0 ${desktop ? 'max-w-[14rem] 2xl:max-w-none' : ''}`
        }
      >
        {!footer && (
          <span className="mb-0.5 block text-[8px] leading-none text-white/80 xs:text-[9px] sm:text-[10px]">
            Home
          </span>
        )}
        <span
          className={`htls-brand-name font-times block ${nameClass} ${brandNameSize(compact, footer, desktop, fullMobileName)}${
            compact ? ' htls-brand-name--compact' : ''
          }`}
        >
          {brandLabel}
        </span>
      </span>
    </div>
  );
}
