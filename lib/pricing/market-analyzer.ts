import { createClient } from "@/lib/supabase/server"

export interface MarketAnalysis {
  categoryId: string
  avgPrice: number
  medianPrice: number
  priceRange: { min: number; max: number }
  demandScore: number
  trendDirection: "increasing" | "decreasing" | "stable"
  totalListings: number
  soldListings: number
  avgDaysToSell: number
}

export interface PriceSuggestion {
  suggestedPrice: number
  confidenceScore: number
  reasoning: string
  factors: {
    marketPosition: string
    demandLevel: string
    competitiveAdvantage: string[]
    seasonalFactors: string[]
  }
}

export class MarketAnalyzer {
  private supabase = createClient()

  // Analyze market data for a specific category
  async analyzeMarket(categoryId: string): Promise<MarketAnalysis> {
    try {
      // Get recent listings in category (last 90 days)
      const { data: recentListings } = await this.supabase
        .from("products")
        .select("price, created_at, status")
        .eq("category_id", categoryId)
        .gte("created_at", new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString())
        .order("created_at", { ascending: false })

      if (!recentListings || recentListings.length === 0) {
        throw new Error("Insufficient market data")
      }

      // Calculate market metrics
      const prices = recentListings.map((p) => Number.parseFloat(p.price.toString()))
      const soldListings = recentListings.filter((p) => p.status === "sold")

      const avgPrice = prices.reduce((sum, price) => sum + price, 0) / prices.length
      const sortedPrices = prices.sort((a, b) => a - b)
      const medianPrice = sortedPrices[Math.floor(sortedPrices.length / 2)]
      const minPrice = Math.min(...prices)
      const maxPrice = Math.max(...prices)

      // Calculate demand score based on sold ratio and listing velocity
      const soldRatio = soldListings.length / recentListings.length
      const demandScore = Math.min(100, soldRatio * 100 + (recentListings.length / 90) * 10)

      // Determine trend direction
      const recentPrices = recentListings.slice(0, 30).map((p) => Number.parseFloat(p.price.toString()))
      const olderPrices = recentListings.slice(-30).map((p) => Number.parseFloat(p.price.toString()))
      const recentAvg = recentPrices.reduce((sum, price) => sum + price, 0) / recentPrices.length
      const olderAvg = olderPrices.reduce((sum, price) => sum + price, 0) / olderPrices.length

      let trendDirection: "increasing" | "decreasing" | "stable" = "stable"
      const priceChange = (recentAvg - olderAvg) / olderAvg
      if (priceChange > 0.05) trendDirection = "increasing"
      else if (priceChange < -0.05) trendDirection = "decreasing"

      // Calculate average days to sell
      const avgDaysToSell =
        soldListings.length > 0
          ? soldListings.reduce((sum, listing) => {
              const daysListed = Math.floor(
                (new Date().getTime() - new Date(listing.created_at).getTime()) / (1000 * 60 * 60 * 24),
              )
              return sum + daysListed
            }, 0) / soldListings.length
          : 30 // Default estimate

      // Update market data table
      await this.updateMarketData(categoryId, {
        avgPrice,
        medianPrice,
        minPrice,
        maxPrice,
        totalListings: recentListings.length,
        soldListings: soldListings.length,
        demandScore,
        trendDirection,
        avgDaysToSell: Math.round(avgDaysToSell),
      })

      return {
        categoryId,
        avgPrice,
        medianPrice,
        priceRange: { min: minPrice, max: maxPrice },
        demandScore,
        trendDirection,
        totalListings: recentListings.length,
        soldListings: soldListings.length,
        avgDaysToSell: Math.round(avgDaysToSell),
      }
    } catch (error) {
      console.error("Market analysis error:", error)
      throw error
    }
  }

  // Generate price suggestion for a specific product
  async generatePriceSuggestion(productId: string, productData: any): Promise<PriceSuggestion> {
    try {
      // Get market analysis for product category
      const marketAnalysis = await this.analyzeMarket(productData.category_id)

      // Find similar products
      const { data: similarProducts } = await this.supabase
        .from("products")
        .select("price, title, condition, created_at, status")
        .eq("category_id", productData.category_id)
        .neq("id", productId)
        .ilike("title", `%${productData.title.split(" ")[0]}%`) // Match first word
        .limit(10)

      let suggestedPrice = marketAnalysis.avgPrice
      let confidenceScore = 60
      const factors = {
        marketPosition: "at_market",
        demandLevel: "medium",
        competitiveAdvantage: [] as string[],
        seasonalFactors: [] as string[],
      }

      // Adjust based on condition
      if (productData.condition === "new") {
        suggestedPrice *= 1.15
        factors.competitiveAdvantage.push("New condition premium")
        confidenceScore += 10
      } else if (productData.condition === "poor") {
        suggestedPrice *= 0.7
        factors.competitiveAdvantage.push("Discounted for condition")
      }

      // Adjust based on demand
      if (marketAnalysis.demandScore > 70) {
        suggestedPrice *= 1.1
        factors.demandLevel = "high"
        factors.competitiveAdvantage.push("High demand category")
        confidenceScore += 15
      } else if (marketAnalysis.demandScore < 30) {
        suggestedPrice *= 0.9
        factors.demandLevel = "low"
        factors.competitiveAdvantage.push("Competitive pricing needed")
      }

      // Adjust based on trend
      if (marketAnalysis.trendDirection === "increasing") {
        suggestedPrice *= 1.05
        factors.seasonalFactors.push("Upward price trend")
        confidenceScore += 10
      } else if (marketAnalysis.trendDirection === "decreasing") {
        suggestedPrice *= 0.95
        factors.seasonalFactors.push("Downward price trend")
      }

      // Compare with similar products
      if (similarProducts && similarProducts.length > 0) {
        const similarPrices = similarProducts.map((p) => Number.parseFloat(p.price.toString()))
        const avgSimilarPrice = similarPrices.reduce((sum, price) => sum + price, 0) / similarPrices.length

        // Adjust suggestion based on similar products
        suggestedPrice = (suggestedPrice + avgSimilarPrice) / 2
        confidenceScore += 15
      }

      // Determine market position
      if (suggestedPrice < marketAnalysis.avgPrice * 0.9) {
        factors.marketPosition = "below_market"
      } else if (suggestedPrice > marketAnalysis.avgPrice * 1.1) {
        factors.marketPosition = "above_market"
      }

      // Generate reasoning
      const reasoning = this.generateReasoning(suggestedPrice, marketAnalysis, factors)

      // Save suggestion to database
      await this.savePriceSuggestion(productId, productData.price, suggestedPrice, confidenceScore, reasoning, factors)

      return {
        suggestedPrice: Math.round(suggestedPrice * 100) / 100,
        confidenceScore: Math.min(100, confidenceScore),
        reasoning,
        factors,
      }
    } catch (error) {
      console.error("Price suggestion error:", error)
      throw error
    }
  }

  // Update market data in database
  private async updateMarketData(categoryId: string, data: any) {
    await this.supabase.from("market_data").upsert(
      {
        category_id: categoryId,
        avg_price: data.avgPrice,
        median_price: data.medianPrice,
        min_price: data.minPrice,
        max_price: data.maxPrice,
        total_listings: data.totalListings,
        sold_listings: data.soldListings,
        avg_days_to_sell: data.avgDaysToSell,
        demand_score: data.demandScore,
        trend_direction: data.trendDirection,
        last_updated: new Date().toISOString(),
      },
      {
        onConflict: "category_id",
      },
    )
  }

  // Save price suggestion to database
  private async savePriceSuggestion(
    productId: string,
    currentPrice: number,
    suggestedPrice: number,
    confidenceScore: number,
    reasoning: string,
    factors: any,
  ) {
    await this.supabase.from("price_suggestions").insert({
      product_id: productId,
      current_price: currentPrice,
      suggested_price: suggestedPrice,
      confidence_score: confidenceScore,
      reasoning,
      factors,
    })
  }

  // Generate human-readable reasoning
  private generateReasoning(suggestedPrice: number, marketAnalysis: MarketAnalysis, factors: any): string {
    let reasoning = `Based on market analysis of ${marketAnalysis.totalListings} similar listings, `

    if (factors.marketPosition === "below_market") {
      reasoning += "this price is competitive and should attract buyers quickly. "
    } else if (factors.marketPosition === "above_market") {
      reasoning += "this premium pricing reflects the item's value but may take longer to sell. "
    } else {
      reasoning += "this price aligns well with current market rates. "
    }

    if (marketAnalysis.demandScore > 70) {
      reasoning += "High demand in this category supports stronger pricing. "
    } else if (marketAnalysis.demandScore < 30) {
      reasoning += "Lower demand suggests competitive pricing is important. "
    }

    if (marketAnalysis.trendDirection === "increasing") {
      reasoning += "Prices are trending upward in this category. "
    } else if (marketAnalysis.trendDirection === "decreasing") {
      reasoning += "Prices are trending downward, suggesting urgency in pricing. "
    }

    reasoning += `Average time to sell: ${marketAnalysis.avgDaysToSell} days.`

    return reasoning
  }

  // Check for price drop opportunities
  async checkPriceDropAlerts(productId: string, newPrice: number) {
    const { data: alerts } = await this.supabase
      .from("price_alerts")
      .select("*")
      .eq("product_id", productId)
      .eq("is_active", true)
      .lte("target_price", newPrice)

    if (alerts && alerts.length > 0) {
      // Trigger price drop notifications
      for (const alert of alerts) {
        await this.triggerPriceAlert(alert.id, alert.user_id, productId, newPrice)
      }
    }
  }

  // Trigger price alert notification
  private async triggerPriceAlert(alertId: string, userId: string, productId: string, newPrice: number) {
    // Mark alert as triggered
    await this.supabase
      .from("price_alerts")
      .update({
        is_active: false,
        triggered_at: new Date().toISOString(),
      })
      .eq("id", alertId)

    // Create notification (would integrate with notification system)
    console.log(`Price alert triggered for user ${userId}: Product ${productId} dropped to ${newPrice}`)
  }
}
