import { Home, Building2, Users, Info } from 'lucide-react';

function PricingCard({ icon: Icon, title, subtitle, tenantPct, ownerPct, exampleRent, accentClass }) {
  const tenantAmt = Math.round((exampleRent * tenantPct) / 100);
  const ownerAmt = Math.round((exampleRent * ownerPct) / 100);

  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-md transition-shadow hover:shadow-lg">
      <header className={`px-5 py-4 border-b border-stone-100 ${accentClass}`}>
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/90 shadow-sm">
            <Icon className="h-5 w-5 text-navy" aria-hidden />
          </span>
          <div>
            <h2 className="font-bold text-navy text-lg leading-tight">{title}</h2>
            <p className="text-xs text-stone-600 mt-0.5">{subtitle}</p>
          </div>
        </div>
      </header>

      <div className="flex flex-1 flex-col p-5">
        <p className="text-center text-xs font-semibold uppercase tracking-wider text-stone-500">
          Of first month&apos;s rent
        </p>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-xl border-2 border-gold/35 bg-gradient-to-b from-gold/10 to-white px-3 py-4 text-center">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-stone-500">Tenant</p>
            <p className="mt-1 font-black text-3xl text-navy tabular-nums">{tenantPct}%</p>
          </div>
          <div className="rounded-xl border-2 border-navy/15 bg-gradient-to-b from-navy/5 to-white px-3 py-4 text-center">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-stone-500">Owner</p>
            <p className="mt-1 font-black text-3xl text-navy tabular-nums">{ownerPct}%</p>
          </div>
        </div>

        <div className="mt-5 rounded-xl bg-stone-50 border border-stone-100 px-4 py-3">
          <p className="text-[11px] font-bold uppercase tracking-wide text-stone-500 mb-2">Example</p>
          <p className="text-sm text-stone-700 leading-relaxed">
            If monthly rent is{' '}
            <strong className="text-navy">₹{exampleRent.toLocaleString('en-IN')}</strong>
          </p>
          <ul className="mt-2 space-y-1 text-sm text-stone-700">
            <li className="flex justify-between gap-2">
              <span>Tenant pays</span>
              <strong className="text-navy tabular-nums">₹{tenantAmt.toLocaleString('en-IN')}</strong>
            </li>
            <li className="flex justify-between gap-2">
              <span>Owner pays</span>
              <strong className="text-navy tabular-nums">₹{ownerAmt.toLocaleString('en-IN')}</strong>
            </li>
          </ul>
        </div>
      </div>
    </article>
  );
}

/** Shared pricing copy for /our-pricing and signup summary. */
export default function PricingContent({ compact = false }) {
  if (compact) {
    return (
      <p className="text-gray text-xs sm:text-sm leading-relaxed">
        <strong className="text-navy">Residential:</strong> 30% of 1st month rent from tenant &amp; owner each ·{' '}
        <strong className="text-navy">Commercial:</strong> 60% of 1st month rent from tenant &amp; owner each.
      </p>
    );
  }

  return (
    <div className="space-y-8 text-left">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#081936] via-[#0f2a54] to-[#0a2044] px-6 py-7 text-white shadow-lg">
        <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gold/10 blur-2xl" aria-hidden />
        <div className="relative flex flex-col sm:flex-row sm:items-center gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gold/20 border border-gold/30">
            <Users className="h-6 w-6 text-gold" aria-hidden />
          </span>
          <div>
            <p className="text-gold text-xs font-bold uppercase tracking-widest">How we charge</p>
            <h2 className="mt-1 text-xl sm:text-2xl font-bold leading-snug">
              Both sides pay — calculated on the{' '}
              <span className="text-gold">first month&apos;s rent</span>
            </h2>
            <p className="mt-2 text-sm text-white/75 max-w-xl leading-relaxed">
              When Harsh To Let Services facilitates a deal, tenant and owner each pay their share as a percentage
              of the first month&apos;s rent. No hidden fees — terms confirmed in writing before closing.
            </p>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <PricingCard
          icon={Home}
          title="Residential flats"
          subtitle="Homes, apartments & BHK"
          tenantPct={30}
          ownerPct={30}
          exampleRent={10000}
          accentClass="bg-gradient-to-r from-gold/15 to-gold/5"
        />
        <PricingCard
          icon={Building2}
          title="Commercial deals"
          subtitle="Shops, offices & business space"
          tenantPct={60}
          ownerPct={60}
          exampleRent={20000}
          accentClass="bg-gradient-to-r from-navy/8 to-stone-50"
        />
      </div>

      <section className="rounded-2xl border border-gold/25 bg-gradient-to-br from-gold/5 to-white px-5 py-4 shadow-sm">
        <div className="flex gap-3">
          <Info className="h-5 w-5 shrink-0 text-gold mt-0.5" aria-hidden />
          <div>
            <h3 className="font-bold text-navy text-sm sm:text-base">Good to know</h3>
            <ul className="mt-2 space-y-2 text-gray text-xs sm:text-sm leading-relaxed">
              <li>
                <strong className="text-navy">Residential:</strong> 30% of first month&apos;s rent from tenant + 30%
                from owner.
              </li>
              <li>
                <strong className="text-navy">Commercial:</strong> 60% of first month&apos;s rent from tenant + 60%
                from owner.
              </li>
              <li>Applies only when our team successfully facilitates the transaction.</li>
              <li>Mission co-ownership (1 Zameen, Char Parivar) may have separate terms — discussed with our team.</li>
            </ul>
          </div>
        </div>
      </section>

      <p className="text-xs sm:text-sm text-gray pt-2 border-t border-stone-100">
        Last updated: {new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
      </p>
    </div>
  );
}
