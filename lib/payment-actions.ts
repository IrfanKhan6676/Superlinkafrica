"use server"

import { createWritableServerClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function createOrder(formData: FormData) {
  const supabase = await createWritableServerClient()

  try {
    // Extract form data
    const productId = formData.get("product_id")?.toString()
    const sellerId = formData.get("seller_id")?.toString()
    const buyerId = formData.get("buyer_id")?.toString()
    const quantity = formData.get("quantity")?.toString()
    const totalAmount = formData.get("total_amount")?.toString()
    const shippingCost = formData.get("shipping_cost")?.toString()
    const paymentMethod = formData.get("payment_method")?.toString()
    const shippingAddress = formData.get("shipping_address")?.toString()
    const firstName = formData.get("firstName")?.toString()
    const lastName = formData.get("lastName")?.toString()
    const phone = formData.get("phone")?.toString()

    if (!productId || !sellerId || !buyerId || !totalAmount || !shippingAddress) {
      return { error: "Missing required fields" }
    }

    // Create order
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        product_id: productId,
        seller_id: sellerId,
        buyer_id: buyerId,
        quantity: Number.parseInt(quantity || "1"),
        total_amount: Number.parseFloat(totalAmount),
        shipping_cost: Number.parseFloat(shippingCost || "0"),
        payment_method: paymentMethod,
        shipping_address: `${firstName} ${lastName}\n${shippingAddress}\nPhone: ${phone}`,
        payment_status: "paid", // Simplified - in production, integrate with payment gateway
        order_status: "confirmed",
      })
      .select()
      .single()

    if (orderError) {
      console.error("Order creation error:", orderError)
      return { error: "Failed to create order" }
    }

    // Create escrow transaction
    const { error: escrowError } = await supabase.from("escrow_transactions").insert({
      order_id: order.id,
      amount: Number.parseFloat(totalAmount),
      status: "held",
      transaction_reference: `ESC-${Date.now()}`,
    })

    if (escrowError) {
      console.error("Escrow creation error:", escrowError)
    }

    // Update product status if it's a fixed price item
    await supabase.from("products").update({ status: "sold" }).eq("id", productId).eq("listing_type", "fixed")

    revalidatePath("/orders")
    return { success: true, orderId: order.id }
  } catch (error) {
    console.error("Error creating order:", error)
    return { error: "An unexpected error occurred" }
  }
}

export async function confirmDelivery(orderId: string) {
  const supabase = await createWritableServerClient()

  try {
    // Update order status
    const { error: orderError } = await supabase
      .from("orders")
      .update({
        order_status: "delivered",
        escrow_released: true,
      })
      .eq("id", orderId)

    if (orderError) {
      return { error: "Failed to confirm delivery" }
    }

    // Release escrow
    const { error: escrowError } = await supabase
      .from("escrow_transactions")
      .update({
        status: "released",
        released_at: new Date().toISOString(),
      })
      .eq("order_id", orderId)

    if (escrowError) {
      console.error("Escrow release error:", escrowError)
    }

    revalidatePath("/orders")
    return { success: true }
  } catch (error) {
    console.error("Error confirming delivery:", error)
    return { error: "An unexpected error occurred" }
  }
}

export async function createDispute(orderId: string, reason: string) {
  const supabase = await createWritableServerClient()

  try {
    // Get order details
    const { data: order } = await supabase.from("orders").select("buyer_id, seller_id").eq("id", orderId).single()

    if (!order) {
      return { error: "Order not found" }
    }

    // Create dispute
    const { error } = await supabase.from("disputes").insert({
      order_id: orderId,
      complainant_id: order.buyer_id,
      respondent_id: order.seller_id,
      reason: reason,
      description: reason,
      status: "open",
    })

    if (error) {
      return { error: "Failed to create dispute" }
    }

    revalidatePath("/orders")
    return { success: true }
  } catch (error) {
    console.error("Error creating dispute:", error)
    return { error: "An unexpected error occurred" }
  }
}
