import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PropertyFilterPanel from './PropertyFilterPanel';
import { useMobileCatalog } from '../../context/MobileCatalogContext';
import { saveSearchSession } from '../../utils/searchSession';

const PropertyFilterSheet = ({ presetLocation = '', presetType = '' }) => {
  const { filterOpen, closeFilter } = useMobileCatalog();
  const navigate = useNavigate();

  useEffect(() => {
    if (!filterOpen) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [filterOpen]);

  if (!filterOpen || typeof document === 'undefined') return null;

  const applyFilters = (payload) => {
    const params = new URLSearchParams();
    Object.entries(payload).forEach(([k, v]) => {
      if (v != null && String(v).trim() !== '') params.append(k, String(v).trim());
    });
    saveSearchSession(payload);
    closeFilter();
    navigate(`/search?${params.toString()}`);
  };

  return createPortal(
    <div
      className="htls-filter-sheet fixed inset-0 z-[52] flex flex-col bg-[#0a1020] lg:hidden"
      role="dialog"
      aria-modal="true"
      aria-label="Property filters"
    >
      <header className="flex shrink-0 items-center gap-2 border-b border-gold/25 bg-[#0a1020] px-2 py-2.5 pt-[max(0.5rem,env(safe-area-inset-top))]">
        <button
          type="button"
          onClick={closeFilter}
          aria-label="Close filters"
          className="flex h-10 w-10 items-center justify-center rounded-full text-gold transition hover:bg-gold/10 touch-manipulation"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <h2 className="text-base font-bold tracking-wide text-gold">Filters</h2>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain pb-[calc(5.5rem+env(safe-area-inset-bottom))]">
        <PropertyFilterPanel
          presetLocation={presetLocation}
          presetType={presetType}
          onApply={applyFilters}
        />
      </div>
    </div>,
    document.body
  );
};

export default PropertyFilterSheet;
