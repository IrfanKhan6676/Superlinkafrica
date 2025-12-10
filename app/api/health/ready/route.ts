import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// Readiness probe - checks if app is ready to serve traffic
export async function GET() {
  try {
    // Check critical dependencies
    const supabase = createClient()

    // Quick database connectivity check
    const { error } = await supabase.from("users").select("count").limit(1).single()

    if (error) {
      return NextResponse.json({ status: "not ready", reason: "Database not accessible" }, { status: 503 })
    }

    return NextResponse.json({ status: "ready" }, { status: 200 })
  } catch (error) {
    return NextResponse.json({ status: "not ready", reason: "Service initialization failed" }, { status: 503 })
  }
}
