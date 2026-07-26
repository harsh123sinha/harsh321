import { Link } from 'react-router-dom';
import { ExternalLink, MapPin, Navigation } from 'lucide-react';
import { OFFICES } from '../constants/offices';

/**
 * Journey story + live office map previews for Harsh To Let Services.
 */
export default function OurJourney() {
  return (
    <div className="min-h-screen bg-stone-100">
      <section className="relative overflow-hidden bg-[#0a1020] text-white">
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            background:
              'radial-gradient(ellipse at 20% 0%, rgba(212,175,55,0.25), transparent 55%), radial-gradient(ellipse at 80% 100%, rgba(16,185,129,0.12), transparent 50%)',
          }}
          aria-hidden
        />
        <div className="relative mx-auto max-w-4xl px-4 py-12 text-center sm:px-6 sm:py-16 lg:px-8">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-gold">
            Harsh To Let Services
          </p>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            Our Journey &amp; Offices
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-white/75 sm:text-base">
            From a local Patna desk in 2011 to a trusted property platform — serving families,
            owners and tenants across Bihar.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <div className="rounded-2xl border border-stone-200/90 bg-white p-6 shadow-sm sm:p-8">
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-gold">Since 2011</p>
          <h2 className="mb-4 text-2xl font-bold text-navy sm:text-3xl">How we started</h2>
          <div className="space-y-4 text-sm leading-relaxed text-stone-600 sm:text-base">
            <p>
              Harsh To Let Services began in <strong className="text-navy">2011</strong> with a
              simple promise: help people in Patna find the right home without confusion, delays or
              unreliable middlemen. What started as hands-on local brokerage has grown into a
              full-service platform for rent, buy, plots, shops and home services.
            </p>
            <p>
              Over the years we have built trust through verified listings, clear paperwork and
              on-ground support — from first visit to move-in. Today our teams operate from offices
              in Rajeev Nagar and Ashiyana so clients can walk in, talk to us, and get real help
              close to home.
            </p>
            <p>
              Our journey continues with the same focus: honest deals, legal clarity, and a
              neighbourly approach that Patna families can rely on.
            </p>
          </div>
        </div>

        <div className="mt-10 sm:mt-12">
          <div className="mb-6 text-center sm:mb-8 sm:text-left">
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-gold">Visit us</p>
            <h2 className="text-2xl font-bold text-navy sm:text-3xl">Our offices</h2>
            <p className="mt-2 text-sm text-stone-600 sm:text-base">
              Live map previews — tap directions to open Google Maps.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-2 lg:gap-8">
            {OFFICES.map((office) => (
              <article
                key={office.id}
                className="overflow-hidden rounded-2xl border border-stone-200/90 bg-white shadow-sm"
              >
                <div className="relative aspect-[16/11] w-full bg-stone-200">
                  <iframe
                    title={`Map — ${office.shortName}`}
                    src={office.embedUrl}
                    className="absolute inset-0 h-full w-full border-0"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    allowFullScreen
                  />
                </div>
                <div className="p-5 sm:p-6">
                  <div className="mb-2 flex items-start gap-2">
                    <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-gold" aria-hidden />
                    <div>
                      <h3 className="text-lg font-bold text-navy">{office.shortName}</h3>
                      <p className="text-xs font-medium uppercase tracking-wide text-stone-500">
                        {office.title}
                      </p>
                    </div>
                  </div>
                  <p className="mb-4 text-sm leading-relaxed text-stone-600">{office.address}</p>
                  <a
                    href={office.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full bg-navy px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-navy-light"
                  >
                    <Navigation className="h-4 w-4 text-gold" aria-hidden />
                    Get directions
                    <ExternalLink className="h-3.5 w-3.5 opacity-70" aria-hidden />
                  </a>
                </div>
              </article>
            ))}
          </div>
        </div>

        <p className="mt-10 text-center text-sm text-stone-500">
          <Link to="/" className="font-semibold text-gold hover:underline">
            Back to home
          </Link>
          {' · '}
          <Link to="/rent" className="text-navy hover:underline">
            Browse rentals
          </Link>
        </p>
      </section>
    </div>
  );
}
