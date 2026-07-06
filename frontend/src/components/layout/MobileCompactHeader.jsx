import { ChevronLeft, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useMobileCatalog } from '../../context/MobileCatalogContext';

const MobileCompactHeader = ({ title, locationHint }) => {
  const navigate = useNavigate();
  const { openFilter } = useMobileCatalog();

  return (
    <header className="sticky top-0 z-40 border-b border-stone-200 bg-white lg:hidden">
      <div className="flex items-center gap-2 px-2 py-2.5">
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label="Go back"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-navy touch-manipulation"
        >
          <ChevronLeft className="h-6 w-6" aria-hidden />
        </button>

        <button
          type="button"
          onClick={openFilter}
          className="flex min-w-0 flex-1 items-center gap-2 rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-left touch-manipulation"
        >
          <span className="min-w-0 flex-1 truncate text-sm font-medium text-navy">{title}</span>
        </button>

        <button
          type="button"
          onClick={openFilter}
          aria-label="Location filters"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-navy touch-manipulation"
        >
          <MapPin className="h-5 w-5" aria-hidden />
        </button>
      </div>
      {locationHint ? (
        <p className="border-t border-stone-100 px-3 py-1.5 text-[11px] text-stone-500">{locationHint}</p>
      ) : null}
    </header>
  );
};

export default MobileCompactHeader;
