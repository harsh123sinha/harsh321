import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, LogIn, LogOut, User, Bookmark, Briefcase } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import NotificationBell from '../notifications/NotificationBell';
import BrandMark from '../brand/BrandMark';
import MobileMenu from './MobileMenu';

const PostPropertyButton = ({ className = '', onClick, compact = false }) => (
  <Link
    to="/add-property"
    onClick={onClick}
    className={
      compact
        ? `inline-flex shrink-0 items-center gap-1 rounded-md bg-gold px-2 py-1 text-[10px] font-bold leading-none text-navy shadow-sm transition hover:bg-gold/90 ${className}`
        : `inline-flex flex-row flex-nowrap items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-gold px-4 py-2 text-sm font-bold leading-none text-navy shadow-sm transition hover:bg-gold/90 ${className}`
    }
  >
    {compact ? 'Post' : 'Post Property'}
    <span
      className={
        compact
          ? 'rounded bg-red-600 px-1 py-px text-[8px] font-extrabold uppercase leading-none text-white'
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

const JobApplyButton = ({ onClick, compact = false }) => (
  <Link
    to="/job-apply"
    onClick={onClick}
    title="Job Apply"
    className={
      compact
        ? `htls-job-apply-btn inline-flex shrink-0 items-center gap-1 rounded-md px-2 py-1 text-[10px] font-bold leading-none text-white shadow-sm transition ${JOB_APPLY_COLOR}`
        : `htls-job-apply-btn inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-bold leading-none text-white shadow-sm transition ${JOB_APPLY_COLOR}`
    }
  >
    <Briefcase className={`relative z-[2] shrink-0 ${compact ? 'h-3 w-3' : 'h-4 w-4'}`} />
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
    const onResize = () => {
      if (window.matchMedia('(min-width: 1922px)').matches) {
        setIsMenuOpen(false);
      }
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
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
    { to: '/search?type=rent&other_type=Shop', label: 'Shop' },
    { to: '/other', label: 'Other' },
    { to: '/our-vendors', label: 'Our Services' },
  ];

  const brokersLink = { to: '/broker', label: 'Brokers', highlight: true };

  const linkClass = (highlight) =>
    highlight
      ? 'border-2 border-gold bg-gold/15 text-gold px-3 py-1 rounded-lg font-semibold hover:bg-gold/25 hover:text-gold-light transition-colors duration-200 shadow-sm shadow-gold/10'
      : 'text-white hover:text-gold transition-colors duration-200 font-medium';

  const getDashboardLink = () => {
    if (user?.role === 'owner') return '/dashboard/owner';
    if (user?.role === 'agent') return '/dashboard/agent';
    if (user?.role === 'worker') return '/dashboard/worker';
    if (user?.role === 'buyer') return '/dashboard/buyer';
    return '/';
  };

  const loginLink = (
    <Link
      to="/login"
      className="flex items-center gap-1 whitespace-nowrap text-sm font-medium text-white transition-colors duration-200 hover:text-gold"
    >
      <LogIn className="h-4 w-4 shrink-0" />
      <span>Login</span>
    </Link>
  );

  const authenticatedLeadingActions = (
    <>
      <NotificationBell />
      <Link
        to="/saved"
        className="flex items-center gap-1 whitespace-nowrap text-sm font-medium text-white transition-colors duration-200 hover:text-gold"
        title="Saved properties"
      >
        <Bookmark className="h-4 w-4 shrink-0" />
        <span>Saved</span>
      </Link>
      <Link
        to={getDashboardLink()}
        className="flex items-center gap-1 whitespace-nowrap text-sm font-medium text-white transition-colors duration-200 hover:text-gold"
      >
        <User className="h-4 w-4 shrink-0" />
        <span>Dashboard</span>
      </Link>
    </>
  );

  const logoutButton = (
    <button
      type="button"
      onClick={handleLogout}
      className="flex items-center gap-1 whitespace-nowrap rounded-lg bg-gold px-5 py-2 text-sm font-semibold text-navy transition-colors duration-200 hover:bg-gold/90"
    >
      <LogOut className="h-4 w-4 shrink-0" />
      <span>Logout</span>
    </button>
  );

  return (
    <nav className="bg-navy sticky top-0 z-50 shadow-lg">
      <div className="mx-auto w-full max-w-7xl px-3 sm:px-6 nav:max-w-none nav:px-0">
        {/* Compact header — below desktop nav breakpoint (~1922px) */}
        <div className="nav:hidden relative">
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

        {/* Desktop — unchanged layout at 1922px+ */}
        <div className="hidden nav:grid nav:min-h-[116px] nav:py-1.5 nav:grid-cols-[1fr_auto_1fr] nav:items-center nav:gap-6">
          <div className="flex min-w-0 justify-self-start nav:pl-[300px]">
            <Link to="/" className="flex items-center touch-target" aria-label="Harsh To Let Services home">
              <BrandMark />
            </Link>
          </div>

          <div className="flex items-center justify-center gap-6">
            {mainNavLinks.map((link) => (
              <Link key={link.to} to={link.to} className={`whitespace-nowrap text-sm ${linkClass(false)}`}>
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex min-w-0 items-center justify-end justify-self-end nav:pr-[300px]">
            {isAuthenticated && (
              <div className="mr-4 flex shrink-0 items-center gap-3">
                {authenticatedLeadingActions}
              </div>
            )}
            <div className="flex shrink-0 flex-nowrap items-center gap-4">
              {isAuthenticated ? logoutButton : loginLink}
              <Link to={brokersLink.to} className={`whitespace-nowrap text-sm ${linkClass(brokersLink.highlight)}`}>
                {brokersLink.label}
              </Link>
              <JobApplyButton />
              <PostPropertyButton />
            </div>
          </div>
        </div>
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
