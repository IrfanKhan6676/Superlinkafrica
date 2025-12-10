import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import Header from "@/components/header"
import Footer from "@/components/footer"
import SellerSidebar from "@/components/seller/seller-sidebar"
import SellerProducts from "@/components/seller/seller-products"

export default async function SellerProductsPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <SellerSidebar />
          </div>
          <div className="lg:col-span-3">
            <SellerProducts sellerId={user.id} />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
