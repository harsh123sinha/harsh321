import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Download, Share, Plus, X, Loader2 } from 'lucide-react';
import { usePwaInstall } from '../../hooks/usePwaInstall';

const SHOW_DELAY_MS = 5000;
const SESSION_DISMISS_KEY = 'hts-get-app-strip-dismissed';

/**
 * Full-width "Get Our App" strip — slides in from the right middle of the screen
 * 5 seconds after the Find Broker moment on the landing page.
 */
export default function GetOurAppStrip() {
  const { pathname } = useLocation();
  const { installed, ios, showHelp, setShowHelp, helpReason, installing, install } = usePwaInstall();
  const [armed, setArmed] = useState(false);
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(() => {
    if (typeof sessionStorage === 'undefined') return false;
    return sessionStorage.getItem(SESSION_DISMISS_KEY) === '1';
  });

  useEffect(() => {
    if (pathname !== '/' || installed || dismissed) return undefined;

    const onBrokerCue = () => setArmed(true);
    window.addEventListener('hts:find-broker-appeared', onBrokerCue);
    return () => window.removeEventListener('hts:find-broker-appeared', onBrokerCue);
  }, [pathname, installed, dismissed]);

  useEffect(() => {
    if (!armed || visible || dismissed || installed || pathname !== '/') return undefined;

    const t = window.setTimeout(() => setVisible(true), SHOW_DELAY_MS);
    return () => window.clearTimeout(t);
  }, [armed, visible, dismissed, installed, pathname]);

  const dismiss = () => {
    sessionStorage.setItem(SESSION_DISMISS_KEY, '1');
    setDismissed(true);
    setVisible(false);
  };

  const onClick = async () => {
    if (installing) return;
    await install();
  };

  if (pathname !== '/' || installed || dismissed) return null;

  return (
    <>
      <div
        className={`pointer-events-none fixed inset-y-0 right-0 z-[85] flex w-full items-center transition-transform duration-700 ease-out ${
          visible ? 'translate-x-0' : 'translate-x-full'
        }`}
        aria-hidden={!visible}
      >
        <div
          className="pointer-events-auto flex w-full items-center gap-3 border-y border-gold/40 bg-navy/95 px-3 py-2.5 shadow-[0_8px_32px_rgba(15,23,42,0.35)] backdrop-blur-md sm:gap-4 sm:px-6 sm:py-3"
          role="region"
          aria-label="Get Our App"
        >
          <img
            src="/pwa-192.png"
            alt=""
            className="h-9 w-9 shrink-0 rounded-lg object-cover ring-1 ring-gold/40 sm:h-10 sm:w-10"
            width={40}
            height={40}
          />
          <button
            type="button"
            onClick={onClick}
            disabled={installing}
            className="flex min-w-0 flex-1 items-center justify-center gap-2 text-center disabled:opacity-80 sm:justify-start"
          >
            {installing ? (
              <Loader2 className="h-4 w-4 shrink-0 animate-spin text-gold" aria-hidden />
            ) : (
              <Download className="hidden h-4 w-4 shrink-0 text-gold sm:block" aria-hidden />
            )}
            <span className="text-sm font-bold tracking-wide text-white sm:text-base">
              {installing ? 'Installing…' : 'Get Our App'}
            </span>
            {!installing ? (
              <span className="hidden text-xs font-medium text-white/60 sm:inline">
                — Harsh To-Let on your phone
              </span>
            ) : null}
          </button>
          <button
            type="button"
            onClick={dismiss}
            className="shrink-0 rounded-lg p-1.5 text-white/60 transition hover:bg-white/10 hover:text-white"
            aria-label="Dismiss"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {showHelp ? (
        <div
          className="fixed inset-0 z-[90] flex items-end justify-center bg-black/50 p-4 sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="pwa-install-title"
        >
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl sm:p-6">
            <div className="mb-3 flex items-start justify-between gap-3">
              <h3 id="pwa-install-title" className="text-lg font-bold text-navy">
                {helpReason === 'check-device'
                  ? 'Check your phone for the app'
                  : 'Add Harsh To-Let to your phone'}
              </h3>
              <button
                type="button"
                onClick={() => setShowHelp(false)}
                className="rounded-lg p-1.5 text-stone-500 hover:bg-stone-100 hover:text-navy"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {helpReason === 'ios' || ios ? (
              <ol className="space-y-3 text-left text-sm text-stone-700">
                <li className="flex gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-navy text-xs font-bold text-white">
                    1
                  </span>
                  <span>
                    Open this site in <strong>Safari</strong> (not Chrome on iPhone).
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-navy text-xs font-bold text-white">
                    2
                  </span>
                  <span>
                    Tap the <Share className="inline h-4 w-4 text-navy" aria-hidden /> <strong>Share</strong> button
                    (bottom center).
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-navy text-xs font-bold text-white">
                    3
                  </span>
                  <span>
                    Tap <Plus className="inline h-4 w-4 text-navy" aria-hidden />{' '}
                    <strong>Add to Home Screen</strong>, then <strong>Add</strong>.
                  </span>
                </li>
              </ol>
            ) : helpReason === 'check-device' ? (
              <div className="space-y-3 text-left text-sm text-stone-700">
                <p>
                  Chrome may say &quot;Installing…&quot; even when the icon is not on the home screen yet.
                </p>
                <ol className="list-decimal space-y-2 pl-5">
                  <li>
                    Swipe through your <strong>home screens</strong> and open the <strong>App drawer</strong> (app
                    list) — look for <strong>Harsh To-Let</strong>.
                  </li>
                  <li>
                    If it is missing, open Chrome menu <strong>⋮</strong> → <strong>Add to Home screen</strong> /{' '}
                    <strong>Install app</strong> → confirm.
                  </li>
                  <li>
                    Still missing? Use <strong>Chrome</strong> (not Facebook/Instagram in-app browser), refresh the
                    page, and try again.
                  </li>
                </ol>
              </div>
            ) : (
              <div className="space-y-3 text-left text-sm text-stone-700">
                <p>Install from Chrome on Android:</p>
                <ol className="list-decimal space-y-2 pl-5">
                  <li>
                    Open <strong>www.harshtoletservices.in</strong> in <strong>Chrome</strong> (not Instagram /
                    Facebook browser).
                  </li>
                  <li>
                    Tap menu <strong>⋮</strong> → <strong>Install app</strong> or <strong>Add to Home screen</strong>.
                  </li>
                  <li>
                    Confirm — then check home screen <em>and</em> the app drawer for <strong>Harsh To-Let</strong>.
                  </li>
                </ol>
              </div>
            )}

            <button
              type="button"
              onClick={() => setShowHelp(false)}
              className="mt-5 w-full rounded-xl bg-navy py-3 text-sm font-semibold text-white hover:bg-navy-light"
            >
              Got it
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
