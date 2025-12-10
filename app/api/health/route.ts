import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { logger } from "@/lib/observability/logger"

interface HealthStatus {
  status: "healthy" | "unhealthy" | "degraded"
  timestamp: string
  uptime: number
  environment: string
  version?: string
  checks: {
    database: HealthCheckResult
    supabase: HealthCheckResult
    memory: HealthCheckResult
    disk: HealthCheckResult
  }
}

interface HealthCheckResult {
  status: "pass" | "fail" | "warn"
  responseTime?: number
  details?: string
}

async function checkDatabase(): Promise<HealthCheckResult> {
  const start = Date.now()
  try {
    const supabase = await createServerClient()
    const { error } = await supabase.from("users").select("count").limit(1).single()

    const responseTime = Date.now() - start

    if (error) {
      return { status: "fail", responseTime, details: error.message }
    }

    return { status: "pass", responseTime }
  } catch (error) {
    return {
      status: "fail",
      responseTime: Date.now() - start,
      details: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

async function checkSupabase(): Promise<HealthCheckResult> {
  const start = Date.now()
  try {
    const supabase = await createServerClient()
    const { error } = await supabase.auth.getSession()

    const responseTime = Date.now() - start

    if (error) {
      return { status: "fail", responseTime, details: error.message }
    }

    return { status: "pass", responseTime }
  } catch (error) {
    return {
      status: "fail",
      responseTime: Date.now() - start,
      details: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

function checkMemory(): HealthCheckResult {
  const memUsage = process.memoryUsage()
  const totalMem = memUsage.heapTotal
  const usedMem = memUsage.heapUsed
  const memoryUsagePercent = (usedMem / totalMem) * 100

  if (memoryUsagePercent > 90) {
    return { status: "fail", details: `Memory usage: ${memoryUsagePercent.toFixed(2)}%` }
  } else if (memoryUsagePercent > 75) {
    return { status: "warn", details: `Memory usage: ${memoryUsagePercent.toFixed(2)}%` }
  }

  return { status: "pass", details: `Memory usage: ${memoryUsagePercent.toFixed(2)}%` }
}

function checkDisk(): HealthCheckResult {
  // Basic disk check - in production, you'd want more sophisticated monitoring
  try {
    const fs = require("fs")
    const stats = fs.statSync(".")
    return { status: "pass", details: "Disk accessible" }
  } catch (error) {
    return { status: "fail", details: "Disk check failed" }
  }
}

export async function GET() {
  const startTime = Date.now()

  try {
    // Run all health checks in parallel
    const [database, supabase, memory, disk] = await Promise.all([
      checkDatabase(),
      checkSupabase(),
      Promise.resolve(checkMemory()),
      Promise.resolve(checkDisk()),
    ])

    const checks = { database, supabase, memory, disk }

    // Determine overall status
    const hasFailures = Object.values(checks).some((check) => check.status === "fail")
    const hasWarnings = Object.values(checks).some((check) => check.status === "warn")

    let overallStatus: "healthy" | "unhealthy" | "degraded"
    if (hasFailures) {
      overallStatus = "unhealthy"
    } else if (hasWarnings) {
      overallStatus = "degraded"
    } else {
      overallStatus = "healthy"
    }

    const healthStatus: HealthStatus = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: "development", // Hardcoded environment
      version: process.env.APP_VERSION || "unknown",
      checks,
    }

    const statusCode = overallStatus === "unhealthy" ? 503 : 200;

    // Log health check results
    logger.info("Health check completed", {
      status: overallStatus,
      responseTime: Date.now() - startTime,
      checks,
    })

    return NextResponse.json(healthStatus, { status: statusCode })
  } catch (error) {
    logger.error("Health check failed", error as Error)

    return NextResponse.json(
      {
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || "development",
        error: "Health check system failure",
        checks: {},
      },
      { status: 503 },
    )
  }
}
