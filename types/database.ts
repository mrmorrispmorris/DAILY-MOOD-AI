export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          subscription_level: 'free' | 'premium'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          subscription_level?: 'free' | 'premium'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          subscription_level?: 'free' | 'premium'
          created_at?: string
          updated_at?: string
        }
      }
      mood_entries: {
        Row: {
          id: string
          user_id: string
          mood_score: number
          mood_notes: string
          activities: string[]
          weather: string
          sleep_hours: number | null
          stress_level: number
          energy_level: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string
          mood_score: number
          mood_notes?: string
          activities?: string[]
          weather?: string
          sleep_hours?: number | null
          stress_level?: number
          energy_level?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          mood_score?: number
          mood_notes?: string
          activities?: string[]
          weather?: string
          sleep_hours?: number | null
          stress_level?: number
          energy_level?: number
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type User = Database['public']['Tables']['users']['Row']
export type MoodEntry = Database['public']['Tables']['mood_entries']['Row']
export type MoodEntryInsert = Database['public']['Tables']['mood_entries']['Insert']
export type MoodEntryUpdate = Database['public']['Tables']['mood_entries']['Update']