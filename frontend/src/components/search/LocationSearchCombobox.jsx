import { useState, useRef, useEffect, useLayoutEffect, useMemo, useId } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, ChevronUp } from 'lucide-react';

/**
 * Searchable location picker: opens a panel above the field (drop-up) with filter + scrollable list.
 * Uses fixed + portal so parent overflow does not clip the menu.
 */
export default function LocationSearchCombobox({
  value,
  onChange,
  options = [],
  triggerClassName,
  tone = 'light',
  dropUp = true,
  emptyLabel = 'Select area',
}) {
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState('');
  const triggerRef = useRef(null);
  const menuRef = useRef(null);
  const inputRef = useRef(null);
  const listId = useId();
  const [menuPos, setMenuPos] = useState({ left: 0, width: 240, maxHeight: 280 });

  const selectedLabel = useMemo(() => {
    if (!value) return emptyLabel;
    return options.find((o) => o.value === value)?.label ?? value;
  }, [options, value, emptyLabel]);

  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return options;
    return options.filter(
      (o) =>
        o.label.toLowerCase().includes(q) ||
        String(o.value).toLowerCase().includes(q),
    );
  }, [options, filter]);

  const updatePosition = () => {
    const el = triggerRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const gap = 8;
    const width = Math.max(r.width, 220);
    let left = r.left;
    if (left + width > window.innerWidth - 8) left = Math.max(8, window.innerWidth - width - 8);

    if (dropUp) {
      const spaceAbove = r.top - gap;
      const maxHeight = Math.min(420, Math.max(160, spaceAbove - 8));
      setMenuPos({
        left,
        width,
        maxHeight,
        bottom: window.innerHeight - r.top + gap,
        top: undefined,
      });
      return;
    }

    const spaceBelow = window.innerHeight - r.bottom - gap;
    const maxHeight = Math.min(420, Math.max(160, spaceBelow - 8));
    setMenuPos({
      left,
      width,
      maxHeight,
      top: r.bottom + gap,
      bottom: undefined,
    });
  };

  useLayoutEffect(() => {
    if (!open) return;
    updatePosition();
    const onScroll = () => updatePosition();
    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', onScroll);
    };
  }, [open, dropUp]);

  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => inputRef.current?.focus(), 0);
    return () => window.clearTimeout(t);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onDocMouseDown = (e) => {
      const t = e.target;
      if (triggerRef.current?.contains(t)) return;
      if (menuRef.current?.contains(t)) return;
      setOpen(false);
      setFilter('');
    };
    document.addEventListener('mousedown', onDocMouseDown);
    return () => document.removeEventListener('mousedown', onDocMouseDown);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setOpen(false);
        setFilter('');
        triggerRef.current?.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  const pick = (opt) => {
    onChange(opt.value);
    setOpen(false);
    setFilter('');
  };

  const isDark = tone === 'dark';

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        id="search-location"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        className={`${triggerClassName} flex w-full items-center justify-between gap-1 text-left`}
        onClick={() => {
          setOpen((o) => !o);
          if (open) setFilter('');
        }}
      >
        <span className={`min-w-0 flex-1 truncate ${!value ? (isDark ? 'text-white/60' : 'text-gray') : ''}`}>
          {selectedLabel}
        </span>
        {open ? (
          <ChevronUp className={`h-3 w-3 shrink-0 lg:h-3.5 lg:w-3.5 ${tone === 'dark' ? 'text-white/50' : 'opacity-60'}`} aria-hidden />
        ) : (
          <ChevronDown className={`h-3 w-3 shrink-0 lg:h-3.5 lg:w-3.5 ${tone === 'dark' ? 'text-white/50' : 'opacity-60'}`} aria-hidden />
        )}
      </button>

      {open &&
        createPortal(
          <div
            ref={menuRef}
            className={`z-[10000] flex flex-col overflow-hidden rounded-lg shadow-2xl ${
              isDark
                ? 'border border-white/15 bg-navy text-white ring-1 ring-black/30'
                : 'border border-gray-200 bg-white ring-1 ring-black/5'
            }`}
            style={{
              position: 'fixed',
              left: menuPos.left,
              width: menuPos.width,
              maxHeight: menuPos.maxHeight,
              ...(menuPos.bottom != null ? { bottom: menuPos.bottom } : {}),
              ...(menuPos.top != null ? { top: menuPos.top } : {}),
            }}
          >
            <div className={`shrink-0 border-b px-3 py-2 text-[11px] font-semibold uppercase tracking-wide ${isDark ? 'border-white/10 text-white/50' : 'border-gray-100 text-gray'}`}>
              All areas ({filtered.length})
            </div>
            <div className={`shrink-0 border-b p-2 ${isDark ? 'border-white/10' : 'border-gray-100'}`}>
              <input
                ref={inputRef}
                type="search"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                placeholder="Search area…"
                className={
                  isDark
                    ? 'w-full rounded-md border border-white/15 bg-navy-light px-2.5 py-2 text-sm text-white outline-none placeholder:text-white/40 focus:border-gold focus:ring-1 focus:ring-gold/30'
                    : 'w-full rounded-md border border-gray-200 bg-gray-50 px-2.5 py-2 text-sm text-navy outline-none placeholder:text-gray-400 focus:border-gold focus:bg-white focus:ring-1 focus:ring-gold/30'
                }
                aria-autocomplete="list"
                autoComplete="off"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    if (filtered.length === 1) pick(filtered[0]);
                  }
                }}
              />
            </div>
            <ul
              id={listId}
              role="listbox"
              aria-label="Areas"
              className="min-h-0 flex-1 overflow-y-auto overscroll-contain py-1 [scrollbar-width:thin]"
            >
              {filtered.length === 0 ? (
                <li className={`px-3 py-4 text-center text-sm ${isDark ? 'text-white/60' : 'text-gray'}`}>
                  No areas match
                </li>
              ) : (
                filtered.map((opt) => {
                  const selected = opt.value === value;
                  return (
                    <li key={opt.value || '__any__'} role="presentation">
                      <button
                        type="button"
                        role="option"
                        aria-selected={selected}
                        className={
                          isDark
                            ? `flex w-full px-3 py-2.5 text-left text-sm text-white hover:bg-white/10 touch-manipulation ${
                                selected ? 'bg-white/15 font-semibold' : 'font-normal'
                              }`
                            : `flex w-full px-3 py-2.5 text-left text-sm text-navy hover:bg-gold/10 touch-manipulation ${
                                selected ? 'bg-gold/15 font-semibold' : 'font-normal'
                              }`
                        }
                        onClick={() => pick(opt)}
                      >
                        {opt.label}
                      </button>
                    </li>
                  );
                })
              )}
            </ul>
          </div>,
          document.body,
        )}
    </>
  );
}
