'use client'

import { useAuth } from '@/hooks/use-auth'
import { useSubscription } from '@/hooks/use-subscription'
import { useMoodData } from '@/hooks/use-mood-data'
import { CSVExportService } from '@/lib/export/csv-export'
import { enhancedPushService } from '@/lib/notifications/enhanced-push-service'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BottomNav } from '@/components/ui/bottom-nav'
import { Badge } from '@/components/ui/badge'
import { User, Crown, Download, Bell, Settings, LogOut, Mail, Calendar, TrendingUp } from 'lucide-react'
import { SubscriptionManagement } from '@/components/subscription/subscription-management'
import { InAppPurchases } from '@/components/premium/in-app-purchases'
import { ThemeCustomization } from '@/components/premium/theme-customization'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { ErrorService } from '@/lib/error-handling/error-service'

export default function ProfilePage() {
  const { user, loading, signOut } = useAuth()
  const { subscriptionLevel, isPremium, loading: subscriptionLoading } = useSubscription()
  const { moodEntries } = useMoodData()
  const router = useRouter()
  const [exportingCSV, setExportingCSV] = useState(false)
  const [notificationsEnabled, setNotificationsEnabled] = useState(false)

  if (loading || subscriptionLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!user) {
    router.push('/login')
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  const handleCSVExport = async () => {
    if (!isPremium) {
      ErrorService.showError(new Error('CSV export is a Premium feature. Upgrade to access!'), 'Premium Feature')
      router.push('/pricing')
      return
    }

    if (moodEntries.length === 0) {
      ErrorService.showError(new Error('No mood data to export'), 'CSV Export')
      return
    }

    setExportingCSV(true)
    
    try {
      const result = await CSVExportService.exportUserMoodData(moodEntries)
      
      if (result.success) {
        ErrorService.showSuccess(`Exported ${moodEntries.length} mood entries to ${result.filename}`)
      } else {
        ErrorService.showError(new Error(result.error || 'Export failed'), 'CSV Export')
      }
    } catch (error) {
      ErrorService.showError(error, 'CSV Export')
    } finally {
      setExportingCSV(false)
    }
  }

  const handleEnableNotifications = async () => {
    try {
      const initialized = await enhancedPushService.initialize()
      
      if (!initialized) {
        ErrorService.showError(new Error('Notifications not supported on this device'), 'Push Notifications')
        return
      }

      const permission = await enhancedPushService.requestPermission()
      
      if (permission.granted) {
        await enhancedPushService.scheduleDailyReminder('20:00')
        setNotificationsEnabled(true)
        ErrorService.showSuccess('Daily mood reminders enabled! 🔔')
        
        setTimeout(() => {
          enhancedPushService.testNotification('smart')
        }, 2000)
      } else {
        ErrorService.showError(new Error('Permission denied'), 'Notifications')
      }
    } catch (error) {
      ErrorService.showError(error, 'Notifications')
    }
  }

  const calculateStats = () => {
    const totalEntries = moodEntries.length
    const averageScore = totalEntries > 0 
      ? (moodEntries.reduce((sum, entry) => sum + entry.mood_score, 0) / totalEntries).toFixed(1)
      : '0.0'
    const goodDays = moodEntries.filter(entry => entry.mood_score >= 7).length
    
    return { totalEntries, averageScore, goodDays }
  }

  const stats = calculateStats()

  return (
    <div className="min-h-screen bg-gray-50 pb-20 animate-fade-in">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center justify-center">
          <div className="flex items-center space-x-2">
            <User className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold text-primary">Profile</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* User Info Card */}
        <Card className="bg-gradient-to-r from-primary/5 to-blue-50 border-primary/20">
          <CardHeader className="pb-3">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
                <User className="h-8 w-8 text-white" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-lg">{user.email || 'demo@example.com'}</CardTitle>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge variant={isPremium ? "default" : "secondary"}>
                    {isPremium ? 'Premium' : 'Free'}
                  </Badge>
                  {isPremium && <Crown className="h-4 w-4 text-yellow-500" />}
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <Calendar className="h-6 w-6 text-blue-500 mx-auto mb-2" />
              <div className="text-xl font-bold text-gray-900">{stats.totalEntries}</div>
              <div className="text-xs text-gray-600">Total Logs</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <TrendingUp className="h-6 w-6 text-green-500 mx-auto mb-2" />
              <div className="text-xl font-bold text-gray-900">{stats.averageScore}</div>
              <div className="text-xs text-gray-600">Avg Score</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Crown className="h-6 w-6 text-yellow-500 mx-auto mb-2" />
              <div className="text-xl font-bold text-gray-900">{stats.goodDays}</div>
              <div className="text-xs text-gray-600">Good Days</div>
            </CardContent>
          </Card>
        </div>

        {/* Account Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Settings className="mr-2 h-5 w-5" />
              Account Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-gray-600" />
                <div>
                  <span className="font-medium text-gray-900">Email</span>
                  <p className="text-sm text-gray-600">{user.email || 'demo@example.com'}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Crown className="h-5 w-5 text-gray-600" />
                <div>
                  <span className="font-medium text-gray-900">Subscription</span>
                  <p className="text-sm text-gray-600">
                    {isPremium ? 'Premium Plan' : 'Free Plan'}
                  </p>
                </div>
              </div>
              {!isPremium && (
                <Button
                  size="sm"
                  onClick={() => router.push('/pricing')}
                >
                  Upgrade
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Premium Features */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Features</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* CSV Export */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Download className="h-5 w-5 text-gray-600" />
                <div>
                  <span className="font-medium text-gray-900">Export Data</span>
                  <p className="text-sm text-gray-600">Download your mood data as CSV</p>
                </div>
              </div>
              <Button
                onClick={handleCSVExport}
                disabled={exportingCSV || !isPremium}
                variant={isPremium ? "default" : "outline"}
                size="sm"
              >
                {exportingCSV ? (
                  <LoadingSpinner size="sm" />
                ) : isPremium ? (
                  'Export'
                ) : (
                  'Premium'
                )}
              </Button>
            </div>

            {/* Push Notifications */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Bell className="h-5 w-5 text-gray-600" />
                <div>
                  <span className="font-medium text-gray-900">Daily Reminders</span>
                  <p className="text-sm text-gray-600">Get notified to log your mood</p>
                </div>
              </div>
              <Button
                onClick={handleEnableNotifications}
                disabled={notificationsEnabled}
                variant={notificationsEnabled ? "secondary" : "default"}
                size="sm"
              >
                {notificationsEnabled ? 'Enabled' : 'Enable'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Subscription Management */}
        <SubscriptionManagement />

        {/* In-App Purchases */}
        <InAppPurchases />

        {/* Theme Customization */}
        <ThemeCustomization />

        {/* Actions */}
        <Card>
          <CardContent className="p-4 space-y-3">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => router.push('/pricing')}
            >
              <Crown className="mr-2 h-4 w-4" />
              {isPremium ? 'Manage Subscription' : 'Upgrade to Premium'}
            </Button>
            
            <Button
              variant="outline"
              className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={signOut}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </CardContent>
        </Card>
      </main>

      <BottomNav />
    </div>
  )
}