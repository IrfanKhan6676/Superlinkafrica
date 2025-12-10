import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const { step, data, currentStep } = await request.json()
    const supabase = createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Update or create user profile with onboarding data
    const { error } = await supabase.from("user_profiles").upsert({
      user_id: user.id,
      [`${step}_data`]: data,
      onboarding_step: currentStep,
      updated_at: new Date().toISOString(),
    })

    if (error) {
      console.error("Error saving onboarding progress:", error)
      return NextResponse.json({ error: "Failed to save progress" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in save-progress:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
