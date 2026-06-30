import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, ExternalLink } from 'lucide-react';
import BrandMark from '../brand/BrandMark';
import { FOOTER_LOGO_CLASS } from '../brand/BrandLogo';
import { FEATURED_PATNA_AREAS } from '../../constants/areaPages';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-gold/25 bg-navy text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand — full footer width so name stays on one line */}
          <div className="col-span-1 space-y-4 sm:col-span-2 lg:col-span-5">
            <Link to="/" className="block w-full">
              <BrandMark logoClassName={FOOTER_LOGO_CLASS} footer />
            </Link>
            <p className="text-gray-light text-sm">
              Patna&apos;s trusted real estate and to-let platform — buy, rent, or sell flats, houses,
              plots and shops across Bihar with verified listings and local home services.
            </p>
            <div className="flex flex-wrap gap-3 text-sm">
              <a
                href="https://www.facebook.com/profile.php?id=61575885901043"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-light hover:text-gold transition-colors touch-target inline-flex items-center gap-1"
                aria-label="Facebook"
              >
                <ExternalLink className="h-4 w-4 shrink-0" /> Facebook
              </a>
              <a
                href="https://www.instagram.com/harsh_to_let_service/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-light hover:text-gold transition-colors touch-target inline-flex items-center gap-1"
                aria-label="Instagram"
              >
                <ExternalLink className="h-4 w-4 shrink-0" /> Instagram
              </a>
              <a
                href="https://www.linkedin.com/in/harsh-tolet-services-796b1741a?utm_source=share_via&utm_content=profile&utm_medium=member_ios"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-light hover:text-gold transition-colors touch-target inline-flex items-center gap-1"
                aria-label="LinkedIn"
              >
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
                  Properties for Rent in Patna
                </Link>
              </li>
              <li>
                <Link to="/buy" className="text-gray-light hover:text-gold transition-colors text-sm block py-1">
                  Properties for Sale in Patna
                </Link>
              </li>
              <li>
                <Link to="/plots" className="text-gray-light hover:text-gold transition-colors text-sm block py-1">
                  Plots in Patna
                </Link>
              </li>
              <li>
                <Link to="/shop" className="text-gray-light hover:text-gold transition-colors text-sm block py-1">
                  Shops for Rent in Patna
                </Link>
              </li>
              <li>
                <Link to="/other" className="text-gray-light hover:text-gold transition-colors text-sm block py-1">
                  Other Properties
                </Link>
              </li>
              <li>
                <Link to="/our-vendors" className="text-gray-light hover:text-gold transition-colors text-sm block py-1">
                  Home Services &amp; Vendors
                </Link>
              </li>
              <li>
                <Link to="/broker" className="text-gray-light hover:text-gold transition-colors text-sm block py-1">
                  Find Brokers
                </Link>
              </li>
            </ul>
          </div>

          {/* Patna areas */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gold">Patna Areas</h3>
            <ul className="space-y-2">
              {FEATURED_PATNA_AREAS.map((area) => (
                <li key={area.slug}>
                  <Link
                    to={area.path}
                    className="text-gray-light hover:text-gold transition-colors text-sm block py-1"
                  >
                    Rent in {area.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link to="/patna" className="text-gold hover:underline text-sm block py-1 font-medium">
                  All Patna areas →
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
              <li className="flex items-start space-x-2 text-gray-light text-sm">
                <Phone className="h-5 w-5 text-gold flex-shrink-0 mt-0.5" />
                <div className="flex flex-col gap-1">
                  <a href="tel:+919334072476" className="hover:text-gold transition-colors">
                    +91 9334072476
                  </a>
                  <a href="tel:+918210078910" className="hover:text-gold transition-colors">
                    +91 8210078910
                  </a>
                </div>
              </li>
              <li className="flex items-center space-x-2 text-gray-light text-sm">
                <Mail className="h-5 w-5 text-gold flex-shrink-0" />
                <a href="mailto:harshtoletservices@gmail.com" className="hover:text-gold transition-colors break-all">
                  harshtoletservices@gmail.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gold/20 mt-8 pt-6 text-center">
          <p className="text-gray-light text-sm">
            © {currentYear} Harsh To Let Services. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
