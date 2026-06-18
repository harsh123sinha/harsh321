import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, Home, LogIn, UserPlus, LogOut, User, Building2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMenuOpen(false);
  };

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const navLinks = [
    { to: '/rent', label: 'Rent' },
    { to: '/buy', label: 'Buy' },
    { to: '/plots', label: 'Plots' },
    { to: '/other', label: 'Other' },
  ];

  const getDashboardLink = () => {
    if (user?.role === 'owner') return '/dashboard/owner';
    if (user?.role === 'agent') return '/dashboard/agent';
    if (user?.role === 'buyer') return '/dashboard/buyer';
    return '/';
  };

  return (
    <nav className="bg-navy sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 touch-target">
            <Building2 className="h-8 w-8 text-gold" />
            <span className="text-white font-bold text-lg sm:text-xl">HarshToLetServices</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="text-white hover:text-gold transition-colors duration-200 font-medium"
              >
                {link.label}
              </Link>
            ))}

            {isAuthenticated ? (
              <>
                <Link
                  to={getDashboardLink()}
                  className="text-white hover:text-gold transition-colors duration-200 font-medium flex items-center space-x-1"
                >
                  <User className="h-4 w-4" />
                  <span>Dashboard</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="bg-gold text-navy px-5 py-2 rounded-lg font-semibold hover:bg-gold/90 transition-colors duration-200 flex items-center space-x-1"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-white hover:text-gold transition-colors duration-200 font-medium flex items-center space-x-1"
                >
                  <LogIn className="h-4 w-4" />
                  <span>Login</span>
                </Link>
                <Link
                  to="/signup"
                  className="bg-gold text-navy px-5 py-2 rounded-lg font-semibold hover:bg-gold/90 transition-colors duration-200"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={toggleMenu}
            className="md:hidden text-white touch-target p-2"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-navy-light border-t border-gold/20">
          <div className="px-4 py-4 space-y-3">
            <Link
              to="/"
              onClick={toggleMenu}
              className="flex items-center space-x-2 text-white hover:text-gold transition-colors py-2 touch-target"
            >
              <Home className="h-5 w-5" />
              <span className="font-medium">Home</span>
            </Link>

            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={toggleMenu}
                className="block text-white hover:text-gold transition-colors py-2 font-medium touch-target"
              >
                {link.label}
              </Link>
            ))}

            <div className="border-t border-gold/20 pt-3 mt-3">
              {isAuthenticated ? (
                <>
                  <Link
                    to={getDashboardLink()}
                    onClick={toggleMenu}
                    className="flex items-center space-x-2 text-white hover:text-gold transition-colors py-2 mb-2 touch-target"
                  >
                    <User className="h-5 w-5" />
                    <span className="font-medium">Dashboard</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full bg-gold text-navy px-4 py-3 rounded-lg font-semibold hover:bg-gold/90 transition-colors flex items-center justify-center space-x-2 touch-target"
                  >
                    <LogOut className="h-5 w-5" />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={toggleMenu}
                    className="flex items-center space-x-2 text-white hover:text-gold transition-colors py-2 mb-3 touch-target"
                  >
                    <LogIn className="h-5 w-5" />
                    <span className="font-medium">Login</span>
                  </Link>
                  <Link
                    to="/signup"
                    onClick={toggleMenu}
                    className="block w-full bg-gold text-navy px-4 py-3 rounded-lg font-semibold hover:bg-gold/90 transition-colors text-center touch-target"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
