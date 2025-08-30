import React, { createContext, useContext } from 'react';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Use the same Supabase configuration as web app
const supabaseUrl = 'https://ctmgjkwctnndlpkpxvqv.supabase.co'; // From existing web app
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN0bWdqa3djdG5uZGxwa3B4dnF2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjMzNTUxOTYsImV4cCI6MjAzODkzMTE5Nn0.cllvpOrgzJREinBRCkMd_UbzqJhFYgm0xo-fZ_OZNyQ'; // From existing web app

// Create Supabase client with React Native specific configuration
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false, // React Native doesn't use URLs for auth
  },
});

const SupabaseContext = createContext(supabase);

export const useSupabase = () => {
  const context = useContext(SupabaseContext);
  if (!context) {
    throw new Error('useSupabase must be used within a SupabaseProvider');
  }
  return context;
};

export const SupabaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <SupabaseContext.Provider value={supabase}>
      {children}
    </SupabaseContext.Provider>
  );
};
