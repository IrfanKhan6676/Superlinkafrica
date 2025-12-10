import Redis from "ioredis"
import { logger } from "@/lib/observability/logger"

class RedisClient {
  private static instance: RedisClient
  private client: Redis | null = null

  private constructor() {
    this.connect()
  }

  static getInstance(): RedisClient {
    if (!RedisClient.instance) {
      RedisClient.instance = new RedisClient()
    }
    return RedisClient.instance
  }

  private connect() {
    try {
      // Hardcoded Redis URL - replace with your actual Redis URL
      const redisUrl = 'redis://localhost:6379';

      if (!redisUrl) {
        logger.warn("Redis URL not configured, caching disabled");
        return;
      }

      this.client = new Redis(redisUrl, {
        // Standard Redis connection options
        connectTimeout: 10000,
        maxRetriesPerRequest: 3,
        enableReadyCheck: true,
        keepAlive: 1000,
        // Add any additional Redis options as needed
      })

      this.client.on("connect", () => {
        logger.info("Redis connected successfully")
      })

      this.client.on("error", (error) => {
        logger.error("Redis connection error", error)
      })
    } catch (error) {
      logger.error("Failed to initialize Redis client", error as Error)
    }
  }

  async get<T>(key: string): Promise<T | null> {
    if (!this.client) return null

    try {
      const value = await this.client.get(key)
      return value ? JSON.parse(value) : null
    } catch (error) {
      logger.error(`Redis GET error for key ${key}`, error as Error)
      return null
    }
  }

  async set(key: string, value: any, ttlSeconds = 3600): Promise<boolean> {
    if (!this.client) return false

    try {
      await this.client.setex(key, ttlSeconds, JSON.stringify(value))
      return true
    } catch (error) {
      logger.error(`Redis SET error for key ${key}`, error as Error)
      return false
    }
  }

  async del(key: string): Promise<boolean> {
    if (!this.client) return false

    try {
      await this.client.del(key)
      return true
    } catch (error) {
      logger.error(`Redis DEL error for key ${key}`, error as Error)
      return false
    }
  }

  async invalidatePattern(pattern: string): Promise<void> {
    if (!this.client) return

    try {
      const keys = await this.client.keys(pattern)
      if (keys.length > 0) {
        await this.client.del(...keys)
        logger.info(`Invalidated ${keys.length} cache keys matching pattern: ${pattern}`)
      }
    } catch (error) {
      logger.error(`Redis pattern invalidation error for pattern ${pattern}`, error as Error)
    }
  }
}

export const redis = RedisClient.getInstance()
