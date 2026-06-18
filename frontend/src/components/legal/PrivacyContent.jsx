/** Shared body for /privacy and signup modal (scrolls inside parent). */
export default function PrivacyContent() {
  return (
    <div className="space-y-6 text-left">
      <section>
        <h2 className="text-xl font-bold text-navy mb-2">1. Information We Collect</h2>
        <p className="text-gray leading-relaxed text-sm sm:text-base mb-2">
          We collect information that you provide directly to us, including:
        </p>
        <ul className="list-disc list-inside text-gray space-y-1 ml-2 text-sm sm:text-base">
          <li>Name, email address, and phone number</li>
          <li>Property preferences and search history</li>
          <li>Account credentials and profile information</li>
          <li>Property listings and images you upload</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-bold text-navy mb-2">2. How We Use Your Information</h2>
        <p className="text-gray leading-relaxed text-sm sm:text-base mb-2">We use the information we collect to:</p>
        <ul className="list-disc list-inside text-gray space-y-1 ml-2 text-sm sm:text-base">
          <li>Provide, maintain, and improve our services</li>
          <li>Process transactions and send related information</li>
          <li>Send you technical notices and support messages</li>
          <li>Respond to your comments and questions</li>
          <li>Monitor and analyze trends and usage</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-bold text-navy mb-2">3. Information Sharing</h2>
        <p className="text-gray leading-relaxed text-sm sm:text-base">
          We do not sell your personal information. We may share your information only with your consent or as necessary
          to provide our services, comply with legal obligations, or protect our rights.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-bold text-navy mb-2">4. Data Security</h2>
        <p className="text-gray leading-relaxed text-sm sm:text-base">
          We implement appropriate technical and organizational measures to protect your personal information against
          unauthorized access, alteration, disclosure, or destruction.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-bold text-navy mb-2">5. Your Rights</h2>
        <p className="text-gray leading-relaxed text-sm sm:text-base mb-2">You have the right to:</p>
        <ul className="list-disc list-inside text-gray space-y-1 ml-2 text-sm sm:text-base">
          <li>Access and receive a copy of your personal data</li>
          <li>Rectify inaccurate personal data</li>
          <li>Request deletion of your personal data</li>
          <li>Object to processing of your personal data</li>
          <li>Withdraw consent at any time</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-bold text-navy mb-2">6. Cookies</h2>
        <p className="text-gray leading-relaxed text-sm sm:text-base">
          We use cookies and similar tracking technologies to track activity on our service and store certain
          information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-bold text-navy mb-2">7. Contact Us</h2>
        <p className="text-gray leading-relaxed text-sm sm:text-base">
          If you have any questions about this Privacy Policy, please contact us at info@realestate.com
        </p>
      </section>

      <p className="text-xs sm:text-sm text-gray pt-4 border-t">
        Last updated: {new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
      </p>
    </div>
  );
}
