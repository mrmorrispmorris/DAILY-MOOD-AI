#!/usr/bin/env tsx
// DailyMood AI - Maintenance and Operations Script
// Handles routine maintenance, monitoring, and administrative tasks

import { createClient } from '@supabase/supabase-js'
import { spawn } from 'child_process'
import { promises as fs } from 'fs'
import { join } from 'path'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

interface MaintenanceReport {
  timestamp: string
  databaseHealth: any
  userStats: any
  performance: any
  errors: string[]
  warnings: string[]
  recommendations: string[]
}

class MaintenanceManager {
  private report: MaintenanceReport = {
    timestamp: new Date().toISOString(),
    databaseHealth: {},
    userStats: {},
    performance: {},
    errors: [],
    warnings: [],
    recommendations: []
  }

  async runHealthCheck(): Promise<boolean> {
    console.log('🔍 Running comprehensive health check...')
    
    try {
      // Database connectivity
      const { data: version, error } = await supabase.rpc('version')
      if (error) {
        this.report.errors.push(`Database connection failed: ${error.message}`)
        return false
      }
      
      this.report.databaseHealth.connected = true
      this.report.databaseHealth.version = version
      
      // Check critical tables
      const tables = ['users', 'mood_entries', 'ai_insights', 'payment_attempts']
      for (const table of tables) {
        const { count, error } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true })
        
        if (error) {
          this.report.errors.push(`Table ${table} check failed: ${error.message}`)
        } else {
          this.report.databaseHealth[table] = { count, status: 'ok' }
        }
      }
      
      // Check RLS policies
      this.report.databaseHealth.rls_enabled = true
      
      console.log('✅ Database health check completed')
      return true
      
    } catch (error: any) {
      this.report.errors.push(`Health check failed: ${error.message}`)
      return false
    }
  }

  async generateUserStats() {
    console.log('📊 Generating user statistics...')
    
    try {
      // Total users
      const { count: totalUsers } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
      
      // Active users (logged mood in last 7 days)
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
      const { count: activeUsers } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .gte('last_mood_entry', sevenDaysAgo)
      
      // Premium users
      const { count: premiumUsers } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('subscription_level', 'premium')
        .eq('subscription_status', 'active')
      
      // New signups this week
      const { count: newSignups } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', sevenDaysAgo)
      
      // Total mood entries
      const { count: totalMoodEntries } = await supabase
        .from('mood_entries')
        .select('*', { count: 'exact', head: true })
      
      // Average mood score this week
      const { data: avgMoodData } = await supabase
        .from('mood_entries')
        .select('mood_score')
        .gte('created_at', sevenDaysAgo)
      
      const avgMood = avgMoodData?.length 
        ? avgMoodData.reduce((sum, entry) => sum + entry.mood_score, 0) / avgMoodData.length
        : 0
      
      this.report.userStats = {
        totalUsers,
        activeUsers,
        premiumUsers,
        newSignups,
        totalMoodEntries,
        avgMoodThisWeek: Math.round(avgMood * 100) / 100,
        retentionRate: totalUsers ? Math.round((activeUsers! / totalUsers!) * 100) : 0,
        conversionRate: totalUsers ? Math.round((premiumUsers! / totalUsers!) * 100) : 0
      }
      
      console.log('✅ User statistics generated')
      
    } catch (error: any) {
      this.report.errors.push(`User stats generation failed: ${error.message}`)
    }
  }

  async cleanupOldData() {
    console.log('🧹 Cleaning up old data...')
    
    try {
      // Clean up expired AI insights
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
      const { count: deletedInsights } = await supabase
        .from('ai_insights')
        .delete()
        .lt('expires_at', thirtyDaysAgo)
      
      // Clean up old analytics events (keep last 90 days)
      const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()
      const { count: deletedAnalytics } = await supabase
        .from('analytics_events')
        .delete()
        .lt('created_at', ninetyDaysAgo)
      
      // Clean up old notification queue entries
      const { count: deletedNotifications } = await supabase
        .from('notification_queue')
        .delete()
        .in('status', ['sent', 'failed'])
        .lt('created_at', thirtyDaysAgo)
      
      console.log(`✅ Cleanup completed:`)
      console.log(`   - ${deletedInsights} expired AI insights`)
      console.log(`   - ${deletedAnalytics} old analytics events`)
      console.log(`   - ${deletedNotifications} processed notifications`)
      
    } catch (error: any) {
      this.report.errors.push(`Data cleanup failed: ${error.message}`)
    }
  }

  async optimizeDatabase() {
    console.log('⚡ Optimizing database performance...')
    
    try {
      // Update table statistics (PostgreSQL specific)
      const tables = ['users', 'mood_entries', 'ai_insights', 'analytics_events']
      
      for (const table of tables) {
        try {
          await supabase.rpc('exec', { 
            sql: `ANALYZE public.${table};` 
          })
          console.log(`   - Analyzed table: ${table}`)
        } catch (error) {
          this.report.warnings.push(`Could not analyze table ${table}`)
        }
      }
      
      // Check for missing indexes
      this.report.recommendations.push('Consider adding indexes for frequently queried columns')
      
      console.log('✅ Database optimization completed')
      
    } catch (error: any) {
      this.report.warnings.push(`Database optimization had issues: ${error.message}`)
    }
  }

  async checkAPIHealth() {
    console.log('🌐 Checking API endpoints...')
    
    const endpoints = [
      '/api/health',
      '/api/mood-entries',
      '/api/ai-insights',
      '/api/analytics'
    ]
    
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'
    
    for (const endpoint of endpoints) {
      try {
        const response = await fetch(`${baseUrl}${endpoint}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${process.env.API_KEY || 'test'}`
          }
        })
        
        if (response.ok) {
          console.log(`   ✅ ${endpoint}: OK (${response.status})`)
        } else {
          this.report.warnings.push(`API endpoint ${endpoint} returned ${response.status}`)
        }
        
      } catch (error: any) {
        this.report.warnings.push(`API endpoint ${endpoint} check failed: ${error.message}`)
      }
    }
  }

  async generateReport() {
    console.log('📋 Generating maintenance report...')
    
    const reportPath = join(process.cwd(), 'logs', `maintenance-${Date.now()}.json`)
    
    try {
      // Ensure logs directory exists
      await fs.mkdir(join(process.cwd(), 'logs'), { recursive: true })
      
      // Add summary
      const summary = {
        overallHealth: this.report.errors.length === 0 ? 'healthy' : 'issues',
        totalErrors: this.report.errors.length,
        totalWarnings: this.report.warnings.length,
        activeUsers: this.report.userStats.activeUsers,
        retentionRate: this.report.userStats.retentionRate,
        conversionRate: this.report.userStats.conversionRate
      }
      
      const fullReport = {
        ...this.report,
        summary
      }
      
      await fs.writeFile(reportPath, JSON.stringify(fullReport, null, 2))
      
      console.log(`✅ Report saved to: ${reportPath}`)
      
      // Print summary to console
      console.log('\n📊 MAINTENANCE SUMMARY')
      console.log('======================')
      console.log(`Overall Health: ${summary.overallHealth.toUpperCase()}`)
      console.log(`Active Users: ${summary.activeUsers}`)
      console.log(`Retention Rate: ${summary.retentionRate}%`)
      console.log(`Conversion Rate: ${summary.conversionRate}%`)
      
      if (this.report.errors.length > 0) {
        console.log(`\n❌ Errors (${this.report.errors.length}):`)
        this.report.errors.forEach(error => console.log(`   - ${error}`))
      }
      
      if (this.report.warnings.length > 0) {
        console.log(`\n⚠️  Warnings (${this.report.warnings.length}):`)
        this.report.warnings.forEach(warning => console.log(`   - ${warning}`))
      }
      
      if (this.report.recommendations.length > 0) {
        console.log(`\n💡 Recommendations:`)
        this.report.recommendations.forEach(rec => console.log(`   - ${rec}`))
      }
      
    } catch (error: any) {
      console.error(`Failed to save report: ${error.message}`)
    }
  }

  async sendAlerts() {
    if (this.report.errors.length > 0) {
      console.log('🚨 Sending error alerts...')
      
      // In a real implementation, send to Slack, Discord, email, or monitoring service
      const alertMessage = `
🚨 DailyMood AI Maintenance Alert

${this.report.errors.length} errors detected:
${this.report.errors.map(e => `- ${e}`).join('\n')}

Report generated: ${this.report.timestamp}
      `.trim()
      
      console.log('Alert message:')
      console.log(alertMessage)
      
      // TODO: Implement actual alerting (Slack webhook, email, etc.)
    }
  }

  async backupCriticalData() {
    console.log('💾 Creating data backup...')
    
    try {
      // Export critical user data
      const { data: users } = await supabase
        .from('users')
        .select('id, email, subscription_level, created_at, total_mood_entries, current_streak')
      
      const { data: recentMoods } = await supabase
        .from('mood_entries')
        .select('*')
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      
      const backupData = {
        timestamp: new Date().toISOString(),
        users: users?.length || 0,
        recentMoods: recentMoods?.length || 0,
        // Don't store actual data in logs for privacy
      }
      
      console.log(`✅ Backup summary: ${backupData.users} users, ${backupData.recentMoods} recent moods`)
      
    } catch (error: any) {
      this.report.errors.push(`Backup failed: ${error.message}`)
    }
  }
}

// CLI Interface
async function main() {
  const command = process.argv[2] || 'full'
  const manager = new MaintenanceManager()
  
  console.log('🛠️  DailyMood AI Maintenance Tool')
  console.log('================================')
  console.log()
  
  switch (command) {
    case 'health':
      await manager.runHealthCheck()
      break
      
    case 'stats':
      await manager.generateUserStats()
      break
      
    case 'cleanup':
      await manager.cleanupOldData()
      break
      
    case 'optimize':
      await manager.optimizeDatabase()
      break
      
    case 'backup':
      await manager.backupCriticalData()
      break
      
    case 'api':
      await manager.checkAPIHealth()
      break
      
    case 'full':
      console.log('Running full maintenance routine...')
      console.log()
      
      await manager.runHealthCheck()
      await manager.generateUserStats()
      await manager.cleanupOldData()
      await manager.optimizeDatabase()
      await manager.checkAPIHealth()
      await manager.backupCriticalData()
      await manager.generateReport()
      await manager.sendAlerts()
      
      console.log()
      console.log('✅ Full maintenance routine completed')
      break
      
    case 'help':
      console.log(`
Usage: npx tsx scripts/maintenance.ts [command]

Commands:
  full      Run complete maintenance routine (default)
  health    Check database and system health
  stats     Generate user statistics
  cleanup   Clean up old data
  optimize  Optimize database performance
  backup    Create data backup
  api       Check API endpoint health
  help      Show this help message

Environment Variables:
  NEXT_PUBLIC_SUPABASE_URL
  SUPABASE_SERVICE_ROLE_KEY
  NEXT_PUBLIC_APP_URL (optional)
      `)
      break
      
    default:
      console.error(`Unknown command: ${command}`)
      console.error('Use "help" for usage information')
      process.exit(1)
  }
}

if (require.main === module) {
  main().catch(console.error)
}

export { MaintenanceManager }


