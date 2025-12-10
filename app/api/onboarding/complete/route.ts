import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Mark onboarding as completed and award welcome bonus
    const { error } = await supabase
      .from("user_profiles")
      .update({
        onboarding_completed: true,
        onboarding_completed_at: new Date().toISOString(),
      })
      .eq("user_id", user.id)

    if (error) {
      console.error("Error completing onboarding:", error)
      return NextResponse.json({ error: "Failed to complete onboarding" }, { status: 500 })
    }

    // Award welcome bonus points
    await supabase.from("loyalty_points").insert({
      user_id: user.id,
      points: 100,
      source: "welcome_bonus",
      description: "Welcome to Superlink bonus",
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in complete onboarding:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
