'use client'
import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { trackGoogleAdsConversion, getUTMParameters } from '@/lib/google-ads'
import { trackEvent } from '@/lib/analytics'

export default function MoodTrackerAdLanding() {
  const searchParams = useSearchParams()
  
  useEffect(() => {
    // Track landing page view
    const utmParams = getUTMParameters()
    trackEvent('Ad Landing Page Viewed', {
      page: 'mood-tracker',
      ...utmParams
    })
  }, [])
  
  const handleCTAClick = () => {
    trackGoogleAdsConversion('Trial_Signup')
    trackEvent('Ad CTA Clicked', {
      page: 'mood-tracker', 
      cta: 'start_trial'
    })
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Hero Section - Above the fold */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4 text-center">
          {/* Trust Badge */}
          <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium mb-6">
            ⭐ 4.9/5 Rating • 10,000+ Users Trust DailyMood AI
          </div>
          
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            The #1 AI-Powered
            <span className="block text-blue-600">Mood Tracker App</span>
          </h1>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Transform your mental health with intelligent mood tracking. 
            Get personalized AI insights that help you understand patterns, 
            predict changes, and improve your emotional wellness.
          </p>
          
          {/* Primary CTA */}
          <div className="mb-8">
            <Link 
              href="/login"
              onClick={handleCTAClick}
              className="inline-block px-12 py-4 bg-blue-600 text-white text-lg font-bold rounded-lg hover:bg-blue-700 transition shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
            >
              Start Your Free Trial Today
            </Link>
            <p className="text-sm text-gray-500 mt-3">
              ✅ Free for 14 days • ✅ No credit card required • ✅ Cancel anytime
            </p>
          </div>
          
          {/* Social Proof */}
          <div className="flex justify-center items-center gap-12 text-gray-600">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">500K+</p>
              <p className="text-sm">Moods Tracked</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">94%</p>
              <p className="text-sm">Report Improved Awareness</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">10K+</p>
              <p className="text-sm">Active Users</p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Benefits - What makes us different */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4">
            Why DailyMood AI is the Best Mood Tracker
          </h2>
          <p className="text-xl text-gray-600 text-center mb-12">
            Go beyond basic mood logging with AI-powered insights
          </p>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6 bg-blue-50 rounded-xl">
              <div className="text-4xl mb-4">🧠</div>
              <h3 className="text-xl font-bold mb-3">AI-Powered Analysis</h3>
              <p className="text-gray-600">
                Unlike basic trackers, our AI identifies patterns, predicts mood changes, 
                and provides personalized recommendations based on your unique data.
              </p>
            </div>
            
            <div className="text-center p-6 bg-green-50 rounded-xl">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-xl font-bold mb-3">Beautiful Visualizations</h3>
              <p className="text-gray-600">
                See your emotional journey through stunning charts and graphs. 
                Track trends, spot triggers, and celebrate progress visually.
              </p>
            </div>
            
            <div className="text-center p-6 bg-purple-50 rounded-xl">
              <div className="text-4xl mb-4">🔒</div>
              <h3 className="text-xl font-bold mb-3">Complete Privacy</h3>
              <p className="text-gray-600">
                Your mental health data stays private and secure. HIPAA-compliant 
                encryption with full data export whenever you want.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-12">How DailyMood AI Works</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">1</div>
              <h3 className="font-bold mb-2">Track Your Mood</h3>
              <p className="text-gray-600 text-sm">
                Quick daily check-ins take just 30 seconds. Rate your mood and add context.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">2</div>
              <h3 className="font-bold mb-2">AI Analyzes Patterns</h3>
              <p className="text-gray-600 text-sm">
                Our AI identifies triggers, predicts changes, and finds hidden connections.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">3</div>
              <h3 className="font-bold mb-2">Get Insights & Improve</h3>
              <p className="text-gray-600 text-sm">
                Receive personalized recommendations to improve your mental wellness.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Join 10,000+ Users Improving Their Mental Health
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-blue-50 p-6 rounded-xl">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">SM</div>
                <div className="ml-3">
                  <p className="font-semibold">Sarah M.</p>
                  <p className="text-sm text-gray-600">Marketing Manager</p>
                </div>
              </div>
              <p className="text-gray-700 italic">
                "DailyMood AI helped me realize my anxiety spikes every Sunday evening. 
                Now I plan relaxing activities and my weeks start so much better!"
              </p>
              <div className="mt-3 text-yellow-400">⭐⭐⭐⭐⭐</div>
            </div>
            
            <div className="bg-green-50 p-6 rounded-xl">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center text-white font-bold">JD</div>
                <div className="ml-3">
                  <p className="font-semibold">James D.</p>
                  <p className="text-sm text-gray-600">Software Engineer</p>
                </div>
              </div>
              <p className="text-gray-700 italic">
                "The AI insights are incredible. It predicted a mood dip 3 days before 
                it happened and suggested coping strategies that actually worked."
              </p>
              <div className="mt-3 text-yellow-400">⭐⭐⭐⭐⭐</div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Transform Your Mental Health?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands who've improved their emotional wellness with DailyMood AI
          </p>
          
          <Link 
            href="/login"
            onClick={handleCTAClick}
            className="inline-block px-12 py-4 bg-white text-blue-600 text-lg font-bold rounded-lg hover:bg-gray-100 transition shadow-xl"
          >
            Start Free Trial - No Credit Card Required
          </Link>
          
          <div className="mt-8 flex justify-center items-center gap-8 text-blue-100">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              14-Day Free Trial
            </div>
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Cancel Anytime
            </div>
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              HIPAA Compliant
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}


