"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Package, Truck, CheckCircle, Clock, AlertTriangle, Shield, MessageSquare } from "lucide-react"
import Image from "next/image"
import { confirmDelivery, createDispute } from "@/lib/payment-actions"

interface OrderDetailsProps {
  order: any
  currentUserId: string
}

export default function OrderDetails({ order, currentUserId }: OrderDetailsProps) {
  const primaryImage =
    order.product?.product_images?.find((img: any) => img.is_primary) || order.product?.product_images?.[0]

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-5 w-5" />
      case "confirmed":
        return <Package className="h-5 w-5" />
      case "shipped":
        return <Truck className="h-5 w-5" />
      case "delivered":
        return <CheckCircle className="h-5 w-5" />
      case "cancelled":
        return <AlertTriangle className="h-5 w-5" />
      default:
        return <Clock className="h-5 w-5" />
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

  const handleConfirmDelivery = async () => {
    const result = await confirmDelivery(order.id)
    if (result.success) {
      window.location.reload()
    } else {
      alert(result.error || "Failed to confirm delivery")
    }
  }

  const handleCreateDispute = async () => {
    const reason = prompt("Please describe the issue with your order:")
    if (reason) {
      const result = await createDispute(order.id, reason)
      if (result.success) {
        alert("Dispute created successfully. Our team will review it shortly.")
        window.location.reload()
      } else {
        alert(result.error || "Failed to create dispute")
      }
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Order Details</h1>
          <p className="text-gray-600">Order #{order.id.slice(0, 8)}</p>
        </div>
        <Badge className={`${getStatusColor(order.order_status)} flex items-center gap-2 text-base px-4 py-2`}>
          {getStatusIcon(order.order_status)}
          {order.order_status}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Information */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Product Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <Image
                  src={primaryImage?.image_url || "/placeholder.svg?height=100&width=100"}
                  alt={order.product?.title || "Product"}
                  width={100}
                  height={100}
                  className="rounded-lg object-cover"
                />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{order.product?.title}</h3>
                  <p className="text-sm text-gray-600 mb-1">Seller: {order.seller?.full_name}</p>
                  <p className="text-sm text-gray-600 mb-1">Quantity: {order.quantity}</p>
                  <p className="text-sm text-gray-600">
                    Price: K{(order.total_amount - order.shipping_cost).toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Shipping Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm">
                  <strong>Address:</strong> {order.shipping_address}
                </p>
                <p className="text-sm">
                  <strong>Shipping Cost:</strong> K{order.shipping_cost?.toLocaleString()}
                </p>
                {order.tracking_number && (
                  <p className="text-sm">
                    <strong>Tracking Number:</strong> {order.tracking_number}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payment Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm">
                  <strong>Payment Method:</strong> {order.payment_method?.replace("_", " ").toUpperCase()}
                </p>
                <p className="text-sm">
                  <strong>Payment Status:</strong>{" "}
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      order.payment_status === "paid" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {order.payment_status}
                  </span>
                </p>
                <p className="text-sm">
                  <strong>Total Amount:</strong> K{order.total_amount?.toLocaleString()}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions and Status */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Order Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {order.order_status === "delivered" && !order.escrow_released && order.buyer_id === currentUserId && (
                <Button onClick={handleConfirmDelivery} className="w-full bg-green-600 hover:bg-green-700">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Confirm Receipt
                </Button>
              )}

              {order.order_status === "shipped" && (
                <Button variant="outline" className="w-full bg-transparent">
                  <Truck className="h-4 w-4 mr-2" />
                  Track Package
                </Button>
              )}

              {order.buyer_id === currentUserId && !order.disputes?.length && (
                <Button onClick={handleCreateDispute} variant="outline" className="w-full bg-transparent">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Report Issue
                </Button>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Escrow Protection
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span>Escrow Status:</span>
                  <Badge
                    className={
                      order.escrow_released
                        ? "bg-green-100 text-green-800"
                        : order.escrow_transactions?.[0]?.status === "held"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-yellow-100 text-yellow-800"
                    }
                  >
                    {order.escrow_released ? "Released" : order.escrow_transactions?.[0]?.status || "Pending"}
                  </Badge>
                </div>
                <p className="text-xs text-gray-600">
                  {order.escrow_released
                    ? "Payment has been released to the seller"
                    : "Your payment is safely held in escrow until delivery confirmation"}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Order Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div>
                    <p className="font-medium">Order Placed</p>
                    <p className="text-gray-500">{new Date(order.created_at).toLocaleString()}</p>
                  </div>
                </div>

                {order.order_status !== "pending" && (
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div>
                      <p className="font-medium">Order Confirmed</p>
                      <p className="text-gray-500">{new Date(order.updated_at).toLocaleString()}</p>
                    </div>
                  </div>
                )}

                {(order.order_status === "shipped" || order.order_status === "delivered") && (
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div>
                      <p className="font-medium">Order Shipped</p>
                      <p className="text-gray-500">In transit</p>
                    </div>
                  </div>
                )}

                {order.order_status === "delivered" && (
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div>
                      <p className="font-medium">Order Delivered</p>
                      <p className="text-gray-500">Awaiting confirmation</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
