import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/Input"
import { createClient } from "@/lib/supabase/server"
import { MoreHorizontal, Search, Eye, CheckCircle, XCircle } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import Image from "next/image"

export default async function AdminProducts() {
  const supabase = createClient()

  const { data: products } = await supabase
    .from("products")
    .select(`
      *,
      seller:users!products_seller_id_fkey(full_name, email),
      category:categories(name),
      product_images(image_url, is_primary)
    `)
    .order("created_at", { ascending: false })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "inactive":
        return "bg-gray-100 text-gray-800"
      case "sold":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Product Management</h1>
          <p className="text-gray-600">Monitor and moderate product listings</p>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input placeholder="Search products..." className="pl-10" />
            </div>
            <select className="px-3 py-2 border border-gray-300 rounded-md">
              <option value="">All Categories</option>
              <option value="electronics">Electronics</option>
              <option value="fashion">Fashion</option>
              <option value="home">Home & Garden</option>
            </select>
            <select className="px-3 py-2 border border-gray-300 rounded-md">
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Products List */}
      <div className="space-y-4">
        {products?.map((product) => {
          const primaryImage = product.product_images?.find((img) => img.is_primary) || product.product_images?.[0]

          return (
            <Card key={product.id}>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <Image
                    src={primaryImage?.image_url || "/placeholder.svg?height=80&width=80"}
                    alt={product.title}
                    width={80}
                    height={80}
                    className="rounded-lg object-cover"
                  />

                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-semibold text-gray-900">{product.title}</h3>
                          <Badge className={getStatusColor(product.status)}>{product.status}</Badge>
                          {product.listing_type === "auction" && <Badge className="bg-orange-500">Auction</Badge>}
                        </div>
                        <p className="text-sm text-gray-600 mb-1">
                          by {product.seller?.full_name} ({product.seller?.email})
                        </p>
                        <p className="text-sm text-gray-500">
                          {product.category?.name} • {new Date(product.created_at).toLocaleDateString()}
                        </p>
                      </div>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="h-4 w-4 mr-2" />
                            View Product
                          </DropdownMenuItem>
                          {product.status === "pending" && (
                            <>
                              <DropdownMenuItem className="text-green-600">
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Approve Product
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-red-600">
                                <XCircle className="h-4 w-4 mr-2" />
                                Reject Product
                              </DropdownMenuItem>
                            </>
                          )}
                          {product.status === "active" && (
                            <DropdownMenuItem className="text-red-600">
                              <XCircle className="h-4 w-4 mr-2" />
                              Deactivate Product
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-600">
                        <p className="line-clamp-2 mb-2">{product.description}</p>
                        <div className="flex items-center gap-4">
                          <span>
                            {product.listing_type === "auction"
                              ? `Current bid: K${product.current_bid?.toLocaleString() || 0}`
                              : `Price: K${product.price?.toLocaleString() || 0}`}
                          </span>
                          <span>Views: {product.views_count || 0}</span>
                          <span>Location: {product.location}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
