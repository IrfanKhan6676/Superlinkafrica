import { type NextRequest, NextResponse } from "next/server"
import { AnalyticsService } from "@/lib/analytics/analytics-service"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const range = searchParams.get("range") || "30d"
    const role = searchParams.get("role") || "admin"

    // Calculate date range
    const endDate = new Date()
    const startDate = new Date()

    switch (range) {
      case "7d":
        startDate.setDate(endDate.getDate() - 7)
        break
      case "30d":
        startDate.setDate(endDate.getDate() - 30)
        break
      case "90d":
        startDate.setDate(endDate.getDate() - 90)
        break
      case "1y":
        startDate.setFullYear(endDate.getFullYear() - 1)
        break
    }

    const dateRange = {
      start: startDate.toISOString(),
      end: endDate.toISOString(),
    }

    const analyticsService = new AnalyticsService()

    // Get platform metrics
    const platformMetrics = await analyticsService.getPlatformAnalytics(dateRange)

    // Get trending products
    const trendingProducts = await analyticsService.getTrendingProducts(10)

    // Generate mock chart data (in a real app, this would come from the database)
    const chartData = {
      revenue: generateMockRevenueData(range),
      categories: [
        { name: "Electronics", value: 35, color: "#3B82F6" },
        { name: "Fashion", value: 25, color: "#10B981" },
        { name: "Home & Garden", value: 20, color: "#F59E0B" },
        { name: "Sports", value: 12, color: "#EF4444" },
        { name: "Books", value: 8, color: "#8B5CF6" },
      ],
      userGrowth: generateMockUserGrowthData(range),
    }

    return NextResponse.json({
      platformMetrics,
      chartData,
      trendingProducts,
    })
  } catch (error) {
    console.error("Analytics dashboard API error:", error)
    return NextResponse.json({ error: "Failed to fetch analytics data" }, { status: 500 })
  }
}

// Helper functions to generate mock data
function generateMockRevenueData(range: string) {
  const days = range === "7d" ? 7 : range === "30d" ? 30 : range === "90d" ? 90 : 365
  const data = []

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)

    data.push({
      date: date.toLocaleDateString(),
      revenue: Math.floor(Math.random() * 5000) + 1000,
      orders: Math.floor(Math.random() * 50) + 10,
    })
  }

  return data
}

function generateMockUserGrowthData(range: string) {
  const days = range === "7d" ? 7 : range === "30d" ? 30 : range === "90d" ? 90 : 365
  const data = []
  let totalUsers = 1000

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)

    const newUsers = Math.floor(Math.random() * 20) + 5
    totalUsers += newUsers

    data.push({
      date: date.toLocaleDateString(),
      users: totalUsers,
      newUsers,
    })
  }

  return data
}
