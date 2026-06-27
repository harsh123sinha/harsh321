import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, Home, LogIn, LogOut, User, Building2, Bookmark, Briefcase } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import NotificationBell from '../notifications/NotificationBell';

const PostPropertyButton = ({ className = '', onClick, compact = false }) => (
  <Link
    to="/add-property"
    onClick={onClick}
    className={
      compact
        ? `inline-flex shrink-0 items-center gap-1 rounded-md bg-gold px-2 py-1 text-[10px] font-bold leading-none text-navy shadow-sm transition hover:bg-gold/90 ${className}`
        : `inline-flex items-center justify-center gap-2 rounded-lg bg-gold px-4 py-2 text-sm font-bold text-navy shadow-sm transition hover:bg-gold/90 ${className}`
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

const JOB_APPLY_COLOR =
  'bg-[rgb(149,0,0)] hover:bg-[rgb(120,0,0)] ring-1 ring-[rgb(149,0,0)]/45';

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
    <Briefcase className={compact ? 'h-3 w-3 shrink-0' : 'h-4 w-4 shrink-0'} />
    Job Apply
  </Link>
);

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const isWorker = isAuthenticated && user?.role === 'worker';

  useEffect(() => {
    if (!isMenuOpen) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isMenuOpen]);

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

  const workerActions = (
    <>
      <Link
        to="/dashboard/worker"
        onClick={closeMenu}
        className="text-white hover:text-gold transition-colors duration-200 font-medium inline-flex items-center gap-1.5 text-sm"
      >
        <User className="h-4 w-4 shrink-0" />
        <span>Dashboard</span>
      </Link>
      <button
        type="button"
        onClick={handleLogout}
        className="bg-gold text-navy px-4 py-2 rounded-lg font-semibold hover:bg-gold/90 transition-colors duration-200 inline-flex items-center gap-1.5 text-sm"
      >
        <LogOut className="h-4 w-4 shrink-0" />
        <span>Logout</span>
      </button>
    </>
  );

  const authenticatedActions = (
    <>
      <NotificationBell />
      <Link
        to="/saved"
        className="flex items-center gap-1 whitespace-nowrap text-sm font-medium text-white transition-colors duration-200 hover:text-gold"
        title="Saved properties"
      >
        <Bookmark className="h-4 w-4 shrink-0" />
        <span className="hidden lg:inline">Saved</span>
      </Link>
      <Link
        to={getDashboardLink()}
        className="flex items-center gap-1 whitespace-nowrap text-sm font-medium text-white transition-colors duration-200 hover:text-gold"
      >
        <User className="h-4 w-4 shrink-0" />
        <span className="hidden lg:inline">Dashboard</span>
      </Link>
      <button
        type="button"
        onClick={handleLogout}
        className="flex items-center gap-1 whitespace-nowrap rounded-lg bg-gold px-3 py-2 text-sm font-semibold text-navy transition-colors duration-200 hover:bg-gold/90 lg:px-5"
      >
        <LogOut className="h-4 w-4 shrink-0" />
        <span className="hidden lg:inline">Logout</span>
      </button>
    </>
  );

  if (isWorker) {
    return (
      <nav className="bg-navy sticky top-0 z-50 shadow-lg">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 md:h-16 gap-3">
            <Link to="/dashboard/worker" className="flex min-w-0 items-center gap-2 touch-target">
              <Building2 className="h-7 w-7 md:h-8 md:w-8 shrink-0 text-gold" />
              <span className="truncate text-sm md:text-xl font-bold text-white">HarshToLetServices</span>
            </Link>
            <div className="flex items-center gap-3 sm:gap-4 shrink-0">
              {workerActions}
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-navy sticky top-0 z-50 shadow-lg">
      <div className="mx-auto max-w-7xl px-1.5 sm:px-6 lg:max-w-[88rem] lg:px-8 xl:max-w-[96rem]">
        {/* Mobile header */}
        <div className="md:hidden relative">
          <div className="flex items-center justify-between gap-2 py-2 pl-0.5">
            <Link to="/" className="flex min-w-0 flex-1 items-center gap-1.5 touch-target">
              <Building2 className="h-6 w-6 shrink-0 text-gold" />
              <span className="truncate text-sm font-bold text-white">HarshToLetServices</span>
            </Link>
            <button
              type="button"
              onClick={toggleMenu}
              className="shrink-0 rounded-md p-1.5 text-white touch-target"
              aria-label="Toggle menu"
              aria-expanded={isMenuOpen}
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>

          <div className="-ml-0.5 flex items-center gap-1.5 overflow-x-auto pb-2 pl-0 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
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

          {isMenuOpen && (
            <>
              <button
                type="button"
                className="fixed inset-0 z-40 bg-black/50"
                aria-label="Close menu"
                onClick={closeMenu}
              />
              <div className="absolute left-0 right-0 top-full z-50 max-h-[calc(100dvh-5.5rem)] overflow-y-auto overscroll-y-contain border-t border-gold/20 bg-navy-light shadow-xl">
                <div className="space-y-1 px-3 py-3">
                  <Link
                    to="/"
                    onClick={closeMenu}
                    className="flex items-center gap-2 rounded-lg px-2 py-2.5 text-sm text-white hover:bg-white/5 touch-target"
                  >
                    <Home className="h-4 w-4 shrink-0 text-gold" />
                    <span className="font-medium">Home</span>
                  </Link>

                  {mainNavLinks.map((link) => (
                    <Link
                      key={link.to}
                      to={link.to}
                      onClick={closeMenu}
                      className="block rounded-lg px-2 py-2.5 text-sm font-medium text-white hover:bg-white/5 touch-target"
                    >
                      {link.label}
                    </Link>
                  ))}

                  <Link
                    to={brokersLink.to}
                    onClick={closeMenu}
                    className="inline-block rounded-lg border border-gold/50 bg-gold/10 px-3 py-2 text-sm font-semibold text-gold touch-target"
                  >
                    {brokersLink.label}
                  </Link>

                  <Link
                    to="/job-apply"
                    onClick={closeMenu}
                    className={`htls-job-apply-btn mt-2 inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-bold text-white touch-target ${JOB_APPLY_COLOR}`}
                  >
                    <Briefcase className="h-4 w-4" />
                    Job Apply
                  </Link>

                  {isAuthenticated && (
                    <div className="mt-2 space-y-1 border-t border-gold/20 pt-2">
                      <div className="flex items-center justify-between px-2 py-2">
                        <span className="text-sm font-medium text-white">Alerts</span>
                        <NotificationBell />
                      </div>
                      <Link
                        to="/saved"
                        onClick={closeMenu}
                        className="flex items-center gap-2 rounded-lg px-2 py-2.5 text-sm text-white hover:bg-white/5 touch-target"
                      >
                        <Bookmark className="h-4 w-4 text-gold" />
                        <span className="font-medium">Saved properties</span>
                      </Link>
                      <Link
                        to={getDashboardLink()}
                        onClick={closeMenu}
                        className="flex items-center gap-2 rounded-lg px-2 py-2.5 text-sm text-white hover:bg-white/5 touch-target"
                      >
                        <User className="h-4 w-4 text-gold" />
                        <span className="font-medium">Dashboard</span>
                      </Link>
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="flex w-full items-center justify-center gap-2 rounded-lg bg-gold px-3 py-2.5 text-sm font-semibold text-navy touch-target"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Logout</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Desktop — logo left, main links true center, actions right */}
        <div className="hidden md:grid md:h-16 md:grid-cols-[1fr_auto_1fr] md:items-center md:gap-4 lg:gap-6">
          <Link to="/" className="flex min-w-0 items-center justify-self-start gap-2 touch-target">
            <Building2 className="h-8 w-8 shrink-0 text-gold" />
            <span className="truncate text-lg font-bold text-white lg:text-xl">HarshToLetServices</span>
          </Link>

          <div className="flex items-center justify-center gap-4 lg:gap-6">
            {mainNavLinks.map((link) => (
              <Link key={link.to} to={link.to} className={`whitespace-nowrap text-sm ${linkClass(false)}`}>
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex shrink-0 items-center justify-end justify-self-end gap-3 lg:gap-4">
            {isAuthenticated ? authenticatedActions : loginLink}
            <Link to={brokersLink.to} className={`whitespace-nowrap text-sm ${linkClass(brokersLink.highlight)}`}>
              {brokersLink.label}
            </Link>
            <JobApplyButton />
            <PostPropertyButton />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
