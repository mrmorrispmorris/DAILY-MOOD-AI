'use client'

import Link from 'next/link'
import { LogoWithText } from '@/components/Logo'
import InteractiveDemo from '@/app/components/InteractiveDemo'

export default function LandingPage() {
  return (
    <>
      {/* Above the fold - load immediately */}
      <section className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
        <div className="max-w-7xl mx-auto px-4 pt-20 pb-16">
          {/* Navigation */}
          <nav className="flex justify-between items-center mb-16">
            <LogoWithText />
            <div className="flex items-center space-x-6">
              <Link href="/pricing" className="text-gray-700 hover:text-purple-600 transition font-medium">Pricing</Link>
              <Link href="/features" className="text-gray-700 hover:text-purple-600 transition font-medium">Features</Link>
              <Link href="/blog" className="text-gray-700 hover:text-purple-600 transition font-medium">Blog</Link>
              <Link href="/login" className="text-gray-700 hover:text-purple-600 transition font-medium">Login</Link>
              <Link href="/signup" className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full font-semibold hover:shadow-lg transition-all">
                Get Started Free
              </Link>
            </div>
          </nav>

          <div className="text-center">
            <h1 className="text-5xl font-bold mb-6 text-gray-900">
              Track Your Mood,
              <span className="text-purple-600 font-bold">
                {" "}Transform Your Life
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
              Understand your emotions with AI-powered insights. 
              Join 10,000+ users improving their mental wellness daily.
            </p>
            
            <div className="flex gap-4 justify-center mb-12">
              <Link 
                href="/signup"
                className="px-8 py-4 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition"
              >
                Start Free Trial
              </Link>
              <Link
                href="/pricing"
                className="px-8 py-4 border-2 border-purple-600 text-purple-600 rounded-lg font-semibold hover:bg-purple-50 transition"
              >
                View Pricing
              </Link>
            </div>
            
            {/* Trust signals */}
            <div className="flex justify-center gap-8 text-gray-600 text-sm">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                No credit card required
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Cancel anytime
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                HIPAA compliant
              </div>
            </div>

            {/* Social proof */}
            <div className="mt-16 flex justify-center items-center gap-12 text-gray-500">
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <span className="text-yellow-400">⭐⭐⭐⭐⭐</span>
                </div>
                <p className="text-sm">4.9/5 from 1,000+ reviews</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">10,000+</p>
                <p className="text-sm">Active users</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">500K+</p>
                <p className="text-sm">Moods tracked</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      
                   {/* Interactive Demo section */}
             <section id="demo" className="py-20 bg-gray-50">
               <div className="max-w-6xl mx-auto px-4">
                 <div className="text-center mb-12">
                   <h2 className="text-3xl font-bold text-gray-900 mb-4">
                     See DailyMood AI in Action
                   </h2>
                   <p className="text-xl text-gray-600">
                     Experience how our AI transforms your mood data into actionable insights
                   </p>
                 </div>
                 
                 {/* Interactive Demo Component */}
                 <InteractiveDemo />
               </div>
             </section>
      
      {/* Features section */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Why Choose DailyMood AI?
          </h2>
          <p className="text-xl text-gray-600 mb-12">
            The most intelligent mood tracking experience
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 bg-purple-50 rounded-xl">
              <div className="text-4xl mb-4">🤖</div>
              <h3 className="font-bold mb-2">AI-Powered Insights</h3>
              <p className="text-gray-600">Advanced analytics and personalized recommendations</p>
            </div>
            <div className="p-6 bg-pink-50 rounded-xl">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="font-bold mb-2">Beautiful Charts</h3>
              <p className="text-gray-600">Visualize your emotional journey with stunning graphics</p>
            </div>
            <div className="p-6 bg-blue-50 rounded-xl">
              <div className="text-4xl mb-4">🔒</div>
              <h3 className="font-bold mb-2">Privacy First</h3>
              <p className="text-gray-600">Your data stays secure and completely private</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-purple-600 to-pink-600">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Transform Your Mental Health?
          </h2>
          <p className="text-xl text-purple-100 mb-8">
            Join thousands of users who have improved their emotional wellbeing with DailyMood AI
          </p>
          <Link 
            href="/signup"
            className="inline-block px-12 py-4 bg-white text-purple-600 rounded-lg font-bold text-lg hover:bg-gray-100 transition shadow-lg"
          >
            Start Your Free Trial Today
          </Link>
          <p className="text-purple-200 text-sm mt-4">
            No commitment • Cancel anytime • Free for 14 days
          </p>
        </div>
      </section>
    </>
  )
}