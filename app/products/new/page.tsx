import Header from "@/components/header"
import Footer from "@/components/footer"
import ProductForm from "@/components/products/ProductForm"
import { redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase/server-utils"

export default async function NewProductPage() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return redirect(`/auth/login?next=${encodeURIComponent('/products/new')}`)
  }
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Create Product</h1>
        <div className="bg-white p-6 rounded shadow">
          <ProductForm mode="create" submitLabel="Create" />
        </div>
      </main>
      <Footer />
    </div>
  )
}
