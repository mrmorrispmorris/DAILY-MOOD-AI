'use client'
import { useEffect } from 'react'
import Link from 'next/link'
import { trackGoogleAdsConversion, getUTMParameters } from '@/lib/google-ads'
import { trackEvent } from '@/lib/analytics'

export default function DaylioAlternativeLanding() {
  useEffect(() => {
    const utmParams = getUTMParameters()
    trackEvent('Ad Landing Page Viewed', {
      page: 'daylio-alternative',
      ...utmParams
    })
  }, [])
  
  const handleCTAClick = () => {
    trackGoogleAdsConversion('Trial_Signup')
    trackEvent('Ad CTA Clicked', {
      page: 'daylio-alternative',
      cta: 'switch_from_daylio'
    })
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <div className="inline-flex items-center px-4 py-2 bg-purple-100 text-purple-800 rounded-full text-sm font-medium mb-6">
            🚀 Switching from Daylio? • Get 30% OFF your first year
          </div>
          
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            The Daylio Alternative That
            <span className="block text-purple-600">Actually Uses AI</span>
          </h1>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Love Daylio's simplicity but want more insights? DailyMood AI gives you 
            everything Daylio offers PLUS intelligent pattern recognition, 
            mood prediction, and personalized recommendations.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Link 
              href="/login"
              onClick={handleCTAClick}
              className="px-12 py-4 bg-purple-600 text-white text-lg font-bold rounded-lg hover:bg-purple-700 transition shadow-xl"
            >
              Try DailyMood AI Free
            </Link>
            <Link 
              href="#comparison"
              className="px-12 py-4 border-2 border-purple-600 text-purple-600 text-lg font-bold rounded-lg hover:bg-purple-50 transition"
            >
              See the Comparison
            </Link>
          </div>
          
          <p className="text-sm text-gray-500">
            ✅ Import your Daylio data • ✅ Free for 14 days • ✅ Cancel anytime
          </p>
        </div>
      </section>

      {/* Why Switch */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4">
            Why 2,000+ Daylio Users Have Already Switched
          </h2>
          <p className="text-xl text-gray-600 text-center mb-12">
            Don't just track your mood — understand and improve it
          </p>
          
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="text-center p-6 bg-purple-50 rounded-xl">
              <div className="text-4xl mb-4">🧠</div>
              <h3 className="text-xl font-bold mb-3">AI-Powered Insights</h3>
              <p className="text-gray-600 mb-4">
                Daylio shows you basic charts. DailyMood AI's artificial intelligence 
                identifies hidden patterns, predicts mood changes, and suggests specific actions.
              </p>
              <div className="bg-purple-100 p-3 rounded text-sm">
                <strong>Example:</strong> "Your mood drops every Tuesday after work meetings. 
                Try a 10-minute walk afterward."
              </div>
            </div>
            
            <div className="text-center p-6 bg-blue-50 rounded-xl">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-xl font-bold mb-3">Advanced Analytics</h3>
              <p className="text-gray-600 mb-4">
                Go beyond Daylio's basic statistics with correlation analysis, 
                seasonal trends, and predictive modeling of your emotional patterns.
              </p>
              <div className="bg-blue-100 p-3 rounded text-sm">
                <strong>Example:</strong> See how sleep, weather, and social activities 
                specifically impact YOUR unique mood patterns.
              </div>
            </div>
            
            <div className="text-center p-6 bg-green-50 rounded-xl">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-xl font-bold mb-3">Personalized Recommendations</h3>
              <p className="text-gray-600 mb-4">
                Daylio tells you what happened. DailyMood AI tells you what to DO 
                about it with evidence-based suggestions tailored to your data.
              </p>
              <div className="bg-green-100 p-3 rounded text-sm">
                <strong>Example:</strong> Custom meditation, exercise, or social recommendations 
                based on what actually works for you.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Comparison */}
      <section id="comparison" className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            DailyMood AI vs Daylio: Feature by Feature
          </h2>
          
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="text-left p-6 font-bold">Feature</th>
                  <th className="text-center p-6 font-bold text-gray-500">Daylio</th>
                  <th className="text-center p-6 font-bold text-purple-600">DailyMood AI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr>
                  <td className="p-6 font-medium">Basic mood tracking</td>
                  <td className="p-6 text-center">✅</td>
                  <td className="p-6 text-center text-green-600">✅</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="p-6 font-medium">Custom mood scale</td>
                  <td className="p-6 text-center">✅</td>
                  <td className="p-6 text-center text-green-600">✅</td>
                </tr>
                <tr>
                  <td className="p-6 font-medium">Activity tracking</td>
                  <td className="p-6 text-center">✅</td>
                  <td className="p-6 text-center text-green-600">✅</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="p-6 font-medium">Basic statistics</td>
                  <td className="p-6 text-center">✅</td>
                  <td className="p-6 text-center text-green-600">✅</td>
                </tr>
                <tr>
                  <td className="p-6 font-medium">AI pattern recognition</td>
                  <td className="p-6 text-center text-red-500">❌</td>
                  <td className="p-6 text-center text-green-600 font-bold">✅</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="p-6 font-medium">Mood prediction</td>
                  <td className="p-6 text-center text-red-500">❌</td>
                  <td className="p-6 text-center text-green-600 font-bold">✅</td>
                </tr>
                <tr>
                  <td className="p-6 font-medium">Personalized insights</td>
                  <td className="p-6 text-center text-red-500">❌</td>
                  <td className="p-6 text-center text-green-600 font-bold">✅</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="p-6 font-medium">Correlation analysis</td>
                  <td className="p-6 text-center text-red-500">❌</td>
                  <td className="p-6 text-center text-green-600 font-bold">✅</td>
                </tr>
                <tr>
                  <td className="p-6 font-medium">Therapy integration</td>
                  <td className="p-6 text-center text-red-500">❌</td>
                  <td className="p-6 text-center text-green-600 font-bold">✅</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="p-6 font-medium">Advanced data export</td>
                  <td className="p-6 text-center text-yellow-500">Basic</td>
                  <td className="p-6 text-center text-green-600 font-bold">Full PDF Reports</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div className="text-center mt-8">
            <p className="text-lg text-gray-600 mb-4">
              <strong>Ready to upgrade your mood tracking?</strong>
            </p>
            <Link 
              href="/login"
              onClick={handleCTAClick}
              className="inline-block px-8 py-3 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 transition"
            >
              Switch to DailyMood AI Today
            </Link>
          </div>
        </div>
      </section>

      {/* Migration Process */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Switching from Daylio is Easy (And Free!)
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">1</div>
              <h3 className="text-xl font-bold mb-3">Export Your Daylio Data</h3>
              <p className="text-gray-600">
                Use Daylio's built-in export feature to download your mood history. 
                We support CSV and backup file formats.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">2</div>
              <h3 className="text-xl font-bold mb-3">Import to DailyMood AI</h3>
              <p className="text-gray-600">
                Our import tool automatically converts your Daylio data into our format. 
                Your entire mood history transfers seamlessly.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">3</div>
              <h3 className="text-xl font-bold mb-3">Get AI Insights Immediately</h3>
              <p className="text-gray-600">
                Our AI analyzes your historical data instantly, revealing patterns 
                Daylio never showed you. Start getting insights on day one.
              </p>
            </div>
          </div>
          
          <div className="bg-purple-50 p-8 rounded-xl mt-12 text-center">
            <h3 className="text-2xl font-bold mb-4">🎁 Special Switching Bonus</h3>
            <p className="text-lg text-gray-700 mb-4">
              Current Daylio users get <strong>30% OFF</strong> their first year + free data migration support
            </p>
            <p className="text-sm text-gray-600">
              Use code: UPGRADE30 • Valid for first 500 switchers
            </p>
          </div>
        </div>
      </section>

      {/* Testimonials from Switchers */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            What Daylio Users Say After Switching
          </h2>
          
          <div className="space-y-8">
            <div className="bg-white p-8 rounded-xl shadow-lg">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold">MK</div>
                <div className="ml-4">
                  <p className="font-semibold">Mike K.</p>
                  <p className="text-sm text-gray-600">Used Daylio for 2 years</p>
                </div>
              </div>
              <p className="text-gray-700 italic mb-4">
                "I loved Daylio's simplicity, but after switching to DailyMood AI, I can't believe 
                how much I was missing. The AI showed me patterns I tracked for 2 years but never 
                noticed. It's like having a personal therapist analyzing my data 24/7."
              </p>
              <div className="text-yellow-400">⭐⭐⭐⭐⭐</div>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-lg">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">LM</div>
                <div className="ml-4">
                  <p className="font-semibold">Lisa M.</p>
                  <p className="text-sm text-gray-600">Daylio premium user for 3 years</p>
                </div>
              </div>
              <p className="text-gray-700 italic mb-4">
                "The data import was seamless - all my 3 years of Daylio data transferred perfectly. 
                Within hours, DailyMood AI was giving me insights I wish I had years ago. 
                The mood predictions are scary accurate!"
              </p>
              <div className="text-yellow-400">⭐⭐⭐⭐⭐</div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-r from-purple-600 to-pink-600 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Upgrade Your Mood Tracking?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join 2,000+ former Daylio users who've discovered the power of AI insights
          </p>
          
          <Link 
            href="/login"
            onClick={handleCTAClick}
            className="inline-block px-12 py-4 bg-white text-purple-600 text-lg font-bold rounded-lg hover:bg-gray-100 transition shadow-xl mr-4"
          >
            Start Free Trial + Import Daylio Data
          </Link>
          
          <p className="mt-6 text-purple-100">
            ✅ 14-day free trial • ✅ Free data migration • ✅ 30% off with code UPGRADE30
          </p>
        </div>
      </section>
    </div>
  )
}


