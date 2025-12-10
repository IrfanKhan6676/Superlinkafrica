"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/Input"
import { Card, CardContent } from "@/components/ui/card"
import { Heart, Share2, ShoppingCart, Gavel } from "lucide-react"
import { useRouter } from "next/navigation"

interface ProductActionsProps {
  product: {
    id: string
    title: string
    price: number
    listing_type: string
    seller_id: string
  }
  currentUserId?: string
}

export default function ProductActions({ product, currentUserId }: ProductActionsProps) {
  const router = useRouter()
  const [bidAmount, setBidAmount] = useState("")
  const [isWishlisted, setIsWishlisted] = useState(false)

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-ZM", {
      style: "currency",
      currency: "ZMW",
    }).format(price)
  }

  const handleBuyNow = () => {
    if (!currentUserId) {
      router.push("/auth/login")
      return
    }
    router.push(`/checkout/${product.id}`)
  }

  const handlePlaceBid = () => {
    if (!currentUserId) {
      router.push("/auth/login")
      return
    }
    // Handle bid placement logic
    console.log("Placing bid:", bidAmount)
  }

  const handleWishlist = () => {
    if (!currentUserId) {
      router.push("/auth/login")
      return
    }
    setIsWishlisted(!isWishlisted)
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.title,
        url: window.location.href,
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
    }
  }

  const isOwnProduct = currentUserId === product.seller_id

  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-4">
          {product.listing_type === "fixed" ? (
            <div className="space-y-3">
              <div className="text-2xl font-bold text-blue-600">{formatPrice(product.price)}</div>
              <Button
                onClick={handleBuyNow}
                disabled={isOwnProduct}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                size="lg"
              >
                <ShoppingCart className="mr-2 h-4 w-4" />
                {isOwnProduct ? "Your Product" : "Buy Now"}
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="text-2xl font-bold text-blue-600">
                {formatPrice(product.price)}
                <span className="text-sm font-normal text-gray-500 block">Current bid</span>
              </div>

              {!isOwnProduct && (
                <div className="space-y-2">
                  <Input
                    type="number"
                    placeholder="Enter bid amount"
                    value={bidAmount}
                    onChange={(e) => setBidAmount(e.target.value)}
                    min={product.price + 1}
                  />
                  <Button
                    onClick={handlePlaceBid}
                    disabled={!bidAmount || Number.parseFloat(bidAmount) <= product.price}
                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                    size="lg"
                  >
                    <Gavel className="mr-2 h-4 w-4" />
                    Place Bid
                  </Button>
                </div>
              )}

              {isOwnProduct && <div className="text-center text-gray-500 py-4">This is your auction listing</div>}
            </div>
          )}

          <div className="flex gap-2">
            <Button variant="outline" onClick={handleWishlist} className="flex-1 bg-transparent">
              <Heart className={`mr-2 h-4 w-4 ${isWishlisted ? "fill-red-500 text-red-500" : ""}`} />
              {isWishlisted ? "Saved" : "Save"}
            </Button>
            <Button variant="outline" onClick={handleShare} className="flex-1 bg-transparent">
              <Share2 className="mr-2 h-4 w-4" />
              Share
            </Button>
          </div>

          <div className="text-xs text-gray-500 text-center">
            {product.listing_type === "auction" ? "Auction ends in 3 days" : "Free shipping on orders over ZMW 500"}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
