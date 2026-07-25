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

/**
 * Handles Android Chrome install prompt + iOS Add-to-Home-Screen guidance.
 */
export function usePwaInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [installed, setInstalled] = useState(() => isStandaloneDisplay());
  const [ios, setIos] = useState(false);
  const [showIosHelp, setShowIosHelp] = useState(false);

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
      setShowIosHelp(false);
    };

    window.addEventListener('beforeinstallprompt', onBeforeInstall);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  const canNativeInstall = Boolean(deferredPrompt) && !installed;

  const install = useCallback(async () => {
    if (installed) return { ok: true, already: true };

    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      setDeferredPrompt(null);
      if (choice?.outcome === 'accepted') {
        setInstalled(true);
        return { ok: true };
      }
      return { ok: false, dismissed: true };
    }

    if (isIosDevice()) {
      setShowIosHelp(true);
      return { ok: false, iosHelp: true };
    }

    setShowIosHelp(true);
    return { ok: false, manual: true };
  }, [deferredPrompt, installed]);

  return {
    installed,
    ios,
    canNativeInstall,
    showIosHelp,
    setShowIosHelp,
    install,
  };
}
