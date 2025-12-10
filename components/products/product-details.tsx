import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Clock, MapPin, Eye } from "lucide-react"

interface ProductDetailsProps {
  product: {
    id: string
    title: string
    description: string
    price: number
    condition: string
    listing_type: string
    location?: string
    views?: number
    created_at: string
    category: {
      name: string
    }
  }
}

export default function ProductDetails({ product }: ProductDetailsProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-ZM", {
      style: "currency",
      currency: "ZMW",
    }).format(price)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-ZM", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{product.title}</h1>
            <div className="flex items-center gap-2 mb-4">
              <Badge variant={product.listing_type === "auction" ? "destructive" : "default"}>
                {product.listing_type === "auction" ? "Auction" : "Fixed Price"}
              </Badge>
              <Badge variant="outline" className="capitalize">
                {product.condition}
              </Badge>
              <Badge variant="secondary">{product.category.name}</Badge>
            </div>
          </div>

          <div className="text-3xl font-bold text-blue-600">
            {formatPrice(product.price)}
            {product.listing_type === "auction" && (
              <span className="text-sm font-normal text-gray-500 ml-2">Current bid</span>
            )}
          </div>

          <div className="prose max-w-none">
            <h3 className="text-lg font-semibold mb-2">Description</h3>
            <p className="text-gray-700 whitespace-pre-wrap">{product.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="h-4 w-4" />
              <span>Listed {formatDate(product.created_at)}</span>
            </div>
            {product.location && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="h-4 w-4" />
                <span>{product.location}</span>
              </div>
            )}
            {product.views && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Eye className="h-4 w-4" />
                <span>{product.views} views</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
