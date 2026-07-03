import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import ScrollToTop from './ScrollToTop';
import RouteSeo from '../seo/RouteSeo';
import FirstTimePatnaModal from '../brokers/FirstTimePatnaModal';
import { MobileCatalogProvider } from '../../context/MobileCatalogContext';
import { useIsCatalogRoute } from '../../hooks/useIsCatalogRoute';

const LayoutBody = () => {
  const isCatalog = useIsCatalogRoute();

  return (
    <div className="flex flex-col min-h-screen">
      <ScrollToTop />
      <RouteSeo />
      <div className={isCatalog ? 'hidden lg:block' : undefined}>
        <Navbar />
      </div>
      <main className="flex-grow">
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
