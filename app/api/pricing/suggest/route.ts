import { type NextRequest, NextResponse } from "next/server"
import { MarketAnalyzer } from "@/lib/pricing/market-analyzer"

export async function POST(request: NextRequest) {
  try {
    const { productId, currentPrice, categoryId, productData } = await request.json()

    if (!currentPrice || !categoryId || !productData) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const analyzer = new MarketAnalyzer()
    const suggestion = await analyzer.generatePriceSuggestion(productId, {
      ...productData,
      price: currentPrice,
      category_id: categoryId,
    })

    return NextResponse.json({ suggestion })
  } catch (error) {
    console.error("Price suggestion API error:", error)
    return NextResponse.json({ error: "Failed to generate price suggestion" }, { status: 500 })
  }
}
