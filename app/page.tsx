'use client'

import Link from 'next/link'
// Using simple HTML elements instead of complex UI components
import { 
  Brain, 
  TrendingUp, 
  Heart,
  Sparkles,
  Smartphone, 
  Download,
  Star,
  CheckCircle,
  Zap
} from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 py-24 text-center">
          <div className="mb-12">
            {/* Beautiful Logo */}
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl">
              <Brain className="w-12 h-12 text-white" />
            </div>
            
            {/* Main Headline */}
            <h1 className="text-6xl md:text-7xl font-bold text-slate-900 mb-8 leading-tight">
              Track Your Mood
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                with Intelligence
              </span>
            </h1>
            
            {/* Subtitle */}
            <p className="text-xl md:text-2xl text-slate-600 mb-12 max-w-3xl mx-auto leading-relaxed">
              Understand your emotional patterns with AI-powered insights. 
              Beautiful, simple, and genuinely helpful.
            </p>
            
            {/* CTA buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Link href="/login">
                <button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-10 py-6 text-xl font-semibold rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105">
                  <Heart className="w-6 h-6 mr-3" />
                  Start Tracking
                </button>
              </Link>
              <Link href="/pricing">
                <button className="px-10 py-6 text-xl font-semibold rounded-2xl border-2 border-slate-300 hover:border-blue-500 hover:text-blue-600 transition-all duration-300">
                  <Star className="w-5 h-5 mr-3" />
                  View Plans
                </button>
              </Link>
            </div>
            
            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center items-center gap-6 text-slate-500">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span>Free to start</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span>Cancel anytime</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
              Why People Love DailyMood AI
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              We focus on making mood tracking beautiful and meaningful, not just another subscription to sell.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Beautiful Design */}
            <div className="border-0 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 bg-gradient-to-br from-white to-blue-50">
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4">Beautiful by Design</h3>
                <p className="text-slate-600 leading-relaxed">
                  Every pixel is crafted for joy. Clean, calming, and genuinely pleasant to use.
                </p>
              </div>
            </div>

            {/* AI Insights */}
            <div className="border-0 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 bg-gradient-to-br from-white to-purple-50">
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Brain className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4">AI That Actually Helps</h3>
                <p className="text-slate-600 leading-relaxed">
                  Get real insights about your mood patterns, not just generic advice.
                </p>
              </div>
            </div>

            {/* Privacy First */}
            <div className="border-0 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 bg-gradient-to-br from-white to-green-50">
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Heart className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4">Your Data, Your Control</h3>
                <p className="text-slate-600 leading-relaxed">
                  We respect your privacy. Your mood data stays yours, always.
                </p>
              </div>
            </div>

            {/* Mobile First */}
            <div className="border-0 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 bg-gradient-to-br from-white to-orange-50">
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Smartphone className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4">Works Everywhere</h3>
                <p className="text-slate-600 leading-relaxed">
                  Install as an app, use in browser, sync across all devices seamlessly.
                </p>
              </div>
            </div>

            {/* Simple & Fast */}
            <div className="border-0 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 bg-gradient-to-br from-white to-indigo-50">
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4">Lightning Fast</h3>
                <p className="text-slate-600 leading-relaxed">
                  Log your mood in seconds. No waiting, no loading, just pure speed.
                </p>
              </div>
            </div>

            {/* Always Available */}
            <div className="border-0 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 bg-gradient-to-br from-white to-teal-50">
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Download className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4">Always There</h3>
                <p className="text-slate-600 leading-relaxed">
                  Works offline, syncs when you&apos;re back. Never lose your progress.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="py-24 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-8">
            Join Thousands of Happy Users
          </h2>
          <p className="text-xl text-slate-600 mb-12">
            People are already improving their mental wellbeing with DailyMood AI
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">10,000+</div>
              <div className="text-slate-600">Active Users</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-600 mb-2">500,000+</div>
              <div className="text-slate-600">Mood Entries</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">4.9★</div>
              <div className="text-slate-600">User Rating</div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/login">
              <button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-12 py-6 text-xl font-semibold rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105">
                <Heart className="w-6 h-6 mr-3" />
                Start Your Journey
              </button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}