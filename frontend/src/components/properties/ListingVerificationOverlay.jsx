import { Loader2, CheckCircle2, ShieldCheck } from 'lucide-react';

const ListingVerificationOverlay = ({ phase, pendingReview }) => {
  if (!phase) return null;

  const verifying = phase === 'verifying';
  const verified = phase === 'verified';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-navy/60 backdrop-blur-sm px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl text-center">
        {verifying && (
          <>
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-gold/15">
              <Loader2 className="h-9 w-9 animate-spin text-gold" aria-hidden />
            </div>
            <p className="text-lg font-bold text-navy">Harsh To Let Services</p>
            <p className="mt-2 text-sm text-gray">is verifying your listing…</p>
            <p className="mt-4 text-xs text-gray">Checking details and images. Please wait.</p>
          </>
        )}

        {verified && (
          <>
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircle2 className="h-10 w-10 text-green-600" aria-hidden />
            </div>
            <div className="inline-flex items-center gap-2 rounded-full bg-green-50 px-4 py-1.5 text-sm font-semibold text-green-700">
              <ShieldCheck className="h-4 w-4" aria-hidden />
              Verified by Harsh To Let Services
            </div>
            <p className="mt-4 text-sm text-navy font-medium">
              {pendingReview
                ? 'Your listing passed checks and is submitted for final admin review.'
                : 'Your listing is verified and published successfully.'}
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default ListingVerificationOverlay;
