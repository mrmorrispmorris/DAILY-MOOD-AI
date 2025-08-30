import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Learn how DailyMood AI protects your personal data and mood information with industry-leading security practices.',
}

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-6">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
          <p className="text-sm text-gray-600 mb-8">Last updated: {new Date().toLocaleDateString()}</p>
          
          <div className="prose prose-gray max-w-none">
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">1. Information We Collect</h2>
              <p className="text-gray-700 mb-4">
                DailyMood AI collects only the information necessary to provide our mood tracking and AI insight services:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li><strong>Account Information:</strong> Email address for account creation and authentication</li>
                <li><strong>Mood Data:</strong> Mood scores, notes, tags, and timestamps you provide</li>
                <li><strong>Usage Analytics:</strong> Anonymous usage patterns to improve our service</li>
                <li><strong>Payment Information:</strong> Processed securely through Stripe (we don't store payment details)</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">2. How We Use Your Information</h2>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Generate personalized AI insights about your mood patterns</li>
                <li>Provide mood tracking functionality and data visualization</li>
                <li>Send important service updates and notifications (if opted in)</li>
                <li>Improve our service through anonymous analytics</li>
                <li>Process payments for premium features</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">3. AI Processing & OpenAI</h2>
              <p className="text-gray-700 mb-4">
                When you use our AI insights feature, your mood data is processed by OpenAI's GPT-4 service to generate personalized recommendations. This processing:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Only includes mood scores, notes, and patterns you've logged</li>
                <li>Does not include your email, name, or other identifying information</li>
                <li>Is subject to OpenAI's privacy policy and data processing practices</li>
                <li>Results in AI-generated insights that are stored in your account</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">4. Data Security</h2>
              <p className="text-gray-700 mb-4">
                We implement industry-standard security measures to protect your data:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>All data transmitted using HTTPS encryption</li>
                <li>Database access restricted to authorized personnel only</li>
                <li>Regular security audits and updates</li>
                <li>No sharing of personal data with third parties (except OpenAI for AI processing)</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">5. Your Rights</h2>
              <p className="text-gray-700 mb-4">You have the right to:</p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Access all your personal data we have stored</li>
                <li>Request correction of inaccurate data</li>
                <li>Delete your account and all associated data</li>
                <li>Export your mood data in a portable format</li>
                <li>Opt out of non-essential communications</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">6. Data Retention</h2>
              <p className="text-gray-700 mb-4">
                We retain your data for as long as your account is active. When you delete your account:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>All personal data is immediately deleted from our primary systems</li>
                <li>Backup systems are purged within 30 days</li>
                <li>Anonymous analytics data may be retained for service improvement</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">7. Contact Us</h2>
              <p className="text-gray-700">
                If you have questions about this privacy policy or your data, please contact us at:{' '}
                <a href="mailto:privacy@dailymood.ai" className="text-blue-600 hover:text-blue-800">
                  privacy@dailymood.ai
                </a>
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">8. Changes to This Policy</h2>
              <p className="text-gray-700">
                We may update this privacy policy from time to time. We will notify you of any material changes 
                via email or through our service. Your continued use of DailyMood AI after any changes 
                constitutes acceptance of the new privacy policy.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}


