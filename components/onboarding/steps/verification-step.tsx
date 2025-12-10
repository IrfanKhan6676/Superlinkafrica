"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/Input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Shield, Upload, CheckCircle, AlertTriangle } from "lucide-react"

interface VerificationStepProps {
  data: any
  onNext: (data: any) => void
  onSkip: () => void
  isLoading: boolean
}

export function VerificationStep({ data, onNext, onSkip, isLoading }: VerificationStepProps) {
  const [formData, setFormData] = useState({
    nationalId: data.nationalId || "",
    idDocument: data.idDocument || null,
    verificationStatus: data.verificationStatus || "pending",
    ...data,
  })
  const [uploadProgress, setUploadProgress] = useState(0)

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Simulate upload progress
    setUploadProgress(0)
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          return 100
        }
        return prev + 10
      })
    }, 200)

    // In real implementation, upload to Supabase Storage
    setTimeout(() => {
      setFormData((prev) => ({ ...prev, idDocument: file.name }))
    }, 2000)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onNext(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="text-center mb-6">
        <Shield className="w-12 h-12 mx-auto text-green-600 mb-2" />
        <h3 className="text-lg font-semibold mb-2">Identity Verification</h3>
        <p className="text-gray-600">Help us keep Superlink safe by verifying your identity</p>
      </div>

      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          Your documents are encrypted and used only for verification. We comply with Zambian data protection laws.
        </AlertDescription>
      </Alert>

      <div className="space-y-4">
        <div>
          <Label htmlFor="nationalId">National Registration Card Number</Label>
          <Input
            id="nationalId"
            value={formData.nationalId}
            onChange={(e) => setFormData((prev) => ({ ...prev, nationalId: e.target.value }))}
            placeholder="e.g., 123456/78/9"
            pattern="[0-9]{6}/[0-9]{2}/[0-9]"
          />
          <p className="text-xs text-gray-500 mt-1">Format: 123456/78/9</p>
        </div>

        <div>
          <Label>Upload ID Document</Label>
          <Card className="border-dashed border-2 border-gray-300 hover:border-blue-400 transition-colors">
            <CardContent className="p-6">
              <div className="text-center">
                <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-600 mb-2">Upload a clear photo of your National Registration Card</p>
                <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" id="id-upload" />
                <Button type="button" variant="outline" onClick={() => document.getElementById("id-upload")?.click()}>
                  Choose File
                </Button>
              </div>

              {uploadProgress > 0 && uploadProgress < 100 && (
                <div className="mt-4">
                  <div className="bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Uploading... {uploadProgress}%</p>
                </div>
              )}

              {formData.idDocument && (
                <div className="mt-4 flex items-center justify-center text-green-600">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  <span className="text-sm">Document uploaded successfully</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Why verify?</strong> Verified users get higher trust scores, better visibility, and access to
            premium features.
          </AlertDescription>
        </Alert>
      </div>

      <div className="flex justify-between pt-6">
        <Button type="button" variant="ghost" onClick={onSkip} disabled={isLoading}>
          Skip for now
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Processing..." : "Continue"}
        </Button>
      </div>
    </form>
  )
}
