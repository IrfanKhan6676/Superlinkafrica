import { notFound } from "next/navigation"
<<<<<<< HEAD
import Header from "@/components/header"
import Footer from "@/components/footer"
import DeleteButton from "@/components/products/DeleteButton"
import ProductForm from "@/components/products/ProductForm"
import { createServerClient } from "@/lib/supabase/server-utils"

export default async function ProductPage({ params }: { params: { id: string } }) {
  const supabase = await createServerClient()

  const { data: product, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', params.id)
=======
import { createClient } from "@/lib/supabase/server"
import Header from "@/components/header"
import Footer from "@/components/footer"
import ProductDetails from "@/components/products/product-details"
import ProductImages from "@/components/products/product-images"
import ProductActions from "@/components/products/product-actions"
import SellerInfo from "@/components/products/seller-info"
import ProductReviews from "@/components/products/product-reviews"

export default async function ProductPage({ params }: { params: { id: string } }) {
  const supabase = createClient()

  const { data: product, error } = await supabase
    .from("products")
    .select(`
      *,
      seller:users!products_seller_id_fkey(id, full_name, email, created_at),
      category:categories(name, slug),
      product_images(image_url, is_primary, sort_order),
      reviews(rating, comment, reviewer:users!reviews_reviewer_id_fkey(full_name))
    `)
    .eq("id", params.id)
    .eq("status", "active")
>>>>>>> 0c4e38a90ff868b906bd0973817ce070e17ecf55
    .single()

  if (error || !product) {
    notFound()
  }

<<<<<<< HEAD
  const { data: { user } } = await supabase.auth.getUser()
  const isOwner = user?.id === product.user_id

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
          <div className="flex flex-col md:flex-row gap-6">
            {product.image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={product.image_url} alt={product.title} className="w-full md:w-1/2 rounded" />
            ) : null}
            <div className="flex-1 space-y-4">
              <h1 className="text-2xl font-bold">{product.title}</h1>
              <p className="text-gray-700">{product.description}</p>
              <p className="text-xl font-semibold">K{Number(product.price).toLocaleString()}</p>
            </div>
          </div>

          {isOwner && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Edit</h2>
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
              <DeleteButton id={product.id} />
            </div>
          )}
=======
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <ProductImages images={product.product_images} title={product.title} />
            <div className="space-y-6">
              <ProductDetails product={product} />
              <ProductActions product={product} />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <ProductReviews productId={product.id} reviews={product.reviews} />
            </div>
            <div>
              <SellerInfo seller={product.seller} />
            </div>
          </div>
>>>>>>> 0c4e38a90ff868b906bd0973817ce070e17ecf55
        </div>
      </main>
      <Footer />
    </div>
  )
}
