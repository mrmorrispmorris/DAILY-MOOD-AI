'use client'
import { useState } from 'react'
import { supabase } from '@/app/lib/supabase-client'

interface EmailCaptureProps {
  variant?: 'default' | 'blog' | 'popup' | 'footer'
  source?: string
  className?: string
}

export default function EmailCapture({ 
  variant = 'default', 
  source = 'landing', 
  className = '' 
}: EmailCaptureProps) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')
    setErrorMessage('')
    
    try {
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email)) {
        throw new Error('Please enter a valid email address')
      }
      
      // Save to newsletter subscribers table
      const { error } = await supabase
        .from('newsletter_subscribers')
        .insert({
          email,
          source,
          subscribed_at: new Date().toISOString(),
          status: 'active'
        })
      
      if (error) {
        // Handle duplicate email gracefully
        if (error.code === '23505') {
          throw new Error('You\'re already subscribed!')
        }
        throw error
      }
      
      setStatus('success')
      setEmail('')
      
      // Track conversion analytics
      try {
        await supabase.from('analytics_events').insert({
          event_name: 'newsletter_signup',
          properties: { 
            source,
            variant,
            email_domain: email.split('@')[1] 
          },
          timestamp: new Date().toISOString()
        })
      } catch (analyticsError) {
        console.error('Analytics tracking failed:', analyticsError)
        // Don't fail the main operation if analytics fails
      }
      
      // Reset form after delay
      setTimeout(() => {
        setStatus('idle')
      }, 5000)
      
    } catch (error: any) {
      console.error('Newsletter signup error:', error)
      setStatus('error')
      setErrorMessage(error.message || 'Something went wrong. Please try again.')
    }
  }
  
  // Variant-specific styling and content
  const getVariantStyles = () => {
    switch (variant) {
      case 'blog':
        return {
          container: 'bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl p-8',
          title: 'text-2xl font-bold mb-3',
          subtitle: 'text-gray-700 mb-6',
          form: 'flex gap-3',
          input: 'flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200',
          button: 'px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors',
          disclaimer: 'text-xs text-gray-600 mt-3'
        }
      case 'popup':
        return {
          container: 'bg-white rounded-2xl shadow-2xl p-8 max-w-md mx-auto',
          title: 'text-xl font-bold mb-2',
          subtitle: 'text-gray-600 mb-4 text-sm',
          form: 'space-y-3',
          input: 'w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200',
          button: 'w-full px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors',
          disclaimer: 'text-xs text-gray-500 text-center mt-2'
        }
      case 'footer':
        return {
          container: 'bg-gray-800 text-white p-6 rounded-lg',
          title: 'text-lg font-bold mb-2 text-white',
          subtitle: 'text-gray-300 mb-4 text-sm',
          form: 'flex gap-2',
          input: 'flex-1 px-3 py-2 rounded border border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:border-purple-400 focus:outline-none',
          button: 'px-4 py-2 bg-purple-600 text-white rounded font-semibold hover:bg-purple-700 transition-colors',
          disclaimer: 'text-xs text-gray-400 mt-2'
        }
      default:
        return {
          container: 'bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-8 text-white text-center',
          title: 'text-2xl font-bold mb-3 text-white',
          subtitle: 'text-purple-100 mb-6',
          form: 'flex flex-col sm:flex-row gap-3 max-w-md mx-auto',
          input: 'flex-1 px-4 py-3 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-300',
          button: 'px-6 py-3 bg-white text-purple-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors',
          disclaimer: 'text-xs text-purple-200 mt-3'
        }
    }
  }
  
  const styles = getVariantStyles()
  
  const getContent = () => {
    switch (variant) {
      case 'blog':
        return {
          title: 'Get Weekly Mental Health Tips',
          subtitle: 'Join 5,000+ subscribers improving their mental wellness with expert insights',
          buttonText: 'Subscribe Free',
          disclaimer: 'No spam, unsubscribe anytime. Read our Privacy Policy.'
        }
      case 'popup':
        return {
          title: 'Don\'t Miss Out!',
          subtitle: 'Get exclusive mental health tips and early access to new features.',
          buttonText: 'Get Free Tips',
          disclaimer: 'We respect your privacy. Unsubscribe at any time.'
        }
      case 'footer':
        return {
          title: 'Stay Updated',
          subtitle: 'Mental wellness tips delivered weekly',
          buttonText: 'Subscribe',
          disclaimer: 'No spam, ever.'
        }
      default:
        return {
          title: 'Get Weekly Mental Health Tips',
          subtitle: 'Join 5,000+ subscribers improving their mental wellness with expert insights',
          buttonText: 'Subscribe Free',
          disclaimer: 'No spam, unsubscribe anytime. Read our Privacy Policy.'
        }
    }
  }
  
  const content = getContent()
  
  return (
    <div className={`${styles.container} ${className}`}>
      {status === 'success' ? (
        <div className="text-center">
          <div className="text-4xl mb-4">🎉</div>
          <h3 className={`${styles.title} ${variant === 'default' ? 'text-white' : 'text-green-700'}`}>
            Welcome aboard!
          </h3>
          <p className={`${variant === 'default' ? 'text-purple-100' : 'text-green-600'}`}>
            Check your email for a confirmation message.
          </p>
        </div>
      ) : (
        <>
          <h3 className={styles.title}>{content.title}</h3>
          <p className={styles.subtitle}>{content.subtitle}</p>
          
          <form onSubmit={handleSubmit} className={styles.form}>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              disabled={status === 'loading'}
              className={styles.input}
              aria-label="Email address"
            />
            <button
              type="submit"
              disabled={status === 'loading'}
              className={`${styles.button} ${status === 'loading' ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {status === 'loading' ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Subscribing...
                </span>
              ) : (
                content.buttonText
              )}
            </button>
          </form>
          
          {status === 'error' && (
            <p className="text-red-500 text-sm mt-2 text-center">
              {errorMessage}
            </p>
          )}
          
          <p className={styles.disclaimer}>
            {content.disclaimer}
          </p>
        </>
      )}
    </div>
  )
}


