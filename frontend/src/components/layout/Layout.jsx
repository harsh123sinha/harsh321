import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import ScrollToTop from './ScrollToTop';
import RouteSeo from '../seo/RouteSeo';
import FirstTimePatnaModal from '../brokers/FirstTimePatnaModal';

const Layout = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <ScrollToTop />
      <RouteSeo />
      <Navbar />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
      <FirstTimePatnaModal />
    </div>
  );
};

export default Layout;
