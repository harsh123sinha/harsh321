import { PROPERTY_LIST_PAGE_SIZE } from '../constants/propertyList';

const PREFIX = 'htls-list-scroll:';
const MAX_AGE_MS = 30 * 60 * 1000;

export function saveListScroll(listKey, propertyId, listIndex) {
  if (!listKey || propertyId == null) return;
  const pagesNeeded =
    listIndex != null
      ? Math.ceil((Number(listIndex) + 1) / PROPERTY_LIST_PAGE_SIZE)
      : 1;
  try {
    sessionStorage.setItem(
      PREFIX + listKey,
      JSON.stringify({
        propertyId,
        scrollY: window.scrollY,
        pagesNeeded,
        ts: Date.now(),
      })
    );
  } catch {
    /* ignore quota errors */
  }
}

export function consumeListScroll(listKey) {
  if (!listKey) return null;
  try {
    const raw = sessionStorage.getItem(PREFIX + listKey);
    if (!raw) return null;
    sessionStorage.removeItem(PREFIX + listKey);
    const data = JSON.parse(raw);
    if (!data || Date.now() - data.ts > MAX_AGE_MS) return null;
    return data;
  } catch {
    return null;
  }
}
