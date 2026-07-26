import MobileCompactHeader from './MobileCompactHeader';
import MobileBottomNav from './MobileBottomNav';
import PropertyFilterSheet from '../search/PropertyFilterSheet';
import ReviewUsLink from '../ui/ReviewUsLink';
import { buildCatalogHeaderTitle } from '../../utils/catalogTitles';

/**
 * OLX-style mobile catalog: compact header + results + bottom nav.
 * Desktop keeps the hero search block.
 */
const PropertyCatalogShell = ({
  catalogKind = 'search',
  filters = {},
  headerTitle,
  locationHint,
  presetLocation = '',
  presetType = '',
  desktopHero,
  children,
}) => {
  const title = headerTitle || buildCatalogHeaderTitle(filters, catalogKind);

  return (
    <div className="min-h-screen bg-gray-50 pb-[calc(5rem+env(safe-area-inset-bottom))] lg:pb-0">
      <MobileCompactHeader title={title} locationHint={locationHint} />
      <div className="flex items-center justify-center border-b border-stone-200 bg-white px-3 py-2 lg:hidden">
        <ReviewUsLink variant="bar" />
      </div>

      {desktopHero ? (
        <div className="hidden lg:block">
          {desktopHero}
          <div className="flex justify-center border-b border-stone-200 bg-white py-3">
            <ReviewUsLink variant="bar" />
          </div>
        </div>
      ) : null}

      <div className="py-2 lg:py-12">{children}</div>

      <MobileBottomNav catalogKind={catalogKind} />
      <PropertyFilterSheet presetLocation={presetLocation} presetType={presetType} />
    </div>
  );
};

export default PropertyCatalogShell;
