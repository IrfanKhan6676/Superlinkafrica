import type { NextRequest } from "next/server"

// Utilities to support both Edge (Web Crypto) and Node environments
async function sha256Hex(input: string): Promise<string> {
  // Prefer Web Crypto when available (Edge runtime)
  try {
    if (typeof globalThis !== "undefined" && (globalThis as any).crypto && (globalThis as any).crypto.subtle) {
      const encoder = new TextEncoder()
      const data = encoder.encode(input)
      const hashBuffer = await (globalThis as any).crypto.subtle.digest("SHA-256", data)
      const hashArray = Array.from(new Uint8Array(hashBuffer))
      return hashArray.map(b => b.toString(16).padStart(2, "0")).join("")
    }
  } catch {
    // fall through to Node fallback
  }
  // Node fallback using require to avoid top-level import in Edge
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const nodeCrypto = require("crypto") as { createHash: (alg: string) => any }
    return nodeCrypto.createHash("sha256").update(input).digest("hex")
  } catch {
    // As a last resort, return a non-cryptographic hash to avoid runtime crashes
    let hash = 0
    for (let i = 0; i < input.length; i++) {
      const chr = input.charCodeAt(i)
      hash = (hash << 5) - hash + chr
      hash |= 0
    }
    return Math.abs(hash).toString(16)
  }
}

function randomBytesHex(length: number): string {
  // Prefer Web Crypto when available
  try {
    if (typeof globalThis !== "undefined" && (globalThis as any).crypto && typeof (globalThis as any).crypto.getRandomValues === "function") {
      const bytes = new Uint8Array(length)
      ;(globalThis as any).crypto.getRandomValues(bytes)
      return Array.from(bytes)
        .map(b => b.toString(16).padStart(2, "0"))
        .join("")
    }
  } catch {
    // fall through to Node fallback
  }
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const nodeCrypto = require("crypto") as { randomBytes: (n: number) => { toString: (enc: string) => string } }
    return nodeCrypto.randomBytes(length).toString("hex")
  } catch {
    // Weak fallback
    return Array.from({ length }, () => Math.floor(Math.random() * 256))
      .map(b => (b as number).toString(16).padStart(2, "0"))
      .join("")
  }
}

export function generateCSRFToken(): string {
  return randomBytesHex(32)
}

export async function validateCSRFToken(request: NextRequest, sessionToken?: string): Promise<boolean> {
  const csrfToken = request.headers.get("x-csrf-token") || request.nextUrl.searchParams.get("csrf_token")

  if (!csrfToken || !sessionToken) {
    return false
  }

  const secret = process.env.JWT_SECRET || ""
  const expectedToken = await sha256Hex(sessionToken + secret)

  return csrfToken === expectedToken
}
