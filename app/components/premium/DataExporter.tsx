'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '@/app/lib/supabase-client'

interface MoodEntry {
  id: string
  user_id: string
  mood_score: number
  emoji: string
  date: string
  time: string
  activities: string[]
  notes: string
  created_at: string
}

interface DataExporterProps {
  userId: string
  className?: string
}

interface ExportData {
  entries: MoodEntry[]
  statistics: {
    totalEntries: number
    averageMood: number
    highestMood: number
    lowestMood: number
    mostFrequentActivity: string
    dateRange: {
      start: string
      end: string
    }
  }
}

export default function DataExporter({ userId, className = "" }: DataExporterProps) {
  const [loading, setLoading] = useState(false)
  const [exportData, setExportData] = useState<ExportData | null>(null)
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days ago
    end: new Date().toISOString().split('T')[0] // today
  })
  const [exportFormat, setExportFormat] = useState<'csv' | 'pdf'>('csv')
  const [showPreview, setShowPreview] = useState(false)

  useEffect(() => {
    if (showPreview) {
      fetchExportData()
    }
  }, [dateRange, userId, showPreview])

  const fetchExportData = async () => {
    try {
      setLoading(true)
      
      const { data, error } = await supabase
        .from('mood_entries')
        .select('*')
        .eq('user_id', userId)
        .gte('date', dateRange.start)
        .lte('date', dateRange.end)
        .order('date', { ascending: true })
        .order('time', { ascending: true })

      if (error) {
        console.error('Error fetching export data:', error)
        return
      }

      const entries = data || []
      
      // Calculate statistics
      const totalEntries = entries.length
      const averageMood = totalEntries > 0 
        ? entries.reduce((sum, entry) => sum + entry.mood_score, 0) / totalEntries 
        : 0
      const highestMood = totalEntries > 0 
        ? Math.max(...entries.map(e => e.mood_score)) 
        : 0
      const lowestMood = totalEntries > 0 
        ? Math.min(...entries.map(e => e.mood_score)) 
        : 0

      // Find most frequent activity
      const activityCounts = new Map<string, number>()
      entries.forEach(entry => {
        entry.activities.forEach(activity => {
          activityCounts.set(activity, (activityCounts.get(activity) || 0) + 1)
        })
      })
      
      const mostFrequentActivity = Array.from(activityCounts.entries())
        .sort(([,a], [,b]) => b - a)[0]?.[0] || 'None'

      setExportData({
        entries,
        statistics: {
          totalEntries,
          averageMood,
          highestMood,
          lowestMood,
          mostFrequentActivity,
          dateRange: {
            start: dateRange.start,
            end: dateRange.end
          }
        }
      })
    } catch (error) {
      console.error('Failed to fetch export data:', error)
    } finally {
      setLoading(false)
    }
  }

  const exportToCSV = () => {
    if (!exportData) return

    const headers = [
      'Date',
      'Time',
      'Mood Score',
      'Emoji',
      'Activities',
      'Notes',
      'Created At'
    ]

    const csvContent = [
      headers.join(','),
      ...exportData.entries.map(entry => [
        entry.date,
        entry.time,
        entry.mood_score,
        `"${entry.emoji}"`,
        `"${entry.activities.join('; ')}"`,
        `"${entry.notes.replace(/"/g, '""')}"`, // Escape quotes in notes
        entry.created_at
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    
    link.setAttribute('href', url)
    link.setAttribute('download', `mood_data_${dateRange.start}_to_${dateRange.end}.csv`)
    link.style.visibility = 'hidden'
    
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const exportToPDF = () => {
    if (!exportData) return

    // Create a simple HTML document for PDF generation
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Mood Tracking Report</title>
          <style>
            body { 
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
              line-height: 1.6; 
              margin: 40px;
              color: #333;
            }
            .header { 
              text-align: center; 
              border-bottom: 3px solid #4F46E5; 
              padding-bottom: 20px; 
              margin-bottom: 30px;
            }
            .header h1 { 
              color: #4F46E5; 
              margin: 0; 
              font-size: 2.5em;
            }
            .date-range { 
              color: #666; 
              font-size: 1.1em; 
              margin-top: 10px;
            }
            .statistics { 
              background: #f8fafc; 
              border-radius: 12px; 
              padding: 25px; 
              margin: 30px 0;
              border: 1px solid #e2e8f0;
            }
            .statistics h2 { 
              color: #1e293b; 
              margin-top: 0; 
              border-bottom: 2px solid #e2e8f0;
              padding-bottom: 10px;
            }
            .stat-grid { 
              display: grid; 
              grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); 
              gap: 20px; 
              margin-top: 20px;
            }
            .stat-item { 
              text-align: center; 
              background: white;
              padding: 15px;
              border-radius: 8px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            .stat-value { 
              font-size: 2em; 
              font-weight: bold; 
              color: #4F46E5; 
              display: block;
            }
            .stat-label { 
              color: #64748b; 
              font-size: 0.9em; 
              margin-top: 5px;
            }
            .entries-section h2 { 
              color: #1e293b; 
              border-bottom: 2px solid #e2e8f0;
              padding-bottom: 10px;
            }
            .entry { 
              background: #f8fafc; 
              border-radius: 8px; 
              padding: 15px; 
              margin: 15px 0;
              border-left: 4px solid #4F46E5;
            }
            .entry-header { 
              display: flex; 
              justify-content: space-between; 
              align-items: center;
              margin-bottom: 10px;
            }
            .entry-date { 
              font-weight: bold; 
              color: #1e293b;
            }
            .entry-mood { 
              font-size: 1.2em; 
              color: #4F46E5; 
              font-weight: bold;
            }
            .entry-activities { 
              margin: 8px 0; 
              font-size: 0.9em;
            }
            .activity-tag { 
              background: #e0e7ff; 
              color: #4338ca; 
              padding: 2px 8px; 
              border-radius: 4px; 
              margin-right: 5px;
              font-size: 0.8em;
            }
            .entry-notes { 
              font-style: italic; 
              color: #64748b; 
              margin-top: 8px;
              padding: 8px;
              background: white;
              border-radius: 4px;
            }
            @media print {
              .entry { page-break-inside: avoid; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🧠 Mood Tracking Report</h1>
            <div class="date-range">
              ${new Date(dateRange.start).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })} - ${new Date(dateRange.end).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </div>
          </div>

          <div class="statistics">
            <h2>📊 Summary Statistics</h2>
            <div class="stat-grid">
              <div class="stat-item">
                <span class="stat-value">${exportData.statistics.totalEntries}</span>
                <div class="stat-label">Total Entries</div>
              </div>
              <div class="stat-item">
                <span class="stat-value">${exportData.statistics.averageMood.toFixed(1)}</span>
                <div class="stat-label">Average Mood</div>
              </div>
              <div class="stat-item">
                <span class="stat-value">${exportData.statistics.highestMood}</span>
                <div class="stat-label">Highest Mood</div>
              </div>
              <div class="stat-item">
                <span class="stat-value">${exportData.statistics.lowestMood}</span>
                <div class="stat-label">Lowest Mood</div>
              </div>
              <div class="stat-item">
                <span class="stat-value" style="font-size: 1.2em;">${exportData.statistics.mostFrequentActivity}</span>
                <div class="stat-label">Most Frequent Activity</div>
              </div>
            </div>
          </div>

          <div class="entries-section">
            <h2>📝 Mood Entries (${exportData.entries.length} total)</h2>
            ${exportData.entries.map(entry => `
              <div class="entry">
                <div class="entry-header">
                  <div class="entry-date">
                    ${new Date(entry.date).toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      month: 'short', 
                      day: 'numeric' 
                    })} at ${entry.time.slice(0, 5)}
                  </div>
                  <div class="entry-mood">${entry.emoji} ${entry.mood_score}/10</div>
                </div>
                ${entry.activities.length > 0 ? `
                  <div class="entry-activities">
                    <strong>Activities:</strong> 
                    ${entry.activities.map(activity => `<span class="activity-tag">${activity}</span>`).join('')}
                  </div>
                ` : ''}
                ${entry.notes ? `
                  <div class="entry-notes">"${entry.notes}"</div>
                ` : ''}
              </div>
            `).join('')}
          </div>
        </body>
      </html>
    `

    // Create a new window for printing
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(htmlContent)
      printWindow.document.close()
      
      // Wait for content to load then print
      printWindow.onload = () => {
        printWindow.print()
        printWindow.close()
      }
    }
  }

  const handleExport = () => {
    if (exportFormat === 'csv') {
      exportToCSV()
    } else {
      exportToPDF()
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-3xl font-bold text-white mb-2">
            📊 Data Export
          </h3>
          <p className="text-cyan-300">
            Export your mood data for backup or analysis
          </p>
        </div>
      </div>

      {/* Export Configuration */}
      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
        <h4 className="text-lg font-semibold text-white mb-4">Export Settings</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Date Range */}
          <div className="space-y-4">
            <div>
              <label className="block text-cyan-300 font-medium mb-2">From Date</label>
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-cyan-500 focus:outline-none transition-colors"
              />
            </div>
            
            <div>
              <label className="block text-cyan-300 font-medium mb-2">To Date</label>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-cyan-500 focus:outline-none transition-colors"
              />
            </div>
          </div>

          {/* Format Selection */}
          <div className="space-y-4">
            <div>
              <label className="block text-cyan-300 font-medium mb-2">Export Format</label>
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="format"
                    value="csv"
                    checked={exportFormat === 'csv'}
                    onChange={(e) => setExportFormat(e.target.value as 'csv' | 'pdf')}
                    className="mr-3 text-cyan-500"
                  />
                  <div>
                    <div className="text-white font-medium">CSV File</div>
                    <div className="text-gray-400 text-sm">Raw data for analysis in Excel/Sheets</div>
                  </div>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="format"
                    value="pdf"
                    checked={exportFormat === 'pdf'}
                    onChange={(e) => setExportFormat(e.target.value as 'csv' | 'pdf')}
                    className="mr-3 text-cyan-500"
                  />
                  <div>
                    <div className="text-white font-medium">PDF Report</div>
                    <div className="text-gray-400 text-sm">Formatted report with statistics</div>
                  </div>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mt-6">
          <button
            onClick={() => setShowPreview(!showPreview)}
            disabled={loading}
            className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 px-6 rounded-xl transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Loading...' : showPreview ? 'Hide Preview' : 'Preview Data'}
          </button>
          
          <button
            onClick={handleExport}
            disabled={!exportData || loading}
            className="flex-1 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white py-3 px-6 rounded-xl transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Export {exportFormat.toUpperCase()}
          </button>
        </div>
      </div>

      {/* Preview Section */}
      <AnimatePresence>
        {showPreview && exportData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Statistics Preview */}
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
              <h4 className="text-lg font-semibold text-white mb-4">📊 Export Preview</h4>
              
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-cyan-400 mb-1">
                    {exportData.statistics.totalEntries}
                  </div>
                  <div className="text-sm text-gray-400">Entries</div>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-400 mb-1">
                    {exportData.statistics.averageMood.toFixed(1)}
                  </div>
                  <div className="text-sm text-gray-400">Avg Mood</div>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400 mb-1">
                    {exportData.statistics.highestMood}
                  </div>
                  <div className="text-sm text-gray-400">Highest</div>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-400 mb-1">
                    {exportData.statistics.lowestMood}
                  </div>
                  <div className="text-sm text-gray-400">Lowest</div>
                </div>
                
                <div className="text-center">
                  <div className="text-lg font-bold text-yellow-400 mb-1">
                    {exportData.statistics.mostFrequentActivity}
                  </div>
                  <div className="text-sm text-gray-400">Top Activity</div>
                </div>
              </div>

              <div className="text-center text-gray-300">
                <p>
                  Data from {formatDate(dateRange.start)} to {formatDate(dateRange.end)}
                </p>
              </div>
            </div>

            {/* Sample Entries */}
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
              <h4 className="text-lg font-semibold text-white mb-4">
                📝 Sample Entries ({exportData.entries.slice(0, 5).length} of {exportData.entries.length} shown)
              </h4>
              
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {exportData.entries.slice(0, 5).map((entry) => (
                  <div key={entry.id} className="bg-gray-700/50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-white font-medium">
                        {new Date(entry.date).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric' 
                        })} at {entry.time.slice(0, 5)}
                      </div>
                      <div className="text-cyan-400 font-bold">
                        {entry.emoji} {entry.mood_score}/10
                      </div>
                    </div>
                    
                    {entry.activities.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {entry.activities.map((activity) => (
                          <span
                            key={activity}
                            className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded text-xs"
                          >
                            {activity}
                          </span>
                        ))}
                      </div>
                    )}
                    
                    {entry.notes && (
                      <p className="text-gray-300 text-sm">"{entry.notes}"</p>
                    )}
                  </div>
                ))}
                
                {exportData.entries.length > 5 && (
                  <div className="text-center text-gray-400 text-sm">
                    ... and {exportData.entries.length - 5} more entries
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty State */}
      {showPreview && exportData?.entries.length === 0 && (
        <div className="text-center py-12 bg-gray-800/50 rounded-xl border border-gray-700">
          <div className="text-6xl mb-4">📊</div>
          <h4 className="text-xl font-semibold text-white mb-2">No data in selected range</h4>
          <p className="text-gray-400">Try selecting a different date range</p>
        </div>
      )}
    </div>
  )
}

