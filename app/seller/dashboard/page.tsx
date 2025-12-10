import { redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase/server"
import Header from "@/components/header"
import Footer from "@/components/footer"
import SellerSidebar from "@/components/seller/seller-sidebar"
import SellerOverview from "@/components/seller/seller-overview"
import { User } from "@supabase/supabase-js"

export default async function SellerDashboard() {
  const supabase = await createServerClient()
  const { data: { session }, error } = await supabase.auth.getSession();
  if (!session || !session.user) {
    redirect("/auth/login")
  }

 // Get seller data
  const seller = session?.user
  const typedUser = session?.user as User | null;
  if (!seller || seller.user_metadata?.role !== "seller") {
    redirect("/")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header userData={typedUser}/>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <SellerSidebar />
          </div>
          <div className="lg:col-span-3">
            <SellerOverview sellerId={seller.id} />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
