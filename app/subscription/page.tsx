'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useSubscription } from '@/hooks/use-subscription';
import Link from 'next/link';

export default function SubscriptionPage() {
  const { user } = useAuth();
  const { isPremium, loading, cancelSubscription } = useSubscription();
  const [canceling, setCanceling] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const handleCancelSubscription = async () => {
    setCanceling(true);
    try {
      await cancelSubscription();
      setShowCancelConfirm(false);
      window.location.reload();
    } catch (error) {
      console.error('Failed to cancel subscription:', error);
      alert('Failed to cancel subscription. Please try again.');
    } finally {
      setCanceling(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="h-4 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 rounded mb-4"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-6">Please log in to view your subscription details.</p>
          <Link href="/login?redirect=subscription" className="bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition">
            Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl mb-4 shadow-lg">
            <span className="text-2xl">💎</span>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
            Subscription Management
          </h1>
          <p className="text-xl text-gray-600">Manage your DailyMood AI subscription</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-xl border border-white/30 p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <span className="mr-3">{isPremium ? '👑' : '🆓'}</span>
              Current Plan
            </h2>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Plan Type:</span>
                <span className={`font-semibold px-3 py-1 rounded-full text-sm ${
                  isPremium 
                    ? 'bg-purple-100 text-purple-700' 
                    : 'bg-gray-100 text-gray-700'
                }`}>
                  {isPremium ? 'Premium' : 'Free'}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Monthly Cost:</span>
                <span className="font-semibold text-lg">
                  {isPremium ? '$10.00' : '$0.00'}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Status:</span>
                <span className={`font-semibold ${isPremium ? 'text-green-600' : 'text-gray-600'}`}>
                  {isPremium ? 'Active' : 'Inactive'}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-600">Account:</span>
                <span className="text-sm text-gray-500">{user.email}</span>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="font-semibold text-gray-800 mb-3">
                {isPremium ? 'Premium Features' : 'Current Features'}
              </h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Basic mood tracking
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Mood visualization
                </li>
                <li className="flex items-center">
                  <span className={isPremium ? 'text-green-500' : 'text-gray-400'} mr-2">
                    {isPremium ? '✓' : '✕'}
                  </span>
                  <span className={isPremium ? '' : 'text-gray-400'}>
                    AI-powered insights & predictions
                  </span>
                </li>
                <li className="flex items-center">
                  <span className={isPremium ? 'text-green-500' : 'text-gray-400'} mr-2">
                    {isPremium ? '✓' : '✕'}
                  </span>
                  <span className={isPremium ? '' : 'text-gray-400'}>
                    Unlimited mood history
                  </span>
                </li>
                <li className="flex items-center">
                  <span className={isPremium ? 'text-green-500' : 'text-gray-400'} mr-2}>
                    {isPremium ? '✓' : '✕'}
                  </span>
                  <span className={isPremium ? '' : 'text-gray-400'}>
                    Advanced analytics
                  </span>
                </li>
                <li className="flex items-center">
                  <span className={isPremium ? 'text-green-500' : 'text-gray-400'} mr-2">
                    {isPremium ? '✓' : '✕'}
                  </span>
                  <span className={isPremium ? '' : 'text-gray-400'}>
                    Priority support
                  </span>
                </li>
              </ul>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-xl border border-white/30 p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <span className="mr-3">⚙️</span>
                Subscription Actions
              </h2>
              
              <div className="space-y-4">
                {!isPremium ? (
                  <Link href="/pricing" className="block">
                    <button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-4 px-6 rounded-xl font-semibold hover:from-purple-700 hover:to-blue-700 transition shadow-lg">
                      <span className="mr-2">⬆️</span>
                      Upgrade to Premium - $10.00/month
                    </button>
                  </Link>
                ) : (
                  <div className="space-y-3">
                    <button
                      onClick={() => setShowCancelConfirm(true)}
                      className="w-full bg-red-50 text-red-600 border-2 border-red-200 py-3 px-6 rounded-xl font-semibold hover:bg-red-100 transition"
                    >
                      <span className="mr-2">❌</span>
                      Cancel Subscription
                    </button>
                    
                    <p className="text-xs text-gray-500 text-center">
                      Cancel anytime. Access continues until end of billing period.
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-xl border border-white/30 p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <span className="mr-3">📊</span>
                Account Overview
              </h2>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-purple-50 rounded-xl">
                  <div className="text-2xl font-bold text-purple-600">
                    {isPremium ? 'Unlimited' : '3'}
                  </div>
                  <div className="text-sm text-gray-600">Mood History</div>
                </div>
                
                <div className="text-center p-4 bg-blue-50 rounded-xl">
                  <div className="text-2xl font-bold text-blue-600">
                    {isPremium ? 'Full' : 'Basic'}
                  </div>
                  <div className="text-sm text-gray-600">Feature Access</div>
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-xl border border-white/30 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Need Help?</h3>
              <p className="text-gray-600 text-sm mb-4">
                Have questions about your subscription or need support?
              </p>
              <Link href="/dashboard" className="text-purple-600 hover:text-purple-700 text-sm font-medium">
                Back to Dashboard →
              </Link>
            </div>
          </div>
        </div>

        {showCancelConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
              <div className="text-center">
                <div className="text-6xl mb-4">⚠️</div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">Cancel Subscription?</h3>
                <p className="text-gray-600 mb-6">
                  You'll lose access to premium features at the end of your current billing period. 
                  Your account will revert to the free plan.
                </p>
                
                <div className="space-y-3">
                  <button
                    onClick={handleCancelSubscription}
                    disabled={canceling}
                    className="w-full bg-red-600 text-white py-3 px-6 rounded-xl font-semibold hover:bg-red-700 transition disabled:opacity-50"
                  >
                    {canceling ? 'Canceling...' : 'Yes, Cancel Subscription'}
                  </button>
                  
                  <button
                    onClick={() => setShowCancelConfirm(false)}
                    className="w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-xl font-semibold hover:bg-gray-200 transition"
                  >
                    Keep Subscription
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}