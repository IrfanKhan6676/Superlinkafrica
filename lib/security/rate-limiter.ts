import type { NextRequest } from "next/server"

interface RateLimitConfig {
  windowMs: number
  maxRequests: number
}

const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

export function rateLimit(config: RateLimitConfig) {
  return (request: NextRequest) => {
    // Derive IP from common proxy headers (Edge runtime safe)
    const ipHeader = request.headers.get("x-forwarded-for") || ""
    const ip =
      ipHeader.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      request.headers.get("cf-connecting-ip") ||
      "unknown"
    const key = `${ip}:${request.nextUrl.pathname}`
    const now = Date.now()

    const record = rateLimitStore.get(key)

    if (!record || now > record.resetTime) {
      rateLimitStore.set(key, {
        count: 1,
        resetTime: now + config.windowMs,
      })
      return { allowed: true, remaining: config.maxRequests - 1 }
    }

    if (record.count >= config.maxRequests) {
      return { allowed: false, remaining: 0 }
    }

    record.count++
    return { allowed: true, remaining: config.maxRequests - record.count }
  }
}

export const rateLimitConfigs = {
  auth: { windowMs: 15 * 60 * 1000, maxRequests: 5 }, // 5 attempts per 15 minutes
  api: { windowMs: 60 * 1000, maxRequests: 100 }, // 100 requests per minute
  upload: { windowMs: 60 * 1000, maxRequests: 10 }, // 10 uploads per minute
}
