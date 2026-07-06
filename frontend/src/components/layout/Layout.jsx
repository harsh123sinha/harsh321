import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import MobilePropertyQuickLinks from './MobilePropertyQuickLinks';
import Footer from './Footer';
import ScrollToTop from './ScrollToTop';
import RouteSeo from '../seo/RouteSeo';
import FirstTimePatnaModal from '../brokers/FirstTimePatnaModal';
import { MobileCatalogProvider } from '../../context/MobileCatalogContext';
import { useIsCatalogRoute } from '../../hooks/useIsCatalogRoute';

const LayoutBody = () => {
  const isCatalog = useIsCatalogRoute();
  const { pathname } = useLocation();
  const quickLinkVariant = pathname === '/' ? 'overlay-dark' : 'overlay-light';

  return (
    <div className="flex flex-col min-h-screen">
      <ScrollToTop />
      <RouteSeo />
      <div className={isCatalog ? 'hidden lg:block' : undefined}>
        <Navbar />
      </div>
      <main className="relative flex-grow">
        {!isCatalog ? (
          <div className="pointer-events-none absolute inset-x-0 top-0 z-20 xl:hidden">
            <div className="pointer-events-auto">
              <MobilePropertyQuickLinks variant={quickLinkVariant} />
            </div>
          </div>
        ) : null}
        <Outlet />
      </main>
      <div className={isCatalog ? 'hidden lg:block' : undefined}>
        <Footer />
      </div>
      <FirstTimePatnaModal />
    </div>
  );
};

const Layout = () => (
  <MobileCatalogProvider>
    <LayoutBody />
  </MobileCatalogProvider>
);

export default Layout;
