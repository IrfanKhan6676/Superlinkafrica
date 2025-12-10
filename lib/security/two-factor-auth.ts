import { createClient } from "@/lib/supabase/server"
import * as speakeasy from "speakeasy"
import * as QRCode from "qrcode"
import crypto from "crypto"

export class TwoFactorAuth {
  private supabase = createClient()

  // Generate 2FA secret and QR code
  async generateSecret(userId: string, userEmail: string): Promise<{ secret: string; qrCode: string }> {
    try {
      const secret = speakeasy.generateSecret({
        name: `Superlink (${userEmail})`,
        issuer: "Superlink Marketplace",
        length: 32,
      })

      // Generate QR code
      const qrCode = await QRCode.toDataURL(secret.otpauth_url!)

      // Store secret in database (not enabled yet)
      await this.supabase.from("user_2fa").upsert(
        {
          user_id: userId,
          secret_key: secret.base32!,
          is_enabled: false,
        },
        {
          onConflict: "user_id",
        },
      )

      return {
        secret: secret.base32!,
        qrCode,
      }
    } catch (error) {
      console.error("Error generating 2FA secret:", error)
      throw error
    }
  }

  // Verify 2FA token and enable 2FA
  async enableTwoFactor(userId: string, token: string): Promise<{ success: boolean; backupCodes?: string[] }> {
    try {
      // Get user's secret
      const { data: twoFactorData } = await this.supabase
        .from("user_2fa")
        .select("secret_key")
        .eq("user_id", userId)
        .single()

      if (!twoFactorData) {
        return { success: false }
      }

      // Verify token
      const verified = speakeasy.totp.verify({
        secret: twoFactorData.secret_key,
        encoding: "base32",
        token,
        window: 2, // Allow 2 time steps of variance
      })

      if (!verified) {
        return { success: false }
      }

      // Generate backup codes
      const backupCodes = this.generateBackupCodes()

      // Enable 2FA
      await this.supabase
        .from("user_2fa")
        .update({
          is_enabled: true,
          backup_codes: backupCodes,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", userId)

      // Log security event
      await this.logSecurityEvent(userId, "2fa_enabled", { method: "totp" })

      return { success: true, backupCodes }
    } catch (error) {
      console.error("Error enabling 2FA:", error)
      return { success: false }
    }
  }

  // Verify 2FA token during login
  async verifyToken(userId: string, token: string): Promise<boolean> {
    try {
      const { data: twoFactorData } = await this.supabase
        .from("user_2fa")
        .select("secret_key, backup_codes, is_enabled")
        .eq("user_id", userId)
        .single()

      if (!twoFactorData || !twoFactorData.is_enabled) {
        return false
      }

      // Check if it's a backup code
      if (twoFactorData.backup_codes && twoFactorData.backup_codes.includes(token)) {
        // Remove used backup code
        const updatedBackupCodes = twoFactorData.backup_codes.filter((code) => code !== token)
        await this.supabase
          .from("user_2fa")
          .update({
            backup_codes: updatedBackupCodes,
            last_used_at: new Date().toISOString(),
          })
          .eq("user_id", userId)

        await this.logSecurityEvent(userId, "2fa_backup_code_used", { remaining_codes: updatedBackupCodes.length })
        return true
      }

      // Verify TOTP token
      const verified = speakeasy.totp.verify({
        secret: twoFactorData.secret_key,
        encoding: "base32",
        token,
        window: 2,
      })

      if (verified) {
        await this.supabase.from("user_2fa").update({ last_used_at: new Date().toISOString() }).eq("user_id", userId)

        await this.logSecurityEvent(userId, "2fa_verified", { method: "totp" })
      }

      return verified
    } catch (error) {
      console.error("Error verifying 2FA token:", error)
      return false
    }
  }

  // Disable 2FA
  async disableTwoFactor(userId: string, token: string): Promise<boolean> {
    try {
      // Verify current token first
      const verified = await this.verifyToken(userId, token)
      if (!verified) {
        return false
      }

      // Disable 2FA
      await this.supabase
        .from("user_2fa")
        .update({
          is_enabled: false,
          backup_codes: null,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", userId)

      await this.logSecurityEvent(userId, "2fa_disabled", {})
      return true
    } catch (error) {
      console.error("Error disabling 2FA:", error)
      return false
    }
  }

  // Check if user has 2FA enabled
  async isTwoFactorEnabled(userId: string): Promise<boolean> {
    try {
      const { data } = await this.supabase.from("user_2fa").select("is_enabled").eq("user_id", userId).single()

      return data?.is_enabled || false
    } catch (error) {
      return false
    }
  }

  // Generate backup codes
  private generateBackupCodes(): string[] {
    const codes = []
    for (let i = 0; i < 10; i++) {
      codes.push(crypto.randomBytes(4).toString("hex").toUpperCase())
    }
    return codes
  }

  // Log security events
  private async logSecurityEvent(userId: string, eventType: string, details: any) {
    await this.supabase.from("security_audit_logs").insert({
      user_id: userId,
      event_type: eventType,
      event_details: details,
      status: "success",
    })
  }
}
