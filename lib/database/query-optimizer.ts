import { createClient } from "@/lib/supabase/server"
import { cache } from "@/lib/cache/cache-manager"
import { logger } from "@/lib/observability/logger"
import { metrics } from "@/lib/observability/metrics"

export interface PaginationOptions {
  page?: number
  limit?: number
  cursor?: string
}

export interface QueryResult<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    hasNext: boolean
    hasPrev: boolean
    nextCursor?: string
    prevCursor?: string
  }
}

export class QueryOptimizer {
  private supabase = createClient()

  async paginatedQuery<T>(
    table: string,
    options: PaginationOptions & {
      select?: string
      filters?: Record<string, any>
      orderBy?: { column: string; ascending?: boolean }
      cacheKey?: string
      cacheTTL?: number
    },
  ): Promise<QueryResult<T>> {
    const {
      page = 1,
      limit = 20,
      cursor,
      select = "*",
      filters = {},
      orderBy = { column: "created_at", ascending: false },
      cacheKey,
      cacheTTL = 300,
    } = options

    const startTime = Date.now()

    try {
      // Check cache first
      if (cacheKey) {
        const cached = await cache.get<QueryResult<T>>(cacheKey)
        if (cached) {
          metrics.recordDatabaseQuery("cached_query", Date.now() - startTime, true)
          return cached
        }
      }

      let query = this.supabase.from(table).select(select, { count: "exact" })

      // Apply filters
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          query = query.eq(key, value)
        }
      })

      // Apply ordering
      query = query.order(orderBy.column, { ascending: orderBy.ascending })

      // Apply pagination
      if (cursor) {
        // Cursor-based pagination for better performance
        query = query.gt(orderBy.column, cursor)
      } else {
        // Offset-based pagination
        const offset = (page - 1) * limit
        query = query.range(offset, offset + limit - 1)
      }

      query = query.limit(limit)

      const { data, error, count } = await query

      if (error) {
        metrics.recordDatabaseQuery("paginated_query", Date.now() - startTime, false)
        throw error
      }

      const total = count || 0
      const hasNext = cursor ? data.length === limit : page * limit < total
      const hasPrev = cursor ? false : page > 1

      const result: QueryResult<T> = {
        data: data || [],
        pagination: {
          page,
          limit,
          total,
          hasNext,
          hasPrev,
          nextCursor: hasNext && data.length > 0 ? data[data.length - 1][orderBy.column] : undefined,
          prevCursor: hasPrev ? undefined : undefined,
        },
      }

      // Cache the result
      if (cacheKey) {
        await cache.set(cacheKey, result, { ttl: cacheTTL })
      }

      metrics.recordDatabaseQuery("paginated_query", Date.now() - startTime, true)
      logger.debug("Paginated query executed", {
        table,
        page,
        limit,
        total,
        responseTime: Date.now() - startTime,
      })

      return result
    } catch (error) {
      metrics.recordDatabaseQuery("paginated_query", Date.now() - startTime, false)
      logger.error("Paginated query failed", error as Error, { table, page, limit })
      throw error
    }
  }

  async optimizedProductSearch(
    searchTerm: string,
    filters: {
      categoryId?: string
      minPrice?: number
      maxPrice?: number
      location?: string
      condition?: string
    } = {},
    pagination: PaginationOptions = {},
  ): Promise<QueryResult<any>> {
    const cacheKey = `product_search:${searchTerm}:${JSON.stringify(filters)}:${pagination.page || 1}`

    return this.paginatedQuery("products", {
      ...pagination,
      select: `
        id, title, description, price, condition, location,
        seller_id, category_id, created_at, updated_at,
        product_media!inner(media_url, is_primary),
        users!inner(full_name, profile_image_url),
        categories!inner(name, slug)
      `,
      filters: {
        status: "active",
        ...filters,
      },
      orderBy: { column: "created_at", ascending: false },
      cacheKey,
      cacheTTL: 600, // 10 minutes cache for search results
    })
  }

  async getUserOrders(userId: string, pagination: PaginationOptions = {}): Promise<QueryResult<any>> {
    const cacheKey = `user_orders:${userId}:${pagination.page || 1}`

    return this.paginatedQuery("orders", {
      ...pagination,
      select: `
        id, total_amount, order_status, payment_status, created_at,
        products!inner(title, price),
        users!seller_id(full_name)
      `,
      filters: { buyer_id: userId },
      orderBy: { column: "created_at", ascending: false },
      cacheKey,
      cacheTTL: 300, // 5 minutes cache for user orders
    })
  }

  async getPopularProducts(categoryId?: string, limit = 20): Promise<any[]> {
    const cacheKey = `popular_products:${categoryId || "all"}:${limit}`

    return cache.wrap(
      cacheKey,
      async () => {
        let query = this.supabase
          .from("products")
          .select(`
            id, title, price, views_count, likes_count,
            product_media!inner(media_url, is_primary),
            categories!inner(name, slug)
          `)
          .eq("status", "active")
          .order("views_count", { ascending: false })
          .limit(limit)

        if (categoryId) {
          query = query.eq("category_id", categoryId)
        }

        const { data, error } = await query

        if (error) throw error
        return data || []
      },
      { ttl: 1800, tags: ["products", "popular"] }, // 30 minutes cache
    )
  }
}

export const queryOptimizer = new QueryOptimizer()
