import { redis } from "./redis-client"
import { logger } from "@/lib/observability/logger"

export interface CacheOptions {
  ttl?: number // Time to live in seconds
  tags?: string[] // Cache tags for invalidation
  revalidate?: boolean // Enable background revalidation
}

export class CacheManager {
  private static instance: CacheManager

  static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager()
    }
    return CacheManager.instance
  }

  async get<T>(key: string): Promise<T | null> {
    const startTime = Date.now()

    try {
      const cached = await redis.get<T>(key)

      logger.debug("Cache operation", {
        operation: "GET",
        key,
        hit: cached !== null,
        responseTime: Date.now() - startTime,
      })

      return cached
    } catch (error) {
      logger.error("Cache GET error", error as Error, { key })
      return null
    }
  }

  async set<T>(key: string, value: T, options: CacheOptions = {}): Promise<void> {
    const { ttl = 3600, tags = [] } = options

    try {
      await redis.set(key, value, ttl)

      // Store cache tags for invalidation
      if (tags.length > 0) {
        for (const tag of tags) {
          await redis.set(`tag:${tag}:${key}`, true, ttl)
        }
      }

      logger.debug("Cache SET operation", { key, ttl, tags })
    } catch (error) {
      logger.error("Cache SET error", error as Error, { key })
    }
  }

  async invalidateByTag(tag: string): Promise<void> {
    try {
      await redis.invalidatePattern(`tag:${tag}:*`)
      logger.info(`Invalidated cache for tag: ${tag}`)
    } catch (error) {
      logger.error("Cache tag invalidation error", error as Error, { tag })
    }
  }

  async invalidateByPattern(pattern: string): Promise<void> {
    try {
      await redis.invalidatePattern(pattern)
      logger.info(`Invalidated cache for pattern: ${pattern}`)
    } catch (error) {
      logger.error("Cache pattern invalidation error", error as Error, { pattern })
    }
  }

  // Cache wrapper for functions
  async wrap<T>(key: string, fn: () => Promise<T>, options: CacheOptions = {}): Promise<T> {
    const cached = await this.get<T>(key)

    if (cached !== null) {
      return cached
    }

    const result = await fn()
    await this.set(key, result, options)

    return result
  }
}

export const cache = CacheManager.getInstance()
