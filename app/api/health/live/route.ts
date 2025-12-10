import { NextResponse } from "next/server"

// Liveness probe - checks if app is alive (simpler check)
export async function GET() {
  try {
    // Basic liveness check - just verify the process is running
    const memUsage = process.memoryUsage()

    // If memory usage is extremely high, consider the app unhealthy
    const memoryUsagePercent = (memUsage.heapUsed / memUsage.heapTotal) * 100

    if (memoryUsagePercent > 95) {
      return NextResponse.json({ status: "unhealthy", reason: "Memory exhaustion" }, { status: 503 })
    }

    return NextResponse.json(
      {
        status: "alive",
        uptime: process.uptime(),
        memory: `${memoryUsagePercent.toFixed(2)}%`,
      },
      { status: 200 },
    )
  } catch (error) {
    return NextResponse.json({ status: "dead", reason: "Process check failed" }, { status: 503 })
  }
}
