import { Download, Share, Plus, X, Smartphone } from 'lucide-react';
import { usePwaInstall } from '../../hooks/usePwaInstall';

/**
 * Landing-page CTA: install Harsh To-Let as a lightweight phone app (PWA).
 */
export default function DownloadAppSection() {
  const { installed, ios, canNativeInstall, showIosHelp, setShowIosHelp, install } = usePwaInstall();

  const onClick = async () => {
    await install();
  };

  return (
    <section className="border-b border-stone-200/80 bg-stone-100 py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-3xl flex-col items-center rounded-2xl border border-stone-200/90 bg-white px-6 py-10 text-center shadow-sm sm:px-10 sm:py-12">
          <div className="mb-4 flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl bg-navy shadow-md ring-1 ring-gold/30 sm:h-20 sm:w-20">
            <img src="/pwa-192.png" alt="" className="h-full w-full object-cover" width={80} height={80} />
          </div>
          <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-gold">Harsh To-Let</p>
          <h2 className="mb-2 text-2xl font-bold tracking-tight text-navy sm:text-3xl">Download Our App</h2>
          <p className="mx-auto mb-6 max-w-md text-sm leading-relaxed text-stone-600 sm:text-base">
            Install Harsh To-Let on your phone — open Patna listings in one tap, with our logo on your home screen.
          </p>

          {installed ? (
            <p className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-5 py-2.5 text-sm font-semibold text-navy">
              <Smartphone className="h-4 w-4 text-gold" aria-hidden />
              App installed on this device
            </p>
          ) : (
            <button
              type="button"
              onClick={onClick}
              className="touch-target inline-flex items-center justify-center gap-2 rounded-full bg-navy px-8 py-3.5 text-sm font-bold text-white shadow-md transition hover:bg-navy-light sm:text-base"
            >
              <Download className="h-5 w-5 text-gold" aria-hidden />
              Download Our App
            </button>
          )}

          {!installed && (
            <p className="mt-3 text-xs text-stone-500">
              {ios
                ? 'On iPhone: tap the button for Add to Home Screen steps'
                : canNativeInstall
                  ? 'One tap installs Harsh To-Let on your phone'
                  : 'Works on Android Chrome & iPhone Safari'}
            </p>
          )}
        </div>
      </div>

      {showIosHelp ? (
        <div
          className="fixed inset-0 z-[80] flex items-end justify-center bg-black/50 p-4 sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="pwa-install-title"
        >
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl sm:p-6">
            <div className="mb-3 flex items-start justify-between gap-3">
              <h3 id="pwa-install-title" className="text-lg font-bold text-navy">
                Add Harsh To-Let to your phone
              </h3>
              <button
                type="button"
                onClick={() => setShowIosHelp(false)}
                className="rounded-lg p-1.5 text-stone-500 hover:bg-stone-100 hover:text-navy"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {ios ? (
              <ol className="space-y-3 text-left text-sm text-stone-700">
                <li className="flex gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-navy text-xs font-bold text-white">
                    1
                  </span>
                  <span>
                    Tap the <Share className="inline h-4 w-4 text-navy" aria-hidden /> <strong>Share</strong> button in
                    Safari (bottom center on iPhone).
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-navy text-xs font-bold text-white">
                    2
                  </span>
                  <span>
                    Scroll and tap <Plus className="inline h-4 w-4 text-navy" aria-hidden />{' '}
                    <strong>Add to Home Screen</strong>.
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-navy text-xs font-bold text-white">
                    3
                  </span>
                  <span>
                    Confirm the name <strong>Harsh To-Let</strong>, then tap <strong>Add</strong>.
                  </span>
                </li>
              </ol>
            ) : (
              <div className="space-y-3 text-left text-sm text-stone-700">
                <p>To install on Android:</p>
                <ol className="list-decimal space-y-2 pl-5">
                  <li>Open this site in <strong>Chrome</strong>.</li>
                  <li>Tap the menu (⋮) → <strong>Install app</strong> or <strong>Add to Home screen</strong>.</li>
                  <li>Confirm — the <strong>Harsh To-Let</strong> icon will appear on your phone.</li>
                </ol>
              </div>
            )}

            <button
              type="button"
              onClick={() => setShowIosHelp(false)}
              className="mt-5 w-full rounded-xl bg-navy py-3 text-sm font-semibold text-white hover:bg-navy-light"
            >
              Got it
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}
