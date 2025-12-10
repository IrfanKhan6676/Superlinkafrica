<<<<<<< HEAD
=======
import { createClient } from "@/lib/supabase/server"
>>>>>>> 0c4e38a90ff868b906bd0973817ce070e17ecf55
import ProductCard from "./product-card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface SearchParams {
  category?: string
  search?: string
  min_price?: string
  max_price?: string
  condition?: string
  sort?: string
  page?: string
}

export default async function ProductGrid({ searchParams }: { searchParams: SearchParams }) {
<<<<<<< HEAD
  const page = Number.parseInt(searchParams.page || "1")
  const params = new URLSearchParams()
  params.set('page', String(page))
  // map search/price filters to API params
  if (searchParams.search) params.set('q', searchParams.search)
  if (searchParams.min_price) params.set('priceMin', searchParams.min_price)
  if (searchParams.max_price) params.set('priceMax', searchParams.max_price)
  // map sort options to API format
  if (searchParams.sort === 'price_low') params.set('sort', 'price.asc')
  else if (searchParams.sort === 'price_high') params.set('sort', 'price.desc')
  else params.set('sort', 'created_at.desc')

  const res = await fetch(`/api/products?${params.toString()}`, { cache: 'no-store' })
  if (!res.ok) {
    return <div>Error loading products</div>
  }
  const json = await res.json()
  const products = json.data || []
=======
  const supabase = createClient()
  const page = Number.parseInt(searchParams.page || "1")
  const limit = 20
  const offset = (page - 1) * limit

  let query = supabase
    .from("products")
    .select(`
      *,
      seller:users!products_seller_id_fkey(full_name),
      category:categories(name),
      product_images(image_url, is_primary)
    `)
    .eq("status", "active")
    .range(offset, offset + limit - 1)

  // Apply filters
  if (searchParams.category) {
    const { data: category } = await supabase.from("categories").select("id").eq("slug", searchParams.category).single()

    if (category) {
      query = query.eq("category_id", category.id)
    }
  }

  if (searchParams.search) {
    query = query.ilike("title", `%${searchParams.search}%`)
  }

  if (searchParams.min_price) {
    query = query.gte("price", Number.parseFloat(searchParams.min_price))
  }

  if (searchParams.max_price) {
    query = query.lte("price", Number.parseFloat(searchParams.max_price))
  }

  if (searchParams.condition) {
    query = query.eq("condition", searchParams.condition)
  }

  // Apply sorting
  switch (searchParams.sort) {
    case "price_low":
      query = query.order("price", { ascending: true })
      break
    case "price_high":
      query = query.order("price", { ascending: false })
      break
    case "newest":
      query = query.order("created_at", { ascending: false })
      break
    default:
      query = query.order("created_at", { ascending: false })
  }

  const { data: products, error } = await query

  if (error) {
    return <div>Error loading products</div>
  }
>>>>>>> 0c4e38a90ff868b906bd0973817ce070e17ecf55

  if (!products || products.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
        <p className="text-gray-600 mb-4">Try adjusting your search criteria</p>
        <Button asChild>
          <Link href="/products">Clear Filters</Link>
        </Button>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <p className="text-gray-600">{products.length} products found</p>
        <select className="border border-gray-300 rounded-md px-3 py-2 text-sm">
          <option value="newest">Newest First</option>
          <option value="price_low">Price: Low to High</option>
          <option value="price_high">Price: High to Low</option>
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
<<<<<<< HEAD
        {products.map((product: any) => (
=======
        {products.map((product) => (
>>>>>>> 0c4e38a90ff868b906bd0973817ce070e17ecf55
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {/* Pagination */}
      <div className="flex justify-center mt-8">
        <div className="flex gap-2">
          {page > 1 && (
            <Button variant="outline" asChild>
              <Link href={`/products?${new URLSearchParams({ ...searchParams, page: (page - 1).toString() })}`}>
                Previous
              </Link>
            </Button>
          )}
          <Button variant="outline" asChild>
            <Link href={`/products?${new URLSearchParams({ ...searchParams, page: (page + 1).toString() })}`}>
              Next
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
