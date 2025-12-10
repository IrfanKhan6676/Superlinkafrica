import { createBrowserClient } from '@supabase/ssr';

<<<<<<< HEAD
// Read Supabase configuration from environment variables
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

// Client-side only Supabase client
export function createClient() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY in .env');
  }
  
  return createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY);
=======
// Hardcoded Supabase configuration
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://hfpnnqhrapfegnffyxzg.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhmcG5ucWhyYXBmZWduZmZ5eHpnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc4NjI4NjcsImV4cCI6MjA3MzQzODg2N30.EjoIfzLYTQUyQ7SD_Bqu6_jr9fbPrrZeFqyPmW2dSUE';

// This is a client-side only client
export function createClient() {
  return createBrowserClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
  );
>>>>>>> 0c4e38a90ff868b906bd0973817ce070e17ecf55
}
