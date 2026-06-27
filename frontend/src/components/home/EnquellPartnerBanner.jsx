import { ExternalLink, Scale } from 'lucide-react';

export default function EnquellPartnerBanner({ className = '' }) {
  return (
    <div
      className={`w-full overflow-hidden border-y border-navy/20 bg-gradient-to-br from-navy via-[#0c1630] to-navy-light py-5 shadow-md sm:py-6 ${className}`}
    >
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 sm:gap-4">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-gold/40 bg-gold/10 text-gold sm:h-12 sm:w-12">
            <Scale className="h-5 w-5" strokeWidth={1.75} aria-hidden />
          </span>
          <div className="min-w-0 text-left">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-gold/90 sm:text-[11px]">
              Official partner
            </p>
            <p className="mt-1 text-sm font-bold leading-snug text-white sm:text-base md:text-lg">
              Partner with{' '}
              <span className="text-gold">Enquell Consultancy &amp; Legal Firm</span>
            </p>
          </div>
        </div>

        <a
          href="https://www.enquell.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-gold/30 bg-gold/10 px-4 py-3 text-xs font-medium text-white transition hover:border-gold/50 hover:bg-gold/20 sm:w-auto sm:text-sm"
        >
          <span className="text-center sm:text-left">
            Need legal &amp; consultancy help? Visit{' '}
            <span className="font-bold text-gold">Enquell</span>
          </span>
          <ExternalLink className="h-4 w-4 shrink-0 text-gold" aria-hidden />
        </a>
      </div>
    </div>
  );
}
