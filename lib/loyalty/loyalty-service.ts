import { createClient } from "@/lib/supabase/server"

export interface LoyaltyProfile {
  totalPoints: number
  availablePoints: number
  tierLevel: string
  tierProgress: number
  lifetimeSpent: number
  referralCount: number
  nextTierThreshold: number
  tierBenefits: string[]
}

export interface PointsTransaction {
  id: string
  transactionType: string
  pointsAmount: number
  source: string
  description: string
  createdAt: string
}

export interface Reward {
  id: string
  title: string
  description: string
  rewardType: string
  pointsCost: number
  monetaryValue?: number
  discountPercentage?: number
  minTierRequired: string
  isActive: boolean
  validUntil?: string
}

export class LoyaltyService {
  private supabase = createClient()

  // Award points for various actions
  async awardPoints(
    userId: string,
    points: number,
    source: string,
    sourceId?: string,
    description?: string,
  ): Promise<void> {
    try {
      // Add points transaction
      await this.supabase.from("points_transactions").insert({
        user_id: userId,
        transaction_type: "earned",
        points_amount: points,
        source,
        source_id: sourceId,
        description: description || `Earned ${points} points from ${source}`,
        expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year expiry
      })

      // Update user loyalty profile
      await this.updateUserLoyalty(userId, points)

      console.log(`Awarded ${points} points to user ${userId} for ${source}`)
    } catch (error) {
      console.error("Error awarding points:", error)
    }
  }

  // Update user loyalty profile
  private async updateUserLoyalty(userId: string, pointsChange: number) {
    try {
      // Get current loyalty data
      const { data: currentLoyalty } = await this.supabase
        .from("user_loyalty")
        .select("*")
        .eq("user_id", userId)
        .single()

      const newTotalPoints = (currentLoyalty?.total_points || 0) + pointsChange
      const newAvailablePoints = (currentLoyalty?.available_points || 0) + pointsChange
      const newTierLevel = this.getTierFromPoints(newTotalPoints)

      // Calculate tier progress
      const tierThresholds = { bronze: 0, silver: 5000, gold: 20000, platinum: 50000 }
      const currentThreshold = tierThresholds[newTierLevel as keyof typeof tierThresholds]
      const nextTierThresholds = { bronze: 5000, silver: 20000, gold: 50000, platinum: 100000 }
      const nextThreshold = nextTierThresholds[newTierLevel as keyof typeof nextTierThresholds]
      const tierProgress = ((newTotalPoints - currentThreshold) / (nextThreshold - currentThreshold)) * 100

      // Upsert loyalty profile
      await this.supabase.from("user_loyalty").upsert(
        {
          user_id: userId,
          total_points: newTotalPoints,
          available_points: Math.max(0, newAvailablePoints),
          tier_level: newTierLevel,
          tier_progress: Math.min(100, Math.max(0, tierProgress)),
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "user_id",
        },
      )

      // Check for tier upgrade
      if (currentLoyalty && currentLoyalty.tier_level !== newTierLevel) {
        await this.handleTierUpgrade(userId, currentLoyalty.tier_level, newTierLevel)
      }
    } catch (error) {
      console.error("Error updating user loyalty:", error)
    }
  }

  // Handle tier upgrades
  private async handleTierUpgrade(userId: string, oldTier: string, newTier: string) {
    const tierBonuses = {
      silver: 500,
      gold: 1500,
      platinum: 5000,
    }

    const bonus = tierBonuses[newTier as keyof typeof tierBonuses]
    if (bonus) {
      await this.awardPoints(userId, bonus, "tier_upgrade", undefined, `Tier upgrade bonus: ${oldTier} → ${newTier}`)
    }

    console.log(`User ${userId} upgraded from ${oldTier} to ${newTier}`)
  }

  // Get user loyalty profile
  async getLoyaltyProfile(userId: string): Promise<LoyaltyProfile> {
    try {
      const { data: loyalty } = await this.supabase.from("user_loyalty").select("*").eq("user_id", userId).single()

      if (!loyalty) {
        // Create initial loyalty profile
        await this.supabase.from("user_loyalty").insert({
          user_id: userId,
          total_points: 0,
          available_points: 0,
          tier_level: "bronze",
        })

        return {
          totalPoints: 0,
          availablePoints: 0,
          tierLevel: "bronze",
          tierProgress: 0,
          lifetimeSpent: 0,
          referralCount: 0,
          nextTierThreshold: 5000,
          tierBenefits: this.getTierBenefits("bronze"),
        }
      }

      const tierThresholds = { bronze: 5000, silver: 20000, gold: 50000, platinum: 100000 }
      const nextTierThreshold = tierThresholds[loyalty.tier_level as keyof typeof tierThresholds]

      return {
        totalPoints: loyalty.total_points,
        availablePoints: loyalty.available_points,
        tierLevel: loyalty.tier_level,
        tierProgress: loyalty.tier_progress,
        lifetimeSpent: loyalty.lifetime_spent,
        referralCount: loyalty.referral_count,
        nextTierThreshold,
        tierBenefits: this.getTierBenefits(loyalty.tier_level),
      }
    } catch (error) {
      console.error("Error getting loyalty profile:", error)
      throw error
    }
  }

  // Get points transaction history
  async getPointsHistory(userId: string, limit = 50): Promise<PointsTransaction[]> {
    try {
      const { data: transactions } = await this.supabase
        .from("points_transactions")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(limit)

      return (
        transactions?.map((t) => ({
          id: t.id,
          transactionType: t.transaction_type,
          pointsAmount: t.points_amount,
          source: t.source,
          description: t.description,
          createdAt: t.created_at,
        })) || []
      )
    } catch (error) {
      console.error("Error getting points history:", error)
      return []
    }
  }

  // Get available rewards
  async getAvailableRewards(userId: string): Promise<Reward[]> {
    try {
      const loyaltyProfile = await this.getLoyaltyProfile(userId)

      const { data: rewards } = await this.supabase
        .from("rewards_catalog")
        .select("*")
        .eq("is_active", true)
        .lte("points_cost", loyaltyProfile.availablePoints)
        .or(`valid_until.is.null,valid_until.gte.${new Date().toISOString()}`)
        .order("points_cost", { ascending: true })

      return (
        rewards
          ?.filter((reward) => this.canUserAccessTier(loyaltyProfile.tierLevel, reward.min_tier_required))
          .map((r) => ({
            id: r.id,
            title: r.title,
            description: r.description,
            rewardType: r.reward_type,
            pointsCost: r.points_cost,
            monetaryValue: r.monetary_value,
            discountPercentage: r.discount_percentage,
            minTierRequired: r.min_tier_required,
            isActive: r.is_active,
            validUntil: r.valid_until,
          })) || []
      )
    } catch (error) {
      console.error("Error getting available rewards:", error)
      return []
    }
  }

  // Redeem reward
  async redeemReward(userId: string, rewardId: string): Promise<{ success: boolean; redemptionCode?: string }> {
    try {
      // Get reward details
      const { data: reward } = await this.supabase.from("rewards_catalog").select("*").eq("id", rewardId).single()

      if (!reward || !reward.is_active) {
        return { success: false }
      }

      // Check user has enough points
      const loyaltyProfile = await this.getLoyaltyProfile(userId)
      if (loyaltyProfile.availablePoints < reward.points_cost) {
        return { success: false }
      }

      // Check tier requirement
      if (!this.canUserAccessTier(loyaltyProfile.tierLevel, reward.min_tier_required)) {
        return { success: false }
      }

      // Generate redemption code
      const redemptionCode = this.generateRedemptionCode()

      // Create redemption record
      const { data: redemption } = await this.supabase
        .from("reward_redemptions")
        .insert({
          user_id: userId,
          reward_id: rewardId,
          points_used: reward.points_cost,
          redemption_code: redemptionCode,
          expires_at: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(), // 90 days
        })
        .select("id")
        .single()

      if (!redemption) {
        return { success: false }
      }

      // Deduct points
      await this.supabase.from("points_transactions").insert({
        user_id: userId,
        transaction_type: "redeemed",
        points_amount: reward.points_cost,
        source: "reward_redemption",
        source_id: redemption.id,
        description: `Redeemed: ${reward.title}`,
      })

      // Update user loyalty
      await this.updateUserLoyalty(userId, -reward.points_cost)

      return { success: true, redemptionCode }
    } catch (error) {
      console.error("Error redeeming reward:", error)
      return { success: false }
    }
  }

  // Create referral
  async createReferral(referrerId: string): Promise<string> {
    try {
      const referralCode = this.generateReferralCode()

      await this.supabase.from("referrals").insert({
        referrer_id: referrerId,
        referral_code: referralCode,
        referrer_bonus: 1000, // 1000 points for referrer
        referred_bonus: 500, // 500 points for new user
      })

      return referralCode
    } catch (error) {
      console.error("Error creating referral:", error)
      throw error
    }
  }

  // Process referral signup
  async processReferralSignup(referralCode: string, newUserId: string): Promise<void> {
    try {
      const { data: referral } = await this.supabase
        .from("referrals")
        .select("*")
        .eq("referral_code", referralCode)
        .eq("status", "pending")
        .single()

      if (!referral) return

      // Update referral with new user
      await this.supabase
        .from("referrals")
        .update({
          referred_id: newUserId,
          status: "completed",
          completed_at: new Date().toISOString(),
        })
        .eq("id", referral.id)

      // Award points to both users
      await this.awardPoints(referral.referrer_id, referral.referrer_bonus, "referral", referral.id, "Referral bonus")
      await this.awardPoints(newUserId, referral.referred_bonus, "referral", referral.id, "Welcome referral bonus")

      // Update referral count
      await this.supabase.rpc("increment", {
        table_name: "user_loyalty",
        column_name: "referral_count",
        row_id: referral.referrer_id,
      })
    } catch (error) {
      console.error("Error processing referral signup:", error)
    }
  }

  // Daily check-in
  async processDailyCheckin(userId: string): Promise<{ points: number; streak: number; bonusApplied: boolean }> {
    try {
      const today = new Date().toISOString().split("T")[0]

      // Check if already checked in today
      const { data: existingCheckin } = await this.supabase
        .from("daily_checkins")
        .select("*")
        .eq("user_id", userId)
        .eq("checkin_date", today)
        .single()

      if (existingCheckin) {
        return { points: 0, streak: existingCheckin.streak_count, bonusApplied: false }
      }

      // Get yesterday's checkin to calculate streak
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split("T")[0]
      const { data: yesterdayCheckin } = await this.supabase
        .from("daily_checkins")
        .select("streak_count")
        .eq("user_id", userId)
        .eq("checkin_date", yesterday)
        .single()

      const streakCount = yesterdayCheckin ? yesterdayCheckin.streak_count + 1 : 1
      const basePoints = 10
      const bonusApplied = streakCount % 7 === 0 // Weekly bonus
      const bonusPoints = bonusApplied ? streakCount * 5 : 0
      const totalPoints = basePoints + bonusPoints

      // Record checkin
      await this.supabase.from("daily_checkins").insert({
        user_id: userId,
        checkin_date: today,
        streak_count: streakCount,
        points_earned: totalPoints,
        bonus_applied: bonusApplied,
      })

      // Award points
      await this.awardPoints(
        userId,
        totalPoints,
        "daily_checkin",
        undefined,
        `Daily check-in (${streakCount} day streak)`,
      )

      return { points: totalPoints, streak: streakCount, bonusApplied }
    } catch (error) {
      console.error("Error processing daily checkin:", error)
      return { points: 0, streak: 0, bonusApplied: false }
    }
  }

  // Helper methods
  private getTierFromPoints(points: number): string {
    if (points >= 50000) return "platinum"
    if (points >= 20000) return "gold"
    if (points >= 5000) return "silver"
    return "bronze"
  }

  private getTierBenefits(tier: string): string[] {
    const benefits = {
      bronze: ["Earn 1 point per ZMW spent", "Basic customer support"],
      silver: ["Earn 1.5 points per ZMW spent", "Priority customer support", "Free shipping on orders over ZMW 100"],
      gold: [
        "Earn 2 points per ZMW spent",
        "Premium customer support",
        "Free shipping on all orders",
        "Early access to sales",
      ],
      platinum: [
        "Earn 3 points per ZMW spent",
        "VIP customer support",
        "Free express shipping",
        "Exclusive deals and offers",
        "Personal shopping assistant",
      ],
    }

    return benefits[tier as keyof typeof benefits] || benefits.bronze
  }

  private canUserAccessTier(userTier: string, requiredTier: string): boolean {
    const tierLevels = { bronze: 1, silver: 2, gold: 3, platinum: 4 }
    return tierLevels[userTier as keyof typeof tierLevels] >= tierLevels[requiredTier as keyof typeof tierLevels]
  }

  private generateRedemptionCode(): string {
    return "RDM" + Math.random().toString(36).substring(2, 10).toUpperCase()
  }

  private generateReferralCode(): string {
    return "REF" + Math.random().toString(36).substring(2, 10).toUpperCase()
  }
}
