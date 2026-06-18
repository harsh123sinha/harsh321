import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Building2, UserCog, LogOut } from 'lucide-react';

const linkClass = (active) =>
  `flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
    active ? 'bg-gold text-navy' : 'text-navy hover:bg-gray-light/80'
  }`;

export default function StaffNav({ variant }) {
  const navigate = useNavigate();
  const location = useLocation();
  const isAdmin = variant === 'admin';
  const base = isAdmin ? '/admin' : '/subadmin';
  const tokenKey = isAdmin ? 'adminToken' : 'subAdminToken';
  const loginPath = `${base}/login`;

  const logout = () => {
    localStorage.removeItem(tokenKey);
    navigate(loginPath);
  };

  const active = (path) => location.pathname === path;

  return (
    <header className="bg-white border-b border-gray-light shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-6 flex-wrap">
          <span className="font-bold text-navy">{isAdmin ? 'Admin' : 'Sub-admin'}</span>
          <nav className="flex flex-wrap gap-1">
            <Link to={`${base}/dashboard`} className={linkClass(active(`${base}/dashboard`))}>
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </Link>
            <Link to={`${base}/users`} className={linkClass(active(`${base}/users`))}>
              <Users className="h-4 w-4" />
              Users
            </Link>
            <Link to={`${base}/properties`} className={linkClass(active(`${base}/properties`))}>
              <Building2 className="h-4 w-4" />
              Properties
            </Link>
            {isAdmin && (
              <Link to={`${base}/subadmins`} className={linkClass(active(`${base}/subadmins`))}>
                <UserCog className="h-4 w-4" />
                Sub-admins
              </Link>
            )}
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/" className="text-sm text-gray hover:text-navy px-2">
            Site home
          </Link>
          <button
            type="button"
            onClick={logout}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-navy text-white text-sm font-medium hover:bg-navy-light"
          >
            <LogOut className="h-4 w-4" />
            Log out
          </button>
        </div>
      </div>
    </header>
  );
}
