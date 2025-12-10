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

    // Get user's current subscription
    const { data: subscription, error } = await supabase
      .from("user_subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .eq("status", "active")
      .single()

    if (error && error.code !== "PGRST116") {
      throw error
    }

    return NextResponse.json({ subscription })
  } catch (error) {
    console.error("Error fetching subscription:", error)
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

    const { plan_id, billing_interval } = await request.json()

    // Mock subscription creation - integrate with payment processor
    const subscriptionData = {
      user_id: user.id,
      plan_id,
      billing_interval,
      status: "active",
      current_period_start: new Date().toISOString(),
      current_period_end: new Date(
        Date.now() + (billing_interval === "yearly" ? 365 : 30) * 24 * 60 * 60 * 1000,
      ).toISOString(),
      created_at: new Date().toISOString(),
    }

    const { data: subscription, error } = await supabase
      .from("user_subscriptions")
      .insert(subscriptionData)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ subscription })
  } catch (error) {
    console.error("Error creating subscription:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
