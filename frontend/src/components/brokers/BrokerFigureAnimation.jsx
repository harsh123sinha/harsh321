/** Animated broker figure for hero sections and modals */
const BrokerFigureAnimation = ({ className = 'h-28 w-28 sm:h-36 sm:w-36' }) => (
  <div className={`relative flex-shrink-0 ${className}`} aria-hidden>
    <div className="absolute inset-0 rounded-full bg-gold/20 animate-ping" style={{ animationDuration: '2.5s' }} />
    <div className="absolute inset-2 rounded-full bg-gold/10 animate-pulse" />
    <svg
      viewBox="0 0 120 120"
      className="relative h-full w-full drop-shadow-lg animate-broker-float"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="60" cy="60" r="54" fill="#F8FAFC" stroke="#D4AF37" strokeWidth="2" />
      <ellipse cx="60" cy="38" rx="16" ry="18" fill="#E5C663" />
      <path d="M32 95c4-18 18-28 28-28s24 10 28 28" fill="#0F172A" />
      <rect x="44" y="62" width="32" height="28" rx="4" fill="#1E293B" className="animate-broker-wave" />
      <rect x="72" y="68" width="14" height="18" rx="2" fill="#D4AF37" className="animate-broker-briefcase" />
      <path d="M76 68v-6a4 4 0 0 1 8 0v6" stroke="#B8941F" strokeWidth="2" fill="none" />
      <circle cx="48" cy="36" r="2" fill="#0F172A" />
      <circle cx="72" cy="36" r="2" fill="#0F172A" />
      <path d="M54 44q6 4 12 0" stroke="#0F172A" strokeWidth="1.5" strokeLinecap="round" fill="none" />
    </svg>
    <style>{`
      @keyframes broker-float {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-6px); }
      }
      @keyframes broker-wave {
        0%, 100% { transform: rotate(0deg); transform-origin: 60px 62px; }
        25% { transform: rotate(-8deg); transform-origin: 60px 62px; }
        75% { transform: rotate(8deg); transform-origin: 60px 62px; }
      }
      @keyframes broker-briefcase {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-3px); }
      }
      .animate-broker-float { animation: broker-float 3s ease-in-out infinite; }
      .animate-broker-wave { animation: broker-wave 2s ease-in-out infinite; }
      .animate-broker-briefcase { animation: broker-briefcase 2s ease-in-out infinite 0.3s; }
    `}</style>
  </div>
);

export default BrokerFigureAnimation;
