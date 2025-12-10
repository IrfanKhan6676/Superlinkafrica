import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { TwoFactorAuth } from "@/lib/security/two-factor-auth"

export async function POST(request: NextRequest) {
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

    // Get user email
    const { data: userData } = await supabase.from("users").select("email").eq("id", user.id).single()

    if (!userData) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const twoFactorAuth = new TwoFactorAuth()
    const { secret, qrCode } = await twoFactorAuth.generateSecret(user.id, userData.email)

    return NextResponse.json({ secret, qrCode })
  } catch (error) {
    console.error("2FA generation error:", error)
    return NextResponse.json({ error: "Failed to generate 2FA secret" }, { status: 500 })
  }
}
