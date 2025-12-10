import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Star, MessageCircle, Store, Shield } from "lucide-react"
import Link from "next/link"

interface SellerInfoProps {
  seller: {
    id: string
    full_name: string
    email: string
    created_at: string
    seller_verification?: {
      status: string
      business_name?: string
    }
  }
  stats?: {
    total_products: number
    total_sales: number
    rating: number
    reviews_count: number
  }
}

export default function SellerInfo({ seller, stats }: SellerInfoProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-ZM", {
      year: "numeric",
      month: "long",
    })
  }

  const isVerified = seller.seller_verification?.status === "approved"

  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-lg">
                  {seller.seller_verification?.business_name || seller.full_name}
                </h3>
                {isVerified && (
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    <Shield className="w-3 h-3 mr-1" />
                    Verified
                  </Badge>
                )}
              </div>
              <p className="text-sm text-gray-600">Seller since {formatDate(seller.created_at)}</p>
            </div>
          </div>

          {stats && (
            <div className="grid grid-cols-2 gap-4 py-4 border-t border-b">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.total_products}</div>
                <div className="text-sm text-gray-600">Products</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.total_sales}</div>
                <div className="text-sm text-gray-600">Sales</div>
              </div>
            </div>
          )}

          {stats && stats.reviews_count > 0 && (
            <div className="flex items-center gap-2">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.floor(stats.rating) ? "text-yellow-400 fill-current" : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm font-medium">{stats.rating.toFixed(1)}</span>
              <span className="text-sm text-gray-600">({stats.reviews_count} reviews)</span>
            </div>
          )}

          <div className="space-y-2">
            <Button variant="outline" className="w-full bg-transparent">
              <MessageCircle className="mr-2 h-4 w-4" />
              Contact Seller
            </Button>
            <Link href={`/seller/${seller.id}/products`}>
              <Button variant="outline" className="w-full bg-transparent">
                <Store className="mr-2 h-4 w-4" />
                View Store
              </Button>
            </Link>
          </div>

          <div className="text-xs text-gray-500 space-y-1">
            <p>• Responds within 24 hours</p>
            <p>• Ships from Lusaka, Zambia</p>
            {isVerified && <p>• Identity verified by Superlink</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
