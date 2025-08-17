import { Database } from '@/types/database'

type MoodEntry = Database['public']['Tables']['mood_entries']['Row']

export class CSVExportService {
  static generateCSV(moodEntries: MoodEntry[]): string {
    if (moodEntries.length === 0) {
      return 'No data to export'
    }

    // CSV headers
    const headers = [
      'Date',
      'Mood Score',
      'Emoji',
      'Notes',
      'Tags',
      'Created At'
    ]

    // Convert mood entries to CSV rows
    const rows = moodEntries.map(entry => [
      entry.date,
      entry.mood_score.toString(),
      entry.emoji,
      `"${(entry.notes || '').replace(/"/g, '""')}"`, // Escape quotes in notes
      `"${(entry.tags || []).join(', ')}"`,
      new Date(entry.created_at).toISOString()
    ])

    // Combine headers and rows
    const csvContent = [headers, ...rows]
      .map(row => row.join(','))
      .join('\n')

    return csvContent
  }

  static downloadCSV(csvContent: string, filename: string = 'mood-data.csv') {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', filename)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    }
  }

  static async exportUserMoodData(moodEntries: MoodEntry[]) {
    try {
      const csvContent = this.generateCSV(moodEntries)
      const timestamp = new Date().toISOString().split('T')[0]
      const filename = `dailymood-export-${timestamp}.csv`
      
      this.downloadCSV(csvContent, filename)
      return { success: true, filename }
    } catch (error) {
      console.error('CSV export error:', error)
      return { success: false, error: 'Failed to export data' }
    }
  }
}