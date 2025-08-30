'use client'
import { useState } from 'react'
import { supabase } from '@/app/lib/supabase-client'
import { Download, FileJson, FileSpreadsheet, FileText, Calendar, BarChart3, Shield } from 'lucide-react'

export default function ExportData({ userId }: { userId: string }) {
  const [exporting, setExporting] = useState(false)
  const [exportType, setExportType] = useState<'csv' | 'json' | 'pdf'>('csv')
  const [exportRange, setExportRange] = useState<'all' | 'month' | 'quarter'>('all')


  const handleExport = async () => {
    setExporting(true)
    try {
      // Calculate date range
      let dateFilter: Date | undefined
      const now = new Date()
      
      if (exportRange === 'month') {
        dateFilter = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())
      } else if (exportRange === 'quarter') {
        dateFilter = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate())
      }

      // Fetch user data with date filtering
      let query = supabase
        .from('mood_entries')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (dateFilter) {
        query = query.gte('created_at', dateFilter.toISOString())
      }

      const { data: entries } = await query

      if (!entries || entries.length === 0) {
        alert('No data to export for the selected time range.')
        return
      }

      // Get user profile for export metadata
      const { data: profile } = await supabase.auth.getUser()

      switch (exportType) {
        case 'csv':
          await exportAsCSV(entries, profile?.user?.email || 'user')
          break
        case 'json':
          await exportAsJSON(entries, profile?.user?.email || 'user')
          break
        case 'pdf':
          await exportAsPDF(entries, profile?.user?.email || 'user')
          break
      }
    } catch (error) {
      console.error('Export failed:', error)
      alert('Export failed. Please try again.')
    } finally {
      setExporting(false)
    }
  }

  const exportAsCSV = async (data: any[], userEmail: string) => {
    const headers = [
      'Date', 'Time', 'Mood Score', 'Activities', 'Weather', 'Notes', 'Day of Week'
    ]
    
    const rows = data.map(entry => {
      const date = new Date(entry.created_at)
      return [
        date.toLocaleDateString(),
        date.toLocaleTimeString(),
        entry.mood_score,
        entry.activities?.join('; ') || '',
        entry.weather || '',
        entry.notes || '',
        date.toLocaleDateString('en-US', { weekday: 'long' })
      ]
    })

    // Add metadata header
    const csvContent = [
      `# DailyMood AI Export - ${userEmail}`,
      `# Generated on: ${new Date().toLocaleDateString()}`,
      `# Total entries: ${data.length}`,
      `# Date range: ${exportRange}`,
      '',
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    downloadFile(csvContent, `dailymood-export-${getDateString()}.csv`, 'text/csv')
  }

  const exportAsJSON = async (data: any[], userEmail: string) => {
    const exportData = {
      metadata: {
        user: userEmail,
        exportDate: new Date().toISOString(),
        totalEntries: data.length,
        dateRange: exportRange,
        version: '1.0'
      },
      entries: data.map(entry => ({
        date: entry.created_at,
        moodScore: entry.mood_score,
        activities: entry.activities || [],
        weather: entry.weather,
        notes: entry.notes,
        dayOfWeek: new Date(entry.created_at).toLocaleDateString('en-US', { weekday: 'long' }),
        timestamp: new Date(entry.created_at).getTime()
      })),
      statistics: calculateExportStats(data)
    }

    const json = JSON.stringify(exportData, null, 2)
    downloadFile(json, `dailymood-export-${getDateString()}.json`, 'application/json')
  }

  const exportAsPDF = async (data: any[], userEmail: string) => {
    const stats = calculateExportStats(data)
    
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <title>DailyMood AI - Mood Report</title>
        <meta charset="UTF-8">
        <style>
            body { 
                font-family: Arial, sans-serif; 
                line-height: 1.6; 
                color: #333;
                max-width: 800px;
                margin: 0 auto;
                padding: 20px;
            }
            .header { 
                background: linear-gradient(135deg, #9333EA, #EC4899);
                color: white;
                padding: 20px;
                border-radius: 10px;
                text-align: center;
                margin-bottom: 30px;
            }
            .stats-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 20px;
                margin-bottom: 30px;
            }
            .stat-card {
                background: #f8fafc;
                padding: 15px;
                border-radius: 8px;
                border-left: 4px solid #9333EA;
            }
            .stat-value {
                font-size: 24px;
                font-weight: bold;
                color: #9333EA;
            }
            .stat-label {
                color: #64748b;
                font-size: 12px;
                text-transform: uppercase;
                margin-top: 4px;
            }
            table { 
                width: 100%; 
                border-collapse: collapse; 
                margin-top: 20px;
                background: white;
            }
            th, td { 
                padding: 12px 8px; 
                text-align: left; 
                border-bottom: 1px solid #e2e8f0; 
                font-size: 11px;
            }
            th { 
                background: #f8fafc; 
                font-weight: 600;
                color: #475569;
                text-transform: uppercase;
            }
            tr:hover { background: #f8fafc; }
            .mood-high { color: #059669; font-weight: bold; }
            .mood-medium { color: #d97706; font-weight: bold; }
            .mood-low { color: #dc2626; font-weight: bold; }
            .footer {
                margin-top: 40px;
                padding-top: 20px;
                border-top: 1px solid #e2e8f0;
                text-align: center;
                color: #64748b;
                font-size: 12px;
            }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>🧠 DailyMood AI - Personal Mood Report</h1>
            <p>Generated for: ${userEmail}</p>
            <p>Date: ${new Date().toLocaleDateString()} | Entries: ${data.length}</p>
        </div>

        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-value">${stats.averageMood.toFixed(1)}/10</div>
                <div class="stat-label">Average Mood</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${stats.highMoodDays}</div>
                <div class="stat-label">Great Days (7+)</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${stats.lowMoodDays}</div>
                <div class="stat-label">Challenging Days (≤4)</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${stats.mostFrequentActivity || 'None'}</div>
                <div class="stat-label">Top Activity</div>
            </div>
        </div>

        <h2>📊 Detailed Mood History</h2>
        <table>
            <thead>
                <tr>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Mood</th>
                    <th>Weather</th>
                    <th>Activities</th>
                    <th>Notes</th>
                </tr>
            </thead>
            <tbody>
                ${data.map(entry => {
                  const date = new Date(entry.created_at)
                  const moodClass = entry.mood_score >= 7 ? 'mood-high' : 
                                   entry.mood_score >= 5 ? 'mood-medium' : 'mood-low'
                  return `
                    <tr>
                        <td>${date.toLocaleDateString()}</td>
                        <td>${date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</td>
                        <td class="${moodClass}">${entry.mood_score}/10</td>
                        <td>${entry.weather || '-'}</td>
                        <td>${entry.activities?.join(', ') || '-'}</td>
                        <td>${(entry.notes || '').substring(0, 50)}${entry.notes?.length > 50 ? '...' : ''}</td>
                    </tr>
                  `
                }).join('')}
            </tbody>
        </table>

        <div class="footer">
            <p><strong>DailyMood AI</strong> - AI-Powered Mood Analytics</p>
            <p>This report contains ${data.length} mood entries from your personal tracking data.</p>
            <p>For more insights and predictions, visit your dashboard at DailyMood AI.</p>
        </div>
    </body>
    </html>
    `

    // Open in new window for printing
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(html)
      printWindow.document.close()
      printWindow.focus()
      
      // Trigger print dialog after content loads
      setTimeout(() => {
        printWindow.print()
      }, 500)
    }
  }

  const calculateExportStats = (data: any[]) => {
    if (!data.length) return { averageMood: 0, highMoodDays: 0, lowMoodDays: 0, mostFrequentActivity: null }

    const averageMood = data.reduce((sum, entry) => sum + entry.mood_score, 0) / data.length
    const highMoodDays = data.filter(entry => entry.mood_score >= 7).length
    const lowMoodDays = data.filter(entry => entry.mood_score <= 4).length

    // Find most frequent activity
    const activityCount: Record<string, number> = {}
    data.forEach(entry => {
      if (entry.activities) {
        entry.activities.forEach((activity: string) => {
          activityCount[activity] = (activityCount[activity] || 0) + 1
        })
      }
    })

    const mostFrequentActivity = Object.entries(activityCount)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || null

    return { averageMood, highMoodDays, lowMoodDays, mostFrequentActivity }
  }

  const downloadFile = (content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  const getDateString = () => {
    return new Date().toISOString().split('T')[0]
  }

  const getRangeLabel = () => {
    switch (exportRange) {
      case 'month': return 'Last 30 days'
      case 'quarter': return 'Last 3 months'
      default: return 'All time'
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6">
      <div className="flex items-center gap-2 mb-6">
        <Download className="w-5 h-5 text-purple-600" />
        <h3 className="text-lg font-semibold">Export Your Data</h3>
        <span className="ml-auto bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs font-medium">
          Premium Feature
        </span>
      </div>

      {/* Export Range Selection */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Date Range</h4>
        <div className="grid grid-cols-3 gap-2">
          {[
            { key: 'month', label: 'Last Month', icon: Calendar },
            { key: 'quarter', label: 'Last 3 Months', icon: BarChart3 },
            { key: 'all', label: 'All Data', icon: Shield }
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setExportRange(key as any)}
              className={`flex flex-col items-center p-3 rounded-lg border-2 transition-all ${
                exportRange === key
                  ? 'border-purple-500 bg-purple-50 text-purple-700'
                  : 'border-gray-200 hover:border-gray-300 text-gray-600'
              }`}
            >
              <Icon className="w-5 h-5 mb-1" />
              <span className="text-xs font-medium">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Format Selection */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Export Format</h4>
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => setExportType('csv')}
            className={`flex flex-col items-center p-4 rounded-lg border-2 transition-all ${
              exportType === 'csv'
                ? 'border-green-500 bg-green-50 text-green-700'
                : 'border-gray-200 hover:border-gray-300 text-gray-600'
            }`}
          >
            <FileSpreadsheet className="w-6 h-6 mb-2" />
            <span className="font-medium">CSV</span>
            <span className="text-xs opacity-75">Excel compatible</span>
          </button>

          <button
            onClick={() => setExportType('json')}
            className={`flex flex-col items-center p-4 rounded-lg border-2 transition-all ${
              exportType === 'json'
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-200 hover:border-gray-300 text-gray-600'
            }`}
          >
            <FileJson className="w-6 h-6 mb-2" />
            <span className="font-medium">JSON</span>
            <span className="text-xs opacity-75">With statistics</span>
          </button>

          <button
            onClick={() => setExportType('pdf')}
            className={`flex flex-col items-center p-4 rounded-lg border-2 transition-all ${
              exportType === 'pdf'
                ? 'border-red-500 bg-red-50 text-red-700'
                : 'border-gray-200 hover:border-gray-300 text-gray-600'
            }`}
          >
            <FileText className="w-6 h-6 mb-2" />
            <span className="font-medium">PDF</span>
            <span className="text-xs opacity-75">Printable report</span>
          </button>
        </div>
      </div>

      {/* Export Button */}
      <button
        onClick={handleExport}
        disabled={exporting}
        className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {exporting ? (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Exporting {getRangeLabel()}...
          </>
        ) : (
          <>
            <Download className="w-5 h-5" />
            Export {getRangeLabel()} as {exportType.toUpperCase()}
          </>
        )}
      </button>

      {/* Feature Description */}
      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
        <h4 className="text-sm font-semibold text-gray-800 mb-2">Export Features:</h4>
        <ul className="text-xs text-gray-600 space-y-1">
          <li>• <strong>CSV:</strong> Import into Excel, Google Sheets, or any data tool</li>
          <li>• <strong>JSON:</strong> Complete data with metadata and statistics</li>
          <li>• <strong>PDF:</strong> Beautiful printable report with insights</li>
          <li>• <strong>GDPR Compliant:</strong> Full data portability and ownership</li>
        </ul>
      </div>
    </div>
  )
}

