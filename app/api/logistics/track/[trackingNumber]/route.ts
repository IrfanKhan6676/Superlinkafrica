import { type NextRequest, NextResponse } from "next/server"
import { DeliveryManager } from "@/lib/logistics/delivery-manager"

export async function GET(request: NextRequest, { params }: { params: { trackingNumber: string } }) {
  try {
    const { trackingNumber } = params

    if (!trackingNumber) {
      return NextResponse.json({ error: "Tracking number is required" }, { status: 400 })
    }

    const deliveryManager = new DeliveryManager()
    const trackingData = await deliveryManager.getShipmentTracking(trackingNumber)

    return NextResponse.json(trackingData)
  } catch (error) {
    console.error("Tracking API error:", error)
    return NextResponse.json({ error: "Shipment not found" }, { status: 404 })
  }
}
