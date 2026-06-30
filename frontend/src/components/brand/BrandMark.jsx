import BrandLogo, { NAVBAR_LOGO_CLASS, NAVBAR_DESKTOP_LOGO_CLASS } from './BrandLogo';

const brandNameSize = (compact, footer, desktop) => {
  if (footer) {
    return 'text-lg leading-none xs:text-xl sm:text-2xl md:text-3xl lg:text-[2.25rem] xl:text-4xl';
  }
  if (desktop) {
    return 'text-lg leading-none xl:text-xl 2xl:text-2xl';
  }
  if (compact) {
    return 'text-[11px] leading-tight xs:text-xs sm:text-base sm:leading-none';
  }
  return 'text-sm leading-tight xs:text-base sm:text-lg md:text-2xl lg:text-[1.75rem] sm:leading-none';
};

/**
 * Navbar brand lockup — gold emblem + brand name in Times New Roman.
 */
export default function BrandMark({
  compact = false,
  desktop = false,
  logoClassName,
  footer = false,
}) {
  const resolvedLogoClass =
    logoClassName ?? (desktop ? NAVBAR_DESKTOP_LOGO_CLASS : NAVBAR_LOGO_CLASS);

  const nameClass = footer ? 'whitespace-nowrap' : 'truncate whitespace-nowrap';
  const brandLabel = 'Harsh To Let Services';

  return (
    <div
      className={`flex w-full min-w-0 items-center ${
        desktop ? 'gap-2' : 'gap-2.5 sm:gap-3 md:gap-4'
      } ${footer ? '' : 'min-w-0'}`}
    >
      <BrandLogo className={resolvedLogoClass} alt="" aria-hidden />
      <span
        className={
          footer
            ? 'min-w-0 flex-1'
            : `min-w-0 ${compact ? 'max-w-[8.5rem] xs:max-w-[10rem] sm:max-w-none' : desktop ? 'max-w-[14rem] 2xl:max-w-none' : ''}`
        }
      >
        <span className={`htls-brand-name font-times block ${nameClass} ${brandNameSize(compact, footer, desktop)}`}>
          {brandLabel}
        </span>
      </span>
    </div>
  );
}
