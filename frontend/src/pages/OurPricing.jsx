import { Link } from 'react-router-dom';
import PricingContent from '../components/legal/PricingContent';

const OurPricing = () => (
  <div className="min-h-screen bg-gradient-to-b from-stone-100 to-gray-50">
    <div className="relative overflow-hidden bg-navy text-white py-10 sm:py-14">
      <div
        className="absolute inset-0 opacity-30"
        style={{
          background:
            'linear-gradient(135deg, transparent 40%, rgba(212,175,55,0.15) 50%, transparent 60%)',
        }}
        aria-hidden
      />
      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center sm:text-left">
        <p className="text-gold text-xs font-bold uppercase tracking-[0.2em] mb-2">Harsh To Let Services</p>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold">Our Pricing</h1>
        <p className="mt-3 text-gray-light text-sm sm:text-base max-w-2xl mx-auto sm:mx-0">
          Simple, transparent brokerage — both tenant and owner contribute a share of the{' '}
          <strong className="text-white">first month&apos;s rent</strong>.
        </p>
      </div>
    </div>

    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 -mt-2">
      <PricingContent />

      <p className="mt-10 text-center text-sm text-gray">
        <Link to="/signup" className="text-gold font-semibold hover:underline">
          Create an account
        </Link>
        {' · '}
        <Link to="/terms" className="text-navy hover:underline">
          Terms &amp; Conditions
        </Link>
        {' · '}
        <Link to="/" className="text-navy hover:underline">
          Back to home
        </Link>
      </p>
    </div>
  </div>
);

export default OurPricing;
