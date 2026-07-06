import MobileCompactHeader from './MobileCompactHeader';
import MobilePropertyQuickLinks from './MobilePropertyQuickLinks';
import MobileBottomNav from './MobileBottomNav';
import PropertyFilterSheet from '../search/PropertyFilterSheet';
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
      <div className="lg:hidden">
        <MobilePropertyQuickLinks variant="catalog" />
      </div>

      {desktopHero ? <div className="hidden lg:block">{desktopHero}</div> : null}

      <div className="py-2 lg:py-12">{children}</div>

      <MobileBottomNav catalogKind={catalogKind} />
      <PropertyFilterSheet presetLocation={presetLocation} presetType={presetType} />
    </div>
  );
};

export default PropertyCatalogShell;
