interface MetricData {
  name: string
  value: number
  labels?: Record<string, string>
  timestamp?: number
}

class MetricsCollector {
  private static instance: MetricsCollector
  private metrics: MetricData[] = []

  static getInstance(): MetricsCollector {
    if (!MetricsCollector.instance) {
      MetricsCollector.instance = new MetricsCollector()
    }
    return MetricsCollector.instance
  }

  // RED Metrics (Rate, Errors, Duration)
  recordRequest(endpoint: string, method: string, statusCode: number, duration: number) {
    const labels = { endpoint, method, status: statusCode.toString() }

    this.increment("http_requests_total", labels)
    this.histogram("http_request_duration_ms", duration, labels)

    if (statusCode >= 400) {
      this.increment("http_errors_total", labels)
    }
  }

  // USE Metrics (Utilization, Saturation, Errors)
  recordDatabaseQuery(query: string, duration: number, success: boolean) {
    const labels = { query_type: query.split(" ")[0].toLowerCase(), success: success.toString() }

    this.increment("db_queries_total", labels)
    this.histogram("db_query_duration_ms", duration, labels)

    if (!success) {
      this.increment("db_errors_total", labels)
    }
  }

  recordUserAction(action: string, userId?: string) {
    this.increment("user_actions_total", { action, user_id: userId || "anonymous" })
  }

  private increment(name: string, labels?: Record<string, string>) {
    this.metrics.push({
      name,
      value: 1,
      labels,
      timestamp: Date.now(),
    })
  }

  private histogram(name: string, value: number, labels?: Record<string, string>) {
    this.metrics.push({
      name,
      value,
      labels,
      timestamp: Date.now(),
    })
  }

  getMetrics(): MetricData[] {
    const currentMetrics = [...this.metrics]
    this.metrics = [] // Clear after reading
    return currentMetrics
  }
}

export const metrics = MetricsCollector.getInstance()
