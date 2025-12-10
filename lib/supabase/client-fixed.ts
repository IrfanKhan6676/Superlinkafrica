import { createBrowserClient } from '@supabase/ssr';

// Supabase configuration with fallback to environment variables
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://hfpnnqhrapfegnffyxzg.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhmcG5ucWhyYXBmZWduZmZ5eHpnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc4NjI4NjcsImV4cCI6MjA3MzQzODg2N30.EjoIfzLYTQUyQ7SD_Bqu6_jr9fbPrrZeFqyPmW2dSUE';

// Client-side only Supabase client
export function createClient() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error('Missing Supabase URL or Anon Key');
  }
  
  return createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}
