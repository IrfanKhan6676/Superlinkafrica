"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Loader2, CreditCard, Smartphone, Shield } from "lucide-react"
import { createOrder } from "@/lib/payment-actions"

interface Product {
  id: string
  title: string
  price: number
  listing_type: string
  current_bid?: number
  seller_id: string
  seller: { full_name: string; email: string }
}

interface CheckoutFormProps {
  product: Product
  buyerId: string
}

export default function CheckoutForm({ product, buyerId }: CheckoutFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState("mtn_mobile_money")
  const [quantity, setQuantity] = useState(1)

  const finalPrice = product.listing_type === "auction" ? product.current_bid || product.price : product.price
  const shippingCost = 50 // Fixed shipping cost for demo
  const totalAmount = finalPrice * quantity + shippingCost

  const handleSubmit = async (formData: FormData) => {
    setLoading(true)
    try {
      // Add additional data to form
      formData.append("product_id", product.id)
      formData.append("seller_id", product.seller_id)
      formData.append("buyer_id", buyerId)
      formData.append("quantity", quantity.toString())
      formData.append("total_amount", totalAmount.toString())
      formData.append("shipping_cost", shippingCost.toString())
      formData.append("payment_method", paymentMethod)

      const result = await createOrder(formData)
      if (result.success) {
        router.push(`/orders/${result.orderId}`)
      } else {
        alert(result.error || "Failed to create order")
      }
    } catch (error) {
      alert("An error occurred while processing your order")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      {/* Shipping Information */}
      <Card>
        <CardHeader>
          <CardTitle>Shipping Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">First Name *</Label>
              <Input id="firstName" name="firstName" required className="mt-1" />
            </div>
            <div>
              <Label htmlFor="lastName">Last Name *</Label>
              <Input id="lastName" name="lastName" required className="mt-1" />
            </div>
          </div>

          <div>
            <Label htmlFor="phone">Phone Number *</Label>
            <Input id="phone" name="phone" type="tel" required placeholder="+260..." className="mt-1" />
          </div>

          <div>
            <Label htmlFor="address">Shipping Address *</Label>
            <Textarea
              id="address"
              name="shipping_address"
              required
              rows={3}
              placeholder="Enter your full address including city and province"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="quantity">Quantity</Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              max="10"
              value={quantity}
              onChange={(e) => setQuantity(Number.parseInt(e.target.value) || 1)}
              className="mt-1 w-24"
            />
          </div>
        </CardContent>
      </Card>

      {/* Payment Method */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Payment Method
          </CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-4">
            <div className="flex items-center space-x-3 p-4 border rounded-lg">
              <RadioGroupItem value="mtn_mobile_money" id="mtn" />
              <Label htmlFor="mtn" className="flex items-center gap-3 cursor-pointer flex-1">
                <Smartphone className="h-5 w-5 text-yellow-600" />
                <div>
                  <p className="font-medium">MTN Mobile Money</p>
                  <p className="text-sm text-gray-600">Pay with your MTN Mobile Money wallet</p>
                </div>
              </Label>
            </div>

            <div className="flex items-center space-x-3 p-4 border rounded-lg">
              <RadioGroupItem value="airtel_money" id="airtel" />
              <Label htmlFor="airtel" className="flex items-center gap-3 cursor-pointer flex-1">
                <Smartphone className="h-5 w-5 text-red-600" />
                <div>
                  <p className="font-medium">Airtel Money</p>
                  <p className="text-sm text-gray-600">Pay with your Airtel Money wallet</p>
                </div>
              </Label>
            </div>

            <div className="flex items-center space-x-3 p-4 border rounded-lg">
              <RadioGroupItem value="card" id="card" />
              <Label htmlFor="card" className="flex items-center gap-3 cursor-pointer flex-1">
                <CreditCard className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium">Credit/Debit Card</p>
                  <p className="text-sm text-gray-600">Pay with Visa, Mastercard, or other cards</p>
                </div>
              </Label>
            </div>
          </RadioGroup>

          {/* Payment Details */}
          {(paymentMethod === "mtn_mobile_money" || paymentMethod === "airtel_money") && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <Label htmlFor="mobileNumber">Mobile Number *</Label>
              <Input
                id="mobileNumber"
                name="mobile_number"
                type="tel"
                required
                placeholder="+260..."
                className="mt-1"
              />
            </div>
          )}

          {paymentMethod === "card" && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-4">
              <div>
                <Label htmlFor="cardNumber">Card Number *</Label>
                <Input id="cardNumber" name="card_number" required placeholder="1234 5678 9012 3456" className="mt-1" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="expiryDate">Expiry Date *</Label>
                  <Input id="expiryDate" name="expiry_date" required placeholder="MM/YY" className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="cvv">CVV *</Label>
                  <Input id="cvv" name="cvv" required placeholder="123" className="mt-1" />
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Escrow Information */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <Shield className="h-6 w-6 text-green-600 mt-1" />
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Secure Escrow Protection</h3>
              <p className="text-sm text-gray-600 mb-2">
                Your payment will be held securely in escrow until you confirm receipt of the item. This protects both
                buyers and sellers.
              </p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Payment is held safely until delivery confirmation</li>
                <li>• Seller receives payment only after successful delivery</li>
                <li>• Full refund if item is not as described</li>
                <li>• Dispute resolution available if needed</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Submit */}
      <div className="flex justify-end">
        <Button type="submit" disabled={loading} size="lg" className="bg-blue-600 hover:bg-blue-700 px-8">
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            `Pay K${totalAmount.toLocaleString()} - Place Order`
          )}
        </Button>
      </div>
    </form>
  )
}
