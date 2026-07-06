import { useMemo, useState, useRef, useEffect, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import { PATNA_AREA_PICK_OPTIONS } from '../constants/patnaLocations';

/**
 * Location step: search field + suggestions panel portaled above the field (chatbot)
 * so the full area list stays visible above the chat footer.
 */
const LocationSearchDropdown = ({
  value,
  onChange,
  id,
  options = PATNA_AREA_PICK_OPTIONS,
  openOnMount = false,
  dropUp = true,
}) => {
  const [open, setOpen] = useState(openOnMount);
  const [q, setQ] = useState('');
  const inputRef = useRef(null);
  const menuRef = useRef(null);
  const [menuStyle, setMenuStyle] = useState(null);

  const selectedLabel =
    options.find((o) => o.value === value)?.label || 'Select area';

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return options;
    return options.filter(
      (o) =>
        o.label.toLowerCase().includes(s) ||
        String(o.value).toLowerCase().includes(s)
    );
  }, [q, options]);

  const updateMenuStyle = () => {
    if (!open || !inputRef.current) return;
    const r = inputRef.current.getBoundingClientRect();
    const gap = 8;
    if (dropUp) {
      const spaceAbove = r.top - gap;
      const maxH = Math.min(420, Math.max(160, spaceAbove - 8));
      setMenuStyle({
        left: r.left,
        width: Math.max(r.width, 220),
        maxHeight: maxH,
        bottom: window.innerHeight - r.top + gap,
        top: undefined,
      });
      return;
    }
    const spaceBelow = window.innerHeight - r.bottom - gap;
    const maxH = Math.min(420, Math.max(160, spaceBelow - 8));
    setMenuStyle({
      left: r.left,
      width: Math.max(r.width, 220),
      maxHeight: maxH,
      top: r.bottom + gap,
      bottom: undefined,
    });
  };

  useLayoutEffect(() => {
    if (!open) {
      setMenuStyle(null);
      return;
    }
    updateMenuStyle();
    const onScroll = () => updateMenuStyle();
    const onResize = () => updateMenuStyle();
    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', onResize);
    };
  }, [open, q, dropUp]);

  useEffect(() => {
    if (!openOnMount) return;
    setOpen(true);
    setQ('');
  }, [openOnMount]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e) => {
      if (inputRef.current?.contains(e.target)) return;
      if (menuRef.current?.contains(e.target)) return;
      setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open]);

  const dropdown =
    open &&
    menuStyle &&
    typeof document !== 'undefined' &&
    createPortal(
      <div
        ref={menuRef}
        className="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl ring-1 ring-black/5"
        style={{
          position: 'fixed',
          left: menuStyle.left,
          width: menuStyle.width,
          maxHeight: menuStyle.maxHeight,
          zIndex: 10000,
          ...(menuStyle.bottom != null ? { bottom: menuStyle.bottom } : {}),
          ...(menuStyle.top != null ? { top: menuStyle.top } : {}),
        }}
      >
        <p className="shrink-0 border-b border-slate-100 px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
          All areas ({filtered.length})
        </p>
        <ul className="min-h-0 flex-1 overflow-y-auto overscroll-contain py-1">
          {filtered.map((o) => (
            <li key={o.value || '__any'}>
              <button
                type="button"
                className="w-full px-3 py-2.5 text-left text-sm text-slate-800 hover:bg-slate-50 active:bg-slate-100 touch-manipulation"
                onClick={() => {
                  onChange(o.value);
                  setQ('');
                  setOpen(false);
                  inputRef.current?.blur();
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
    <div className="relative w-full space-y-2">
      <input
        ref={inputRef}
        id={id}
        type="search"
        autoComplete="off"
        enterKeyHint="search"
        placeholder="Search or scroll all localities…"
        value={q}
        onChange={(e) => {
          setQ(e.target.value);
          if (!open) setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        className="w-full min-h-[44px] rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 shadow-sm outline-none focus:border-gold focus:ring-2 focus:ring-gold/25 touch-manipulation"
      />
      {dropdown}
    </div>
  );
};

export default LocationSearchDropdown;
