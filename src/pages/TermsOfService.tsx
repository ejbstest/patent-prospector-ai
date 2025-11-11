export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-8 text-foreground">Terms of Service</h1>
        <div className="prose prose-lg max-w-none space-y-6 text-muted-foreground">
          <p className="text-sm text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
          
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">1. Acceptance of Terms</h2>
            <p>By accessing or using Aegis IP Risk Analysis ("the Service"), you agree to be bound by these Terms of Service. If you do not agree, do not use the Service.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">2. Description of Service</h2>
            <p>Aegis provides AI-powered intellectual property risk analysis, including patent search, freedom-to-operate (FTO) assessments, and white space analysis. Our reports are for informational purposes only and do not constitute legal advice.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">3. User Accounts</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>You must provide accurate and complete information when creating an account</li>
              <li>You are responsible for maintaining the confidentiality of your account credentials</li>
              <li>You are responsible for all activities that occur under your account</li>
              <li>Notify us immediately of any unauthorized use of your account</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">4. Acceptable Use</h2>
            <p>You agree NOT to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Use the Service for any illegal purpose</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Reverse engineer or decompile any part of the Service</li>
              <li>Upload malicious code or viruses</li>
              <li>Resell or redistribute reports without permission</li>
              <li>Submit false or misleading information</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">5. Pricing and Payment</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Prices are displayed in USD and subject to change with 30 days notice</li>
              <li>Free tier users receive limited analysis features</li>
              <li>Paid analyses are non-refundable once processing begins</li>
              <li>Payment is processed securely via Stripe</li>
              <li>Failed payments may result in service suspension</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">6. Intellectual Property</h2>
            <p><strong>Your Content:</strong> You retain ownership of all invention descriptions and data you submit. You grant us a license to use this data solely to provide the Service.</p>
            <p className="mt-4"><strong>Our Content:</strong> All reports, software, and documentation are proprietary to Aegis and protected by copyright, trademark, and other intellectual property laws.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">7. Disclaimers</h2>
            <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
              <p className="font-semibold text-amber-900 dark:text-amber-100">IMPORTANT LEGAL DISCLAIMERS:</p>
              <ul className="list-disc pl-6 space-y-2 mt-2 text-amber-800 dark:text-amber-200">
                <li><strong>Not Legal Advice:</strong> Our reports are informational tools, not legal advice. Consult a licensed patent attorney for legal guidance.</li>
                <li><strong>No Warranty:</strong> The Service is provided "AS IS" without warranties of any kind, express or implied.</li>
                <li><strong>Accuracy:</strong> While we strive for accuracy, we do not guarantee completeness or timeliness of patent data.</li>
                <li><strong>Liability:</strong> We are not liable for decisions you make based on our reports.</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">8. Limitation of Liability</h2>
            <p>To the maximum extent permitted by law, Aegis shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of profits, data, or goodwill, arising from your use of the Service.</p>
            <p className="mt-4">Our total liability for any claims shall not exceed the amount you paid us in the 12 months prior to the claim.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">9. Indemnification</h2>
            <p>You agree to indemnify and hold harmless Aegis from any claims, damages, or expenses arising from your use of the Service or violation of these Terms.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">10. Termination</h2>
            <p>We may suspend or terminate your account at our discretion if you violate these Terms. Upon termination:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Your access to the Service will be revoked</li>
              <li>You may request a data export within 30 days</li>
              <li>We may delete your data after 30 days</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">11. Changes to Terms</h2>
            <p>We reserve the right to modify these Terms at any time. We will notify you of material changes via email or a prominent notice. Continued use of the Service after changes constitutes acceptance.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">12. Governing Law</h2>
            <p>These Terms are governed by the laws of [Your Jurisdiction], without regard to conflict of law principles. Any disputes shall be resolved in the courts of [Your Jurisdiction].</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">13. Contact Information</h2>
            <p>For questions about these Terms, contact us at:</p>
            <p className="mt-2">
              Email: legal@aegisip.com<br />
              Address: [Your Company Address]
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
