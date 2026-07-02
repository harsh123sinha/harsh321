import { CheckCircle2, Loader2 } from 'lucide-react';

export default function ListingVerificationStrip({ phase }) {
  if (!phase) return null;
  const verifying = phase === 'verifying';
  const verified = phase === 'verified';

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[95] px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
      <div className="mx-auto w-full max-w-3xl">
        <div
          className={`h-[100px] w-full rounded-2xl shadow-2xl ring-1 ring-black/10 flex items-center justify-between gap-4 px-5 ${
            verifying ? 'bg-green-700' : 'bg-green-700'
          }`}
          role="status"
          aria-live="polite"
        >
          <div className="flex min-w-0 items-center gap-3 text-white">
            {verifying ? (
              <Loader2 className="h-7 w-7 shrink-0 animate-spin" aria-hidden />
            ) : (
              <CheckCircle2 className="h-8 w-8 shrink-0 text-white" aria-hidden />
            )}
            <div className="min-w-0">
              <p className="text-base font-bold leading-tight">
                {verifying ? 'Harsh To Let Services is verifying…' : 'Verified successfully'}
              </p>
              <p className="mt-1 text-sm text-white/90 leading-snug">
                {verifying ? 'Please wait…' : 'Opening your listing…'}
              </p>
            </div>
          </div>

          {verifying && (
            <div className="hidden sm:flex items-center gap-1 text-white/90">
              <span className="h-2 w-2 rounded-full bg-white/70 animate-bounce [animation-delay:-0.2s]" />
              <span className="h-2 w-2 rounded-full bg-white/70 animate-bounce [animation-delay:-0.1s]" />
              <span className="h-2 w-2 rounded-full bg-white/70 animate-bounce" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

