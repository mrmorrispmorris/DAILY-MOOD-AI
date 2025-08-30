import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = 'https://ctmgjkwctnndlpkpxvqv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN0bWdqa3djdG5uZGxwa3B4dnF2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU1MzY0ODksImV4cCI6MjA1MTExMjQ4OX0.pP1hb_BAPfKxGa7xvIGxrjJJjIqykKGKF3weMJo6fKU';

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Database Types
export interface MoodEntry {
  id: string;
  user_id: string;
  date: string;
  mood_score: number;
  emoji: string;
  notes?: string;
  tags?: string[];
  created_at: string;
}

export interface UserProfile {
  id: string;
  email: string;
  subscription_level: 'free' | 'premium';
  created_at: string;
  updated_at: string;
}

// Database Operations
export class DatabaseService {
  // Mood Operations
  static async createMoodEntry(entry: Omit<MoodEntry, 'id' | 'created_at' | 'user_id'>): Promise<MoodEntry | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('mood_entries')
      .insert({
        ...entry,
        user_id: user.id,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async getMoodEntries(limit = 30): Promise<MoodEntry[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('mood_entries')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  }

  static async getMoodStats(): Promise<{
    averageMood: number;
    totalEntries: number;
    streak: number;
  }> {
    const entries = await this.getMoodEntries(100);
    
    const averageMood = entries.length > 0 
      ? entries.reduce((sum, entry) => sum + entry.mood_score, 0) / entries.length 
      : 0;

    // Calculate streak (consecutive days with entries)
    const today = new Date().toISOString().split('T')[0];
    const sortedEntries = entries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    let streak = 0;
    let currentDate = new Date();
    
    for (const entry of sortedEntries) {
      const entryDate = new Date(entry.date);
      const daysDiff = Math.floor((currentDate.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === streak) {
        streak++;
        currentDate = new Date(entryDate.getTime() - 24 * 60 * 60 * 1000);
      } else if (daysDiff > streak + 1) {
        break;
      }
    }

    return {
      averageMood: Math.round(averageMood * 10) / 10,
      totalEntries: entries.length,
      streak,
    };
  }

  // User Operations
  static async getUserProfile(): Promise<UserProfile | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) {
      // User might not exist in users table, create them
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert({
          id: user.id,
          email: user.email || '',
          subscription_level: 'free',
        })
        .select()
        .single();

      if (createError) throw createError;
      return newUser;
    }

    return data;
  }

  // AI Insights
  static async getAIInsights(moods: MoodEntry[]): Promise<{ insight: string }> {
    if (moods.length < 3) {
      return { insight: 'Track at least 3 moods to unlock AI insights!' };
    }

    try {
      const response = await fetch('https://project-iota-gray.vercel.app/api/ai-insights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
        body: JSON.stringify({ moods }),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('AI Insights error:', error);
      return { insight: 'Unable to generate insights at this time. Please try again later.' };
    }
  }
}


