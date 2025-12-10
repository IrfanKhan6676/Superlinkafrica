'use server';

// Re-export server-only utilities
// This file should only be imported in Server Components or API routes

import { createServerClient as createSupabaseServerClient, createAdminClient as createAdminServerClient } from './server-utils';

// This is a server-side only client
export const createWritableServerClient = async () => {
  return await createSupabaseServerClient();
};

// This is a server-side only admin client
export const createAdminClient = async () => {
  return await createAdminServerClient();
};

// Helper to check if Supabase is configured
export const isSupabaseConfigured = async () => {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
};

// Re-export types
export type { Database } from '@/types/supabase';

// Create and export the main server client as an async function
export const createServerClient = async () => {
  return await createSupabaseServerClient();
};
