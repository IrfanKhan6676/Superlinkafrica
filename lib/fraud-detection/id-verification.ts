import { createClient } from "@/lib/supabase/server"
import crypto from "crypto"

export interface IDVerificationData {
  idNumber: string
  idType: "nrc" | "passport" | "drivers_license"
  fullName: string
  dateOfBirth?: string
}

export class IDVerificationService {
  private supabase = createClient()

  // Hash ID number for privacy
  private hashIDNumber(idNumber: string): string {
    return crypto.createHash("sha256").update(idNumber).digest("hex")
  }

  // Validate name using AI/ML patterns
  async validateName(fullName: string): Promise<{ isValid: boolean; confidence: number; issues: string[] }> {
    const issues: string[] = []
    let confidence = 100

    // Basic validation rules
    const namePattern = /^[a-zA-Z\s'-]+$/
    if (!namePattern.test(fullName)) {
      issues.push("Contains invalid characters")
      confidence -= 30
    }

    // Check for suspicious patterns
    const words = fullName.trim().split(/\s+/)
    if (words.length < 2) {
      issues.push("Incomplete name (missing first or last name)")
      confidence -= 20
    }

    // Check for repetitive characters
    const hasRepetitiveChars = /(.)\1{3,}/.test(fullName.replace(/\s/g, ""))
    if (hasRepetitiveChars) {
      issues.push("Contains repetitive character patterns")
      confidence -= 40
    }

    // Check for random character combinations
    const hasRandomPattern = /[a-z]{8,}|[A-Z]{8,}/.test(fullName.replace(/\s/g, ""))
    if (hasRandomPattern) {
      issues.push("Appears to contain random character sequences")
      confidence -= 35
    }

    // Check for common fake name patterns
    const fakePatterns = ["test", "fake", "dummy", "example", "user", "admin"]
    const lowerName = fullName.toLowerCase()
    for (const pattern of fakePatterns) {
      if (lowerName.includes(pattern)) {
        issues.push(`Contains suspicious word: ${pattern}`)
        confidence -= 25
      }
    }

    return {
      isValid: confidence >= 60,
      confidence: Math.max(0, confidence),
      issues,
    }
  }

  // Check if ID number is already registered
  async checkIDUniqueness(idNumber: string): Promise<{ isUnique: boolean; existingUserId?: string }> {
    const hashedId = this.hashIDNumber(idNumber)

    const { data, error } = await this.supabase
      .from("national_id_verifications")
      .select("user_id")
      .eq("id_number_hash", hashedId)
      .eq("verification_status", "verified")
      .single()

    if (error && error.code !== "PGRST116") {
      throw new Error("Failed to check ID uniqueness")
    }

    return {
      isUnique: !data,
      existingUserId: data?.user_id,
    }
  }

  // Submit ID for verification
  async submitIDVerification(
    userId: string,
    verificationData: IDVerificationData,
  ): Promise<{ success: boolean; verificationId?: string; issues?: string[] }> {
    try {
      // Validate name first
      const nameValidation = await this.validateName(verificationData.fullName)
      if (!nameValidation.isValid) {
        // Create fraud alert for suspicious name
        await this.createFraudAlert(userId, "fake_name", "Suspicious name pattern detected", {
          name: verificationData.fullName,
          issues: nameValidation.issues,
          confidence: nameValidation.confidence,
        })

        return { success: false, issues: nameValidation.issues }
      }

      // Check ID uniqueness
      const uniquenessCheck = await this.checkIDUniqueness(verificationData.idNumber)
      if (!uniquenessCheck.isUnique) {
        await this.createFraudAlert(userId, "duplicate_id", "Duplicate ID number detected", {
          existingUserId: uniquenessCheck.existingUserId,
        })

        return { success: false, issues: ["This ID number is already registered to another account"] }
      }

      // Create verification record
      const hashedId = this.hashIDNumber(verificationData.idNumber)
      const { data, error } = await this.supabase
        .from("national_id_verifications")
        .insert({
          user_id: userId,
          id_number_hash: hashedId,
          id_type: verificationData.idType,
          verification_status: "pending",
        })
        .select("id")
        .single()

      if (error) throw error

      return { success: true, verificationId: data.id }
    } catch (error) {
      console.error("ID verification error:", error)
      return { success: false, issues: ["Verification system error"] }
    }
  }

  // Create fraud alert
  private async createFraudAlert(userId: string, alertType: string, description: string, evidence: any) {
    await this.supabase.from("fraud_alerts").insert({
      user_id: userId,
      alert_type: alertType,
      description,
      evidence,
      severity: alertType === "duplicate_id" ? "high" : "medium",
    })
  }
}
