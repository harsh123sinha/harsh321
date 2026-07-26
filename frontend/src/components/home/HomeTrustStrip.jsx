import { useEffect, useState } from 'react';

const MESSAGES = [
  'Verified listing',
  'Trust since 20 years',
  'With legal paperwork',
  'Great deals in a click',
];

const ROTATE_MS = 2800;

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
        setIndex((i) => (i + 1) % MESSAGES.length);
        setPhase('in');
      }, 280);
    }, ROTATE_MS);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <div
      className="flex w-full items-center justify-center bg-emerald-600 px-3 py-1.5 shadow-sm"
      role="status"
      aria-live="polite"
    >
      <p
        className={`text-center text-[11px] font-semibold tracking-wide text-white transition-all duration-300 sm:text-xs ${
          phase === 'out' ? 'translate-y-1.5 opacity-0' : 'translate-y-0 opacity-100'
        }`}
      >
        {MESSAGES[index]}
      </p>
    </div>
  );
}
