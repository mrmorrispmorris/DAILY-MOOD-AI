'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: string;
  action?: string;
}

interface OnboardingFlowProps {
  userId?: string;
  onComplete: () => void;
  onSkip: () => void;
}

export function OnboardingFlow({ userId, onComplete, onSkip }: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  
  const steps: OnboardingStep[] = [
    {
      id: 'welcome',
      title: 'Welcome to DailyMood AI! 🧠',
      description: 'Track your emotional journey and discover patterns with AI-powered insights.',
      icon: '👋'
    },
    {
      id: 'first_mood',
      title: 'Log Your First Mood 📝',
      description: 'Start by recording how you\'re feeling right now. It only takes 30 seconds.',
      icon: '🎯',
      action: 'Log your mood using the form on your dashboard'
    },
    {
      id: 'daily_habit',
      title: 'Build the Habit 🔥',
      description: 'Log your mood daily to unlock powerful insights about your emotional patterns.',
      icon: '💪',
      action: 'Set a daily reminder and aim for a 7-day streak'
    },
    {
      id: 'ai_insights',
      title: 'Unlock AI Insights 🚀',
      description: 'After 3 entries, upgrade to Premium for personalized AI analysis and recommendations.',
      icon: '✨',
      action: 'Upgrade to Premium when you\'re ready'
    }
  ];
  
  useEffect(() => {
    // Track onboarding start
    if (userId) {
      fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'onboarding_started',
          userId,
          timestamp: new Date().toISOString()
        })
      });
    }
  }, [userId]);
  
  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleComplete();
    }
  };
  
  const handleComplete = () => {
    setIsVisible(false);
    onComplete();
    
    // Track onboarding completion
    if (userId) {
      fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'onboarding_completed',
          userId,
          step: currentStep + 1,
          timestamp: new Date().toISOString()
        })
      });
    }
  };
  
  const handleSkip = () => {
    setIsVisible(false);
    onSkip();
    
    // Track onboarding skip
    if (userId) {
      fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'onboarding_skipped',
          userId,
          step: currentStep + 1,
          timestamp: new Date().toISOString()
        })
      });
    }
  };
  
  if (!isVisible) return null;
  
  const step = steps[currentStep];
  
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl"
        >
          {/* Progress indicator */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex space-x-2">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index <= currentStep ? 'bg-purple-500' : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
            <button
              onClick={handleSkip}
              className="text-sm text-gray-500 hover:text-gray-700 transition"
            >
              Skip
            </button>
          </div>
          
          {/* Step content */}
          <div className="text-center">
            <div className="text-6xl mb-4">{step.icon}</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">{step.title}</h2>
            <p className="text-gray-600 mb-6 leading-relaxed">{step.description}</p>
            
            {step.action && (
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-purple-700 font-medium">💡 {step.action}</p>
              </div>
            )}
          </div>
          
          {/* Navigation */}
          <div className="flex items-center justify-between">
            <button
              onClick={handleSkip}
              className="px-4 py-2 text-gray-500 hover:text-gray-700 transition"
              disabled={currentStep === 0}
            >
              Skip Tour
            </button>
            
            <button
              onClick={handleNext}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold hover:shadow-lg hover:scale-105 transition-all"
            >
              {currentStep === steps.length - 1 ? 'Get Started!' : 'Next'}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}


