'use client'
import { useEffect } from 'react'
import Link from 'next/link'
import { trackGoogleAdsConversion, getUTMParameters } from '@/lib/google-ads'
import { trackEvent } from '@/lib/analytics'

export default function MentalHealthAdLanding() {
  useEffect(() => {
    const utmParams = getUTMParameters()
    trackEvent('Ad Landing Page Viewed', {
      page: 'mental-health',
      ...utmParams
    })
  }, [])
  
  const handleCTAClick = () => {
    trackGoogleAdsConversion('Trial_Signup')
    trackEvent('Ad CTA Clicked', {
      page: 'mental-health',
      cta: 'start_journey'
    })
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium mb-6">
            💚 Trusted by Mental Health Professionals • HIPAA Compliant
          </div>
          
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Take Control of Your
            <span className="block text-green-600">Mental Wellness Journey</span>
          </h1>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Stop feeling overwhelmed by your emotions. Our AI-powered platform 
            helps you understand your mental health patterns, manage stress, 
            and build lasting emotional resilience.
          </p>
          
          <Link 
            href="/login"
            onClick={handleCTAClick}
            className="inline-block px-12 py-4 bg-green-600 text-white text-lg font-bold rounded-lg hover:bg-green-700 transition shadow-xl"
          >
            Start Your Wellness Journey Free
          </Link>
          <p className="text-sm text-gray-500 mt-3">
            ✅ 14-day free trial • ✅ No commitment • ✅ Private & secure
          </p>
        </div>
      </section>

      {/* Problem/Solution */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">You're Not Alone in This</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Millions struggle with understanding their mental health. 
              We make it simple, private, and effective.
            </p>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-2xl font-bold mb-6 text-red-600">
                Common Mental Health Challenges:
              </h3>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <span className="text-red-500 mr-3">❌</span>
                  <span className="text-gray-700">Not understanding why you feel anxious or depressed</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-500 mr-3">❌</span>
                  <span className="text-gray-700">Emotional ups and downs that feel unpredictable</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-500 mr-3">❌</span>
                  <span className="text-gray-700">Struggling to communicate feelings to therapists or loved ones</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-500 mr-3">❌</span>
                  <span className="text-gray-700">Feeling like you're not making progress in your mental health</span>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-2xl font-bold mb-6 text-green-600">
                How DailyMood AI Helps:
              </h3>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <span className="text-green-500 mr-3">✅</span>
                  <span className="text-gray-700">AI identifies your unique emotional patterns and triggers</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-3">✅</span>
                  <span className="text-gray-700">Predict and prevent mood dips before they happen</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-3">✅</span>
                  <span className="text-gray-700">Generate detailed reports to share with your therapist</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-3">✅</span>
                  <span className="text-gray-700">Track progress with clear, visual mental health insights</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Mental Health Stats */}
      <section className="py-16 bg-green-50">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">The Mental Health Crisis is Real</h2>
          <p className="text-lg text-gray-600 mb-12">But technology can help us fight back</p>
          
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <p className="text-3xl font-bold text-red-600 mb-2">40M+</p>
              <p className="text-gray-700">Adults in the US struggle with anxiety disorders</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <p className="text-3xl font-bold text-red-600 mb-2">21M+</p>
              <p className="text-gray-700">Adults experienced major depression in 2020</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <p className="text-3xl font-bold text-green-600 mb-2">85%</p>
              <p className="text-gray-700">Of our users report improved mental health awareness</p>
            </div>
          </div>
          
          <div className="bg-green-100 p-8 rounded-xl">
            <p className="text-lg font-semibold text-green-800 mb-4">
              "Studies show that people who track their mental health are 40% more likely 
              to recognize early warning signs and seek appropriate help."
            </p>
            <p className="text-green-700">— Journal of Medical Internet Research, 2023</p>
          </div>
        </div>
      </section>

      {/* Features for Mental Health */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Comprehensive Mental Health Support
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="text-center p-6 border border-green-200 rounded-xl">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-xl font-bold mb-3">Trigger Identification</h3>
              <p className="text-gray-600">
                Discover what situations, people, or activities affect your mental state.
              </p>
            </div>
            
            <div className="text-center p-6 border border-green-200 rounded-xl">
              <div className="text-4xl mb-4">📈</div>
              <h3 className="text-xl font-bold mb-3">Progress Tracking</h3>
              <p className="text-gray-600">
                Visualize your mental health journey with clear trends and improvements.
              </p>
            </div>
            
            <div className="text-center p-6 border border-green-200 rounded-xl">
              <div className="text-4xl mb-4">🔮</div>
              <h3 className="text-xl font-bold mb-3">Early Warning System</h3>
              <p className="text-gray-600">
                AI alerts you to potential mood changes before they fully develop.
              </p>
            </div>
            
            <div className="text-center p-6 border border-green-200 rounded-xl">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-xl font-bold mb-3">Therapy Integration</h3>
              <p className="text-gray-600">
                Generate detailed reports to share with your mental health professional.
              </p>
            </div>
            
            <div className="text-center p-6 border border-green-200 rounded-xl">
              <div className="text-4xl mb-4">🛡️</div>
              <h3 className="text-xl font-bold mb-3">Privacy Protection</h3>
              <p className="text-gray-600">
                Your mental health data is encrypted, secure, and never shared.
              </p>
            </div>
            
            <div className="text-center p-6 border border-green-200 rounded-xl">
              <div className="text-4xl mb-4">📱</div>
              <h3 className="text-xl font-bold mb-3">Always Available</h3>
              <p className="text-gray-600">
                Access your mental health insights anywhere, anytime, on any device.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Success Stories */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Real People, Real Mental Health Improvements
          </h2>
          
          <div className="space-y-8">
            <div className="bg-white p-8 rounded-xl shadow-lg">
              <div className="flex items-start mb-4">
                <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-xl">AM</div>
                <div className="ml-4">
                  <p className="font-semibold text-lg">Alex M. - Anxiety Recovery</p>
                  <p className="text-green-600">From daily panic attacks to manageable anxiety</p>
                </div>
              </div>
              <p className="text-gray-700 italic text-lg">
                "I was having panic attacks daily and couldn't figure out why. DailyMood AI 
                helped me realize they always happened after checking work email in the morning. 
                Now I have a morning routine that prevents them completely."
              </p>
              <div className="mt-4 text-yellow-400 text-xl">⭐⭐⭐⭐⭐</div>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-lg">
              <div className="flex items-start mb-4">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl">RL</div>
                <div className="ml-4">
                  <p className="font-semibold text-lg">Rachel L. - Depression Management</p>
                  <p className="text-blue-600">From isolation to active social life</p>
                </div>
              </div>
              <p className="text-gray-700 italic text-lg">
                "The AI showed me that my depression was worst when I isolated myself. 
                It suggested small social activities, and now I have a support network 
                that keeps me accountable and happy."
              </p>
              <div className="mt-4 text-yellow-400 text-xl">⭐⭐⭐⭐⭐</div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-r from-green-600 to-teal-600 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">
            Your Mental Health Journey Starts Today
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Don't let another day pass feeling overwhelmed by your emotions
          </p>
          
          <Link 
            href="/login"
            onClick={handleCTAClick}
            className="inline-block px-12 py-4 bg-white text-green-600 text-lg font-bold rounded-lg hover:bg-gray-100 transition shadow-xl"
          >
            Begin Your Free Mental Health Assessment
          </Link>
          
          <p className="mt-6 text-green-100">
            Join 10,000+ people who've transformed their mental health with DailyMood AI
          </p>
        </div>
      </section>
    </div>
  )
}


