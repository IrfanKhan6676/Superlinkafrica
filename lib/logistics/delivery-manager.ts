import { createClient } from "@/lib/supabase/server"

export interface DeliveryPartner {
  id: string
  partnerType: "biker" | "bus_company"
  businessName?: string
  vehicleDetails: any
  serviceAreas: string[]
  baseRate: number
  perKmRate: number
  rating: number
  totalDeliveries: number
  isActive: boolean
  isVerified: boolean
}

export interface ShipmentRequest {
  orderId: string
  pickupAddress: {
    street: string
    city: string
    coordinates: { lat: number; lng: number }
  }
  deliveryAddress: {
    street: string
    city: string
    coordinates: { lat: number; lng: number }
  }
  deliveryType: "standard" | "express" | "scheduled"
  scheduledPickup?: string
  specialInstructions?: string
}

export class DeliveryManager {
  private supabase = createClient()

  // Find available delivery partners for a shipment
  async findAvailablePartners(request: ShipmentRequest): Promise<DeliveryPartner[]> {
    try {
      const distance = this.calculateDistance(request.pickupAddress.coordinates, request.deliveryAddress.coordinates)

      // Determine if intercity delivery is needed
      const isIntercity = request.pickupAddress.city !== request.deliveryAddress.city

      let query = this.supabase.from("delivery_partners").select("*").eq("is_active", true).eq("is_verified", true)

      if (isIntercity) {
        // Look for bus companies with routes between cities
        const { data: busRoutes } = await this.supabase
          .from("bus_routes")
          .select("partner_id")
          .eq("origin_city", request.pickupAddress.city)
          .eq("destination_city", request.deliveryAddress.city)
          .eq("is_active", true)

        if (busRoutes && busRoutes.length > 0) {
          const partnerIds = busRoutes.map((route) => route.partner_id)
          query = query.in("id", partnerIds)
        } else {
          return [] // No bus routes available
        }
      } else {
        // Local delivery - look for bikers
        query = query.eq("partner_type", "biker")
      }

      const { data: partners, error } = await query.order("rating", { ascending: false }).limit(10)

      if (error) throw error

      // Filter partners by service area
      const availablePartners = partners?.filter((partner) => {
        const serviceAreas = partner.service_areas as string[]
        return serviceAreas.includes(request.pickupAddress.city) || serviceAreas.includes("all")
      })

      return availablePartners || []
    } catch (error) {
      console.error("Error finding delivery partners:", error)
      return []
    }
  }

  // Create a new shipment
  async createShipment(request: ShipmentRequest): Promise<{ shipmentId: string; trackingNumber: string }> {
    try {
      // Find the best delivery partner
      const availablePartners = await this.findAvailablePartners(request)

      if (availablePartners.length === 0) {
        throw new Error("No delivery partners available for this route")
      }

      // Select partner with highest rating
      const selectedPartner = availablePartners[0]

      // Calculate delivery cost
      const distance = this.calculateDistance(request.pickupAddress.coordinates, request.deliveryAddress.coordinates)
      const deliveryCost = selectedPartner.baseRate + distance * selectedPartner.perKmRate

      // Determine shipment type and estimated delivery
      const shipmentType = selectedPartner.partnerType
      const estimatedDelivery = this.calculateEstimatedDelivery(shipmentType, distance)

      // Create shipment record
      const { data: shipment, error } = await this.supabase
        .from("shipments")
        .insert({
          order_id: request.orderId,
          delivery_partner_id: selectedPartner.id,
          shipment_type: shipmentType,
          pickup_address: request.pickupAddress,
          delivery_address: request.deliveryAddress,
          pickup_scheduled_at: request.scheduledPickup || new Date().toISOString(),
          estimated_delivery: estimatedDelivery,
          delivery_cost: deliveryCost,
          special_instructions: request.specialInstructions,
          status: "assigned",
        })
        .select("id, tracking_number")
        .single()

      if (error) throw error

      // Create initial tracking entry
      await this.addTrackingUpdate(shipment.id, {
        location: request.pickupAddress.coordinates,
        locationName: request.pickupAddress.city,
        statusUpdate: "Shipment created and assigned to delivery partner",
        notes: `Assigned to ${selectedPartner.businessName || "delivery partner"}`,
      })

      // Notify delivery partner
      await this.notifyDeliveryPartner(selectedPartner.id, shipment.id)

      return {
        shipmentId: shipment.id,
        trackingNumber: shipment.tracking_number,
      }
    } catch (error) {
      console.error("Error creating shipment:", error)
      throw error
    }
  }

  // Add tracking update
  async addTrackingUpdate(
    shipmentId: string,
    update: {
      location?: { lat: number; lng: number }
      locationName?: string
      statusUpdate: string
      notes?: string
    },
  ) {
    await this.supabase.from("shipment_tracking").insert({
      shipment_id: shipmentId,
      location_lat: update.location?.lat,
      location_lng: update.location?.lng,
      location_name: update.locationName,
      status_update: update.statusUpdate,
      notes: update.notes,
    })
  }

  // Update shipment status
  async updateShipmentStatus(shipmentId: string, status: string, location?: { lat: number; lng: number }) {
    try {
      // Update shipment status
      const updateData: any = { status, updated_at: new Date().toISOString() }

      if (status === "picked_up") {
        updateData.pickup_completed_at = new Date().toISOString()
      } else if (status === "delivered") {
        updateData.delivery_completed_at = new Date().toISOString()
      }

      await this.supabase.from("shipments").update(updateData).eq("id", shipmentId)

      // Add tracking update
      await this.addTrackingUpdate(shipmentId, {
        location,
        statusUpdate: `Status updated to: ${status}`,
        notes: `Shipment ${status} at ${new Date().toLocaleString()}`,
      })

      // If delivered, process partner payment
      if (status === "delivered") {
        await this.processPartnerPayment(shipmentId)
      }
    } catch (error) {
      console.error("Error updating shipment status:", error)
      throw error
    }
  }

  // Get shipment tracking information
  async getShipmentTracking(trackingNumber: string) {
    try {
      const { data: shipment, error: shipmentError } = await this.supabase
        .from("shipments")
        .select(`
          *,
          delivery_partner:delivery_partners(business_name, partner_type),
          tracking:shipment_tracking(*)
        `)
        .eq("tracking_number", trackingNumber)
        .single()

      if (shipmentError) throw shipmentError

      return {
        shipment,
        tracking: shipment.tracking || [],
      }
    } catch (error) {
      console.error("Error getting shipment tracking:", error)
      throw error
    }
  }

  // Calculate distance between two coordinates (Haversine formula)
  private calculateDistance(coord1: { lat: number; lng: number }, coord2: { lat: number; lng: number }): number {
    const R = 6371 // Earth's radius in kilometers
    const dLat = this.toRadians(coord2.lat - coord1.lat)
    const dLng = this.toRadians(coord2.lng - coord1.lng)
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(coord1.lat)) *
        Math.cos(this.toRadians(coord2.lat)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180)
  }

  // Calculate estimated delivery time
  private calculateEstimatedDelivery(shipmentType: string, distance: number): string {
    let hoursToAdd = 24 // Default 24 hours

    if (shipmentType === "biker") {
      // Local biker delivery
      hoursToAdd = distance < 10 ? 2 : distance < 30 ? 6 : 12
    } else if (shipmentType === "bus") {
      // Intercity bus delivery
      hoursToAdd = distance < 100 ? 12 : distance < 300 ? 24 : 48
    }

    const estimatedDelivery = new Date()
    estimatedDelivery.setHours(estimatedDelivery.getHours() + hoursToAdd)
    return estimatedDelivery.toISOString()
  }

  // Notify delivery partner of new shipment
  private async notifyDeliveryPartner(partnerId: string, shipmentId: string) {
    // This would integrate with notification system
    console.log(`Notifying partner ${partnerId} of new shipment ${shipmentId}`)
  }

  // Process payment for delivery partner
  private async processPartnerPayment(shipmentId: string) {
    try {
      const { data: shipment } = await this.supabase
        .from("shipments")
        .select("delivery_partner_id, delivery_cost")
        .eq("id", shipmentId)
        .single()

      if (shipment) {
        await this.supabase.from("partner_earnings").insert({
          partner_id: shipment.delivery_partner_id,
          shipment_id: shipmentId,
          base_amount: shipment.delivery_cost * 0.8, // 80% to partner
          distance_amount: 0,
          total_amount: shipment.delivery_cost * 0.8,
          payment_status: "pending",
        })
      }
    } catch (error) {
      console.error("Error processing partner payment:", error)
    }
  }
}
