import { createClient } from "@/lib/supabase/server"

export interface AnalyticsMetrics {
  totalRevenue: number
  totalUsers: number
  totalProducts: number
  totalOrders: number
  conversionRate: number
  averageOrderValue: number
  growthRate: number
}

export interface SellerMetrics {
  totalSales: number
  totalRevenue: number
  totalViews: number
  conversionRate: number
  averageRating: number
  responseTime: number
  topProducts: Array<{
    id: string
    title: string
    views: number
    sales: number
    revenue: number
  }>
}

export interface BuyerMetrics {
  totalPurchases: number
  totalSpent: number
  averageOrderValue: number
  favoriteCategories: Array<{
    category: string
    purchases: number
    spent: number
  }>
  savingsFromDeals: number
}

export class AnalyticsService {
  private supabase = createClient()

  // Track user events
  async trackEvent(userId: string | null, eventType: string, eventData: any, sessionId?: string, pageUrl?: string) {
    try {
      await this.supabase.from("user_analytics").insert({
        user_id: userId,
        session_id: sessionId,
        event_type: eventType,
        event_data: eventData,
        page_url: pageUrl,
        created_at: new Date().toISOString(),
      })
    } catch (error) {
      console.error("Error tracking event:", error)
    }
  }

  // Get platform-wide analytics
  async getPlatformAnalytics(dateRange: { start: string; end: string }): Promise<AnalyticsMetrics> {
    try {
      // Get revenue data
      const { data: revenueData } = await this.supabase
        .from("orders")
        .select("total_amount")
        .eq("status", "completed")
        .gte("created_at", dateRange.start)
        .lte("created_at", dateRange.end)

      const totalRevenue = revenueData?.reduce((sum, order) => sum + Number.parseFloat(order.total_amount), 0) || 0

      // Get user count
      const { count: totalUsers } = await this.supabase
        .from("users")
        .select("*", { count: "exact", head: true })
        .gte("created_at", dateRange.start)
        .lte("created_at", dateRange.end)

      // Get product count
      const { count: totalProducts } = await this.supabase
        .from("products")
        .select("*", { count: "exact", head: true })
        .gte("created_at", dateRange.start)
        .lte("created_at", dateRange.end)

      // Get order count
      const { count: totalOrders } = await this.supabase
        .from("orders")
        .select("*", { count: "exact", head: true })
        .gte("created_at", dateRange.start)
        .lte("created_at", dateRange.end)

      // Calculate conversion rate (orders / unique product views)
      const { data: viewsData } = await this.supabase
        .from("user_analytics")
        .select("user_id")
        .eq("event_type", "product_view")
        .gte("created_at", dateRange.start)
        .lte("created_at", dateRange.end)

      const uniqueViews = new Set(viewsData?.map((v) => v.user_id)).size
      const conversionRate = uniqueViews > 0 ? ((totalOrders || 0) / uniqueViews) * 100 : 0

      // Calculate average order value
      const averageOrderValue = (totalOrders || 0) > 0 ? totalRevenue / (totalOrders || 1) : 0

      // Calculate growth rate (compare with previous period)
      const periodLength = new Date(dateRange.end).getTime() - new Date(dateRange.start).getTime()
      const previousStart = new Date(new Date(dateRange.start).getTime() - periodLength).toISOString()
      const previousEnd = dateRange.start

      const { data: previousRevenueData } = await this.supabase
        .from("orders")
        .select("total_amount")
        .eq("status", "completed")
        .gte("created_at", previousStart)
        .lte("created_at", previousEnd)

      const previousRevenue =
        previousRevenueData?.reduce((sum, order) => sum + Number.parseFloat(order.total_amount), 0) || 0
      const growthRate = previousRevenue > 0 ? ((totalRevenue - previousRevenue) / previousRevenue) * 100 : 0

      return {
        totalRevenue,
        totalUsers: totalUsers || 0,
        totalProducts: totalProducts || 0,
        totalOrders: totalOrders || 0,
        conversionRate,
        averageOrderValue,
        growthRate,
      }
    } catch (error) {
      console.error("Error getting platform analytics:", error)
      throw error
    }
  }

  // Get seller analytics
  async getSellerAnalytics(sellerId: string, dateRange: { start: string; end: string }): Promise<SellerMetrics> {
    try {
      // Get seller's orders
      const { data: orders } = await this.supabase
        .from("orders")
        .select("total_amount, product_id, products(title)")
        .eq("seller_id", sellerId)
        .eq("status", "completed")
        .gte("created_at", dateRange.start)
        .lte("created_at", dateRange.end)

      const totalSales = orders?.length || 0
      const totalRevenue = orders?.reduce((sum, order) => sum + Number.parseFloat(order.total_amount), 0) || 0

      // Get product views
      const { data: productViewsData } = await this.supabase
        .from("user_analytics")
        .select("event_data")
        .eq("event_type", "product_view")
        .gte("created_at", dateRange.start)
        .lte("created_at", dateRange.end)

      // Filter views for seller's products
      const { data: sellerProducts } = await this.supabase.from("products").select("id").eq("seller_id", sellerId)

      const sellerProductIds = new Set(sellerProducts?.map((p) => p.id))
      const totalViews =
        productViewsData?.filter((view) => sellerProductIds.has(view.event_data?.product_id)).length || 0

      // Calculate conversion rate
      const conversionRate = totalViews > 0 ? (totalSales / totalViews) * 100 : 0

      // Get seller rating
      const { data: reviews } = await this.supabase
        .from("reviews")
        .select("rating")
        .eq("seller_id", sellerId)
        .gte("created_at", dateRange.start)
        .lte("created_at", dateRange.end)

      const averageRating =
        reviews && reviews.length > 0 ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length : 0

      // Get response time (mock data for now)
      const responseTime = 2.5 // Average hours

      // Get top products
      const productSales = new Map()
      const productViews = new Map()

      orders?.forEach((order) => {
        const productId = order.product_id
        productSales.set(productId, (productSales.get(productId) || 0) + 1)
      })

      const topProducts = Array.from(productSales.entries())
        .sort(([, a], [, b]) => (b as number) - (a as number))
        .slice(0, 5)
        .map(([productId, sales]) => {
          const product = orders?.find((o) => o.product_id === productId)
          return {
            id: productId as string,
            title: product?.products?.title || "Unknown Product",
            views: productViews.get(productId) || 0,
            sales: sales as number,
            revenue: (sales as number) * (totalRevenue / totalSales || 0),
          }
        })

      return {
        totalSales,
        totalRevenue,
        totalViews,
        conversionRate,
        averageRating,
        responseTime,
        topProducts,
      }
    } catch (error) {
      console.error("Error getting seller analytics:", error)
      throw error
    }
  }

  // Get buyer analytics
  async getBuyerAnalytics(buyerId: string, dateRange: { start: string; end: string }): Promise<BuyerMetrics> {
    try {
      // Get buyer's orders
      const { data: orders } = await this.supabase
        .from("orders")
        .select("total_amount, products(category_id, categories(name))")
        .eq("buyer_id", buyerId)
        .eq("status", "completed")
        .gte("created_at", dateRange.start)
        .lte("created_at", dateRange.end)

      const totalPurchases = orders?.length || 0
      const totalSpent = orders?.reduce((sum, order) => sum + Number.parseFloat(order.total_amount), 0) || 0
      const averageOrderValue = totalPurchases > 0 ? totalSpent / totalPurchases : 0

      // Calculate favorite categories
      const categorySpending = new Map()
      const categoryPurchases = new Map()

      orders?.forEach((order) => {
        const categoryName = order.products?.categories?.name || "Other"
        const amount = Number.parseFloat(order.total_amount)

        categorySpending.set(categoryName, (categorySpending.get(categoryName) || 0) + amount)
        categoryPurchases.set(categoryName, (categoryPurchases.get(categoryName) || 0) + 1)
      })

      const favoriteCategories = Array.from(categorySpending.entries())
        .sort(([, a], [, b]) => (b as number) - (a as number))
        .slice(0, 5)
        .map(([category, spent]) => ({
          category: category as string,
          purchases: categoryPurchases.get(category) || 0,
          spent: spent as number,
        }))

      // Calculate savings from deals (mock calculation)
      const savingsFromDeals = totalSpent * 0.15 // Assume 15% average savings

      return {
        totalPurchases,
        totalSpent,
        averageOrderValue,
        favoriteCategories,
        savingsFromDeals,
      }
    } catch (error) {
      console.error("Error getting buyer analytics:", error)
      throw error
    }
  }

  // Update daily analytics aggregation
  async updateDailyAnalytics(date: string) {
    try {
      // Aggregate sales data
      const { data: salesData } = await this.supabase
        .from("orders")
        .select("total_amount, seller_id, products(category_id)")
        .eq("status", "completed")
        .gte("created_at", `${date}T00:00:00Z`)
        .lt("created_at", `${date}T23:59:59Z`)

      if (salesData && salesData.length > 0) {
        const totalSales = salesData.reduce((sum, order) => sum + Number.parseFloat(order.total_amount), 0)

        // Insert daily sales metric
        await this.supabase.from("analytics_daily").upsert(
          {
            date,
            metric_type: "sales",
            metric_value: totalSales,
            additional_data: { order_count: salesData.length },
          },
          { onConflict: "date,metric_type" },
        )
      }

      // Aggregate user registrations
      const { count: newUsers } = await this.supabase
        .from("users")
        .select("*", { count: "exact", head: true })
        .gte("created_at", `${date}T00:00:00Z`)
        .lt("created_at", `${date}T23:59:59Z`)

      if (newUsers && newUsers > 0) {
        await this.supabase.from("analytics_daily").upsert(
          {
            date,
            metric_type: "users",
            metric_value: newUsers,
          },
          { onConflict: "date,metric_type" },
        )
      }

      // Aggregate product listings
      const { count: newProducts } = await this.supabase
        .from("products")
        .select("*", { count: "exact", head: true })
        .gte("created_at", `${date}T00:00:00Z`)
        .lt("created_at", `${date}T23:59:59Z`)

      if (newProducts && newProducts > 0) {
        await this.supabase.from("analytics_daily").upsert(
          {
            date,
            metric_type: "products",
            metric_value: newProducts,
          },
          { onConflict: "date,metric_type" },
        )
      }
    } catch (error) {
      console.error("Error updating daily analytics:", error)
    }
  }

  // Get trending products
  async getTrendingProducts(limit = 10) {
    try {
      const { data: trendingData } = await this.supabase
        .from("user_analytics")
        .select("event_data")
        .eq("event_type", "product_view")
        .gte("created_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()) // Last 7 days

      // Count views per product
      const productViews = new Map()
      trendingData?.forEach((event) => {
        const productId = event.event_data?.product_id
        if (productId) {
          productViews.set(productId, (productViews.get(productId) || 0) + 1)
        }
      })

      // Get top products
      const topProductIds = Array.from(productViews.entries())
        .sort(([, a], [, b]) => (b as number) - (a as number))
        .slice(0, limit)
        .map(([productId]) => productId)

      if (topProductIds.length === 0) return []

      // Fetch product details
      const { data: products } = await this.supabase
        .from("products")
        .select("id, title, price, images, seller:users(full_name)")
        .in("id", topProductIds)

      return products?.map((product) => ({
        ...product,
        views: productViews.get(product.id) || 0,
      }))
    } catch (error) {
      console.error("Error getting trending products:", error)
      return []
    }
  }
}
