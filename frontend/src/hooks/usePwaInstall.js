import { useCallback, useEffect, useState } from 'react';

function isIosDevice() {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent || '';
  const iOS = /iPad|iPhone|iPod/.test(ua);
  const iPadOs = navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1;
  return iOS || iPadOs;
}

function isStandaloneDisplay() {
  if (typeof window === 'undefined') return false;
  const mq = window.matchMedia('(display-mode: standalone)').matches;
  const iosStandalone = window.navigator.standalone === true;
  return mq || iosStandalone;
}

function isAndroidChrome() {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent || '';
  return /Android/i.test(ua) && /Chrome|CriOS/i.test(ua) && !/EdgA|OPR|SamsungBrowser/i.test(ua);
}

/**
 * Handles Android Chrome install prompt + iOS / manual Add-to-Home-Screen guidance.
 */
export function usePwaInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [installed, setInstalled] = useState(() => isStandaloneDisplay());
  const [ios, setIos] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [helpReason, setHelpReason] = useState('manual'); // ios | manual | check-device
  const [installing, setInstalling] = useState(false);

  useEffect(() => {
    setIos(isIosDevice());
    setInstalled(isStandaloneDisplay());

    const onBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    const onInstalled = () => {
      setInstalled(true);
      setDeferredPrompt(null);
      setInstalling(false);
      setShowHelp(false);
    };

    window.addEventListener('beforeinstallprompt', onBeforeInstall);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  const canNativeInstall = Boolean(deferredPrompt) && !installed;

  const openHelp = useCallback((reason) => {
    setHelpReason(reason);
    setShowHelp(true);
  }, []);

  const install = useCallback(async () => {
    if (installed) return { ok: true, already: true };

    if (deferredPrompt) {
      setInstalling(true);
      try {
        // Ensure a service worker is ready — needed for real Android WebAPK install
        if ('serviceWorker' in navigator) {
          await navigator.serviceWorker.register('/sw.js?v=3').catch(() => {});
          await navigator.serviceWorker.ready.catch(() => {});
        }

        deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        setDeferredPrompt(null);

        if (choice?.outcome !== 'accepted') {
          setInstalling(false);
          return { ok: false, dismissed: true };
        }

        // Wait for real install; do NOT mark installed on accept alone
        const gotApp = await new Promise((resolve) => {
          const done = () => {
            window.clearTimeout(timer);
            window.removeEventListener('appinstalled', done);
            resolve(true);
          };
          const timer = window.setTimeout(() => {
            window.removeEventListener('appinstalled', done);
            resolve(false);
          }, 10000);
          window.addEventListener('appinstalled', done, { once: true });
        });

        setInstalling(false);
        if (gotApp) {
          setInstalled(true);
          return { ok: true };
        }

        // Chrome said installing but WebAPK / icon never confirmed
        openHelp('check-device');
        return { ok: false, checkDevice: true };
      } catch (err) {
        console.warn('PWA install failed:', err?.message || err);
        setInstalling(false);
        openHelp(isIosDevice() ? 'ios' : 'manual');
        return { ok: false, error: true };
      }
    }

    if (isIosDevice()) {
      openHelp('ios');
      return { ok: false, iosHelp: true };
    }

    openHelp(isAndroidChrome() ? 'manual' : 'manual');
    return { ok: false, manual: true };
  }, [deferredPrompt, installed, openHelp]);

  return {
    installed,
    ios,
    canNativeInstall,
    installing,
    showHelp,
    setShowHelp,
    helpReason,
    install,
  };
}
