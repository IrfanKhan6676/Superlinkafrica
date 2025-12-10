import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user achievements
    const { data: achievements, error } = await supabase
      .from("user_achievements")
      .select(`
        *,
        achievement:achievements(*)
      `)
      .eq("user_id", user.id)
      .order("earned_at", { ascending: false })

    if (error) throw error

    return NextResponse.json({ achievements })
  } catch (error) {
    console.error("Error fetching achievements:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { achievement_id, progress } = await request.json()

    // Check if achievement already exists
    const { data: existing } = await supabase
      .from("user_achievements")
      .select("id")
      .eq("user_id", user.id)
      .eq("achievement_id", achievement_id)
      .single()

    if (existing) {
      return NextResponse.json({ error: "Achievement already earned" }, { status: 400 })
    }

    // Award achievement
    const { data: achievement, error } = await supabase
      .from("user_achievements")
      .insert({
        user_id: user.id,
        achievement_id,
        progress: progress || 100,
        earned_at: new Date().toISOString(),
      })
      .select(`
        *,
        achievement:achievements(*)
      `)
      .single()

    if (error) throw error

    // Update user points
    const { data: achievementData } = await supabase
      .from("achievements")
      .select("points_reward")
      .eq("id", achievement_id)
      .single()

    if (achievementData?.points_reward) {
      await supabase.rpc("increment_user_points", {
        user_id: user.id,
        points: achievementData.points_reward,
      })
    }

    return NextResponse.json({ achievement })
  } catch (error) {
    console.error("Error awarding achievement:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
