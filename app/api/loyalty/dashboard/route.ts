import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { LoyaltyService } from "@/lib/loyalty/loyalty-service"

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const loyaltyService = new LoyaltyService()

    // Get loyalty profile
    const profile = await loyaltyService.getLoyaltyProfile(user.id)

    // Get points history
    const pointsHistory = await loyaltyService.getPointsHistory(user.id, 20)

    // Get available rewards
    const availableRewards = await loyaltyService.getAvailableRewards(user.id)

    return NextResponse.json({
      profile,
      pointsHistory,
      availableRewards,
    })
  } catch (error) {
    console.error("Loyalty dashboard API error:", error)
    return NextResponse.json({ error: "Failed to fetch loyalty data" }, { status: 500 })
  }
}
