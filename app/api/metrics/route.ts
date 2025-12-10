import { type NextRequest, NextResponse } from "next/server"
import { metrics } from "@/lib/observability/metrics"

export async function GET(request: NextRequest) {
  try {
    const metricsData = metrics.getMetrics()

    // Convert to Prometheus format
    const prometheusMetrics = metricsData
      .map((metric) => {
        const labels = metric.labels
          ? Object.entries(metric.labels)
              .map(([k, v]) => `${k}="${v}"`)
              .join(",")
          : ""

        return `${metric.name}${labels ? `{${labels}}` : ""} ${metric.value} ${metric.timestamp}`
      })
      .join("\n")

    return new NextResponse(prometheusMetrics, {
      headers: {
        "Content-Type": "text/plain; version=0.0.4; charset=utf-8",
      },
    })
  } catch (error) {
    return NextResponse.json({ error: "Failed to collect metrics" }, { status: 500 })
  }
}
