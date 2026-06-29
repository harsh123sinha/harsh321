import BrandLogo, { NAVBAR_LOGO_CLASS } from './BrandLogo';

const brandNameSize = (compact, footer) => {
  if (footer) {
    return 'text-lg leading-none xs:text-xl sm:text-2xl md:text-3xl lg:text-[2.25rem] xl:text-4xl';
  }
  if (compact) {
    return 'text-[11px] leading-tight xs:text-xs sm:text-base sm:leading-none';
  }
  return 'text-sm leading-tight xs:text-base sm:text-lg md:text-2xl lg:text-[1.75rem] sm:leading-none';
};

/**
 * Navbar brand lockup — gold emblem + “Harsh To Let Services” in Times New Roman.
 */
export default function BrandMark({
  compact = false,
  logoClassName = NAVBAR_LOGO_CLASS,
  footer = false,
}) {
  const nameClass = footer
    ? 'whitespace-nowrap'
    : 'truncate whitespace-nowrap';

  return (
    <div
      className={`flex w-full min-w-0 items-center gap-2.5 sm:gap-3 md:gap-4 ${
        footer ? '' : 'min-w-0'
      }`}
    >
      <BrandLogo className={`${logoClassName}${footer ? ' shrink-0' : ''}`} alt="" aria-hidden />
      <span
        className={
          footer
            ? 'min-w-0 flex-1'
            : `min-w-0 ${compact ? 'max-w-[8.5rem] xs:max-w-[10rem] sm:max-w-none' : ''}`
        }
      >
        <span className={`htls-brand-name font-times block ${nameClass} ${brandNameSize(compact, footer)}`}>
          Harsh To Let Services
        </span>
      </span>
    </div>
  );
}
