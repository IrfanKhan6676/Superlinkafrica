import { createClient } from "@/lib/supabase/server"

export interface BehaviorPattern {
  userId: string
  behaviorType: string
  patternData: any
  anomalyScore: number
}

export class BehaviorMonitorService {
  private supabase = createClient()

  // Track user listing behavior
  async trackListingBehavior(userId: string, action: "create" | "update" | "delete", productData?: any) {
    try {
      // Get recent listing activity
      const { data: recentActivity } = await this.supabase
        .from("products")
        .select("created_at, updated_at")
        .eq("seller_id", userId)
        .gte("created_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()) // Last 24 hours
        .order("created_at", { ascending: false })

      const listingCount = recentActivity?.length || 0
      let anomalyScore = 0

      // Detect suspicious patterns
      if (listingCount > 20) {
        anomalyScore += 40 // Too many listings in 24 hours
      }

      if (listingCount > 50) {
        anomalyScore += 60 // Extremely high listing frequency
      }

      // Check for duplicate content
      if (productData && recentActivity) {
        const duplicateContent = recentActivity.filter(
          (item) => productData.title && item.title === productData.title,
        ).length

        if (duplicateContent > 3) {
          anomalyScore += 30 // Repetitive listings
        }
      }

      // Update behavior pattern
      await this.updateBehaviorPattern(
        userId,
        "listing_frequency",
        {
          dailyCount: listingCount,
          lastAction: action,
          timestamp: new Date().toISOString(),
        },
        anomalyScore,
      )

      // Create alert if anomaly score is high
      if (anomalyScore >= 70) {
        await this.createBehaviorAlert(
          userId,
          "suspicious_listing_behavior",
          `High listing frequency detected: ${listingCount} listings in 24 hours`,
          {
            listingCount,
            anomalyScore,
            recentActivity: recentActivity?.slice(0, 5), // Include sample data
          },
        )
      }
    } catch (error) {
      console.error("Behavior tracking error:", error)
    }
  }

  // Track messaging patterns
  async trackMessagingBehavior(userId: string, messageData: any) {
    try {
      // Get recent messages
      const { data: recentMessages } = await this.supabase
        .from("messages")
        .select("created_at, content")
        .eq("sender_id", userId)
        .gte("created_at", new Date(Date.now() - 60 * 60 * 1000).toISOString()) // Last hour
        .order("created_at", { ascending: false })

      const messageCount = recentMessages?.length || 0
      let anomalyScore = 0

      // Detect spam patterns
      if (messageCount > 30) {
        anomalyScore += 50 // Too many messages per hour
      }

      // Check for repetitive content
      const uniqueMessages = new Set(recentMessages?.map((m) => m.content.toLowerCase().trim()))
      if (uniqueMessages.size < messageCount * 0.3) {
        anomalyScore += 40 // Too much repetitive content
      }

      await this.updateBehaviorPattern(
        userId,
        "message_pattern",
        {
          hourlyCount: messageCount,
          uniqueMessageRatio: uniqueMessages.size / Math.max(messageCount, 1),
          timestamp: new Date().toISOString(),
        },
        anomalyScore,
      )

      if (anomalyScore >= 60) {
        await this.createBehaviorAlert(
          userId,
          "suspicious_messaging_behavior",
          `Potential spam messaging detected: ${messageCount} messages in 1 hour`,
          {
            messageCount,
            uniqueMessageRatio: uniqueMessages.size / Math.max(messageCount, 1),
            anomalyScore,
          },
        )
      }
    } catch (error) {
      console.error("Message behavior tracking error:", error)
    }
  }

  // Update behavior pattern in database
  private async updateBehaviorPattern(userId: string, behaviorType: string, patternData: any, anomalyScore: number) {
    await this.supabase.from("user_behavior_patterns").upsert(
      {
        user_id: userId,
        behavior_type: behaviorType,
        pattern_data: patternData,
        anomaly_score: anomalyScore,
        last_updated: new Date().toISOString(),
      },
      {
        onConflict: "user_id,behavior_type",
      },
    )
  }

  // Create behavior-based fraud alert
  private async createBehaviorAlert(userId: string, alertType: string, description: string, evidence: any) {
    await this.supabase.from("fraud_alerts").insert({
      user_id: userId,
      alert_type: alertType,
      description,
      evidence,
      severity: evidence.anomalyScore >= 80 ? "high" : "medium",
    })
  }

  // Suspend account if critical anomalies detected
  async checkForAutoSuspension(userId: string) {
    const { data: patterns } = await this.supabase
      .from("user_behavior_patterns")
      .select("anomaly_score, behavior_type")
      .eq("user_id", userId)

    const highAnomalyCount = patterns?.filter((p) => p.anomaly_score >= 80).length || 0

    if (highAnomalyCount >= 2) {
      await this.suspendAccount(userId, "Multiple high-risk behavior patterns detected", "temporary")
    }
  }

  // Suspend user account
  private async suspendAccount(userId: string, reason: string, type: "temporary" | "permanent") {
    const expiresAt =
      type === "temporary"
        ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
        : null

    await this.supabase.from("account_suspensions").insert({
      user_id: userId,
      reason,
      suspension_type: type,
      expires_at: expiresAt?.toISOString(),
    })

    // Create high-priority alert
    await this.createBehaviorAlert(userId, "account_suspended", `Account automatically suspended: ${reason}`, {
      suspensionType: type,
      expiresAt: expiresAt?.toISOString(),
    })
  }
}
