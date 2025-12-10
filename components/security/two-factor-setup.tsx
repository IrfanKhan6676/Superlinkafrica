"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/Input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Shield, Smartphone, Key, Copy, CheckCircle, AlertTriangle } from "lucide-react"

interface TwoFactorSetupProps {
  isEnabled: boolean
  onStatusChange: (enabled: boolean) => void
}

export function TwoFactorSetup({ isEnabled, onStatusChange }: TwoFactorSetupProps) {
  const [qrCode, setQrCode] = useState("")
  const [secret, setSecret] = useState("")
  const [verificationCode, setVerificationCode] = useState("")
  const [backupCodes, setBackupCodes] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [step, setStep] = useState<"setup" | "verify" | "backup" | "complete">("setup")

  const generateSecret = async () => {
    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/security/2fa/generate", {
        method: "POST",
      })

      const data = await response.json()

      if (response.ok) {
        setQrCode(data.qrCode)
        setSecret(data.secret)
        setStep("verify")
      } else {
        setError(data.error || "Failed to generate 2FA secret")
      }
    } catch (error) {
      setError("Failed to generate 2FA secret")
    } finally {
      setLoading(false)
    }
  }

  const enableTwoFactor = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      setError("Please enter a valid 6-digit code")
      return
    }

    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/security/2fa/enable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: verificationCode }),
      })

      const data = await response.json()

      if (response.ok) {
        setBackupCodes(data.backupCodes)
        setStep("backup")
      } else {
        setError(data.error || "Invalid verification code")
      }
    } catch (error) {
      setError("Failed to enable 2FA")
    } finally {
      setLoading(false)
    }
  }

  const disableTwoFactor = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      setError("Please enter a valid 6-digit code to disable 2FA")
      return
    }

    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/security/2fa/disable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: verificationCode }),
      })

      if (response.ok) {
        onStatusChange(false)
        setStep("setup")
        setVerificationCode("")
      } else {
        const data = await response.json()
        setError(data.error || "Failed to disable 2FA")
      }
    } catch (error) {
      setError("Failed to disable 2FA")
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const completeSetup = () => {
    setStep("complete")
    onStatusChange(true)
  }

  if (isEnabled) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-green-600" />
            <span>Two-Factor Authentication</span>
            <Badge className="bg-green-100 text-green-800">Enabled</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Your account is protected with two-factor authentication.
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Enter 2FA code to disable</label>
              <Input
                type="text"
                placeholder="000000"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                maxLength={6}
              />
            </div>

            {error && (
              <Alert className="border-red-200 bg-red-50">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">{error}</AlertDescription>
              </Alert>
            )}

            <Button
              onClick={disableTwoFactor}
              disabled={loading || verificationCode.length !== 6}
              variant="destructive"
              className="w-full"
            >
              {loading ? "Disabling..." : "Disable 2FA"}
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Shield className="h-5 w-5" />
          <span>Two-Factor Authentication</span>
          <Badge variant="secondary">Disabled</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={step} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="setup" disabled={step !== "setup"}>
              Setup
            </TabsTrigger>
            <TabsTrigger value="verify" disabled={step !== "verify"}>
              Verify
            </TabsTrigger>
            <TabsTrigger value="backup" disabled={step !== "backup"}>
              Backup
            </TabsTrigger>
            <TabsTrigger value="complete" disabled={step !== "complete"}>
              Complete
            </TabsTrigger>
          </TabsList>

          <TabsContent value="setup" className="space-y-4">
            <Alert>
              <Smartphone className="h-4 w-4" />
              <AlertDescription>
                Two-factor authentication adds an extra layer of security to your account. You'll need an authenticator
                app like Google Authenticator or Authy.
              </AlertDescription>
            </Alert>

            <Button onClick={generateSecret} disabled={loading} className="w-full">
              {loading ? "Generating..." : "Setup 2FA"}
            </Button>
          </TabsContent>

          <TabsContent value="verify" className="space-y-4">
            <div className="text-center space-y-4">
              <h3 className="font-medium">Scan QR Code</h3>
              {qrCode && (
                <img src={qrCode || "/placeholder.svg"} alt="2FA QR Code" className="mx-auto border rounded" />
              )}

              <div className="space-y-2">
                <p className="text-sm text-gray-600">Or enter this secret manually:</p>
                <div className="flex items-center space-x-2">
                  <Input value={secret} readOnly className="font-mono text-sm" />
                  <Button size="sm" variant="outline" onClick={() => copyToClipboard(secret)}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Enter verification code</label>
                <Input
                  type="text"
                  placeholder="000000"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  maxLength={6}
                />
              </div>

              {error && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800">{error}</AlertDescription>
                </Alert>
              )}

              <Button onClick={enableTwoFactor} disabled={loading || verificationCode.length !== 6} className="w-full">
                {loading ? "Verifying..." : "Verify & Enable"}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="backup" className="space-y-4">
            <Alert className="border-yellow-200 bg-yellow-50">
              <Key className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-800">
                Save these backup codes in a safe place. You can use them to access your account if you lose your
                authenticator device.
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-2 gap-2">
              {backupCodes.map((code, index) => (
                <div key={index} className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                  <span className="font-mono text-sm flex-1">{code}</span>
                  <Button size="sm" variant="ghost" onClick={() => copyToClipboard(code)}>
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>

            <Button onClick={completeSetup} className="w-full">
              I've Saved My Backup Codes
            </Button>
          </TabsContent>

          <TabsContent value="complete" className="space-y-4">
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Two-factor authentication has been successfully enabled for your account!
              </AlertDescription>
            </Alert>

            <div className="text-center">
              <Shield className="h-12 w-12 text-green-600 mx-auto mb-2" />
              <h3 className="font-medium">Your Account is Now Secure</h3>
              <p className="text-sm text-gray-600 mt-1">
                You'll be asked for a verification code each time you sign in.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
