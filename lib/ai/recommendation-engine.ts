import { createClient } from "@/lib/supabase/server"

export interface RecommendationOptions {
  userId: string
  type: "products" | "sellers" | "categories" | "bundles"
  limit?: number
  excludeIds?: string[]
  categoryId?: string
  priceRange?: { min: number; max: number }
}

export interface Recommendation {
  id: string
  type: "product" | "seller" | "category"
  score: number
  reason: string
  metadata?: Record<string, any>
}

export class RecommendationEngine {
  private supabase = createClient()

  async generateRecommendations(options: RecommendationOptions): Promise<Recommendation[]> {
    const { userId, type, limit = 20, excludeIds = [] } = options

    switch (type) {
      case "products":
        return this.generateProductRecommendations(userId, limit, excludeIds, options)
      case "sellers":
        return this.generateSellerRecommendations(userId, limit, excludeIds)
      case "categories":
        return this.generateCategoryRecommendations(userId, limit)
      case "bundles":
        return this.generateBundleRecommendations(userId, limit, excludeIds)
      default:
        return []
    }
  }

  private async generateProductRecommendations(
    userId: string,
    limit: number,
    excludeIds: string[],
    options: RecommendationOptions,
  ): Promise<Recommendation[]> {
    const recommendations: Recommendation[] = []

    // 1. Collaborative filtering - users with similar behavior
    const collaborativeRecs = await this.getCollaborativeRecommendations(userId, limit / 4)
    recommendations.push(...collaborativeRecs)

    // 2. Content-based filtering - similar to liked/viewed items
    const contentRecs = await this.getContentBasedRecommendations(userId, limit / 4, options)
    recommendations.push(...contentRecs)

    // 3. Category-based recommendations
    const categoryRecs = await this.getCategoryBasedRecommendations(userId, limit / 4, options)
    recommendations.push(...categoryRecs)

    // 4. Trending items
    const trendingRecs = await this.getTrendingRecommendations(userId, limit / 4)
    recommendations.push(...trendingRecs)

    // Remove duplicates and excluded items
    const uniqueRecs = recommendations
      .filter((rec, index, self) => self.findIndex((r) => r.id === rec.id) === index && !excludeIds.includes(rec.id))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)

    return uniqueRecs
  }

  private async getCollaborativeRecommendations(userId: string, limit: number): Promise<Recommendation[]> {
    // Find users with similar behavior patterns
    const { data: similarUsers } = await this.supabase.rpc("find_similar_users", {
      target_user_id: userId,
      similarity_threshold: 0.3,
      limit_users: 10,
    })

    if (!similarUsers?.length) return []

    // Get products liked by similar users
    const { data: products } = await this.supabase
      .from("product_likes")
      .select(`
        product_id,
        products!inner(id, title, price, seller_id, status)
      `)
      .in(
        "user_id",
        similarUsers.map((u: any) => u.user_id),
      )
      .eq("products.status", "active")
      .limit(limit)

    return (
      products?.map((item: any) => ({
        id: item.product_id,
        type: "product" as const,
        score: 0.8,
        reason: "Users with similar interests liked this",
        metadata: item.products,
      })) || []
    )
  }

  private async getContentBasedRecommendations(
    userId: string,
    limit: number,
    options: RecommendationOptions,
  ): Promise<Recommendation[]> {
    // Get user's interaction history
    const { data: userBehavior } = await this.supabase
      .from("user_behavior")
      .select("target_id, action_type, metadata")
      .eq("user_id", userId)
      .eq("target_type", "product")
      .in("action_type", ["view", "like", "swipe_right"])
      .order("created_at", { ascending: false })
      .limit(50)

    if (!userBehavior?.length) return []

    // Extract categories and tags from viewed products
    const productIds = userBehavior.map((b) => b.target_id).filter(Boolean)
    const { data: viewedProducts } = await this.supabase
      .from("products")
      .select("category_id, tags")
      .in("id", productIds)

    const categories = [...new Set(viewedProducts?.map((p) => p.category_id).filter(Boolean))]
    const tags = [...new Set(viewedProducts?.flatMap((p) => p.tags || []))]

    // Find similar products
    let query = this.supabase
      .from("products")
      .select("id, title, price, category_id, tags, seller_id")
      .eq("status", "active")
      .not("seller_id", "eq", userId) // Don't recommend own products

    if (categories.length > 0) {
      query = query.in("category_id", categories)
    }

    if (options.priceRange) {
      query = query.gte("price", options.priceRange.min).lte("price", options.priceRange.max)
    }

    const { data: similarProducts } = await query.limit(limit)

    return (
      similarProducts?.map((product) => ({
        id: product.id,
        type: "product" as const,
        score: this.calculateContentSimilarity(product, { categories, tags }),
        reason: "Similar to items you've viewed",
        metadata: product,
      })) || []
    )
  }

  private calculateContentSimilarity(product: any, userPreferences: { categories: string[]; tags: string[] }): number {
    let score = 0

    // Category match
    if (userPreferences.categories.includes(product.category_id)) {
      score += 0.5
    }

    // Tag matches
    const productTags = product.tags || []
    const tagMatches = productTags.filter((tag: string) => userPreferences.tags.includes(tag)).length

    score += (tagMatches / Math.max(productTags.length, 1)) * 0.3

    return Math.min(score, 1)
  }

  private async getCategoryBasedRecommendations(
    userId: string,
    limit: number,
    options: RecommendationOptions,
  ): Promise<Recommendation[]> {
    // Get user's category interests
    const { data: interests } = await this.supabase
      .from("user_interests")
      .select("category_id, interest_level")
      .eq("user_id", userId)
      .order("interest_level", { ascending: false })

    if (!interests?.length) return []

    const categoryIds = interests.map((i) => i.category_id)

    let query = this.supabase
      .from("products")
      .select("id, title, price, category_id, views_count, likes_count")
      .in("category_id", categoryIds)
      .eq("status", "active")
      .not("seller_id", "eq", userId)

    if (options.priceRange) {
      query = query.gte("price", options.priceRange.min).lte("price", options.priceRange.max)
    }

    const { data: products } = await query.order("likes_count", { ascending: false }).limit(limit)

    return (
      products?.map((product) => ({
        id: product.id,
        type: "product" as const,
        score: 0.6,
        reason: "Popular in your favorite categories",
        metadata: product,
      })) || []
    )
  }

  private async getTrendingRecommendations(userId: string, limit: number): Promise<Recommendation[]> {
    // Get trending products based on recent activity
    const { data: trending } = await this.supabase
      .from("products")
      .select("id, title, price, views_count, likes_count, created_at")
      .eq("status", "active")
      .not("seller_id", "eq", userId)
      .gte("created_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()) // Last 7 days
      .order("views_count", { ascending: false })
      .limit(limit)

    return (
      trending?.map((product) => ({
        id: product.id,
        type: "product" as const,
        score: 0.4,
        reason: "Trending this week",
        metadata: product,
      })) || []
    )
  }

  private async generateSellerRecommendations(
    userId: string,
    limit: number,
    excludeIds: string[],
  ): Promise<Recommendation[]> {
    // Find sellers based on user's category interests and past interactions
    const { data: topSellers } = await this.supabase.rpc("get_recommended_sellers", {
      target_user_id: userId,
      limit_sellers: limit,
    })

    return (
      topSellers?.map((seller: any) => ({
        id: seller.seller_id,
        type: "seller" as const,
        score: seller.recommendation_score,
        reason: "Top seller in your interests",
        metadata: seller,
      })) || []
    )
  }

  private async generateCategoryRecommendations(userId: string, limit: number): Promise<Recommendation[]> {
    // Recommend categories based on trending and user behavior
    const { data: categories } = await this.supabase.rpc("get_trending_categories", {
      user_id: userId,
      limit_categories: limit,
    })

    return (
      categories?.map((category: any) => ({
        id: category.category_id,
        type: "category" as const,
        score: category.trend_score,
        reason: "Trending category",
        metadata: category,
      })) || []
    )
  }

  private async generateBundleRecommendations(
    userId: string,
    limit: number,
    excludeIds: string[],
  ): Promise<Recommendation[]> {
    // "People who bought this also bought" recommendations
    const { data: bundles } = await this.supabase.rpc("get_bundle_recommendations", {
      user_id: userId,
      limit_bundles: limit,
    })

    return (
      bundles?.map((bundle: any) => ({
        id: bundle.product_id,
        type: "product" as const,
        score: bundle.bundle_score,
        reason: "Frequently bought together",
        metadata: bundle,
      })) || []
    )
  }

  async cacheRecommendations(userId: string, recommendations: Recommendation[], type: string) {
    const { error } = await this.supabase.from("ai_recommendations").upsert({
      user_id: userId,
      recommendation_type: type,
      recommended_items: recommendations,
      confidence_score: recommendations.reduce((sum, r) => sum + r.score, 0) / recommendations.length,
      algorithm_version: "1.0",
      expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hour cache
    })

    if (error) {
      console.error("Error caching recommendations:", error)
    }
  }

  async getCachedRecommendations(userId: string, type: string): Promise<Recommendation[] | null> {
    const { data } = await this.supabase
      .from("ai_recommendations")
      .select("recommended_items, expires_at")
      .eq("user_id", userId)
      .eq("recommendation_type", type)
      .gt("expires_at", new Date().toISOString())
      .single()

    return data?.recommended_items || null
  }
}

export const recommendationEngine = new RecommendationEngine()
