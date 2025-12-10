import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()

    // Get current user and verify admin role
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is admin
    const { data: userData } = await supabase.from("users").select("role").eq("id", user.id).single()

    if (userData?.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    // Fetch fraud alerts with user information
    const { data: alerts, error } = await supabase
      .from("fraud_alerts")
      .select(`
        *,
        user:users!fraud_alerts_user_id_fkey(email, full_name)
      `)
      .order("created_at", { ascending: false })

    if (error) {
      throw error
    }

    return NextResponse.json({ alerts })
  } catch (error) {
    console.error("Fraud alerts API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
