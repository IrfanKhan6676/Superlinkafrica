import { notFound } from "next/navigation"
import Header from "@/components/header"
import Footer from "@/components/footer"
import ProductForm from "@/components/products/ProductForm"
import { createServerClient } from "@/lib/supabase/server-utils"

export default async function EditProductPage({ params }: { params: { id: string } }) {
  const supabase = await createServerClient()
  const { data: product, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', params.id)
    .single()

  if (error || !product) notFound()

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Edit Product</h1>
        <div className="bg-white p-6 rounded shadow">
          <ProductForm
            mode="edit"
            id={product.id}
            submitLabel="Update"
            initial={{
              title: product.title,
              description: product.description,
              price: product.price,
              image_url: product.image_url,
            }}
          />
        </div>
      </main>
      <Footer />
    </div>
  )
}
