import { Link, useLocation } from 'react-router-dom';
import { Home, Briefcase, SlidersHorizontal, UserPlus } from 'lucide-react';
import { useMobileCatalog } from '../../context/MobileCatalogContext';
import CategoryRotator from './CategoryRotator';

const NavItem = ({ to, icon: Icon, label, active, onClick }) => {
  const body = (
    <>
      <Icon
        className={`h-5 w-5 shrink-0 ${active ? 'text-[#002f6c]' : 'text-stone-500'}`}
        aria-hidden
      />
      <span
        className={`text-[10px] font-medium ${active ? 'text-[#002f6c]' : 'text-stone-500'}`}
      >
        {label}
      </span>
    </>
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 touch-manipulation"
      >
        {body}
      </button>
    );
  }

  return (
    <Link
      to={to}
      className="flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 touch-manipulation"
    >
      {body}
    </Link>
  );
};

const MobileBottomNav = ({ catalogKind = 'search' }) => {
  const { pathname } = useLocation();
  const { openFilter } = useMobileCatalog();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 border-t border-stone-200 bg-white pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_20px_rgba(0,0,0,0.06)] lg:hidden"
      aria-label="Mobile catalog navigation"
    >
      <div className="mx-auto flex max-w-lg items-end justify-between px-1 pt-1.5">
        <NavItem to="/" icon={Home} label="Home" active={pathname === '/'} />
        <NavItem to="/broker" icon={Briefcase} label="Broker" active={pathname.startsWith('/broker')} />

        <div className="relative -mt-5 flex shrink-0 flex-col items-center px-1">
          <button
            type="button"
            onClick={openFilter}
            aria-label="Open filters"
            className="flex h-14 w-14 items-center justify-center rounded-full border-[3px] border-[#23e5db] bg-[#002f6c] text-white shadow-lg ring-2 ring-[#ffce32]/80 touch-manipulation"
          >
            <SlidersHorizontal className="h-6 w-6" aria-hidden />
          </button>
          <span className="mt-1 text-[10px] font-semibold text-[#002f6c]">Filter</span>
        </div>

        <NavItem to="/job-apply" icon={UserPlus} label="Job Apply" active={pathname === '/job-apply'} />
        <CategoryRotator activeKey={catalogKind} />
      </div>
    </nav>
  );
};

export default MobileBottomNav;
