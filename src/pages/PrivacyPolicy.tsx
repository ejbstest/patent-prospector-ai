export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-8 text-foreground">Privacy Policy</h1>
        <div className="prose prose-lg max-w-none space-y-6 text-muted-foreground">
          <p className="text-sm text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
          
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">1. Information We Collect</h2>
            <p>We collect information you provide directly to us, including:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Account information (name, email, company name)</li>
              <li>Invention descriptions and patent-related data</li>
              <li>Payment information (processed securely via Stripe)</li>
              <li>Usage data and analytics</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">2. How We Use Your Information</h2>
            <p>We use your information to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Provide and improve our IP risk analysis services</li>
              <li>Process payments and send transactional emails</li>
              <li>Communicate with you about your analyses</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">3. Data Security</h2>
            <p>We implement industry-standard security measures including:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Encryption of data in transit (SSL/TLS) and at rest</li>
              <li>Row-Level Security (RLS) on all database tables</li>
              <li>Regular security audits and monitoring</li>
              <li>Secure authentication via Supabase Auth</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">4. Your Rights (GDPR/CCPA)</h2>
            <p>You have the right to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Access:</strong> Request a copy of your data</li>
              <li><strong>Rectification:</strong> Correct inaccurate data</li>
              <li><strong>Deletion:</strong> Request deletion of your data</li>
              <li><strong>Portability:</strong> Export your data in machine-readable format</li>
              <li><strong>Opt-out:</strong> Unsubscribe from marketing emails</li>
            </ul>
            <p className="mt-4">To exercise these rights, visit your Settings page or contact us at privacy@aegisip.com</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">5. Data Retention</h2>
            <p>We retain your data for as long as your account is active or as needed to provide services. Analyses and reports are retained for 7 years for legal compliance unless you request earlier deletion.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">6. Third-Party Services</h2>
            <p>We use the following third-party services:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Supabase:</strong> Database and authentication</li>
              <li><strong>Stripe:</strong> Payment processing</li>
              <li><strong>OpenAI:</strong> AI-powered analysis</li>
              <li><strong>Resend:</strong> Transactional emails</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">7. Cookies</h2>
            <p>We use essential cookies for authentication and analytics cookies (with your consent) to improve our service. You can manage cookie preferences via the banner on our site.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">8. Changes to This Policy</h2>
            <p>We may update this policy from time to time. We will notify you of significant changes via email or a prominent notice on our site.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">9. Contact Us</h2>
            <p>For privacy-related questions or concerns, contact us at:</p>
            <p className="mt-2">
              Email: privacy@aegisip.com<br />
              Address: [Your Company Address]
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
