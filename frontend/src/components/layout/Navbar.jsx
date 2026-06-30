import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, LogIn, LogOut, User, Bookmark, Briefcase } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import NotificationBell from '../notifications/NotificationBell';
import BrandMark from '../brand/BrandMark';
import MobileMenu from './MobileMenu';

const DESKTOP_NAV_MIN_PX = 1280;

const DESKTOP_NAV_GAP = 'gap-2.5 2xl:gap-4';
const DESKTOP_ICON = 'h-3.5 w-3.5 shrink-0 2xl:h-4 2xl:w-4';
const DESKTOP_TEXT = 'text-xs xl:text-sm 2xl:text-base';

const AUTH_CENTER_GAP = 'gap-3 2xl:gap-4';
const AUTH_CENTER_TEXT = 'text-xs xl:text-sm 2xl:text-base font-medium';
const AUTH_CENTER_ICON = 'h-3.5 w-3.5 shrink-0 2xl:h-4 2xl:w-4';

const PostPropertyButton = ({ className = '', onClick, compact = false, desktop = false }) => (
  <Link
    to="/add-property"
    onClick={onClick}
    className={
      compact
        ? `inline-flex shrink-0 items-center gap-1 rounded-md bg-gold px-2 py-1 text-[10px] font-bold leading-none text-navy shadow-sm transition hover:bg-gold/90 ${className}`
        : desktop
          ? `inline-flex shrink-0 items-center gap-1 rounded-md bg-gold px-2.5 py-1 text-xs font-bold leading-none text-navy shadow-sm transition hover:bg-gold/90 2xl:gap-1.5 2xl:px-3 2xl:py-1.5 2xl:text-sm ${className}`
          : `inline-flex flex-row flex-nowrap items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-gold px-4 py-2 text-sm font-bold leading-none text-navy shadow-sm transition hover:bg-gold/90 ${className}`
    }
  >
    {compact ? 'Post' : 'Post Property'}
    <span
      className={
        compact
          ? 'rounded bg-red-600 px-1 py-px text-[8px] font-extrabold uppercase leading-none text-white'
          : desktop
            ? 'rounded bg-red-600 px-1 py-px text-[8px] font-extrabold uppercase leading-none text-white 2xl:px-1.5 2xl:text-[9px]'
            : 'rounded bg-red-600 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-white'
      }
    >
      Free
    </span>
  </Link>
);

const MobileQuickLink = ({ to, onClick, children, highlight = false }) => (
  <Link
    to={to}
    onClick={onClick}
    className={
      highlight
        ? 'inline-flex shrink-0 items-center gap-1 rounded-md border border-gold/60 bg-gold/15 px-2 py-1 text-[10px] font-semibold leading-none text-gold'
        : 'inline-flex shrink-0 items-center gap-1 rounded-md px-2 py-1 text-[10px] font-semibold leading-none text-white hover:text-gold'
    }
  >
    {children}
  </Link>
);

const JOB_APPLY_COLOR = 'bg-[rgb(149,0,0)] hover:bg-[rgb(120,0,0)]';

const JobApplyButton = ({ onClick, compact = false, desktop = false }) => (
  <Link
    to="/job-apply"
    onClick={onClick}
    title="Job Apply"
    className={
      compact
        ? `htls-job-apply-btn inline-flex shrink-0 items-center gap-1 rounded-md px-2 py-1 text-[10px] font-bold leading-none text-white shadow-sm transition ${JOB_APPLY_COLOR}`
        : desktop
          ? `htls-job-apply-btn inline-flex shrink-0 items-center gap-1 rounded-md px-2 py-1 text-xs font-bold leading-none text-white shadow-sm transition 2xl:gap-1.5 2xl:px-3 2xl:py-1.5 2xl:text-sm ${JOB_APPLY_COLOR}`
          : `htls-job-apply-btn inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-bold leading-none text-white shadow-sm transition ${JOB_APPLY_COLOR}`
    }
  >
    <Briefcase className={`relative z-[2] shrink-0 ${compact || desktop ? 'h-3 w-3 2xl:h-4 2xl:w-4' : 'h-4 w-4'}`} />
    <span className="relative z-[2]">Job Apply</span>
  </Link>
);

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isMenuOpen) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isMenuOpen]);

  useEffect(() => {
    const mq = window.matchMedia(`(min-width: ${DESKTOP_NAV_MIN_PX}px)`);
    const onChange = () => {
      if (mq.matches) setIsMenuOpen(false);
    };
    onChange();
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMenuOpen(false);
  };

  const toggleMenu = () => setIsMenuOpen((open) => !open);
  const closeMenu = () => setIsMenuOpen(false);

  const mainNavLinks = [
    { to: '/rent', label: 'Rent' },
    { to: '/buy', label: 'Buy' },
    { to: '/plots', label: 'Plots' },
    { to: '/shop', label: 'Shop' },
    { to: '/other', label: 'Other' },
    { to: '/our-vendors', label: 'Our Services' },
  ];

  const brokersLink = { to: '/broker', label: 'Brokers', highlight: true };

  const linkClass = (highlight) =>
    highlight
      ? `border border-gold bg-gold/15 text-gold px-2 py-0.5 rounded-md font-semibold hover:bg-gold/25 hover:text-gold-light transition-colors duration-200 2xl:px-2.5 2xl:py-1 ${DESKTOP_TEXT}`
      : `text-white hover:text-gold transition-colors duration-200 font-medium ${DESKTOP_TEXT}`;

  const iconActionClass = `flex items-center gap-1 whitespace-nowrap font-medium text-white transition-colors duration-200 hover:text-gold ${DESKTOP_TEXT}`;

  const getDashboardLink = () => {
    if (user?.role === 'owner') return '/dashboard/owner';
    if (user?.role === 'agent') return '/dashboard/agent';
    if (user?.role === 'worker') return '/dashboard/worker';
    if (user?.role === 'buyer') return '/dashboard/buyer';
    return '/';
  };

  const loginLink = (
    <Link to="/login" className={iconActionClass}>
      <LogIn className={DESKTOP_ICON} />
      <span>Login</span>
    </Link>
  );

  const authSavedDashboardLinks = (
    <>
      <Link
        to="/saved"
        className={`flex shrink-0 items-center gap-1 whitespace-nowrap text-white transition-colors hover:text-gold ${AUTH_CENTER_TEXT}`}
        title="Saved properties"
      >
        <Bookmark className={AUTH_CENTER_ICON} />
        <span>Saved</span>
      </Link>
      <Link
        to={getDashboardLink()}
        className={`flex shrink-0 items-center gap-1 whitespace-nowrap text-white transition-colors hover:text-gold ${AUTH_CENTER_TEXT}`}
        title="Dashboard"
      >
        <User className={AUTH_CENTER_ICON} />
        <span>Dashboard</span>
      </Link>
    </>
  );

  const logoutButton = (
    <button
      type="button"
      onClick={handleLogout}
      className={`flex items-center gap-1 whitespace-nowrap rounded-md bg-gold px-2.5 py-1 font-semibold text-navy transition-colors duration-200 hover:bg-gold/90 2xl:px-3 2xl:py-1.5 ${DESKTOP_TEXT}`}
    >
      <LogOut className={DESKTOP_ICON} />
      <span>Logout</span>
    </button>
  );

  const authenticatedRightActions = (
    <>
      {logoutButton}
      <Link to={brokersLink.to} className={`whitespace-nowrap ${linkClass(brokersLink.highlight)}`}>
        {brokersLink.label}
      </Link>
      <JobApplyButton desktop />
      <PostPropertyButton desktop />
    </>
  );

  const desktopBrandOffset = 'xl:pl-6 2xl:pl-8';
  const desktopActionsOffset = 'xl:pr-6 2xl:pr-8';

  const mainNavLinkItems = mainNavLinks.map((link) => (
    <Link key={link.to} to={link.to} className={`whitespace-nowrap ${linkClass(false)}`}>
      {link.label}
    </Link>
  ));

  const authMainNavLinkItems = mainNavLinks.map((link) => (
    <Link
      key={link.to}
      to={link.to}
      className={`shrink-0 whitespace-nowrap text-white transition-colors hover:text-gold ${AUTH_CENTER_TEXT}`}
    >
      {link.label}
    </Link>
  ));

  const authenticatedCenterNav = (
    <div
      className={`flex shrink-0 flex-nowrap items-center ${AUTH_CENTER_GAP} xl:-translate-x-10 2xl:-translate-x-14`}
    >
      {authMainNavLinkItems}
      <span className="shrink-0">
        <NotificationBell compact />
      </span>
      {authSavedDashboardLinks}
    </div>
  );

  const guestCenterNav = (
    <div className={`flex items-center justify-center ${DESKTOP_NAV_GAP}`}>{mainNavLinkItems}</div>
  );

  return (
    <nav className="bg-navy sticky top-0 z-50 shadow-lg">
      <div className="mx-auto w-full max-w-7xl px-3 sm:px-6 xl:max-w-none xl:px-4 2xl:px-6">
        {/* Phone + tablet — hamburger (below 1280px) */}
        <div className="xl:hidden relative">
          <div className="flex min-h-16 items-center justify-between gap-3 py-2">
            <Link
              to="/"
              className="flex min-w-0 flex-1 items-center touch-target"
              aria-label="Harsh To Let Services home"
            >
              <BrandMark compact />
            </Link>
            <button
              type="button"
              onClick={toggleMenu}
              className="relative shrink-0 rounded-lg p-2 text-white touch-target transition-colors hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/60"
              aria-label={isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={isMenuOpen}
              aria-controls="mobile-nav-drawer"
            >
              <span className="relative block h-6 w-6">
                <Menu
                  className={`absolute inset-0 h-6 w-6 transition-all duration-300 ease-out ${
                    isMenuOpen ? 'rotate-90 scale-75 opacity-0' : 'rotate-0 scale-100 opacity-100'
                  }`}
                  aria-hidden
                />
                <X
                  className={`absolute inset-0 h-6 w-6 transition-all duration-300 ease-out ${
                    isMenuOpen ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-75 opacity-0'
                  }`}
                  aria-hidden
                />
              </span>
            </button>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <PostPropertyButton compact />
            {isAuthenticated ? (
              <MobileQuickLink to={getDashboardLink()}>
                <User className="h-3 w-3 shrink-0" />
                Dashboard
              </MobileQuickLink>
            ) : (
              <MobileQuickLink to="/login">
                <LogIn className="h-3 w-3 shrink-0" />
                Login
              </MobileQuickLink>
            )}
            <MobileQuickLink to={brokersLink.to} highlight>
              Brokers
            </MobileQuickLink>
            <JobApplyButton compact />
          </div>
        </div>

        {/* Desktop navbar (1280px+) */}
        {isAuthenticated ? (
          <div className="hidden xl:flex xl:min-h-[4.5rem] xl:w-full xl:items-center xl:justify-between xl:py-2 2xl:min-h-20">
            <div className={`flex shrink-0 items-center ${desktopBrandOffset}`}>
              <Link to="/" className="flex items-center touch-target" aria-label="Harsh To Let Services home">
                <BrandMark desktop />
              </Link>
            </div>

            <div className="flex min-w-0 flex-1 justify-center overflow-visible px-2">
              {authenticatedCenterNav}
            </div>

            <div className={`flex shrink-0 items-center ${DESKTOP_NAV_GAP} ${desktopActionsOffset}`}>
              {authenticatedRightActions}
            </div>
          </div>
        ) : (
          <div className="hidden xl:grid xl:min-h-[4.5rem] xl:grid-cols-[1fr_auto_1fr] xl:items-center xl:py-2 2xl:min-h-20">
            <div className={`flex min-w-0 items-center justify-self-start ${desktopBrandOffset}`}>
              <Link to="/" className="flex items-center touch-target" aria-label="Harsh To Let Services home">
                <BrandMark desktop />
              </Link>
            </div>

            {guestCenterNav}

            <div className={`flex min-w-0 items-center justify-end justify-self-end ${DESKTOP_NAV_GAP} ${desktopActionsOffset}`}>
              {loginLink}
              <Link to={brokersLink.to} className={`whitespace-nowrap ${linkClass(brokersLink.highlight)}`}>
                {brokersLink.label}
              </Link>
              <JobApplyButton desktop />
              <PostPropertyButton desktop />
            </div>
          </div>
        )}
      </div>

      <MobileMenu
        isOpen={isMenuOpen}
        onClose={closeMenu}
        mainNavLinks={mainNavLinks}
        brokersLink={brokersLink}
        isAuthenticated={isAuthenticated}
        getDashboardLink={getDashboardLink}
        onLogout={handleLogout}
      />
    </nav>
  );
};

export default Navbar;
