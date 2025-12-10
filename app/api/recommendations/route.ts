import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { recommendationEngine } from "@/lib/ai/recommendation-engine"

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const type = searchParams.get("type") as "products" | "sellers" | "categories" | "bundles"
    const limit = Number.parseInt(searchParams.get("limit") || "20")
    const categoryId = searchParams.get("categoryId")
    const minPrice = searchParams.get("minPrice")
    const maxPrice = searchParams.get("maxPrice")
    const excludeIds = searchParams.get("excludeIds")?.split(",") || []

    if (!type) {
      return NextResponse.json({ error: "Type parameter is required" }, { status: 400 })
    }

    // Check cache first
    const cached = await recommendationEngine.getCachedRecommendations(user.id, type)
    if (cached) {
      return NextResponse.json({ recommendations: cached, cached: true })
    }

    // Generate new recommendations
    const options = {
      userId: user.id,
      type,
      limit,
      excludeIds,
      categoryId: categoryId || undefined,
      priceRange:
        minPrice && maxPrice
          ? {
              min: Number.parseFloat(minPrice),
              max: Number.parseFloat(maxPrice),
            }
          : undefined,
    }

    const recommendations = await recommendationEngine.generateRecommendations(options)

    // Cache the results
    await recommendationEngine.cacheRecommendations(user.id, recommendations, type)

    return NextResponse.json({ recommendations, cached: false })
  } catch (error) {
    console.error("Error generating recommendations:", error)
    return NextResponse.json({ error: "Failed to generate recommendations" }, { status: 500 })
  }
}
