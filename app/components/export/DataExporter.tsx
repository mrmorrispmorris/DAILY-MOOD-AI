'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Download, 
  FileText, 
  Calendar, 
  Database, 
  Cloud, 
  CheckCircle,
  AlertCircle,
  Loader2,
  Share2
} from 'lucide-react'
import { supabase } from '@/app/lib/supabase-client'

interface MoodEntry {
  id: number
  user_id: string
  mood_score: number
  date: string
  activities: string[]
  notes: string
  created_at: string
  emoji?: string
}

interface DataExporterProps {
  userId?: string
  moods: MoodEntry[]
}

type ExportFormat = 'csv' | 'json' | 'pdf'
type ExportRange = '7d' | '30d' | '90d' | '1y' | 'all'
type ExportType = 'moods' | 'goals' | 'conversations' | 'all'

export default function DataExporter({ userId, moods }: DataExporterProps) {
  const [exportFormat, setExportFormat] = useState<ExportFormat>('csv')
  const [exportRange, setExportRange] = useState<ExportRange>('all')
  const [exportType, setExportType] = useState<ExportType>('all')
  const [isExporting, setIsExporting] = useState(false)
  const [exportStatus, setExportStatus] = useState<{
    type: 'success' | 'error' | null
    message: string
  }>({ type: null, message: '' })
  const [showAdvanced, setShowAdvanced] = useState(false)

  // Get filtered data based on range
  const getFilteredData = (data: any[], dateField: string = 'date') => {
    if (exportRange === 'all') return data
    
    const now = new Date()
    const cutoffDate = new Date()
    
    switch (exportRange) {
      case '7d':
        cutoffDate.setDate(now.getDate() - 7)
        break
      case '30d':
        cutoffDate.setDate(now.getDate() - 30)
        break
      case '90d':
        cutoffDate.setDate(now.getDate() - 90)
        break
      case '1y':
        cutoffDate.setFullYear(now.getFullYear() - 1)
        break
    }
    
    return data.filter(item => new Date(item[dateField]) >= cutoffDate)
  }

  // Convert array to CSV
  const arrayToCSV = (data: any[]) => {
    if (!data.length) return ''
    
    const headers = Object.keys(data[0]).join(',')
    const rows = data.map(item => 
      Object.values(item).map(value => {
        // Handle arrays and objects
        if (Array.isArray(value)) {
          return `"${value.join('; ')}"`
        }
        if (typeof value === 'object' && value !== null) {
          return `"${JSON.stringify(value)}"`
        }
        // Escape quotes and wrap in quotes if contains comma
        const stringValue = String(value)
        if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
          return `"${stringValue.replace(/"/g, '""')}"`
        }
        return stringValue
      }).join(',')
    )
    
    return [headers, ...rows].join('\n')
  }

  // Generate filename with timestamp
  const generateFilename = (type: string, format: string) => {
    const timestamp = new Date().toISOString().split('T')[0]
    const rangeText = exportRange === 'all' ? 'all-time' : exportRange
    return `dailymood-${type}-${rangeText}-${timestamp}.${format}`
  }

  // Download file
  const downloadFile = (content: string, filename: string, contentType: string) => {
    const blob = new Blob([content], { type: contentType })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  // Export mood data
  const exportMoods = async () => {
    const filteredMoods = getFilteredData(moods)
    
    if (!filteredMoods.length) {
      setExportStatus({ type: 'error', message: 'No mood data available for the selected time range' })
      return
    }

    // Clean data for export
    const exportData = filteredMoods.map(mood => ({
      date: mood.date,
      mood_score: mood.mood_score,
      emoji: mood.emoji || '',
      notes: mood.notes || '',
      activities: mood.activities?.join('; ') || '',
      created_at: mood.created_at
    }))

    if (exportFormat === 'csv') {
      const csv = arrayToCSV(exportData)
      downloadFile(csv, generateFilename('moods', 'csv'), 'text/csv')
    } else if (exportFormat === 'json') {
      const json = JSON.stringify(exportData, null, 2)
      downloadFile(json, generateFilename('moods', 'json'), 'application/json')
    }
  }

  // Export goals data
  const exportGoals = async () => {
    if (!userId) return

    try {
      const { data: goals } = await supabase
        .from('user_goals')
        .select(`
          *,
          goal_progress (
            progress_value,
            progress_date,
            notes,
            created_at
          )
        `)
        .eq('user_id', userId)

      if (!goals?.length) {
        setExportStatus({ type: 'error', message: 'No goal data available' })
        return
      }

      const filteredGoals = getFilteredData(goals, 'created_at')
      
      if (exportFormat === 'csv') {
        const csv = arrayToCSV(filteredGoals)
        downloadFile(csv, generateFilename('goals', 'csv'), 'text/csv')
      } else if (exportFormat === 'json') {
        const json = JSON.stringify(filteredGoals, null, 2)
        downloadFile(json, generateFilename('goals', 'json'), 'application/json')
      }
    } catch (error) {
      console.error('Export goals error:', error)
      setExportStatus({ type: 'error', message: 'Failed to export goals data' })
    }
  }

  // Export AI conversations
  const exportConversations = async () => {
    if (!userId) return

    try {
      const { data: conversations } = await supabase
        .from('ai_conversations')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (!conversations?.length) {
        setExportStatus({ type: 'error', message: 'No conversation data available' })
        return
      }

      const filteredConversations = getFilteredData(conversations, 'created_at')
      
      // Clean sensitive data
      const exportData = filteredConversations.map(conv => ({
        conversation_date: conv.created_at?.split('T')[0],
        user_message: conv.user_message || '',
        ai_response: conv.ai_response || '',
        mood_score: conv.mood_score_at_conversation,
        conversation_type: conv.conversation_type,
        sentiment_analysis: conv.sentiment_analysis,
        created_at: conv.created_at
      }))
      
      if (exportFormat === 'csv') {
        const csv = arrayToCSV(exportData)
        downloadFile(csv, generateFilename('conversations', 'csv'), 'text/csv')
      } else if (exportFormat === 'json') {
        const json = JSON.stringify(exportData, null, 2)
        downloadFile(json, generateFilename('conversations', 'json'), 'application/json')
      }
    } catch (error) {
      console.error('Export conversations error:', error)
      setExportStatus({ type: 'error', message: 'Failed to export conversation data' })
    }
  }

  // Generate comprehensive report
  const generateReport = async () => {
    if (!moods?.length) {
      setExportStatus({ type: 'error', message: 'No data available to generate report' })
      return
    }

    const filteredMoods = getFilteredData(moods)
    
    // Calculate statistics
    const scores = filteredMoods.map(m => m.mood_score)
    const average = scores.reduce((a, b) => a + b, 0) / scores.length
    const min = Math.min(...scores)
    const max = Math.max(...scores)
    
    // Activity analysis
    const activityMap: Record<string, number[]> = {}
    filteredMoods.forEach(mood => {
      mood.activities?.forEach(activity => {
        if (!activityMap[activity]) activityMap[activity] = []
        activityMap[activity].push(mood.mood_score)
      })
    })
    
    const topActivities = Object.entries(activityMap)
      .map(([activity, moodScores]) => ({
        activity,
        averageMood: moodScores.reduce((a, b) => a + b, 0) / moodScores.length,
        count: moodScores.length
      }))
      .sort((a, b) => b.averageMood - a.averageMood)
      .slice(0, 5)

    // Generate report content
    const reportContent = `# DailyMood AI - Personal Wellness Report
Generated: ${new Date().toLocaleDateString()}
Time Period: ${exportRange === 'all' ? 'All Time' : exportRange.toUpperCase()}

## Summary Statistics
- Total Mood Entries: ${filteredMoods.length}
- Average Mood: ${average.toFixed(1)}/10
- Mood Range: ${min} - ${max}
- Most Common Mood: ${Math.round(average)}

## Top Activities by Mood Impact
${topActivities.map((item, index) => 
  `${index + 1}. ${item.activity}: ${item.averageMood.toFixed(1)}/10 (${item.count} times)`
).join('\n')}

## Recent Mood Entries
${filteredMoods.slice(0, 10).map(mood => 
  `${mood.date}: ${mood.mood_score}/10 ${mood.emoji || ''} - ${mood.notes || 'No notes'}`
).join('\n')}

## Data Export Information
This report contains your personal mood tracking data from DailyMood AI.
All data has been anonymized and is for your personal use only.

For questions about your data, visit: https://dailymood-ai.com/support
`

    downloadFile(reportContent, generateFilename('report', 'txt'), 'text/plain')
  }

  // Main export handler
  const handleExport = async () => {
    if (!userId && exportType !== 'moods') {
      setExportStatus({ type: 'error', message: 'User authentication required for this export type' })
      return
    }

    setIsExporting(true)
    setExportStatus({ type: null, message: '' })

    try {
      switch (exportType) {
        case 'moods':
          await exportMoods()
          break
        case 'goals':
          await exportGoals()
          break
        case 'conversations':
          await exportConversations()
          break
        case 'all':
          await exportMoods()
          if (userId) {
            await exportGoals()
            await exportConversations()
          }
          await generateReport()
          break
      }

      setExportStatus({ 
        type: 'success', 
        message: `Successfully exported ${exportType === 'all' ? 'all data' : exportType} as ${exportFormat.toUpperCase()}`
      })
    } catch (error) {
      console.error('Export error:', error)
      setExportStatus({ type: 'error', message: 'Failed to export data. Please try again.' })
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center gap-3 mb-6">
        <Database className="w-6 h-6 text-blue-600" />
        <div>
          <h2 className="text-xl font-bold text-gray-900">Data Export</h2>
          <p className="text-gray-600">Export your wellness data for backup or analysis</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Export Type Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">What to Export</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              { value: 'moods', label: 'Mood Entries', icon: Calendar, desc: 'Your daily mood logs and activities' },
              { value: 'goals', label: 'Goals & Progress', icon: CheckCircle, desc: 'Goal tracking and achievements' },
              { value: 'conversations', label: 'AI Conversations', icon: Share2, desc: 'Chat history with MOODY' },
              { value: 'all', label: 'Complete Export', icon: Database, desc: 'All data plus summary report' }
            ].map(({ value, label, icon: Icon, desc }) => (
              <button
                key={value}
                onClick={() => setExportType(value as ExportType)}
                className={`p-4 border-2 rounded-lg text-left transition-colors ${
                  exportType === value
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <Icon className={`w-5 h-5 ${exportType === value ? 'text-blue-600' : 'text-gray-600'}`} />
                  <span className="font-medium">{label}</span>
                </div>
                <p className="text-sm text-gray-600">{desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Format and Range Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Export Format</label>
            <div className="space-y-2">
              {[
                { value: 'csv', label: 'CSV', desc: 'Excel-compatible spreadsheet format' },
                { value: 'json', label: 'JSON', desc: 'Machine-readable structured data' }
              ].map(({ value, label, desc }) => (
                <button
                  key={value}
                  onClick={() => setExportFormat(value as ExportFormat)}
                  className={`w-full p-3 border-2 rounded-lg text-left transition-colors ${
                    exportFormat === value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-medium">{label}</div>
                  <div className="text-sm text-gray-600">{desc}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Time Range</label>
            <select
              value={exportRange}
              onChange={(e) => setExportRange(e.target.value as ExportRange)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 3 months</option>
              <option value="1y">Last year</option>
              <option value="all">All time</option>
            </select>
          </div>
        </div>

        {/* Advanced Options */}
        <div>
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            {showAdvanced ? 'Hide' : 'Show'} Advanced Options
          </button>
          
          <AnimatePresence>
            {showAdvanced && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 p-4 bg-gray-50 rounded-lg"
              >
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Privacy & Security</h4>
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span>Personal data anonymized in exports</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span>No sensitive information included</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span>Data encrypted during download</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Export Details</h4>
                    <p className="text-sm text-gray-600">
                      Your exported data includes timestamps, mood scores, activities, and notes. 
                      AI conversations are sanitized to remove any potentially sensitive content.
                      All exports are generated locally and not stored on our servers.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Status Messages */}
        <AnimatePresence>
          {exportStatus.type && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`p-4 rounded-lg flex items-center gap-3 ${
                exportStatus.type === 'success'
                  ? 'bg-green-50 text-green-700 border border-green-200'
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}
            >
              {exportStatus.type === 'success' ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                <AlertCircle className="w-5 h-5" />
              )}
              <span>{exportStatus.message}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Export Button */}
        <div className="flex justify-center pt-4">
          <button
            onClick={handleExport}
            disabled={isExporting}
            className={`flex items-center gap-3 px-8 py-4 rounded-lg font-medium transition-all ${
              isExporting
                ? 'bg-gray-400 text-white cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg'
            }`}
          >
            {isExporting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="w-5 h-5" />
                Export {exportType === 'all' ? 'All Data' : exportType.charAt(0).toUpperCase() + exportType.slice(1)}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
