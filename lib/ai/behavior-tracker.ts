import { createClient } from "@/lib/supabase/client"

export interface UserBehavior {
  userId: string
  actionType:
    | "view"
    | "click"
    | "search"
    | "like"
    | "share"
    | "swipe_left"
    | "swipe_right"
    | "add_to_wishlist"
    | "message_seller"
  targetType: "product" | "seller" | "category" | "search_query"
  targetId?: string
  metadata?: Record<string, any>
  sessionId?: string
}

export class BehaviorTracker {
  private supabase = createClient()
  private sessionId: string
  private batchQueue: UserBehavior[] = []
  private batchTimeout: NodeJS.Timeout | null = null

  constructor() {
    this.sessionId = this.generateSessionId()
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  async track(behavior: Omit<UserBehavior, "sessionId">) {
    const behaviorWithSession = {
      ...behavior,
      sessionId: this.sessionId,
    }

    // Add to batch queue
    this.batchQueue.push(behaviorWithSession)

    // Process batch if queue is full or after timeout
    if (this.batchQueue.length >= 10) {
      await this.processBatch()
    } else {
      this.scheduleBatchProcess()
    }
  }

  private scheduleBatchProcess() {
    if (this.batchTimeout) {
      clearTimeout(this.batchTimeout)
    }

    this.batchTimeout = setTimeout(() => {
      this.processBatch()
    }, 5000) // Process batch every 5 seconds
  }

  private async processBatch() {
    if (this.batchQueue.length === 0) return

    const batch = [...this.batchQueue]
    this.batchQueue = []

    if (this.batchTimeout) {
      clearTimeout(this.batchTimeout)
      this.batchTimeout = null
    }

    try {
      const { error } = await this.supabase.from("user_behavior").insert(
        batch.map((behavior) => ({
          user_id: behavior.userId,
          action_type: behavior.actionType,
          target_type: behavior.targetType,
          target_id: behavior.targetId,
          metadata: behavior.metadata || {},
          session_id: behavior.sessionId,
        })),
      )

      if (error) {
        console.error("Error tracking behavior:", error)
        // Re-queue failed items
        this.batchQueue.unshift(...batch)
      }
    } catch (error) {
      console.error("Error processing behavior batch:", error)
    }
  }

  // Track specific actions
  async trackProductView(userId: string, productId: string, metadata?: Record<string, any>) {
    await this.track({
      userId,
      actionType: "view",
      targetType: "product",
      targetId: productId,
      metadata,
    })
  }

  async trackSearch(userId: string, query: string, filters?: Record<string, any>) {
    await this.track({
      userId,
      actionType: "search",
      targetType: "search_query",
      metadata: { query, filters },
    })
  }

  async trackSwipe(userId: string, productId: string, direction: "left" | "right") {
    await this.track({
      userId,
      actionType: direction === "left" ? "swipe_left" : "swipe_right",
      targetType: "product",
      targetId: productId,
    })
  }

  async trackLike(userId: string, productId: string) {
    await this.track({
      userId,
      actionType: "like",
      targetType: "product",
      targetId: productId,
    })
  }
}

// Singleton instance
export const behaviorTracker = new BehaviorTracker()
