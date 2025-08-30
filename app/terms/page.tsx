import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Terms and conditions for using DailyMood AI mood tracking and AI insights platform.',
}

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-6">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Terms of Service</h1>
          <p className="text-sm text-gray-600 mb-8">Last updated: {new Date().toLocaleDateString()}</p>
          
          <div className="prose prose-gray max-w-none">
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">1. Acceptance of Terms</h2>
              <p className="text-gray-700">
                By accessing and using DailyMood AI, you accept and agree to be bound by the terms and 
                provision of this agreement. If you do not agree to abide by the above, please do not 
                use this service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">2. Description of Service</h2>
              <p className="text-gray-700 mb-4">
                DailyMood AI is a digital wellness platform that provides:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Mood tracking and visualization tools</li>
                <li>AI-powered insights and pattern analysis</li>
                <li>Personal wellness recommendations</li>
                <li>Data export and privacy controls</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">3. User Responsibilities</h2>
              <p className="text-gray-700 mb-4">You agree to:</p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Provide accurate information when creating your account</li>
                <li>Maintain the security of your account credentials</li>
                <li>Use the service only for lawful purposes</li>
                <li>Not attempt to reverse engineer or hack the platform</li>
                <li>Respect the intellectual property rights of DailyMood AI</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">4. Medical Disclaimer</h2>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <p className="text-yellow-800 font-medium">
                  ⚠️ Important: DailyMood AI is NOT a medical device or diagnostic tool.
                </p>
              </div>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Our AI insights are for informational purposes only</li>
                <li>Do not use this service as a substitute for professional medical advice</li>
                <li>Always consult qualified healthcare professionals for mental health concerns</li>
                <li>If you're experiencing a mental health crisis, contact emergency services immediately</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">5. Subscription and Billing</h2>
              <p className="text-gray-700 mb-4">Premium subscription terms:</p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li><strong>Billing:</strong> Monthly subscriptions are billed in advance</li>
                <li><strong>Free Trial:</strong> 7-day free trial for new premium subscribers</li>
                <li><strong>Cancellation:</strong> Cancel anytime with immediate effect on next billing cycle</li>
                <li><strong>Refunds:</strong> Pro-rated refunds available within 14 days of subscription</li>
                <li><strong>Price Changes:</strong> 30-day advance notice for any price increases</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">6. Intellectual Property</h2>
              <p className="text-gray-700 mb-4">
                DailyMood AI and its original content, features, and functionality are owned by 
                DailyMood AI and are protected by international copyright, trademark, patent, 
                trade secret, and other intellectual property laws.
              </p>
              <p className="text-gray-700">
                You retain ownership of your mood data and content you create while using our service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">7. Limitation of Liability</h2>
              <p className="text-gray-700">
                DailyMood AI shall not be liable for any indirect, incidental, special, consequential, 
                or punitive damages, including without limitation, loss of profits, data, use, goodwill, 
                or other intangible losses, resulting from your use of the service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">8. Service Availability</h2>
              <p className="text-gray-700 mb-4">We strive to provide:</p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>99.9% uptime for our core services</li>
                <li>Regular backups of your data</li>
                <li>Advance notice of planned maintenance</li>
                <li>Prompt resolution of any service issues</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">9. Termination</h2>
              <p className="text-gray-700">
                We may terminate or suspend your account immediately, without prior notice or liability, 
                for any reason whatsoever, including without limitation if you breach the Terms. 
                Upon termination, your right to use the service will cease immediately.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">10. Changes to Terms</h2>
              <p className="text-gray-700">
                We reserve the right, at our sole discretion, to modify or replace these Terms at 
                any time. If a revision is material, we will try to provide at least 30 days notice 
                prior to any new terms taking effect.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">11. Contact Information</h2>
              <p className="text-gray-700">
                If you have any questions about these Terms of Service, please contact us at:{' '}
                <a href="mailto:legal@dailymood.ai" className="text-blue-600 hover:text-blue-800">
                  legal@dailymood.ai
                </a>
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}


