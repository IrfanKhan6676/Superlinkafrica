"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Truck, Package, DollarSign, Star, MapPin, Clock, CheckCircle, XCircle } from "lucide-react"

interface PartnerStats {
  totalDeliveries: number
  activeShipments: number
  totalEarnings: number
  averageRating: number
  completionRate: number
}

interface Shipment {
  id: string
  tracking_number: string
  status: string
  pickup_address: any
  delivery_address: any
  delivery_cost: number
  pickup_scheduled_at: string
  special_instructions?: string
}

export function PartnerDashboard() {
  const [stats, setStats] = useState<PartnerStats | null>(null)
  const [activeShipments, setActiveShipments] = useState<Shipment[]>([])
  const [completedShipments, setCompletedShipments] = useState<Shipment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const [statsResponse, shipmentsResponse] = await Promise.all([
        fetch("/api/logistics/partner/stats"),
        fetch("/api/logistics/partner/shipments"),
      ])

      const statsData = await statsResponse.json()
      const shipmentsData = await shipmentsResponse.json()

      setStats(statsData.stats)
      setActiveShipments(shipmentsData.active || [])
      setCompletedShipments(shipmentsData.completed || [])
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  const updateShipmentStatus = async (shipmentId: string, status: string) => {
    try {
      await fetch(`/api/logistics/shipments/${shipmentId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })

      fetchDashboardData() // Refresh data
    } catch (error) {
      console.error("Failed to update shipment status:", error)
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center p-8">Loading dashboard...</div>
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Package className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium">Total Deliveries</p>
                <p className="text-2xl font-bold text-blue-600">{stats?.totalDeliveries || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Truck className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-sm font-medium">Active Shipments</p>
                <p className="text-2xl font-bold text-orange-600">{stats?.activeShipments || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm font-medium">Total Earnings</p>
                <p className="text-2xl font-bold text-green-600">ZMW {stats?.totalEarnings?.toFixed(2) || "0.00"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Star className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-sm font-medium">Average Rating</p>
                <p className="text-2xl font-bold text-yellow-600">{stats?.averageRating?.toFixed(1) || "0.0"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm font-medium">Completion Rate</p>
                <p className="text-2xl font-bold text-purple-600">{stats?.completionRate?.toFixed(0) || 0}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Shipments Management */}
      <Card>
        <CardHeader>
          <CardTitle>Shipment Management</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="active" className="w-full">
            <TabsList>
              <TabsTrigger value="active">Active Shipments ({activeShipments.length})</TabsTrigger>
              <TabsTrigger value="completed">Completed ({completedShipments.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="active" className="space-y-4">
              {activeShipments.length === 0 ? (
                <Alert>
                  <Package className="h-4 w-4" />
                  <AlertDescription>No active shipments at the moment.</AlertDescription>
                </Alert>
              ) : (
                activeShipments.map((shipment) => (
                  <Card key={shipment.id} className="border-l-4 border-l-blue-500">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline">{shipment.tracking_number}</Badge>
                            <Badge className="bg-blue-100 text-blue-800">{shipment.status.replace("_", " ")}</Badge>
                          </div>

                          <div className="space-y-1 text-sm">
                            <div className="flex items-center space-x-2">
                              <MapPin className="h-3 w-3 text-gray-500" />
                              <span>
                                <strong>Pickup:</strong> {shipment.pickup_address.street},{" "}
                                {shipment.pickup_address.city}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <MapPin className="h-3 w-3 text-gray-500" />
                              <span>
                                <strong>Delivery:</strong> {shipment.delivery_address.street},{" "}
                                {shipment.delivery_address.city}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Clock className="h-3 w-3 text-gray-500" />
                              <span>
                                <strong>Scheduled:</strong> {new Date(shipment.pickup_scheduled_at).toLocaleString()}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <DollarSign className="h-3 w-3 text-gray-500" />
                              <span>
                                <strong>Earnings:</strong> ZMW {(shipment.delivery_cost * 0.8).toFixed(2)}
                              </span>
                            </div>
                          </div>

                          {shipment.special_instructions && (
                            <Alert className="mt-2">
                              <AlertDescription className="text-sm">
                                <strong>Special Instructions:</strong> {shipment.special_instructions}
                              </AlertDescription>
                            </Alert>
                          )}
                        </div>

                        <div className="flex flex-col space-y-2">
                          {shipment.status === "assigned" && (
                            <Button
                              size="sm"
                              onClick={() => updateShipmentStatus(shipment.id, "picked_up")}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Mark Picked Up
                            </Button>
                          )}

                          {shipment.status === "picked_up" && (
                            <Button
                              size="sm"
                              onClick={() => updateShipmentStatus(shipment.id, "in_transit")}
                              className="bg-blue-600 hover:bg-blue-700"
                            >
                              <Truck className="h-4 w-4 mr-2" />
                              In Transit
                            </Button>
                          )}

                          {shipment.status === "in_transit" && (
                            <Button
                              size="sm"
                              onClick={() => updateShipmentStatus(shipment.id, "delivered")}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Mark Delivered
                            </Button>
                          )}

                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateShipmentStatus(shipment.id, "failed")}
                            className="border-red-200 text-red-600 hover:bg-red-50"
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Report Issue
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>

            <TabsContent value="completed" className="space-y-4">
              {completedShipments.length === 0 ? (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>No completed shipments yet.</AlertDescription>
                </Alert>
              ) : (
                completedShipments.slice(0, 10).map((shipment) => (
                  <Card key={shipment.id} className="border-l-4 border-l-green-500">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline">{shipment.tracking_number}</Badge>
                            <Badge className="bg-green-100 text-green-800">{shipment.status.replace("_", " ")}</Badge>
                          </div>
                          <p className="text-sm text-gray-600">
                            {shipment.pickup_address.city} → {shipment.delivery_address.city}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-green-600">
                            ZMW {(shipment.delivery_cost * 0.8).toFixed(2)}
                          </p>
                          <p className="text-xs text-gray-500">Earned</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
