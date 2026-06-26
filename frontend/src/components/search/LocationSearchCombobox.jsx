import { useState, useRef, useEffect, useLayoutEffect, useMemo, useId } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, ChevronUp } from 'lucide-react';

/**
 * Searchable location picker: opens a panel with filter input + scrollable list.
 * Uses fixed + portal so parent overflow does not clip the menu.
 */
export default function LocationSearchCombobox({ value, onChange, options, triggerClassName, tone = 'light' }) {
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState('');
  const triggerRef = useRef(null);
  const menuRef = useRef(null);
  const inputRef = useRef(null);
  const listId = useId();
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0, width: 240 });

  const selectedLabel = useMemo(
    () => options.find((o) => o.value === value)?.label ?? 'Any area',
    [options, value],
  );

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
    const width = Math.max(r.width, 220);
    let left = r.left;
    if (left + width > window.innerWidth - 8) left = Math.max(8, window.innerWidth - width - 8);
    setMenuPos({
      top: r.bottom + 6,
      left,
      width,
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
  }, [open]);

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
        <span className="min-w-0 flex-1 truncate">{selectedLabel}</span>
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
            className={`z-[10000] max-h-[min(70vh,22rem)] overflow-hidden rounded-lg shadow-2xl ${
              isDark
                ? 'border border-white/15 bg-navy text-white ring-1 ring-black/30'
                : 'border border-gray-200 bg-white ring-1 ring-black/5'
            }`}
            style={{
              position: 'fixed',
              top: menuPos.top,
              left: menuPos.left,
              width: menuPos.width,
            }}
          >
            <div className={`border-b p-2 ${isDark ? 'border-white/10' : 'border-gray-100'}`}>
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
              className="max-h-[min(50vh,16rem)] overflow-y-auto py-1 [scrollbar-width:thin]"
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
                            ? `flex w-full px-3 py-2.5 text-left text-sm text-white hover:bg-white/10 ${
                                selected ? 'bg-white/15 font-semibold' : 'font-normal'
                              }`
                            : `flex w-full px-3 py-2.5 text-left text-sm text-navy hover:bg-gold/10 ${
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
