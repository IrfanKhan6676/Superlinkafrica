import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/server"
import { Package, Truck, CheckCircle, Clock, AlertTriangle } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export default async function OrdersList({ userId }: { userId: string }) {
  const supabase = createClient()

  const { data: orders } = await supabase
    .from("orders")
    .select(`
      *,
      seller:users!orders_seller_id_fkey(full_name),
      product:products(title, product_images(image_url, is_primary)),
      escrow_transactions(status)
    `)
    .eq("buyer_id", userId)
    .order("created_at", { ascending: false })

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4" />
      case "confirmed":
        return <Package className="h-4 w-4" />
      case "shipped":
        return <Truck className="h-4 w-4" />
      case "delivered":
        return <CheckCircle className="h-4 w-4" />
      case "cancelled":
        return <AlertTriangle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "confirmed":
        return "bg-blue-100 text-blue-800"
      case "shipped":
        return "bg-purple-100 text-purple-800"
      case "delivered":
        return "bg-green-100 text-green-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (!orders || orders.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <div className="max-w-md mx-auto">
            <div className="mb-4">
              <Package className="h-12 w-12 text-gray-400 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
            <p className="text-gray-600 mb-6">Start shopping to see your orders here</p>
            <Button asChild className="bg-blue-600 hover:bg-blue-700">
              <Link href="/products">Browse Products</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => {
        const primaryImage =
          order.product?.product_images?.find((img) => img.is_primary) || order.product?.product_images?.[0]

        return (
          <Card key={order.id}>
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <Image
                  src={primaryImage?.image_url || "/placeholder.svg?height=80&width=80"}
                  alt={order.product?.title || "Product"}
                  width={80}
                  height={80}
                  className="rounded-lg object-cover"
                />

                <div className="flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">{order.product?.title}</h3>
                      <p className="text-sm text-gray-600 mb-1">by {order.seller?.full_name}</p>
                      <p className="text-sm text-gray-500">Order #{order.id.slice(0, 8)}</p>
                    </div>

                    <div className="text-right">
                      <p className="text-lg font-semibold text-gray-900 mb-2">
                        K{order.total_amount?.toLocaleString()}
                      </p>
                      <Badge className={`${getStatusColor(order.order_status)} flex items-center gap-1`}>
                        {getStatusIcon(order.order_status)}
                        {order.order_status}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      <p>Quantity: {order.quantity}</p>
                      <p>Order Date: {new Date(order.created_at).toLocaleDateString()}</p>
                      <p>Payment: {order.payment_method?.replace("_", " ").toUpperCase()}</p>
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/orders/${order.id}`}>View Details</Link>
                      </Button>

                      {order.order_status === "delivered" && !order.escrow_released && (
                        <Button size="sm" className="bg-green-600 hover:bg-green-700">
                          Confirm Receipt
                        </Button>
                      )}

                      {order.order_status === "shipped" && (
                        <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                          Track Package
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
