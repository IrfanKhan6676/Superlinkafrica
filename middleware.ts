import { updateSession } from "@/lib/supabase/middleware"
import { rateLimit, rateLimitConfigs } from "@/lib/security/rate-limiter"
import { validateCSRFToken } from "@/lib/security/csrf-protection"
import { createServerClient } from "@/lib/supabase/server"
import type { NextRequest, NextResponse } from "next/server"
import { logger } from "@/lib/observability/logger"
const { match } = require('path-to-regexp')

// Define public routes that don't require authentication
const publicRoutes = [
  '/',
  '/auth/(.*)',
  '/api/auth/(.*)',
  '/_next/(.*)',
  '/favicon.ico',
  '/images/(.*)',
  '/assets/(.*)',
  '/terms',
  '/privacy',
  '/about',
  '/contact',
  '/api/health',
  '/auth/verify-email',
  '/auth/reset-password',
  '/auth/update-password',
]

// Define role-based route prefixes with required permissions
const roleBasedRoutes = {
  admin: {
    routes: ['/admin', '/api/admin'],
    // Admin has all permissions
    permissions: ['read', 'write', 'delete', 'manage_users', 'manage_products']
  },
  seller: {
    routes: ['/sell', '/seller/dashboard', '/seller/products', '/api/seller', '/dashboard/products', '/dashboard/orders'],
    permissions: ['read', 'write', 'manage_own_products', 'view_orders']
  },
  buyer: {
    routes: ['/buyer', '/api/buyer', '/cart', '/checkout', '/orders'],
    permissions: ['read', 'purchase', 'view_own_orders']
  },
  // Default role with minimal permissions
  user: {
    routes: ['/dashboard', '/profile'],
    permissions: ['read']
  }
}

// Check if the current path requires authentication
const isPublicRoute = (path: string): boolean => {
  // Check if path matches any public route pattern
  return publicRoutes.some(route => {
    // Convert route pattern to regex
    const regex = new RegExp(`^${route.replace(/\*/g, '.*')}$`)
    return regex.test(path)
  }) || 
  // Allow all API routes for now (they should handle auth internally)
  path.startsWith('/api/') ||
  // Allow static files
  path.includes('.') && !path.endsWith('.html')
}

// Check if user has access to the requested route based on their role and permissions
const hasRouteAccess = async (userRole: string | null, path: string, request: NextRequest): Promise<boolean> => {
  // If no role, only public routes are accessible
  if (!userRole) return false
  
  // Admin has access to everything
  if (userRole === 'admin') return true
  
  // Get role configuration
  const roleConfig = roleBasedRoutes[userRole as keyof typeof roleBasedRoutes] || roleBasedRoutes.user
  
  // Check if the path matches any of the allowed routes for the role
  const hasMatchingRoute = roleConfig.routes.some(route => {
    // Use path-to-regexp for more accurate route matching
    const matcher = match(route, { decode: decodeURIComponent })
    return matcher(path)
  })
  
  // If no matching route, check for API endpoints
  if (!hasMatchingRoute && path.startsWith('/api/')) {
    // Extract the API endpoint and method for permission checking
    const endpoint = path.replace(/^\/api\//, '').split('?')[0].split('/')[0]
    const method = request.method.toLowerCase()
    
    // Map HTTP methods to CRUD operations
    const methodToPermission: Record<string, string> = {
      'get': 'read',
      'post': 'create',
      'put': 'update',
      'delete': 'delete',
      'patch': 'update'
    }
    
    const requiredPermission = methodToPermission[method] || 'read'
    
    // Check if user has the required permission
    return roleConfig.permissions.includes(requiredPermission) || 
           roleConfig.permissions.includes('*')
  }
  
  return hasMatchingRoute
}

// Check if email is verified
const isEmailVerified = async (userId: string, supabase: any): Promise<boolean> => {
  if (!userId) return false
  
  const { data: user, error } = await supabase
    .from('users')
    .select('email_confirmed_at')
    .eq('id', userId)
    .single()
    
  if (error || !user) return false
  
  return !!user.email_confirmed_at
}

export async function middleware(request: NextRequest) {
  const startTime = Date.now()
  const { pathname } = request.nextUrl
  const isPublic = isPublicRoute(pathname)

  if (isPublic) {
    return await updateSession(request)
  }

  try {
    const response = await updateSession(request);
    // Create Supabase client
    const supabase = await createServerClient();
    
    // Get the session
    const { data: { session }, error } = await supabase.auth.getSession();
    
    // If no session and not a public route, redirect to login
    console.log(session)
    console.log("Hi")
    if (error || !session) {
      console.log('No valid session found, redirecting to login');
      const loginUrl = new URL('/auth/login', request.url);
      // Add redirect URL if needed
      if (pathname !== '/auth/login') {
        loginUrl.searchParams.set('redirectedFrom', pathname);
      }
      return Response.redirect(loginUrl);
    }
    
    
    // Check if user has access to the requested route
    const userRole = session.user?.user_metadata?.role || 'buyer'
    const hasAccess = await hasRouteAccess(userRole, pathname, request)
    // If user doesn't have access, redirect to appropriate page
    console.log(hasAccess)
    if (!hasAccess) {
      // If trying to access admin routes without admin role
      if (pathname.startsWith('/admin')) {
        return Response.redirect(new URL('/unauthorized', request.url))
      }
      
      // Default redirect for other unauthorized access
      console.log("Khannnnnnnnnnnnn8787887")
      return Response.redirect(new URL('/', request.url))
    }
    
    // Apply rate limiting based on route
    // Derive client IP from common proxy headers (Edge runtime safe)
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      request.headers.get("cf-connecting-ip") ||
      "unknown"
      
    let rateLimitConfig = rateLimitConfigs.api

    if (pathname.startsWith("/auth/")) {
      rateLimitConfig = rateLimitConfigs.auth
    } else if (pathname.startsWith("/api/upload")) {
      rateLimitConfig = rateLimitConfigs.upload
    } else if (pathname.startsWith("/admin")) {
      // Stricter rate limits for admin routes
      rateLimitConfig = {
        ...rateLimitConfigs.api,
        maxRequests: 30, // Lower limit for admin routes
        windowMs: 60 * 1000, // 1 minute in milliseconds
        timeWindow: '1m' // Keep for backward compatibility
      } as any // Type assertion to handle the extended properties
    }

    // Only apply rate limiting to state-changing requests. Skip GET/HEAD to avoid blocking page loads.
    let rateLimitHeaders: { limit?: string; remaining?: string } = {}
    if (request.method !== "GET" && request.method !== "HEAD") {
      const rateLimitResult = rateLimit(rateLimitConfig)(request)

      if (!rateLimitResult.allowed) {
        logger.warn("Rate limit exceeded", {
          ip,
          pathname,
          userAgent: request.headers.get("user-agent"),
        })

        return new Response("Too Many Requests", {
          status: 429,
          headers: {
            "Retry-After": "60",
            "X-RateLimit-Limit": rateLimitConfig.maxRequests.toString(),
            "X-RateLimit-Remaining": "0",
          },
        })
      }

      rateLimitHeaders = {
        limit: rateLimitConfig.maxRequests.toString(),
        remaining: rateLimitResult.remaining.toString(),
      }
    }

    // CSRF protection for state-changing operations
    // Skip CSRF validation for:
    // - Auth routes (/auth/*) including sign-up, login, callback
    // - Next.js Server Actions (identified by the Next-Action header)
    // Rationale: Server Actions are protected by React/Next internal mechanisms and use POSTs
    // to an internal endpoint; our generic CSRF check was blocking these legitimate requests.
    const isAuthRoute = pathname.startsWith("/auth/")
    const isServerAction = request.headers.has("next-action") || request.headers.has("Next-Action")

    if (request.method !== "GET" && request.method !== "HEAD") {
      if (!isAuthRoute && !isServerAction) {
        const sessionToken = request.cookies.get("session")?.value
        console.log(sessionToken)
        if (!(await validateCSRFToken(request, sessionToken))) {
          logger.warn("CSRF token validation failed", {
            pathname,
            method: request.method,
          })

          return new Response("Forbidden", { status: 403 })
        }
      }
    }

    // Add security headers
    const nonce = Buffer.from(crypto.randomUUID()).toString('base64')
    const csp = [
      "default-src 'self'",
      "script-src 'self' 'nonce-'" + nonce + " 'strict-dynamic'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self' data:",
      "connect-src 'self' https://*.supabase.co",
      "frame-ancestors 'none'",
      "form-action 'self'",
      "base-uri 'self'"
    ].join('; ')
    
    response.headers.set("X-Frame-Options", "DENY")
    response.headers.set("X-Content-Type-Options", "nosniff")
    response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin")
    response.headers.set("X-XSS-Protection", "1; mode=block")
    response.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload")
    response.headers.set("Content-Security-Policy", csp)
    response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()")
    
    // Add nonce to response headers for pages to use
    response.headers.set("X-Nonce", nonce)

    // Add rate limit headers
    if (rateLimitHeaders.limit) response.headers.set("X-RateLimit-Limit", rateLimitHeaders.limit)
    if (rateLimitHeaders.remaining) response.headers.set("X-RateLimit-Remaining", rateLimitHeaders.remaining)

    // Log request metrics
    logger.info("Request processed", {
      method: request.method,
      pathname,
      responseTime: Date.now() - startTime,
      status: response.status,
    })
    console.log(response)
    console.log(response.url)
    return response
  } catch (error) {
    logger.error("Middleware error", error as Error, {
      pathname: request.nextUrl.pathname,
      method: request.method,
    })

    return new Response("Internal Server Error", { status: 500 })
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api/auth (handled by supabase)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\.(?:svg|png|jpg|jpeg|gif|webp|css|js|woff|woff2|ttf|eot)$).*)',
  ],
  // Ensure middleware runs for all routes, including API routes
  runtime: 'experimental-edge',
  unstable_allowDynamic: [
    // Allow dynamic requires for Next.js internals
    '/node_modules/next/dist/compiled/**/*',
    // Allow dynamic requires for your own code
    '/lib/**/*',
    '/app/**/*',
  ],
}
