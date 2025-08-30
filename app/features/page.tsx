import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Features - DailyMood AI | Comprehensive Mood Tracking',
  description: 'Discover all the powerful features of DailyMood AI: AI-powered insights, beautiful visualizations, streak tracking, and more.',
  keywords: 'mood tracking features, AI insights, emotional wellness, mood analytics, mental health app',
}

export default function FeaturesPage() {
  const features = [
    {
      category: '🎯 Core Features',
      items: [
        {
          icon: '📱',
          title: 'One-Tap Mood Logging',
          description: 'Log your mood in seconds with our intuitive 5-point scale inspired by the best mood tracking apps.',
          benefits: ['Quick and effortless', 'Works offline', 'Smart reminders']
        },
        {
          icon: '📊',
          title: 'Beautiful Visualizations',
          description: 'See your emotional journey through stunning charts, graphs, and calendar views.',
          benefits: ['Interactive charts', 'Calendar heatmap', 'Trend analysis', 'Pattern recognition']
        },
        {
          icon: '🔥',
          title: 'Streak Tracking',
          description: 'Build consistency with our gamified streak system that celebrates your commitment.',
          benefits: ['Daily streak counter', 'Milestone celebrations', 'Motivation system', 'Achievement badges']
        },
        {
          icon: '🏷️',
          title: 'Smart Tagging & Activities',
          description: 'Correlate your moods with daily activities, sleep, work, and more.',
          benefits: ['Activity correlation', 'Custom tags', 'Pattern discovery', 'Context tracking']
        }
      ]
    },
    {
      category: '🤖 AI-Powered Premium Features',
      items: [
        {
          icon: '🧠',
          title: 'GPT-4 Insights',
          description: 'Get personalized recommendations and deep insights powered by advanced AI.',
          benefits: ['Personalized analysis', 'Mood predictions', 'Actionable recommendations', 'Pattern explanations'],
          premium: true
        },
        {
          icon: '🔮',
          title: 'Mood Predictions',
          description: 'Understand what tomorrow might hold based on your patterns and current trends.',
          benefits: ['Tomorrow\'s mood forecast', 'Confidence scores', 'Trend analysis', 'Early warnings'],
          premium: true
        },
        {
          icon: '🎯',
          title: 'Goal Setting & Tracking',
          description: 'Set emotional wellness goals and track your progress with intelligent insights.',
          benefits: ['Custom goals', 'Progress tracking', 'Smart milestones', 'Achievement system'],
          premium: true
        },
        {
          icon: '📈',
          title: 'Advanced Analytics',
          description: 'Dive deep into your data with comprehensive analytics and correlations.',
          benefits: ['Detailed reports', 'Correlation analysis', 'Export capabilities', 'Historical trends'],
          premium: true
        }
      ]
    },
    {
      category: '📱 User Experience',
      items: [
        {
          icon: '🌙',
          title: 'Offline Support',
          description: 'Track your mood anywhere, anytime. Your data syncs when you\'re back online.',
          benefits: ['Works offline', 'Auto-sync', 'Progressive Web App', 'Cross-platform']
        },
        {
          icon: '🎨',
          title: 'Beautiful Design',
          description: 'Enjoy a premium, calming interface designed to make mood tracking a pleasure.',
          benefits: ['Intuitive interface', 'Glass morphism design', 'Smooth animations', 'Accessibility focused']
        },
        {
          icon: '🔔',
          title: 'Smart Notifications',
          description: 'Gentle reminders that learn your preferences and respect your schedule.',
          benefits: ['Intelligent timing', 'Customizable', 'Non-intrusive', 'Streak support']
        },
        {
          icon: '📧',
          title: 'Email Insights',
          description: 'Get weekly summaries and insights delivered directly to your inbox.',
          benefits: ['Weekly summaries', 'Streak celebrations', 'Progress reports', 'Tips & encouragement']
        }
      ]
    },
    {
      category: '🔒 Privacy & Security',
      items: [
        {
          icon: '🛡️',
          title: 'Privacy First',
          description: 'Your emotional data is encrypted, secure, and never shared with third parties.',
          benefits: ['End-to-end encryption', 'GDPR compliant', 'No data selling', 'You own your data']
        },
        {
          icon: '🔐',
          title: 'Secure Authentication',
          description: 'Magic link authentication ensures your account is secure without complex passwords.',
          benefits: ['Magic link login', 'No password needed', 'Secure by default', 'Easy access']
        },
        {
          icon: '💾',
          title: 'Data Export',
          description: 'Export your complete mood history anytime in standard formats.',
          benefits: ['Full data export', 'CSV format', 'Own your data', 'Easy portability']
        },
        {
          icon: '🌍',
          title: 'GDPR Compliant',
          description: 'Full compliance with international privacy regulations and standards.',
          benefits: ['GDPR compliant', 'Right to deletion', 'Data portability', 'Transparent policies']
        }
      ]
    }
  ]

  const testimonials = [
    {
      quote: "The AI insights are incredible! I finally understand my mood patterns.",
      author: "Sarah M.",
      role: "Premium User",
      rating: 5
    },
    {
      quote: "The most beautiful mood tracking app I've ever used. The calendar view is perfect.",
      author: "James L.",
      role: "Daily User",
      rating: 5
    },
    {
      quote: "Offline support saved me during my camping trip. Still kept my streak going!",
      author: "Maria R.",
      role: "Free User",
      rating: 5
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Everything you need for
                                  <span className="block text-white font-bold">
                      emotional wellness
                    </span>
            </h1>
            <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto">
              DailyMood AI combines the simplicity of top mood trackers with the power of artificial intelligence 
              to give you unprecedented insights into your emotional wellbeing.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/signup"
                className="bg-white text-purple-600 px-8 py-4 rounded-full font-semibold text-lg hover:bg-gray-100 transition-colors"
              >
                Start Free Trial
              </Link>
              <Link 
                href="/pricing"
                className="bg-white/10 backdrop-blur border border-white/20 text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-white/20 transition-colors"
              >
                View Pricing
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Sections */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        {features.map((category, categoryIndex) => (
          <div key={categoryIndex} className="mb-20">
            <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
              {category.category}
            </h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              {category.items.map((feature, featureIndex) => (
                <div 
                  key={featureIndex}
                  className={`bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-all duration-300 ${
                    feature.premium ? 'border-2 border-purple-200 relative overflow-hidden' : ''
                  }`}
                >
                  {feature.premium && (
                    <div className="absolute top-0 right-0 bg-gradient-to-l from-purple-500 to-pink-500 text-white px-4 py-1 text-sm font-medium">
                      Premium
                    </div>
                  )}
                  
                  <div className="text-4xl mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">{feature.title}</h3>
                  <p className="text-gray-600 mb-6 leading-relaxed">{feature.description}</p>
                  
                  <div className="space-y-2">
                    {feature.benefits.map((benefit, benefitIndex) => (
                      <div key={benefitIndex} className="flex items-center text-sm text-gray-700">
                        <span className="text-green-500 mr-2">✓</span>
                        {benefit}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Comparison Section */}
      <div className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
            How DailyMood AI Compares
          </h2>
          
          <div className="overflow-x-auto">
            <table className="w-full bg-white rounded-2xl shadow-lg overflow-hidden">
              <thead className="bg-gradient-to-r from-purple-500 to-blue-500 text-white">
                <tr>
                  <th className="px-6 py-4 text-left">Feature</th>
                  <th className="px-6 py-4 text-center">DailyMood AI</th>
                  <th className="px-6 py-4 text-center">Daylio</th>
                  <th className="px-6 py-4 text-center">Mood Meter</th>
                  <th className="px-6 py-4 text-center">Other Apps</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {[
                  ['AI-Powered Insights', '✅', '❌', '❌', '❌'],
                  ['Offline Support', '✅', '✅', '❌', '⚠️'],
                  ['Beautiful Modern UI', '✅', '⚠️', '❌', '⚠️'],
                  ['One-Tap Mood Entry', '✅', '✅', '❌', '✅'],
                  ['Calendar View', '✅', '✅', '❌', '⚠️'],
                  ['Activity Correlation', '✅', '✅', '❌', '⚠️'],
                  ['Mood Predictions', '✅', '❌', '❌', '❌'],
                  ['Email Summaries', '✅', '❌', '❌', '❌'],
                  ['Progressive Web App', '✅', '❌', '❌', '❌'],
                  ['GDPR Compliant', '✅', '✅', '✅', '⚠️']
                ].map(([feature, dailymood, daylio, moodmeter, others], index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">{feature}</td>
                    <td className="px-6 py-4 text-center text-2xl">{dailymood}</td>
                    <td className="px-6 py-4 text-center text-2xl">{daylio}</td>
                    <td className="px-6 py-4 text-center text-2xl">{moodmeter}</td>
                    <td className="px-6 py-4 text-center text-2xl">{others}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
            What Our Users Say
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white rounded-2xl shadow-lg p-8 text-center">
                <div className="flex justify-center mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <span key={i} className="text-yellow-400 text-xl">⭐</span>
                  ))}
                </div>
                <p className="text-gray-600 italic mb-6">"{testimonial.quote}"</p>
                <div>
                  <p className="font-semibold text-gray-800">{testimonial.author}</p>
                  <p className="text-sm text-gray-500">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white py-20">
        <div className="max-w-4xl mx-auto text-center px-6">
          <h2 className="text-4xl font-bold mb-6">
            Ready to transform your emotional wellness?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Join thousands of users who have already started their journey to better emotional health.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/signup"
              className="bg-white text-purple-600 px-8 py-4 rounded-full font-semibold text-lg hover:bg-gray-100 transition-colors"
            >
              Start Your Free Trial
            </Link>
            <Link 
              href="/help"
              className="bg-white/10 backdrop-blur border border-white/20 text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-white/20 transition-colors"
            >
              Learn More
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}


