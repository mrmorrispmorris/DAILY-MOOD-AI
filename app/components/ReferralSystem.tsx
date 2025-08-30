'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface ReferralSystemProps {
  userId?: string;
  userEmail?: string;
}

interface ReferralStats {
  referralCode: string;
  totalReferrals: number;
  successfulReferrals: number;
  rewardEarned: number;
}

export function ReferralSystem({ userId, userEmail }: ReferralSystemProps) {
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    if (userId) {
      generateReferralData();
    }
  }, [userId]);
  
  const generateReferralData = async () => {
    try {
      // Generate unique referral code based on user ID
      const referralCode = generateReferralCode(userId!);
      
      // Mock referral stats (would come from database in real implementation)
      const mockStats: ReferralStats = {
        referralCode,
        totalReferrals: 0, // Would be fetched from database
        successfulReferrals: 0, // Would be calculated from successful signups
        rewardEarned: 0 // Would be calculated based on referral rewards
      };
      
      setStats(mockStats);
      setIsLoading(false);
      
      // Track referral system view
      if (userId) {
        fetch('/api/analytics', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event: 'referral_system_viewed',
            userId,
            timestamp: new Date().toISOString()
          })
        });
      }
    } catch (error) {
      console.error('Error generating referral data:', error);
      setIsLoading(false);
    }
  };
  
  const generateReferralCode = (userId: string): string => {
    // Generate a referral code based on user ID + random component
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const userHash = userId.slice(-4).toUpperCase();
    let random = '';
    for (let i = 0; i < 4; i++) {
      random += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `MOOD${userHash}${random}`;
  };
  
  const getReferralUrl = () => {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
    return `${baseUrl}/signup?ref=${stats?.referralCode}`;
  };
  
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(getReferralUrl());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      
      // Track copy event
      if (userId) {
        fetch('/api/analytics', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event: 'referral_link_copied',
            userId,
            referralCode: stats?.referralCode,
            timestamp: new Date().toISOString()
          })
        });
      }
    } catch (error) {
      console.error('Failed to copy referral link:', error);
    }
  };
  
  const handleShare = (platform: string) => {
    const url = getReferralUrl();
    const message = `🧠 I've been using DailyMood AI to track my emotional wellness and it's amazing! Get AI-powered insights about your mood patterns. Try it free:`;
    
    const shareUrls = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}&url=${encodeURIComponent(url)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(`${message} ${url}`)}`
    };
    
    const shareUrl = shareUrls[platform as keyof typeof shareUrls];
    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
      
      // Track share event
      if (userId) {
        fetch('/api/analytics', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event: 'referral_shared',
            platform,
            userId,
            referralCode: stats?.referralCode,
            timestamp: new Date().toISOString()
          })
        });
      }
    }
  };
  
  if (isLoading) {
    return (
      <div className="bg-white/80 backdrop-blur rounded-2xl p-6 shadow-lg animate-pulse">
        <div className="h-6 bg-gray-200 rounded mb-4"></div>
        <div className="h-4 bg-gray-200 rounded mb-2"></div>
        <div className="h-4 bg-gray-200 rounded"></div>
      </div>
    );
  }
  
  if (!stats) return null;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 shadow-lg border border-green-100"
    >
      <div className="flex items-center mb-4">
        <span className="text-2xl mr-3">🎁</span>
        <h3 className="text-xl font-bold text-gray-900">Invite Friends & Earn Rewards</h3>
      </div>
      
      <p className="text-gray-600 mb-4">
        Share DailyMood AI with friends and earn premium days when they sign up!
      </p>
      
      {/* Referral Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">{stats.totalReferrals}</div>
          <div className="text-xs text-gray-500">Total Invites</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">{stats.successfulReferrals}</div>
          <div className="text-xs text-gray-500">Successful</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600">{stats.rewardEarned}</div>
          <div className="text-xs text-gray-500">Days Earned</div>
        </div>
      </div>
      
      {/* Referral Code & Link */}
      <div className="bg-white rounded-lg p-4 mb-4 border border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Your Referral Code:</span>
          <span className="font-mono text-lg font-bold text-purple-600">{stats.referralCode}</span>
        </div>
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={getReferralUrl()}
            readOnly
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm bg-gray-50"
          />
          <button
            onClick={handleCopyLink}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              copied 
                ? 'bg-green-100 text-green-700' 
                : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
            }`}
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </div>
      
      {/* Social Sharing */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { platform: 'twitter', icon: '🐦', label: 'Twitter' },
          { platform: 'facebook', icon: '👥', label: 'Facebook' },
          { platform: 'linkedin', icon: '💼', label: 'LinkedIn' },
          { platform: 'whatsapp', icon: '💬', label: 'WhatsApp' }
        ].map(({ platform, icon, label }) => (
          <button
            key={platform}
            onClick={() => handleShare(platform)}
            className="flex flex-col items-center py-3 px-2 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-all"
          >
            <span className="text-lg mb-1">{icon}</span>
            <span className="text-xs text-gray-600">{label}</span>
          </button>
        ))}
      </div>
      
      <div className="mt-4 text-center">
        <p className="text-xs text-gray-500">
          💡 Earn 7 premium days for each friend who upgrades to Premium
        </p>
      </div>
    </motion.div>
  );
}


