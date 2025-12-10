// Note: Avoid importing Node's 'crypto' in Edge runtime.
// Use Web Crypto when available, and fall back to Node's crypto via require only when needed.
function getUUID(): string {
  try {
    if (typeof globalThis !== "undefined" && (globalThis as any).crypto && typeof (globalThis as any).crypto.randomUUID === "function") {
      return (globalThis as any).crypto.randomUUID()
    }
  } catch {
    // ignore and try Node fallback
  }
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const nodeCrypto = require("crypto") as { randomUUID?: () => string }
    if (typeof nodeCrypto.randomUUID === "function") {
      return nodeCrypto.randomUUID()
    }
  } catch {
    // ignore and use final fallback
  }
  // Final fallback (not cryptographically secure, but avoids crashes in unsupported envs)
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}

export interface LogContext {
  correlationId?: string
  userId?: string
  sessionId?: string
  requestId?: string
  [key: string]: any
}

export class Logger {
  private static instance: Logger
  private context: LogContext = {}

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger()
    }
    return Logger.instance
  }

  setContext(context: LogContext) {
    this.context = { ...this.context, ...context }
  }

  private sanitizePII(data: any): any {
    if (typeof data !== "object" || data === null) return data

    const sanitized = { ...data }
    const piiFields = ["email", "phone", "password", "ssn", "nrc", "address"]

    for (const field of piiFields) {
      if (sanitized[field]) {
        sanitized[field] = "[REDACTED]"
      }
    }

    return sanitized
  }

  private log(level: string, message: string, meta: any = {}) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      correlationId: this.context.correlationId || getUUID(),
      userId: this.context.userId,
      sessionId: this.context.sessionId,
      requestId: this.context.requestId,
      meta: this.sanitizePII(meta),
      service: "superlink-marketplace",
      environment: process.env.NODE_ENV || "development",
    }

    console.log(JSON.stringify(logEntry))
  }

  info(message: string, meta?: any) {
    this.log("info", message, meta)
  }

  warn(message: string, meta?: any) {
    this.log("warn", message, meta)
  }

  error(message: string, error?: Error, meta?: any) {
    this.log("error", message, {
      ...meta,
      error: error
        ? {
            name: error.name,
            message: error.message,
            stack: error.stack,
          }
        : undefined,
    })
  }

  debug(message: string, meta?: any) {
    if (process.env.NODE_ENV === "development") {
      this.log("debug", message, meta)
    }
  }
}

export const logger = Logger.getInstance()
