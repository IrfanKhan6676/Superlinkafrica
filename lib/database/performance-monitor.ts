import { createClient } from "@/lib/supabase/server"
import { logger } from "@/lib/observability/logger"
import { metrics } from "@/lib/observability/metrics"

export class PerformanceMonitor {
  private supabase = createClient()

  async monitorSlowQueries(): Promise<void> {
    try {
      // Monitor queries taking longer than 1 second
      const { data: slowQueries, error } = await this.supabase.rpc("get_slow_queries", {
        min_duration_ms: 1000,
      })

      if (error) {
        logger.error("Failed to fetch slow queries", error)
        return
      }

      if (slowQueries && slowQueries.length > 0) {
        logger.warn(`Found ${slowQueries.length} slow queries`, { slowQueries })

        // Record metrics
        metrics.recordDatabaseQuery("slow_query_count", slowQueries.length, true)
      }
    } catch (error) {
      logger.error("Error monitoring slow queries", error as Error)
    }
  }

  async checkIndexUsage(): Promise<void> {
    try {
      const { data: indexStats, error } = await this.supabase.rpc("get_index_usage_stats")

      if (error) {
        logger.error("Failed to fetch index usage stats", error)
        return
      }

      // Log unused indexes
      const unusedIndexes = indexStats?.filter((idx: any) => idx.usage_count === 0)
      if (unusedIndexes && unusedIndexes.length > 0) {
        logger.warn(`Found ${unusedIndexes.length} unused indexes`, { unusedIndexes })
      }
    } catch (error) {
      logger.error("Error checking index usage", error as Error)
    }
  }

  async optimizeDatabase(): Promise<void> {
    try {
      logger.info("Starting database optimization")

      // Update table statistics
      await this.supabase.rpc("analyze_tables")

      // Vacuum analyze critical tables
      const criticalTables = ["products", "orders", "users", "user_behavior"]

      for (const table of criticalTables) {
        await this.supabase.rpc("vacuum_analyze_table", { table_name: table })
        logger.info(`Optimized table: ${table}`)
      }

      logger.info("Database optimization completed")
    } catch (error) {
      logger.error("Database optimization failed", error as Error)
    }
  }
}
