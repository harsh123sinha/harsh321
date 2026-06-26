const SpinningO = () => (
  <span
    className="relative mx-[0.06em] inline-flex items-center justify-center align-middle"
    style={{ width: '1.05em', height: '1.05em' }}
    aria-hidden
  >
    <span className="absolute inset-0 animate-spin rounded-full border-[0.14em] border-gold/25 border-t-gold border-r-gold/70" />
    <span className="relative font-bold leading-none text-gold" style={{ fontSize: '0.7em' }}>
      O
    </span>
  </span>
);

const sizeClasses = {
  sm: 'text-base sm:text-lg',
  md: 'text-xl sm:text-2xl md:text-3xl',
  lg: 'text-2xl sm:text-3xl md:text-4xl',
};

const padClasses = {
  sm: 'py-6 sm:py-8',
  md: 'py-12 sm:py-16 md:py-20',
  lg: 'py-16 sm:py-24',
};

/**
 * Branded loader: "Harsh To Let Services" with a spinning circle on the O in "To".
 */
const BrandLoader = ({ fullScreen = false, size = 'md', className = '' }) => {
  const body = (
    <div
      className="flex flex-col items-center justify-center text-center"
      role="status"
      aria-live="polite"
      aria-label="Loading Harsh To Let Services"
    >
      <p
        className={`flex max-w-[min(100%,20rem)] flex-wrap items-center justify-center gap-x-1.5 gap-y-1 font-bold leading-tight tracking-tight text-navy sm:max-w-none sm:gap-x-2 ${sizeClasses[size] || sizeClasses.md}`}
      >
        <span>Harsh</span>
        <span className="inline-flex items-center whitespace-nowrap">
          T
          <SpinningO />
        </span>
        <span>Let Services</span>
      </p>
      <span className="sr-only">Loading…</span>
    </div>
  );

  if (fullScreen) {
    return (
      <div className={`flex min-h-screen items-center justify-center px-4 py-16 ${className}`}>
        {body}
      </div>
    );
  }

  return (
    <div className={`flex justify-center px-4 ${padClasses[size] || padClasses.md} ${className}`}>
      {body}
    </div>
  );
};

export default BrandLoader;
