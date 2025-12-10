import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { createServerClient } from "@/lib/supabase/server"
import { NextResponse, type NextRequest } from "next/server"

// Read Supabase configuration from environment
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Check if Supabase is configured
export const isSupabaseConfigured = 
  SUPABASE_URL.length > 0 && 
  SUPABASE_ANON_KEY.length > 0;

export async function updateSession(request: NextRequest) {
  // If Supabase is not configured, just continue without auth
  if (!isSupabaseConfigured) {
    return NextResponse.next({
      request,
    })
  }

  const res = NextResponse.next()

  // Create a Supabase client configured to use cookies
  const supabase = await createServerClient();

  // Note: Auth code exchange is handled in app/auth/callback/route.ts
  // We no longer exchange codes or redirect from middleware to avoid conflicts.

  // Refresh session if expired - required for Server Components
  await supabase.auth.getSession()

  // Protected routes - only enforce auth on specific sections
  const pathname = request.nextUrl.pathname
  const isAuthRoute =
    pathname.startsWith("/auth/login") || pathname.startsWith("/auth/sign-up") || pathname === "/auth/callback"

  // Define the route prefixes that should require authentication
  const protectedPrefixes = ["/account", "/orders", "/seller", "/admin", "/checkout", "/buyer", "/both"]
  const isProtectedRoute = protectedPrefixes.some((prefix) => pathname.startsWith(prefix))

  if (isProtectedRoute && !isAuthRoute) {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      const redirectUrl = new URL("/auth/login", request.url)
      // Preserve the intended destination so we can redirect after login
      const intended = pathname + (request.nextUrl.search || "")
      redirectUrl.searchParams.set("next", intended)
      const response = NextResponse.redirect(redirectUrl)
      // Also store intended path in a cookie for flows that go through /auth/callback
      response.cookies.set("next-url", intended, {
        path: "/",
        httpOnly: true,
        sameSite: "lax",
      })
      return response
    }
  }

  return res
}

