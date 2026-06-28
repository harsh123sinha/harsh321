import { useLayoutEffect, useState } from 'react';

const CYCLE = '12s';
const MOBILE_MAX = 639;

const getSceneMetrics = () => {
  const mobile = window.matchMedia(`(max-width: ${MOBILE_MAX}px)`).matches;
  return mobile
    ? { sceneHeight: 52, houseGap: 50, houseW: 48, houseH: 44, boyW: 28, boyH: 40 }
    : { sceneHeight: 68, houseGap: 76, houseW: 68, houseH: 62, boyW: 38, boyH: 56 };
};

const RunningBoy = () => (
  <svg viewBox="0 0 36 52" className="h-full w-full" aria-hidden>
    <g className="htls-story-boy-run-cycle">
      <circle cx="18" cy="9" r="6" fill="#fef3c7" stroke="#d4af37" strokeWidth="1.2" />
      <path d="M18 15 L18 28" stroke="#22c55e" strokeWidth="3.2" strokeLinecap="round" />
      <g className="htls-story-boy-arms">
        <path d="M18 18 L11 25" stroke="#16a34a" strokeWidth="2.4" strokeLinecap="round" />
        <path d="M18 18 L25 23" stroke="#16a34a" strokeWidth="2.4" strokeLinecap="round" />
      </g>
      <g className="htls-story-boy-legs">
        <path d="M18 28 L12 42" stroke="#15803d" strokeWidth="2.8" strokeLinecap="round" />
        <path d="M18 28 L24 41" stroke="#15803d" strokeWidth="2.8" strokeLinecap="round" />
      </g>
    </g>
  </svg>
);

const HomeHouse = () => (
  <svg viewBox="0 0 64 58" className="h-full w-full overflow-visible" aria-hidden>
    <path d="M32 4 L6 26 L58 26 Z" fill="#d4af37" stroke="#b8941f" strokeWidth="1.2" />
    <rect x="10" y="26" width="44" height="28" rx="2" fill="#166534" stroke="#14532d" strokeWidth="1.2" />
    <rect x="26" y="36" width="12" height="18" rx="1" fill="#22c55e" className="htls-story-house-door" />
    <rect x="14" y="32" width="9" height="9" rx="1" fill="#fef9c3" stroke="#d4af37" strokeWidth="0.8" />
    <rect x="41" y="32" width="9" height="9" rx="1" fill="#fef9c3" stroke="#d4af37" strokeWidth="0.8" />
  </svg>
);

/**
 * Boy runs along the Our Services panel top border, enters the house on the right,
 * then a quick thank-you line appears just left of the house.
 */
export default function HeroReachHomeAnimation({ heroRef, groundRef }) {
  const [scene, setScene] = useState(null);

  useLayoutEffect(() => {
    const hero = heroRef?.current;
    const ground = groundRef?.current;
    if (!hero || !ground) return undefined;

    const sync = () => {
      const heroRect = hero.getBoundingClientRect();
      const groundRect = ground.getBoundingClientRect();
      const metrics = getSceneMetrics();
      setScene({
        top: groundRect.top - heroRect.top - metrics.sceneHeight,
        left: groundRect.left - heroRect.left,
        width: groundRect.width,
        ...metrics,
      });
    };

    sync();
    const observer = new ResizeObserver(sync);
    observer.observe(hero);
    observer.observe(ground);
    window.addEventListener('resize', sync);

    const mobileQuery = window.matchMedia(`(max-width: ${MOBILE_MAX}px)`);
    const onBreakpoint = () => sync();
    mobileQuery.addEventListener('change', onBreakpoint);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', sync);
      mobileQuery.removeEventListener('change', onBreakpoint);
    };
  }, [heroRef, groundRef]);

  if (!scene) return null;

  return (
    <div
      className="htls-hero-story pointer-events-none absolute z-[8] overflow-visible"
      style={{
        top: scene.top,
        left: scene.left,
        width: scene.width,
        height: scene.sceneHeight,
        ['--htls-story-cycle']: CYCLE,
        ['--htls-story-run-end']: `${scene.houseGap}px`,
        ['--htls-story-enter-end']: `${Math.max(scene.houseGap - 12, 36)}px`,
      }}
      aria-hidden
    >
      <div className="absolute inset-x-0 bottom-0 z-0 h-px bg-gradient-to-r from-gold/25 via-gold/60 to-gold/25" />
      <div className="absolute inset-x-0 bottom-0 z-0 h-5 bg-gradient-to-t from-[#0a1020]/35 to-transparent sm:h-6" />

      {/* House + thank you — same ground line, message left of house */}
      <div className="absolute bottom-[1px] right-1.5 z-[2] sm:right-4">
        <div className="htls-hero-story-thanks absolute bottom-3 right-full mr-1.5 max-w-[calc(100vw-7rem)] text-[8px] font-bold leading-none text-white sm:bottom-4 sm:max-w-none sm:text-[11px]">
          Thank you HarshToLetServices
        </div>
        <div
          className="htls-hero-story-house"
          style={{ width: scene.houseW, height: scene.houseH }}
        >
          <HomeHouse />
        </div>
      </div>

      <div
        className="htls-hero-story-boy absolute bottom-[1px] z-[1]"
        style={{ width: scene.boyW, height: scene.boyH }}
      >
        <RunningBoy />
      </div>
    </div>
  );
}
