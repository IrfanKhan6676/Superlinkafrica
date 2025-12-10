import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import Image from "next/image"

interface Product {
  id: string
  title: string
  price: number
  listing_type: string
  current_bid?: number
  seller: { full_name: string }
  product_images: { image_url: string; is_primary: boolean }[]
}

interface OrderSummaryProps {
  product: Product
}

export default function OrderSummary({ product }: OrderSummaryProps) {
  const primaryImage = product.product_images?.find((img) => img.is_primary) || product.product_images?.[0]
  const finalPrice = product.listing_type === "auction" ? product.current_bid || product.price : product.price
  const quantity = 1
  const shippingCost = 50
  const totalAmount = finalPrice * quantity + shippingCost

  return (
    <Card className="sticky top-8">
      <CardHeader>
        <CardTitle>Order Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Product Info */}
        <div className="flex gap-4">
          <Image
            src={primaryImage?.image_url || "/placeholder.svg?height=80&width=80"}
            alt={product.title}
            width={80}
            height={80}
            className="rounded-lg object-cover"
          />
          <div className="flex-1">
            <h3 className="font-medium text-gray-900 line-clamp-2">{product.title}</h3>
            <p className="text-sm text-gray-600">by {product.seller.full_name}</p>
            <p className="text-sm text-gray-500">Quantity: {quantity}</p>
          </div>
        </div>

        <Separator />

        {/* Price Breakdown */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Item price</span>
            <span>K{finalPrice.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Quantity</span>
            <span>×{quantity}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Shipping</span>
            <span>K{shippingCost.toLocaleString()}</span>
          </div>
          <Separator />
          <div className="flex justify-between font-medium text-lg">
            <span>Total</span>
            <span>K{totalAmount.toLocaleString()}</span>
          </div>
        </div>

        {/* Security Notice */}
        <div className="bg-green-50 p-3 rounded-lg">
          <p className="text-sm text-green-700">
            <strong>Secure Payment:</strong> Your payment is protected by escrow until delivery confirmation.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
