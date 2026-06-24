import { Link } from 'react-router-dom';
import { Building2, Mail, Phone, MapPin, ExternalLink } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-gold/25 bg-navy text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center space-x-2">
              <Building2 className="h-8 w-8 text-gold" />
              <span className="text-xl font-bold">HarshToLetServices</span>
            </Link>
            <p className="text-gray-light text-sm">
              Your trusted partner for buying, renting, and selling properties across Patna.
            </p>
            <div className="flex flex-wrap gap-3 text-sm">
              <a href="#" className="text-gray-light hover:text-gold transition-colors touch-target inline-flex items-center gap-1" aria-label="Facebook">
                <ExternalLink className="h-4 w-4 shrink-0" /> Facebook
              </a>
              <a href="#" className="text-gray-light hover:text-gold transition-colors touch-target inline-flex items-center gap-1" aria-label="Twitter">
                <ExternalLink className="h-4 w-4 shrink-0" /> Twitter
              </a>
              <a href="#" className="text-gray-light hover:text-gold transition-colors touch-target inline-flex items-center gap-1" aria-label="Instagram">
                <ExternalLink className="h-4 w-4 shrink-0" /> Instagram
              </a>
              <a href="#" className="text-gray-light hover:text-gold transition-colors touch-target inline-flex items-center gap-1" aria-label="LinkedIn">
                <ExternalLink className="h-4 w-4 shrink-0" /> LinkedIn
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gold">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/rent" className="text-gray-light hover:text-gold transition-colors text-sm block py-1">
                  Properties for Rent
                </Link>
              </li>
              <li>
                <Link to="/buy" className="text-gray-light hover:text-gold transition-colors text-sm block py-1">
                  Properties for Sale
                </Link>
              </li>
              <li>
                <Link to="/plots" className="text-gray-light hover:text-gold transition-colors text-sm block py-1">
                  Plots
                </Link>
              </li>
              <li>
                <Link to="/other" className="text-gray-light hover:text-gold transition-colors text-sm block py-1">
                  Other Properties
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gold">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/terms" className="text-gray-light hover:text-gold transition-colors text-sm block py-1">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-gray-light hover:text-gold transition-colors text-sm block py-1">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/admin/login" className="text-gray-light hover:text-gold transition-colors text-sm block py-1">
                  Admin Login
                </Link>
              </li>
              <li>
                <Link to="/subadmin/login" className="text-gray-light hover:text-gold transition-colors text-sm block py-1">
                  Sub-Admin Login
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gold">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start space-x-2 text-gray-light text-sm">
                <MapPin className="h-5 w-5 text-gold flex-shrink-0 mt-0.5" />
                <span>Patna, Bihar</span>
              </li>
              <li className="flex items-center space-x-2 text-gray-light text-sm">
                <Phone className="h-5 w-5 text-gold flex-shrink-0" />
                <a href="tel:+919876543210" className="hover:text-gold transition-colors">
                  +91 9
                </a>
              </li>
              <li className="flex items-center space-x-2 text-gray-light text-sm">
                <Mail className="h-5 w-5 text-gold flex-shrink-0" />
                <a href="mailto:info@realestate.com" className="hover:text-gold transition-colors">
                  info@realestate.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gold/20 mt-8 pt-6 text-center">
          <p className="text-gray-light text-sm">
            © {currentYear} HarshToLetServices. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
