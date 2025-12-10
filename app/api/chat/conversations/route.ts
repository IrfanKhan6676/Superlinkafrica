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

    const { productId, sellerId } = await request.json()

    if (!productId || !sellerId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    if (user.id === sellerId) {
      return NextResponse.json({ error: "Cannot start conversation with yourself" }, { status: 400 })
    }

    // Check if conversation already exists
    const { data: existingConversation } = await supabase
      .from("conversations")
      .select("id")
      .eq("product_id", productId)
      .eq("buyer_id", user.id)
      .eq("seller_id", sellerId)
      .single()

    if (existingConversation) {
      return NextResponse.json({ conversationId: existingConversation.id })
    }

    // Create new conversation
    const { data: newConversation, error } = await supabase
      .from("conversations")
      .insert({
        product_id: productId,
        buyer_id: user.id,
        seller_id: sellerId,
        status: "active",
      })
      .select("id")
      .single()

    if (error) throw error

    // Send initial system message
    await supabase.from("messages").insert({
      conversation_id: newConversation.id,
      sender_id: user.id,
      message_type: "system",
      content: "Conversation started",
      metadata: { type: "conversation_start" },
    })

    return NextResponse.json({ conversationId: newConversation.id })
  } catch (error) {
    console.error("Error creating conversation:", error)
    return NextResponse.json({ error: "Failed to create conversation" }, { status: 500 })
  }
}
