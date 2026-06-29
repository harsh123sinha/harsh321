const LOGO_SRC = '/logo.png';

/** Navbar emblem — circular; equal width & height */
export const NAVBAR_LOGO_CLASS =
  'h-14 w-14 xs:h-16 xs:w-16 sm:h-[68px] sm:w-[68px] md:h-[88px] md:w-[88px] lg:h-[100px] lg:w-[100px]';

/** Footer — circular, slightly smaller than navbar */
export const FOOTER_LOGO_CLASS =
  'h-14 w-14 sm:h-16 sm:w-16 md:h-[68px] md:w-[68px]';

const roundShell = 'inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full';

export default function BrandLogo({
  className = 'h-8 w-8',
  alt = 'HarshToLet services',
  shimmer = true,
  ...props
}) {
  const img = (
    <img
      src={LOGO_SRC}
      alt={alt}
      className={`h-full w-full rounded-full object-contain bg-transparent p-[12%] ${shimmer ? 'htls-logo-shimmer__img' : ''}`}
      decoding="async"
      {...props}
    />
  );

  if (!shimmer) {
    return <span className={`${roundShell} ${className}`}>{img}</span>;
  }

  return <span className={`htls-logo-shimmer ${roundShell} ${className}`}>{img}</span>;
}

export { LOGO_SRC };
