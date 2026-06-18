import { useMemo, useState, useRef, useEffect, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import { PATNA_LOCATION_OPTIONS } from '../constants/patnaLocations';

/**
 * Searchable location list; menu is portaled to `document.body` with fixed
 * positioning so it is not clipped or mis-stacked inside the chat footer.
 */
const LocationSearchDropdown = ({ value, onChange, id }) => {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const btnRef = useRef(null);
  const menuRef = useRef(null);
  const [menuRect, setMenuRect] = useState(null);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return PATNA_LOCATION_OPTIONS;
    return PATNA_LOCATION_OPTIONS.filter(
      (o) =>
        o.label.toLowerCase().includes(s) ||
        String(o.value).toLowerCase().includes(s)
    );
  }, [q]);

  const updateMenuRect = () => {
    if (!open || !btnRef.current) return;
    const r = btnRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - r.bottom - 12;
    const maxH = Math.min(280, Math.max(140, spaceBelow));
    setMenuRect({
      top: r.bottom + 8,
      left: r.left,
      width: Math.max(r.width, 200),
      maxH,
    });
  };

  useLayoutEffect(() => {
    if (!open) {
      setMenuRect(null);
      return;
    }
    updateMenuRect();
    const onScroll = () => updateMenuRect();
    const onResize = () => updateMenuRect();
    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', onResize);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e) => {
      if (btnRef.current?.contains(e.target)) return;
      if (menuRef.current?.contains(e.target)) return;
      setOpen(false);
      setQ('');
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open]);

  const selectedLabel =
    PATNA_LOCATION_OPTIONS.find((o) => o.value === value)?.label ||
    (value ? value : 'Select area');

  const dropdown =
    open &&
    menuRect &&
    typeof document !== 'undefined' &&
    createPortal(
      <div
        ref={menuRef}
        className="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl ring-1 ring-black/5"
        style={{
          position: 'fixed',
          top: menuRect.top,
          left: menuRect.left,
          width: menuRect.width,
          maxHeight: menuRect.maxH,
          zIndex: 10000,
        }}
      >
        <div className="shrink-0 border-b border-slate-100 bg-slate-50/80 p-2">
          <input
            type="search"
            autoComplete="off"
            placeholder="Search locality…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-gold focus:ring-2 focus:ring-gold/25"
          />
        </div>
        <ul className="min-h-0 flex-1 overflow-y-auto overscroll-contain py-1">
          {filtered.map((o) => (
            <li key={o.value || '__any'}>
              <button
                type="button"
                className="w-full px-3 py-2.5 text-left text-sm text-slate-800 hover:bg-slate-50 active:bg-slate-100 touch-manipulation"
                onClick={() => {
                  onChange(o.value);
                  setOpen(false);
                  setQ('');
                }}
              >
                {o.label}
              </button>
            </li>
          ))}
          {filtered.length === 0 ? (
            <li className="px-3 py-4 text-center text-sm text-slate-500">No matches</li>
          ) : null}
        </ul>
      </div>,
      document.body
    );

  return (
    <div className="relative w-full">
      <button
        ref={btnRef}
        type="button"
        id={id}
        onClick={() => setOpen((v) => !v)}
        className="flex w-full min-h-[44px] items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-3 text-left text-sm text-slate-800 shadow-sm touch-manipulation"
      >
        <span className="truncate">{selectedLabel}</span>
        <span className="shrink-0 text-slate-400" aria-hidden>
          ▾
        </span>
      </button>
      {dropdown}
    </div>
  );
};

export default LocationSearchDropdown;
