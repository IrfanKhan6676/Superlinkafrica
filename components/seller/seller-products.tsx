import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/server"
import { Edit, Trash2, Eye, MoreHorizontal, Package } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import Image from "next/image"
import Link from "next/link"

export default async function SellerProducts({ sellerId }: { sellerId: string }) {
  const supabase = createClient()

  const { data: products } = await supabase
    .from("products")
    .select(`
      *,
      category:categories(name),
      product_images(image_url, is_primary),
      _count:orders(count)
    `)
    .eq("seller_id", sellerId)
    .order("created_at", { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Products</h1>
          <p className="text-gray-600">Manage your product listings</p>
        </div>
        <Button asChild className="bg-blue-600 hover:bg-blue-700">
          <Link href="/sell">Add New Product</Link>
        </Button>
      </div>

      {products && products.length > 0 ? (
        <div className="grid gap-6">
          {products.map((product) => {
            const primaryImage = product.product_images?.find((img) => img.is_primary) || product.product_images?.[0]

            return (
              <Card key={product.id}>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <Image
                      src={primaryImage?.image_url || "/placeholder.svg?height=100&width=100"}
                      alt={product.title}
                      width={100}
                      height={100}
                      className="rounded-lg object-cover"
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">{product.title}</h3>
                          <p className="text-sm text-gray-600 mb-2">{product.category?.name}</p>
                          <p className="text-gray-700 line-clamp-2 mb-3">{product.description}</p>
                        </div>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/products/${product.id}`}>
                                <Eye className="h-4 w-4 mr-2" />
                                View Product
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit Product
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete Product
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      <div className="flex items-center gap-4 mt-4">
                        <div className="flex items-center gap-2">
                          <Badge variant={product.status === "active" ? "default" : "secondary"}>
                            {product.status}
                          </Badge>
                          <Badge variant="outline">{product.condition}</Badge>
                          {product.listing_type === "auction" && <Badge className="bg-orange-500">Auction</Badge>}
                        </div>

                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span>Views: {product.views_count || 0}</span>
                          <span>•</span>
                          <span>
                            {product.listing_type === "auction"
                              ? `Current bid: K${product.current_bid?.toLocaleString() || 0}`
                              : `Price: K${product.price?.toLocaleString() || 0}`}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="mb-4">
                <Package className="h-12 w-12 text-gray-400 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No products yet</h3>
              <p className="text-gray-600 mb-6">Start selling by creating your first product listing</p>
              <Button asChild className="bg-blue-600 hover:bg-blue-700">
                <Link href="/sell">List Your First Product</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
