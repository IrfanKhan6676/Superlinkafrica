'use server';

import { createServerClient as createSupabaseServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { Database } from '@/types/supabase';

// This file should only be imported in Server Components or API routes
// All functions in this file are server actions and must be async

// Supabase configuration from environment variables
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY as string;

interface CookieOptions {
  name: string;
  value: string;
  httpOnly?: boolean;
  path?: string;
  secure?: boolean;
  sameSite?: 'lax' | 'strict' | 'none';
  maxAge?: number;
  domain?: string;
  expires?: Date;
  [key: string]: any; // Allow additional properties
};

// Helper function to handle cookies in a server component
// ...existing code...
// ...existing code...
function getCookieMethods() {
  return {
    get: async (name: string): Promise<string | undefined> => {
      try {
        const cookieStore = await cookies(); // await here — cookies() returns a Promise in your runtime
        cookieStore.getAll();
        const entry = cookieStore.get(name);
        const raw = entry?.value;
        if (!raw) return undefined;

        if (typeof raw === "string" && raw.startsWith("base64-")) {
          try {
            const b64 = raw.slice("base64-".length);
            return Buffer.from(b64, "base64").toString("utf8");
          } catch (err) {
            console.error("[cookie decode error]", name, err);
            return raw;
          }
        }

        return raw;
      } catch (err) {
        console.error("[cookie get error]", name, err);
        return undefined;
      }
    },

    set: async (
      name: string,
      value: string | object,
      options: Omit<CookieOptions, "name" | "value"> = {}
    ): Promise<boolean> => {
      try {
        const cookieStore = await cookies();
        const valueToStore = typeof value === "string" ? value : JSON.stringify(value);

        cookieStore.set({
          name,
          value: valueToStore,
          path: "/",
          ...options,
        });

        return true;
      } catch (error) {
        console.error("Error setting cookie:", error);
        return false;
      }
    },

    remove: async (name: string, options: Omit<CookieOptions, "name" | "value"> = {}): Promise<boolean> => {
      try {
        const cookieStore = await cookies();
        cookieStore.set({
          name,
          value: "",
          path: "/",
          ...options,
          maxAge: 0,
        });
        return true;
      } catch (error) {
        console.error("Error removing cookie:", error);
        return false;
      }
    },
  };
}
// ...existing code...
// ...existing code...

// Helper function to serialize cookie options
function serializeCookie(name: string, value: string, options: Omit<CookieOptions, 'name' | 'value'> = {}): string {
  const parts: string[] = [
    `${encodeURIComponent(name)}=${encodeURIComponent(value)}`,
    `Path=${options.path || '/'}`,
  ];

  if (options.domain) parts.push(`Domain=${options.domain}`);
  if (options.maxAge !== undefined) parts.push(`Max-Age=${options.maxAge}`);
  if (options.expires) parts.push(`Expires=${options.expires.toUTCString()}`);
  if (options.httpOnly) parts.push('HttpOnly');
  if (options.secure) parts.push('Secure');
  if (options.sameSite) parts.push(`SameSite=${options.sameSite}`);

  return parts.join('; ');
}

export async function createServerClient() {
  const cookieMethods = getCookieMethods();
  
  return createSupabaseServerClient<Database>(
    SUPABASE_URL,
    SUPABASE_ANON_KEY,
    {
      cookies: {
        get: async (name: string) => {
          return await cookieMethods.get(name);
        },
        set: async (name: string, value: string, options: any) => {
          await cookieMethods.set(name, value, options);
        },
        remove: async (name: string, options: any) => {
          await cookieMethods.remove(name, options);
        },
      },
    }
  );
}

export async function createAdminClient() {
  const cookieMethods = getCookieMethods();
  
  return createSupabaseServerClient<Database>(
    SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY,
    {
      cookies: {
        get: async (name: string) => {
          return await cookieMethods.get(name);
        },
        set: async (name: string, value: string, options: any) => {
          await cookieMethods.set(name, value, options);
        },
        remove: async (name: string, options: any) => {
          await cookieMethods.remove(name, options);
        },
      },
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );
}
