'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import Link from 'next/link';

interface PremiumPromptProps {
  trigger: string;
  userId?: string;
}

export function PremiumPrompt({ trigger, userId }: PremiumPromptProps) {
  const [show, setShow] = useState(false);
  const [promptData, setPromptData] = useState<any>(null);
  
  useEffect(() => {
    // Smart timing for prompts based on user behavior and freemium limits
    const triggers = {
      // Existing triggers
      'mood_streak_3': {
        show: true,
        title: 'Unlock Full Potential 🚀',
        message: 'You\'re on a 3-day streak! Get AI-powered insights to understand your patterns better.',
        cta: 'Get Premium - $10/month',
        urgency: 'Limited time: 7-day free trial'
      },
      'insights_viewed': {
        show: true,
        title: 'Want Deeper Insights? 🧠',
        message: 'Unlock unlimited AI analysis and personalized recommendations.',
        cta: 'Upgrade Now',
        urgency: 'Join 10,000+ users improving their wellbeing'
      },
      'history_limit': {
        show: true,
        title: 'See Your Complete Journey 📊',
        message: 'View unlimited mood history and advanced analytics.',
        cta: 'Remove Limits - $10/month',
        urgency: 'Track patterns over months, not days'
      },
      'tag_limit': {
        show: true,
        title: 'Organize Your Moods Better 🏷️',
        message: 'Create unlimited tags and custom categories for precise tracking.',
        cta: 'Upgrade to Premium',
        urgency: 'Better organization = Better insights'
      },
      
      // New freemium-based triggers  
      'monthly_limit_reached': {
        show: true,
        title: 'Monthly Limit Reached! 📊',
        message: 'You\'ve used all 50 free mood entries this month. Upgrade for unlimited tracking!',
        cta: 'Get Unlimited - $10/month',
        urgency: '🎯 Don\'t break your momentum - upgrade now!'
      },
      'monthly_limit_warning': {
        show: true,
        title: 'Almost at Your Limit ⚠️',
        message: 'Only a few mood entries left this month. Upgrade to Premium for unlimited tracking!',
        cta: 'Upgrade Now',
        urgency: '📈 43% of users upgrade at this point'
      },
      'notes_limit_hit': {
        show: true,
        title: 'Express Yourself Fully 📝',
        message: 'Your thoughtful notes are being cut short! Premium users get unlimited note length.',
        cta: 'Upgrade for Full Notes',
        urgency: '💭 Capture every thought, not just the first 200 characters'
      },
      'ai_feature_blocked': {
        show: true,
        title: 'AI Insights Awaiting! 🤖',
        message: 'You just tried to access AI features. Unlock personalized insights and predictions!',
        cta: 'Get AI Features - $10/month', 
        urgency: '🧠 See what patterns your mood data reveals'
      },
      'data_export_attempted': {
        show: true,
        title: 'Take Your Data With You 📥',
        message: 'Export your complete mood history to CSV, PDF, or other formats.',
        cta: 'Unlock Export - $10/month',
        urgency: '🔐 Your data, your way - no limits'
      },
      'power_user': {
        show: true,
        title: 'You\'re a Power User! 💪',
        message: 'Your consistent tracking shows you\'re serious about wellbeing. Ready for premium features?',
        cta: 'Upgrade to Pro Features',
        urgency: '⭐ Join other dedicated users who upgraded'
      }
    };
    
    const triggerData = triggers[trigger as keyof typeof triggers];
    if (triggerData?.show) {
      setPromptData(triggerData);
      setShow(true);
      
      // Track conversion event
      if (userId) {
        fetch('/api/analytics', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event: 'premium_prompt_shown',
            trigger,
            userId,
            timestamp: new Date().toISOString()
          })
        });
      }
    }
  }, [trigger, userId]);
  
  if (!show || !promptData) return null;
  
  const handleUpgrade = () => {
    // Track conversion click
    if (userId) {
      fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'premium_upgrade_clicked',
          trigger,
          userId,
          timestamp: new Date().toISOString()
        })
      });
    }
    // Redirect to pricing page
    window.location.href = '/pricing';
  };
  
  const handleDismiss = () => {
    setShow(false);
    // Track dismissal
    if (userId) {
      fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'premium_prompt_dismissed',
          trigger,
          userId,
          timestamp: new Date().toISOString()
        })
      });
    }
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 50, scale: 0.9 }}
      className="fixed bottom-4 right-4 max-w-sm z-50"
    >
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl p-6 shadow-2xl border border-white/20">
        <button 
          onClick={handleDismiss}
          className="absolute top-3 right-3 text-white/70 hover:text-white text-xl font-bold"
        >
          ×
        </button>
        
        <h3 className="font-bold text-lg mb-2 pr-6">{promptData.title}</h3>
        <p className="text-sm mb-3 text-white/90">{promptData.message}</p>
        <p className="text-xs mb-4 text-yellow-200 font-medium">{promptData.urgency}</p>
        
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold">$10/mo</span>
          <button 
            onClick={handleUpgrade}
            className="px-4 py-2 bg-white text-purple-600 rounded-lg font-semibold hover:scale-105 hover:shadow-lg transition-all"
          >
            {promptData.cta}
          </button>
        </div>
        
        <div className="flex items-center justify-center mt-3 space-x-1">
          <span className="text-yellow-400 text-xs">⭐⭐⭐⭐⭐</span>
          <span className="text-xs text-white/80">4.9/5 from users</span>
        </div>
      </div>
    </motion.div>
  );
}
