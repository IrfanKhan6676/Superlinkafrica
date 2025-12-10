"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/Input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Truck, MapPin, Clock, Package, CheckCircle, AlertCircle } from "lucide-react"

interface TrackingData {
  shipment: {
    id: string
    tracking_number: string
    status: string
    pickup_address: any
    delivery_address: any
    estimated_delivery: string
    delivery_partner: {
      business_name: string
      partner_type: string
    }
  }
  tracking: Array<{
    location_name: string
    status_update: string
    notes: string
    recorded_at: string
  }>
}

export function ShipmentTracking() {
  const [trackingNumber, setTrackingNumber] = useState("")
  const [trackingData, setTrackingData] = useState<TrackingData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const trackShipment = async () => {
    if (!trackingNumber.trim()) {
      setError("Please enter a tracking number")
      return
    }

    setLoading(true)
    setError("")

    try {
      const response = await fetch(`/api/logistics/track/${trackingNumber}`)
      const data = await response.json()

      if (response.ok) {
        setTrackingData(data)
      } else {
        setError(data.error || "Shipment not found")
      }
    } catch (error) {
      setError("Failed to track shipment")
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "bg-green-100 text-green-800 border-green-200"
      case "in_transit":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "picked_up":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "failed":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "delivered":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "in_transit":
        return <Truck className="h-4 w-4 text-blue-600" />
      case "picked_up":
        return <Package className="h-4 w-4 text-yellow-600" />
      case "failed":
        return <AlertCircle className="h-4 w-4 text-red-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Tracking Input */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Package className="h-5 w-5" />
            <span>Track Your Shipment</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex space-x-2">
            <Input
              placeholder="Enter tracking number (e.g., SL20241201001)"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && trackShipment()}
            />
            <Button onClick={trackShipment} disabled={loading}>
              {loading ? "Tracking..." : "Track"}
            </Button>
          </div>
          {error && (
            <Alert className="border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Tracking Results */}
      {trackingData && (
        <div className="space-y-6">
          {/* Shipment Overview */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Shipment Details</CardTitle>
                <Badge className={getStatusColor(trackingData.shipment.status)}>
                  {trackingData.shipment.status.replace("_", " ").toUpperCase()}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Tracking Number</label>
                  <p className="font-mono text-lg">{trackingData.shipment.tracking_number}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Delivery Partner</label>
                  <p className="flex items-center space-x-2">
                    <Truck className="h-4 w-4" />
                    <span>{trackingData.shipment.delivery_partner.business_name}</span>
                    <Badge variant="outline">
                      {trackingData.shipment.delivery_partner.partner_type === "biker"
                        ? "Local Delivery"
                        : "Bus Transport"}
                    </Badge>
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Pickup Address</label>
                  <p className="text-sm">
                    {trackingData.shipment.pickup_address.street}, {trackingData.shipment.pickup_address.city}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Delivery Address</label>
                  <p className="text-sm">
                    {trackingData.shipment.delivery_address.street}, {trackingData.shipment.delivery_address.city}
                  </p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">Estimated Delivery</label>
                <p className="flex items-center space-x-2">
                  <Clock className="h-4 w-4" />
                  <span>{new Date(trackingData.shipment.estimated_delivery).toLocaleString()}</span>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Tracking Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MapPin className="h-5 w-5" />
                <span>Tracking History</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {trackingData.tracking
                  .sort((a, b) => new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime())
                  .map((update, index) => (
                    <div
                      key={index}
                      className="flex items-start space-x-4 pb-4 border-b border-gray-100 last:border-b-0"
                    >
                      <div className="flex-shrink-0 mt-1">{getStatusIcon(trackingData.shipment.status)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-gray-900">{update.status_update}</p>
                          <p className="text-sm text-gray-500">{new Date(update.recorded_at).toLocaleString()}</p>
                        </div>
                        {update.location_name && (
                          <p className="text-sm text-gray-600 flex items-center space-x-1 mt-1">
                            <MapPin className="h-3 w-3" />
                            <span>{update.location_name}</span>
                          </p>
                        )}
                        {update.notes && <p className="text-sm text-gray-500 mt-1">{update.notes}</p>}
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>

          {/* Delivery Status Actions */}
          {trackingData.shipment.status === "delivered" && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Your package has been successfully delivered! If you have any issues, please contact customer support.
              </AlertDescription>
            </Alert>
          )}

          {trackingData.shipment.status === "failed" && (
            <Alert className="border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                There was an issue with your delivery. Our team will contact you shortly to resolve this.
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}
    </div>
  )
}
