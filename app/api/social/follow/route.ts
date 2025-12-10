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

    const { targetUserId, action } = await request.json()

    if (!targetUserId || !action) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    if (user.id === targetUserId) {
      return NextResponse.json({ error: "Cannot follow yourself" }, { status: 400 })
    }

    if (action === "follow") {
      // Check if already following
      const { data: existing } = await supabase
        .from("user_connections")
        .select("id")
        .eq("follower_id", user.id)
        .eq("following_id", targetUserId)
        .eq("connection_type", "follow")
        .single()

      if (existing) {
        return NextResponse.json({ error: "Already following this user" }, { status: 400 })
      }

      // Create follow relationship
      const { error } = await supabase.from("user_connections").insert({
        follower_id: user.id,
        following_id: targetUserId,
        connection_type: "follow",
      })

      if (error) throw error

      // Create notification for the followed user
      await supabase.from("notifications").insert({
        user_id: targetUserId,
        type: "follow",
        title: "New Follower",
        content: `${user.user_metadata?.full_name || user.email} started following you`,
        data: { follower_id: user.id },
      })

      return NextResponse.json({ success: true, action: "followed" })
    } else if (action === "unfollow") {
      // Remove follow relationship
      const { error } = await supabase
        .from("user_connections")
        .delete()
        .eq("follower_id", user.id)
        .eq("following_id", targetUserId)
        .eq("connection_type", "follow")

      if (error) throw error

      return NextResponse.json({ success: true, action: "unfollowed" })
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }
  } catch (error) {
    console.error("Error handling follow action:", error)
    return NextResponse.json({ error: "Failed to process follow action" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const targetUserId = searchParams.get("targetUserId")
    const type = searchParams.get("type") // "followers" or "following"

    if (!targetUserId || !type) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 })
    }

    let query = supabase
      .from("user_connections")
      .select(`
        id,
        created_at,
        users!${type === "followers" ? "follower_id" : "following_id"}(
          id, full_name, username, profile_image_url, is_verified
        )
      `)
      .eq("connection_type", "follow")

    if (type === "followers") {
      query = query.eq("following_id", targetUserId)
    } else {
      query = query.eq("follower_id", targetUserId)
    }

    const { data, error } = await query.order("created_at", { ascending: false })

    if (error) throw error

    const connections =
      data?.map((conn) => ({
        id: conn.id,
        created_at: conn.created_at,
        user: conn.users,
      })) || []

    return NextResponse.json({ connections })
  } catch (error) {
    console.error("Error fetching connections:", error)
    return NextResponse.json({ error: "Failed to fetch connections" }, { status: 500 })
  }
}
