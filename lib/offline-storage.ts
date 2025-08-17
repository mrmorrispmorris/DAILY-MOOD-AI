'use client'

export interface OfflineMoodEntry {
  date: string
  mood_score: number
  emoji: string
  notes: string
  tags: string[]
  timestamp: number
}

export class OfflineStorage {
  private static STORAGE_KEY = 'dailymood_offline_entries'

  static saveEntry(entry: OfflineMoodEntry): void {
    if (typeof window === 'undefined') return

    const entries = this.getEntries()
    entries.push(entry)
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(entries))
  }

  static getEntries(): OfflineMoodEntry[] {
    if (typeof window === 'undefined') return []

    const stored = localStorage.getItem(this.STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  }

  static clearEntries(): void {
    if (typeof window === 'undefined') return

    localStorage.removeItem(this.STORAGE_KEY)
  }

  static hasEntries(): boolean {
    return this.getEntries().length > 0
  }
}