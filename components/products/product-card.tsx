import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Heart, Clock } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

interface ProductCardProps {
  product: {
    id: string
    title: string
    price: number
    condition: string
    listing_type: string
    auction_end_date?: string
    current_bid?: number
    location: string
    created_at: string
    seller: { full_name: string }
    category: { name: string }
    product_images: { image_url: string; is_primary: boolean }[]
  }
}

export default function ProductCard({ product }: ProductCardProps) {
  const primaryImage = product.product_images.find((img) => img.is_primary) || product.product_images[0]
  const isAuction = product.listing_type === "auction"
  const timeLeft = product.auction_end_date ? new Date(product.auction_end_date).getTime() - Date.now() : 0
  const hoursLeft = Math.max(0, Math.floor(timeLeft / (1000 * 60 * 60)))

  return (
    <Link href={`/products/${product.id}`}>
      <Card className="group hover:shadow-lg transition-shadow cursor-pointer">
        <CardContent className="p-4">
          <div className="relative mb-4">
            <Image
              src={primaryImage?.image_url || "/placeholder.svg?height=200&width=200"}
              alt={product.title}
              width={200}
              height={200}
              className="w-full h-48 object-cover rounded-md"
            />
            <div className="absolute top-2 left-2 flex gap-2">
              <Badge variant={product.condition === "new" ? "default" : "secondary"}>{product.condition}</Badge>
              {isAuction && (
                <Badge className="bg-orange-500">
                  <Clock className="h-3 w-3 mr-1" />
                  {hoursLeft}h
                </Badge>
              )}
            </div>
            <button className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity">
              <Heart className="h-4 w-4 text-gray-600" />
            </button>
          </div>

          <div className="space-y-2">
            <h3 className="font-medium text-gray-900 line-clamp-2 group-hover:text-blue-600">{product.title}</h3>

            <div className="flex items-center justify-between">
              <div>
                {isAuction ? (
                  <div>
                    <p className="text-sm text-gray-600">Current bid</p>
                    <span className="text-lg font-bold text-gray-900">
                      K{product.current_bid?.toLocaleString() || product.price.toLocaleString()}
                    </span>
                  </div>
                ) : (
                  <span className="text-lg font-bold text-gray-900">K{product.price.toLocaleString()}</span>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>{product.location}</span>
              <span>{product.category.name}</span>
            </div>

            <p className="text-sm text-gray-600">by {product.seller.full_name}</p>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
