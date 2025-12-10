import { createClient } from "@/lib/supabase/server"
import { createHash } from "crypto"

export interface UserDataExport {
  profile: any
  orders: any[]
  products: any[]
  reviews: any[]
  messages: any[]
  analytics: any[]
}

export class GDPRCompliance {
  private supabase = createClient()

  // Request data export
  async requestDataExport(userId: string): Promise<{ requestId: string; estimatedCompletion: string }> {
    try {
      const { data: request, error } = await this.supabase
        .from("data_requests")
        .insert({
          user_id: userId,
          request_type: "export",
          status: "pending",
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
        })
        .select("id")
        .single()

      if (error) throw error

      // Estimate completion time (usually within 30 days per GDPR)
      const estimatedCompletion = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()

      return {
        requestId: request.id,
        estimatedCompletion,
      }
    } catch (error) {
      console.error("Error requesting data export:", error)
      throw error
    }
  }

  // Process data export
  async processDataExport(userId: string): Promise<UserDataExport> {
    try {
      // Get user profile
      const { data: profile } = await this.supabase.from("users").select("*").eq("id", userId).single()

      // Get user orders
      const { data: orders } = await this.supabase
        .from("orders")
        .select("*, products(title), shipments(*)")
        .eq("buyer_id", userId)

      // Get user products (if seller)
      const { data: products } = await this.supabase.from("products").select("*").eq("seller_id", userId)

      // Get user reviews
      const { data: reviews } = await this.supabase.from("reviews").select("*, products(title)").eq("user_id", userId)

      // Get user messages
      const { data: messages } = await this.supabase
        .from("messages")
        .select("*, conversations(*)")
        .eq("sender_id", userId)

      // Get user analytics (anonymized)
      const { data: analytics } = await this.supabase
        .from("user_analytics")
        .select("event_type, created_at")
        .eq("user_id", userId)

      return {
        profile: this.anonymizePersonalData(profile),
        orders: orders || [],
        products: products || [],
        reviews: reviews || [],
        messages: messages || [],
        analytics: analytics || [],
      }
    } catch (error) {
      console.error("Error processing data export:", error)
      throw error
    }
  }

  // Request account deletion
  async requestAccountDeletion(userId: string, reason?: string): Promise<{ requestId: string }> {
    try {
      const { data: request, error } = await this.supabase
        .from("data_requests")
        .insert({
          user_id: userId,
          request_type: "delete",
          status: "pending",
          request_details: { reason },
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        })
        .select("id")
        .single()

      if (error) throw error

      return { requestId: request.id }
    } catch (error) {
      console.error("Error requesting account deletion:", error)
      throw error
    }
  }

  // Process account deletion
  async processAccountDeletion(userId: string): Promise<void> {
    try {
      // Start transaction-like operations
      // 1. Anonymize user data instead of hard delete (for legal/business reasons)
      const anonymizedEmail = `deleted_${createHash("sha256").update(userId).digest("hex").substring(0, 8)}@deleted.local`

      await this.supabase
        .from("users")
        .update({
          email: anonymizedEmail,
          full_name: "Deleted User",
          phone: null,
          bio: null,
          avatar_url: null,
          is_deleted: true,
          deleted_at: new Date().toISOString(),
        })
        .eq("id", userId)

      // 2. Anonymize reviews but keep them for product integrity
      await this.supabase
        .from("reviews")
        .update({
          reviewer_name: "Anonymous User",
        })
        .eq("user_id", userId)

      // 3. Delete personal messages
      await this.supabase.from("messages").delete().eq("sender_id", userId)

      // 4. Delete analytics data
      await this.supabase.from("user_analytics").delete().eq("user_id", userId)

      // 5. Delete 2FA data
      await this.supabase.from("user_2fa").delete().eq("user_id", userId)

      // 6. Delete sessions
      await this.supabase.from("user_sessions").delete().eq("user_id", userId)

      // 7. Mark products as deleted but keep for order history
      await this.supabase
        .from("products")
        .update({
          title: "Deleted Product",
          description: "This product has been removed",
          is_deleted: true,
        })
        .eq("seller_id", userId)

      console.log(`Account deletion processed for user ${userId}`)
    } catch (error) {
      console.error("Error processing account deletion:", error)
      throw error
    }
  }

  // Update user consent
  async updateConsent(
    userId: string,
    consentType: string,
    consentGiven: boolean,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<void> {
    try {
      await this.supabase.from("user_consents").insert({
        user_id: userId,
        consent_type: consentType,
        consent_given: consentGiven,
        ip_address: ipAddress,
        user_agent: userAgent,
      })
    } catch (error) {
      console.error("Error updating consent:", error)
      throw error
    }
  }

  // Get user consents
  async getUserConsents(userId: string): Promise<Record<string, boolean>> {
    try {
      const { data: consents } = await this.supabase
        .from("user_consents")
        .select("consent_type, consent_given")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })

      const consentMap: Record<string, boolean> = {}

      // Get latest consent for each type
      consents?.forEach((consent) => {
        if (!(consent.consent_type in consentMap)) {
          consentMap[consent.consent_type] = consent.consent_given
        }
      })

      return consentMap
    } catch (error) {
      console.error("Error getting user consents:", error)
      return {}
    }
  }

  // Anonymize personal data
  private anonymizePersonalData(data: any): any {
    if (!data) return data

    const anonymized = { ...data }

    // Remove or hash sensitive fields
    if (anonymized.email) {
      anonymized.email = this.hashEmail(anonymized.email)
    }
    if (anonymized.phone) {
      anonymized.phone = "***-***-" + anonymized.phone.slice(-4)
    }
    if (anonymized.full_name) {
      anonymized.full_name = anonymized.full_name.charAt(0) + "***"
    }

    delete anonymized.password
    delete anonymized.raw_user_meta_data

    return anonymized
  }

  private hashEmail(email: string): string {
    const [username, domain] = email.split("@")
    const hashedUsername = createHash("sha256").update(username).digest("hex").substring(0, 8)
    return `${hashedUsername}@${domain}`
  }
}
