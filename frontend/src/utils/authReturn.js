import { getSafeInternalReturnPath } from './helpers';

const STORAGE_KEY = 'hts_auth_return_v1';

/** Remember where to send the user after login/signup (survives auth page navigation). */
export function stashAuthReturnPath(candidate) {
  const safe = getSafeInternalReturnPath(candidate);
  if (!safe) return '';
  try {
    sessionStorage.setItem(STORAGE_KEY, safe);
  } catch {
    /* private mode */
  }
  return safe;
}

/** Prefer `?next=` from the URL, then sessionStorage; clears stored value. */
export function consumeAuthReturnPath(urlNext) {
  let path = getSafeInternalReturnPath(urlNext);
  if (!path) {
    try {
      path = getSafeInternalReturnPath(sessionStorage.getItem(STORAGE_KEY));
    } catch {
      /* ignore */
    }
  }
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
  return path;
}

/** Path to return after tapping phone / WhatsApp as a guest. */
export function buildContactAuthReturnPath() {
  const base = `${window.location.pathname}${window.location.search || ''}`.split('#')[0];
  const withContact =
    /^\/(property|projects)\/\d+/.test(base) ? `${base}#contact` : base;
  return getSafeInternalReturnPath(withContact);
}

/** `/login?from=contact&next=…` for guest contact actions. */
export function buildContactLoginUrl() {
  const returnPath = buildContactAuthReturnPath();
  stashAuthReturnPath(returnPath);
  const q = new URLSearchParams({ from: 'contact' });
  if (returnPath) q.set('next', returnPath);
  return `/login?${q.toString()}`;
}

/** `/login?from=chat&next=…` for guest chat on a listing. */
export function buildChatLoginUrl(propertyId) {
  const base = propertyId ? `/property/${propertyId}` : `${window.location.pathname}${window.location.search || ''}`;
  const returnPath = getSafeInternalReturnPath(base.split('#')[0]);
  stashAuthReturnPath(returnPath);
  const q = new URLSearchParams({ from: 'chat' });
  if (returnPath) q.set('next', returnPath);
  return `/login?${q.toString()}`;
}
