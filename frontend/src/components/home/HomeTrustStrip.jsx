import { useEffect, useState } from 'react';
import { BadgeCheck, Handshake, Scale, Sparkles } from 'lucide-react';

const SLIDES = [
  {
    icon: BadgeCheck,
    text: '100% verified listings — inspected before you visit',
  },
  {
    icon: Handshake,
    text: 'Trusted in Patna for 20+ years',
  },
  {
    icon: Scale,
    text: 'Legal paperwork handled end-to-end',
  },
  {
    icon: Sparkles,
    text: 'Great deals in a click — rent, buy & more',
  },
];

const ROTATE_MS = 3200;

/**
 * Green rotating trust strip — homepage only, below Rent / Buy / Shop / Other.
 */
export default function HomeTrustStrip() {
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState('in');

  useEffect(() => {
    const timer = window.setInterval(() => {
      setPhase('out');
      window.setTimeout(() => {
        setIndex((i) => (i + 1) % SLIDES.length);
        setPhase('in');
      }, 320);
    }, ROTATE_MS);
    return () => window.clearInterval(timer);
  }, []);

  const slide = SLIDES[index];
  const Icon = slide.icon;

  return (
    <div
      className="relative overflow-hidden border-y border-emerald-400/30 bg-gradient-to-r from-emerald-800 via-emerald-600 to-teal-600 shadow-[0_4px_18px_rgba(5,150,105,0.35)]"
      role="status"
      aria-live="polite"
    >
      {/* Soft shine sweep */}
      <div
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(110deg,transparent_20%,rgba(255,255,255,0.18)_48%,transparent_72%)] bg-[length:200%_100%] animate-[htls-trust-shine_4.5s_ease-in-out_infinite]"
        aria-hidden
      />
      {/* Edge glow */}
      <div
        className="pointer-events-none absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-black/15 to-transparent"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-black/15 to-transparent"
        aria-hidden
      />

      <div className="relative flex min-h-[2.35rem] items-center justify-center gap-2 px-3 pb-2.5 pt-2 sm:min-h-[2.55rem] sm:gap-2.5 sm:px-4 sm:pb-3 sm:pt-2">
        <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/15 ring-1 ring-white/35 shadow-sm sm:h-6 sm:w-6">
          <Icon
            className={`h-3 w-3 text-amber-200 sm:h-3.5 sm:w-3.5 transition-all duration-300 ${
              phase === 'out' ? 'scale-75 opacity-0' : 'scale-100 opacity-100'
            }`}
            aria-hidden
          />
        </span>

        <p
          className={`max-w-[min(100%,22rem)] text-center text-[11px] font-semibold leading-snug tracking-wide text-white drop-shadow-sm transition-all duration-300 sm:max-w-none sm:text-xs ${
            phase === 'out' ? 'translate-y-2 opacity-0' : 'translate-y-0 opacity-100'
          }`}
        >
          {slide.text}
        </p>

        <span className="hidden h-1 w-1 shrink-0 rounded-full bg-amber-300/90 shadow-[0_0_8px_rgba(252,211,77,0.8)] sm:inline-block" aria-hidden />
      </div>

      {/* Progress dots */}
      <div className="absolute bottom-0.5 left-1/2 flex -translate-x-1/2 gap-1" aria-hidden>
        {SLIDES.map((_, i) => (
          <span
            key={i}
            className={`h-0.5 rounded-full transition-all duration-300 ${
              i === index ? 'w-3 bg-amber-200' : 'w-1 bg-white/35'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
