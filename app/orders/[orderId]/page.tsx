import { redirect, notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import Header from "@/components/header"
import Footer from "@/components/footer"
import OrderDetails from "@/components/orders/order-details"

export default async function OrderDetailPage({ params }: { params: { orderId: string } }) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Get order details
  const { data: order, error } = await supabase
    .from("orders")
    .select(`
      *,
      buyer:users!orders_buyer_id_fkey(full_name, email),
      seller:users!orders_seller_id_fkey(full_name, email),
      product:products(title, product_images(image_url, is_primary)),
      escrow_transactions(*),
      disputes(*)
    `)
    .eq("id", params.orderId)
    .single()

  if (error || !order) {
    notFound()
  }

  // Check if user has access to this order
  if (order.buyer_id !== user.id && order.seller_id !== user.id) {
    redirect("/orders")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <OrderDetails order={order} currentUserId={user.id} />
      </main>
      <Footer />
    </div>
  )
}
