'use client';

import { useState, useEffect } from 'react';

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState<any>(null);
  const [aiStats, setAiStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [adminKey, setAdminKey] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  
  const fetchMetrics = async () => {
    try {
      const [analyticsRes, aiRes] = await Promise.all([
        fetch(`/api/analytics?key=${adminKey}`),
        fetch(`/api/ai-insights?key=${adminKey}`)
      ]);
      
      const analyticsData = await analyticsRes.json();
      const aiData = await aiRes.json();
      
      setMetrics(analyticsData);
      setAiStats(aiData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching metrics:', error);
      setLoading(false);
    }
  };
  
  const handleLogin = () => {
    if (adminKey) {
      setAuthenticated(true);
      fetchMetrics();
    }
  };
  
  if (!authenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full">
          <h1 className="text-2xl font-bold mb-6 text-center">DailyMood AI Admin</h1>
          <input
            type="password"
            placeholder="Enter admin key"
            value={adminKey}
            onChange={(e) => setAdminKey(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg mb-4"
          />
          <button
            onClick={handleLogin}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700"
          >
            Access Dashboard
          </button>
        </div>
      </div>
    );
  }
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading metrics...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-gray-900">Business Metrics Dashboard</h1>
        
        {/* Revenue Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Monthly Recurring Revenue"
            value={`$${metrics?.estimated_mrr || 0}`}
            change="+12%"
            target="$10,000"
            color="green"
          />
          <MetricCard
            title="Active Subscribers"
            value={metrics?.premium_users || 0}
            change="+8%"
            target="1,000"
            color="blue"
          />
          <MetricCard
            title="Conversion Rate"
            value={`${metrics?.conversion_rate || 0}%`}
            change="+2%"
            target="10%"
            color="purple"
          />
          <MetricCard
            title="Total Users"
            value={metrics?.total_users || 0}
            change="+15%"
            target="10,000"
            color="indigo"
          />
        </div>
        
        {/* Engagement Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <MetricCard
            title="Mood Entries (24h)"
            value={metrics?.mood_entries_24h || 0}
            change="+5%"
            color="green"
          />
          <MetricCard
            title="New Users (24h)"
            value={metrics?.new_users_24h || 0}
            change="+10%"
            color="blue"
          />
          <MetricCard
            title="Analytics Events (24h)"
            value={metrics?.analytics_events_24h || 0}
            change="+7%"
            color="purple"
          />
        </div>
        
        {/* AI Usage & Costs */}
        <div className="bg-white rounded-xl p-6 shadow-lg mb-8">
          <h2 className="text-xl font-bold mb-4">AI Usage & Costs</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{aiStats?.dailyCost || '$0.00'}</div>
              <div className="text-sm text-gray-500">Daily Cost</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{aiStats?.monthlyProjected || '$0.00'}</div>
              <div className="text-sm text-gray-500">Monthly Projected</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{aiStats?.activeUsers || 0}</div>
              <div className="text-sm text-gray-500">AI Users</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-indigo-600">{aiStats?.averagePerUser || '$0.00'}</div>
              <div className="text-sm text-gray-500">Cost per User</div>
            </div>
          </div>
        </div>
        
        {/* Conversion Funnel */}
        <div className="bg-white rounded-xl p-6 shadow-lg mb-8">
          <h2 className="text-xl font-bold mb-4">Conversion Funnel (24h)</h2>
          <div className="space-y-4">
            <FunnelStep
              label="Premium Prompts Shown"
              value={metrics?.prompt_shown_24h || 0}
              percentage={100}
              color="blue"
            />
            <FunnelStep
              label="Upgrade Clicks"
              value={metrics?.upgrade_clicked_24h || 0}
              percentage={
                metrics?.prompt_shown_24h > 0 
                  ? (metrics.upgrade_clicked_24h / metrics.prompt_shown_24h) * 100 
                  : 0
              }
              color="purple"
            />
            <FunnelStep
              label="Completed Payments"
              value={metrics?.payment_completed_24h || 0}
              percentage={
                metrics?.upgrade_clicked_24h > 0 
                  ? (metrics.payment_completed_24h / metrics.upgrade_clicked_24h) * 100 
                  : 0
              }
              color="green"
            />
          </div>
        </div>
        
        {/* Performance Metrics */}
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <h2 className="text-xl font-bold mb-4">Performance Targets</h2>
          <div className="space-y-4">
            <PerformanceBar label="Homepage Load Time" current="1.8s" target="<2s" progress={90} />
            <PerformanceBar label="Dashboard Load Time" current="2.1s" target="<2s" progress={85} />
            <PerformanceBar label="API Response Time" current="120ms" target="<200ms" progress={95} />
            <PerformanceBar label="Revenue Goal Progress" current={`$${metrics?.estimated_mrr || 0}`} target="$10,000" progress={(metrics?.estimated_mrr || 0) / 100} />
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value, change, target, color }: any) {
  const colorClasses = {
    green: 'text-green-600 bg-green-50 border-green-200',
    blue: 'text-blue-600 bg-blue-50 border-blue-200',
    purple: 'text-purple-600 bg-purple-50 border-purple-200',
    indigo: 'text-indigo-600 bg-indigo-50 border-indigo-200'
  };
  
  return (
    <div className={`bg-white p-6 rounded-xl shadow-lg border ${colorClasses[color] || colorClasses.blue}`}>
      <h3 className="text-sm font-medium text-gray-600 mb-2">{title}</h3>
      <div className="flex items-center justify-between">
        <span className="text-2xl font-bold">{value}</span>
        {change && <span className="text-sm text-green-600">{change}</span>}
      </div>
      {target && <div className="text-xs text-gray-500 mt-1">Target: {target}</div>}
    </div>
  );
}

function FunnelStep({ label, value, percentage, color }: any) {
  return (
    <div className="flex items-center space-x-4">
      <div className="flex-1">
        <div className="flex justify-between mb-1">
          <span className="text-sm font-medium">{label}</span>
          <span className="text-sm text-gray-500">{value} ({percentage.toFixed(1)}%)</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full bg-${color}-500`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
}

function PerformanceBar({ label, current, target, progress }: any) {
  return (
    <div className="flex items-center space-x-4">
      <div className="flex-1">
        <div className="flex justify-between mb-1">
          <span className="text-sm font-medium">{label}</span>
          <span className="text-sm text-gray-500">{current} / {target}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full ${progress >= 90 ? 'bg-green-500' : progress >= 70 ? 'bg-yellow-500' : 'bg-red-500'}`}
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
}


