import speakeasy from 'speakeasy'
import { createWritableServerClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"

type TwoFactorSetup = {
  secret: string
  otpauthUrl: string
  qrCodeUrl: string
}

type TwoFactorVerifyResult = {
  verified: boolean
  recoveryCodes?: string[]
  error?: string
}

export async function setupTwoFactor(userId: string): Promise<TwoFactorSetup> {
  const secret = speakeasy.generateSecret({
    name: `Superlink:${userId}`,
    issuer: 'Superlink',
    length: 20
  })

<<<<<<< HEAD
  const QR_API_BASE = process.env.NEXT_PUBLIC_QR_API_BASE || 'https://chart.googleapis.com'

  return {
    secret: secret.base32,
    otpauthUrl: secret.otpauth_url || '',
    qrCodeUrl: `${QR_API_BASE}/chart?chs=166x166&chld=L|0&cht=qr&chl=${encodeURIComponent(secret.otpauth_url || '')}`
=======
  return {
    secret: secret.base32,
    otpauthUrl: secret.otpauth_url || '',
    qrCodeUrl: `https://chart.googleapis.com/chart?chs=166x166&chld=L|0&cht=qr&chl=${encodeURIComponent(secret.otpauth_url || '')}`
>>>>>>> 0c4e38a90ff868b906bd0973817ce070e17ecf55
  }
}

export async function verifyTwoFactorCode(secret: string, token: string): Promise<boolean> {
  return speakeasy.totp.verify({
    secret,
    encoding: 'base32',
    token,
    window: 1 // Allow 1 step (30s) before/after current time
  })
}

export async function enableTwoFactorForUser(userId: string, secret: string, backupCodes: string[]): Promise<{ success: boolean; error?: string }> {
  const supabase = await createWritableServerClient()
  
  try {
    // Store the 2FA secret and backup codes in the database
    const { error } = await supabase
      .from('user_security')
      .upsert({
        user_id: userId,
        two_factor_secret: secret,
        two_factor_backup_codes: backupCodes,
        two_factor_enabled: true,
        updated_at: new Date().toISOString()
      })

    if (error) throw error

    return { success: true }
  } catch (error) {
    console.error('Error enabling 2FA:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to enable 2FA' 
    }
  }
}

export async function disableTwoFactorForUser(userId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createWritableServerClient()
  
  try {
    const { error } = await supabase
      .from('user_security')
      .update({
        two_factor_secret: null,
        two_factor_backup_codes: null,
        two_factor_enabled: false,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)

    if (error) throw error

    return { success: true }
  } catch (error) {
    console.error('Error disabling 2FA:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to disable 2FA' 
    }
  }
}

export async function generateBackupCodes(): Promise<string[]> {
  const codes: string[] = []
  
  for (let i = 0; i < 10; i++) {
    // Generate a random 8-character alphanumeric code
    const code = Array(8)
      .fill(0)
      .map(() => Math.random().toString(36).charAt(2).toUpperCase())
      .join('')
      
    codes.push(code)
  }
  
  return codes
}

export async function verifyBackupCode(userId: string, code: string): Promise<boolean> {
  const supabase = await createWritableServerClient()
  
  try {
    const { data, error } = await supabase
      .from('user_security')
      .select('two_factor_backup_codes')
      .eq('user_id', userId)
      .single()

    if (error || !data) return false

    const backupCodes: string[] = data.two_factor_backup_codes || []
    const codeIndex = backupCodes.findIndex(c => c === code)
    
    if (codeIndex === -1) return false
    
    // Remove the used backup code
    backupCodes.splice(codeIndex, 1)
    
    // Update the backup codes in the database
    await supabase
      .from('user_security')
      .update({ two_factor_backup_codes: backupCodes })
      .eq('user_id', userId)
    
    return true
  } catch (error) {
    console.error('Error verifying backup code:', error)
    return false
  }
}

export async function isTwoFactorEnabled(userId: string): Promise<boolean> {
  const supabase = await createWritableServerClient()
  
  try {
    const { data, error } = await supabase
      .from('user_security')
      .select('two_factor_enabled')
      .eq('user_id', userId)
      .single()

    if (error || !data) return false
    
    return data.two_factor_enabled === true
  } catch (error) {
    console.error('Error checking 2FA status:', error)
    return false
  }
}
