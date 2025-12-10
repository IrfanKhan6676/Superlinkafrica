import { redirect, notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import Header from "@/components/header"
import Footer from "@/components/footer"
import CheckoutForm from "@/components/checkout/checkout-form"
import OrderSummary from "@/components/checkout/order-summary"

export default async function CheckoutPage({ params }: { params: { productId: string } }) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Get product details
  const { data: product, error } = await supabase
    .from("products")
    .select(`
      *,
      seller:users!products_seller_id_fkey(full_name, email),
      category:categories(name),
      product_images(image_url, is_primary)
    `)
    .eq("id", params.productId)
    .eq("status", "active")
    .single()

  if (error || !product) {
    notFound()
  }

  // Prevent seller from buying their own product
  if (product.seller_id === user.id) {
    redirect(`/products/${params.productId}`)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Checkout</h1>
          <p className="text-gray-600">Complete your purchase securely</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <CheckoutForm product={product} buyerId={user.id} />
          </div>
          <div className="lg:col-span-1">
            <OrderSummary product={product} />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
