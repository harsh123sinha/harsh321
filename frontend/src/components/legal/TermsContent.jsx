/** Shared body for /terms and signup modal (scrolls inside parent). */
export default function TermsContent() {
  return (
    <div className="space-y-6 text-left">
      <section>
        <h2 className="text-xl font-bold text-navy mb-2">1. Acceptance of Terms</h2>
        <p className="text-gray leading-relaxed text-sm sm:text-base">
          By accessing and using this HarshToLetServices platform, you accept and agree to be bound by the terms and
          provision of this agreement.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-bold text-navy mb-2">2. Use License</h2>
        <p className="text-gray leading-relaxed text-sm sm:text-base mb-2">
          Permission is granted to temporarily use the services on this platform for personal, non-commercial transitory
          viewing only.
        </p>
        <p className="text-gray leading-relaxed text-sm sm:text-base">
          This is the grant of a license, not a transfer of title, and under this license you may not:
        </p>
        <ul className="list-disc list-inside text-gray mt-2 space-y-1 ml-2 text-sm sm:text-base">
          <li>Modify or copy the materials</li>
          <li>Use the materials for any commercial purpose</li>
          <li>Attempt to decompile or reverse engineer any software</li>
          <li>Remove any copyright or other proprietary notations</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-bold text-navy mb-2">3. Property Listings</h2>
        <p className="text-gray leading-relaxed text-sm sm:text-base">
          All property listings are provided by individual property owners and agents. We make every effort to ensure
          accuracy but cannot guarantee the completeness or reliability of listings.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-bold text-navy mb-2">4. Service Charges</h2>
        <p className="text-gray leading-relaxed text-sm sm:text-base mb-2">
          Harsh To Let Services charges a brokerage / facilitation fee on successful dealings facilitated through the
          platform. See{' '}
          <a href="/our-pricing" className="text-gold font-semibold hover:underline">
            Our Pricing
          </a>{' '}
          for full details. Summary:
        </p>
        <ul className="list-disc list-inside text-gray space-y-1 ml-2 text-sm sm:text-base">
          <li>
            <strong className="text-navy">Residential flats:</strong> 30% of the first month&apos;s rent from tenant
            and 30% from owner
          </li>
          <li>
            <strong className="text-navy">Commercial deals:</strong> 60% of the first month&apos;s rent from tenant
            and 60% from owner
          </li>
        </ul>
        <p className="text-gray leading-relaxed text-sm sm:text-base mt-2">
          Exact amounts and payment terms are confirmed in writing before any deal is finalised. By signing up or
          listing a property, you acknowledge these charges may apply where Harsh To Let Services facilitates the
          transaction.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-bold text-navy mb-2">5. User Responsibilities</h2>
        <p className="text-gray leading-relaxed text-sm sm:text-base">
          Users are responsible for verifying all property details, conducting due diligence, and ensuring all
          transactions comply with local laws and regulations.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-bold text-navy mb-2">6. Limitation of Liability</h2>
        <p className="text-gray leading-relaxed text-sm sm:text-base">
          HarshToLetServices shall not be held liable for any direct, indirect, incidental, or consequential damages
          arising from the use of our services or inability to use our services.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-bold text-navy mb-2">7. Contact Us</h2>
        <p className="text-gray leading-relaxed text-sm sm:text-base">
          If you have any questions about these Terms & Conditions, please contact us at info@realestate.com
        </p>
      </section>

      <p className="text-xs sm:text-sm text-gray pt-4 border-t">
        Last updated: {new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
      </p>
    </div>
  );
}
