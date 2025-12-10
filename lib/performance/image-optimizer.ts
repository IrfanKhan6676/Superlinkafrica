import { cache } from "@/lib/cache/cache-manager"

export interface ImageOptimizationOptions {
  width?: number
  height?: number
  quality?: number
  format?: "webp" | "avif" | "jpeg" | "png"
  blur?: boolean
}

export class ImageOptimizer {
  private static instance: ImageOptimizer

  static getInstance(): ImageOptimizer {
    if (!ImageOptimizer.instance) {
      ImageOptimizer.instance = new ImageOptimizer()
    }
    return ImageOptimizer.instance
  }

  generateOptimizedUrl(originalUrl: string, options: ImageOptimizationOptions = {}): string {
    const { width, height, quality = 80, format = "webp", blur = false } = options

    // For Next.js Image component
    const params = new URLSearchParams()

    if (width) params.set("w", width.toString())
    if (height) params.set("h", height.toString())
    params.set("q", quality.toString())
    params.set("f", format)
    if (blur) params.set("blur", "1")

    return `/_next/image?url=${encodeURIComponent(originalUrl)}&${params.toString()}`
  }

  async preloadCriticalImages(imageUrls: string[]): Promise<void> {
    const preloadPromises = imageUrls.map(async (url) => {
      const cacheKey = `preload:${url}`
      const cached = await cache.get(cacheKey)

      if (!cached) {
        // Preload the image
        if (typeof window !== "undefined") {
          const img = new Image()
          img.src = url
          await new Promise((resolve) => {
            img.onload = resolve
            img.onerror = resolve
          })
        }

        await cache.set(cacheKey, true, { ttl: 3600 })
      }
    })

    await Promise.all(preloadPromises)
  }

  generateSrcSet(baseUrl: string, sizes: number[]): string {
    return sizes
      .map((size) => {
        const optimizedUrl = this.generateOptimizedUrl(baseUrl, { width: size })
        return `${optimizedUrl} ${size}w`
      })
      .join(", ")
  }
}

export const imageOptimizer = ImageOptimizer.getInstance()
