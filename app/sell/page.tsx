import { redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase/server"
import Header from "@/components/header"
import Footer from "@/components/footer"
import ProductForm from "@/components/products/product-form"
import { User } from "@supabase/supabase-js"

export default async function SellPage() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }
// Convert user to typed User
const typeUser = user as User || null;
  // Get categories for the form
  const { data: categories , error} = await supabase.from("categories").select("*").eq("is_active", true).order("name",{ ascending: true })

  return (
    <div className="min-h-screen bg-gray-50">
      <Header userData={typeUser}/>
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">List Your Product</h1>
            <p className="text-gray-600">Create a listing to sell your item on Superlink</p>
          </div>

          <ProductForm categories={categories || []} />
        </div>
      </main>
      <Footer />
    </div>
  )
}
