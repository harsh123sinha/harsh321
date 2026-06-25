import { useEffect, useState, useRef, useCallback } from 'react';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

const STAGGER_MS = 550;

function reasonLabel(reason, result) {
  if (result?.userLabel) return result.userLabel;
  switch (reason) {
    case 'nudity':
    case 'explicit_content':
      return 'Rejected — inappropriate content (nudity)';
    case 'contact_info':
    case 'phone_number':
      return 'Rejected — phone number or contact details';
    case 'advertising':
      return 'Rejected — advertising or promotional content';
    case 'invalid_image':
      return 'Rejected — invalid image format';
    default:
      return 'Rejected — policy violation';
  }
}

/**
 * Blocking overlay for property image moderation — shows per-image verification progress.
 */
export default function VerificationOverlay({
  open,
  imageFiles = [],
  imageModeration = null,
  loading = false,
  error = null,
  onAllVerified,
  onAcknowledgeRejections,
  onErrorDismiss,
}) {
  const [lines, setLines] = useState([]);
  const [phase, setPhase] = useState('verifying');
  const revealTimerRef = useRef(null);

  const total = imageFiles.length;

  const resetVerifyingLines = useCallback(() => {
    setLines(
      imageFiles.map((file, i) => ({
        index: i,
        name: file.name || `Image ${i + 1}`,
        status: 'verifying',
      }))
    );
    setPhase('verifying');
  }, [imageFiles]);

  useEffect(() => {
    if (!open) return undefined;

    document.body.style.overflow = 'hidden';
    const blockKeys = (e) => {
      if (e.key === 'Escape') e.preventDefault();
    };
    window.addEventListener('keydown', blockKeys, true);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', blockKeys, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open) {
      setLines([]);
      setPhase('verifying');
      if (revealTimerRef.current) {
        clearInterval(revealTimerRef.current);
        revealTimerRef.current = null;
      }
      return;
    }

    if (error) {
      setPhase('error');
      return;
    }

    if (loading || !imageModeration?.results?.length) {
      resetVerifyingLines();
      return;
    }

    const results = imageModeration.results;
    let step = 0;

    setLines(
      results.map((r, i) => ({
        index: i,
        name: r.filename || imageFiles[i]?.name || `Image ${i + 1}`,
        status: 'waiting',
        reason: r.reason,
      }))
    );
    setPhase('revealing');

    revealTimerRef.current = setInterval(() => {
      if (step < results.length) {
        const r = results[step];
        setLines((prev) => {
          const next = [...prev];
          next[step] = {
            ...next[step],
            status: r.status === 'accepted' ? 'verified' : 'rejected',
            reason: r.reason,
            userLabel: r.userLabel,
            userMessage: r.userMessage,
          };
          return next;
        });
        step += 1;
      } else {
        clearInterval(revealTimerRef.current);
        revealTimerRef.current = null;
        const anyRejected = results.some((r) => r.status === 'rejected');
        setPhase(anyRejected ? 'rejected' : 'complete');
      }
    }, STAGGER_MS);

    return () => {
      if (revealTimerRef.current) {
        clearInterval(revealTimerRef.current);
        revealTimerRef.current = null;
      }
    };
  }, [open, loading, imageModeration, error, imageFiles, resetVerifyingLines]);

  if (!open) return null;

  const rejectedCount = imageModeration?.rejected ?? 0;
  const acceptedCount = imageModeration?.accepted ?? 0;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-navy/70 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="verification-overlay-title"
    >
      <div className="w-full max-w-md rounded-xl bg-white shadow-2xl border border-gray-light/40 p-6 sm:p-8">
        <h2 id="verification-overlay-title" className="text-xl font-bold text-navy text-center mb-1">
          HarshToLet is verifying your property
        </h2>
        <p className="text-sm text-gray-darker text-center mb-6">
          Checking {total} image{total !== 1 ? 's' : ''} for safety and policy compliance
        </p>

        {error ? (
          <div className="text-center space-y-4">
            <XCircle className="h-14 w-14 text-red-500 mx-auto" aria-hidden />
            <p className="text-navy font-medium">{error}</p>
            <button
              type="button"
              onClick={onErrorDismiss}
              className="w-full bg-navy text-white py-3 rounded-lg font-semibold hover:bg-navy-light transition"
            >
              Go back
            </button>
          </div>
        ) : (
          <>
            <ul className="space-y-3 mb-6 max-h-64 overflow-y-auto">
              {lines.map((line, idx) => (
                <li
                  key={line.index}
                  className="flex items-center gap-3 text-sm border border-gray-light/60 rounded-lg px-3 py-2.5"
                >
                  <span className="flex-shrink-0 w-6 flex justify-center">
                    {line.status === 'verified' && (
                      <CheckCircle className="h-5 w-5 text-green-600" aria-hidden />
                    )}
                    {line.status === 'rejected' && (
                      <XCircle className="h-5 w-5 text-red-500" aria-hidden />
                    )}
                    {(line.status === 'verifying' || line.status === 'waiting') && (
                      <Loader2 className="h-5 w-5 text-gold animate-spin" aria-hidden />
                    )}
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="block text-navy font-medium truncate">
                      Image {idx + 1} of {total}
                    </span>
                    <span className="block text-xs text-gray-darker truncate">{line.name}</span>
                    {line.status === 'verified' && (
                      <span className="block text-xs text-green-700 font-medium mt-0.5">Verified</span>
                    )}
                    {line.status === 'rejected' && (
                      <span className="block text-xs text-red-600 font-medium mt-0.5">
                        {line.userLabel || reasonLabel(line.reason)}
                      </span>
                    )}
                    {line.status === 'verifying' && (
                      <span className="block text-xs text-gold font-medium mt-0.5">Verifying…</span>
                    )}
                    {line.status === 'waiting' && phase === 'revealing' && (
                      <span className="block text-xs text-gray mt-0.5">Waiting</span>
                    )}
                    {line.status === 'waiting' && phase === 'verifying' && idx > 0 && (
                      <span className="block text-xs text-gray mt-0.5">Waiting</span>
                    )}
                  </span>
                </li>
              ))}
            </ul>

            {phase === 'complete' && (
              <div className="text-center space-y-4">
                <CheckCircle className="h-16 w-16 text-green-600 mx-auto" aria-hidden />
                <p className="text-lg font-bold text-navy">Verified by HarshToLet</p>
                <button
                  type="button"
                  onClick={onAllVerified}
                  className="w-full bg-gold text-navy py-3 rounded-lg font-bold hover:bg-gold/90 transition"
                >
                  Continue
                </button>
              </div>
            )}

            {phase === 'rejected' && (
              <div className="text-center space-y-4">
                <XCircle className="h-12 w-12 text-red-500 mx-auto" aria-hidden />
                <p className="text-navy font-medium">
                  {imageModeration?.userMessage ||
                    (acceptedCount > 0
                      ? `${acceptedCount} of ${total} image${total !== 1 ? 's were' : ' was'} verified and saved. Please replace the rejected image${rejectedCount !== 1 ? 's' : ''} and upload again.`
                      : `Your property was not added because one or more images contain content we do not allow. Please replace them and try again.`)}
                </p>
                {imageModeration?.rejectionMessage && (
                  <p className="text-sm text-gray-darker">{imageModeration.rejectionMessage}</p>
                )}
                <button
                  type="button"
                  onClick={() =>
                    onAcknowledgeRejections?.({
                      rejectedFilenames: (imageModeration?.results || [])
                        .filter((r) => r.status === 'rejected')
                        .map((r) => r.filename),
                    })
                  }
                  className="w-full bg-navy text-white py-3 rounded-lg font-semibold hover:bg-navy-light transition"
                >
                  Go back and replace images
                </button>
              </div>
            )}

            {(phase === 'verifying' || phase === 'revealing') && (
              <p className="text-center text-xs text-gray animate-pulse">
                Please wait — do not close this page
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
