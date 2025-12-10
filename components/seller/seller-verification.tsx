"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/Input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Upload, CheckCircle, Clock, XCircle, Shield } from "lucide-react"

export default function SellerVerification({ sellerId }: { sellerId: string }) {
  const [uploading, setUploading] = useState(false)
  const [verificationStatus] = useState("pending") // This would come from the database

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case "rejected":
        return <XCircle className="h-5 w-5 text-red-600" />
      case "pending":
        return <Clock className="h-5 w-5 text-yellow-600" />
      default:
        return <Shield className="h-5 w-5 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Seller Verification</h1>
        <p className="text-gray-600">Verify your identity to build trust with buyers</p>
      </div>

      {/* Current Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {getStatusIcon(verificationStatus)}
            Verification Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <Badge className={getStatusColor(verificationStatus)}>
                {verificationStatus.charAt(0).toUpperCase() + verificationStatus.slice(1)}
              </Badge>
              <p className="text-sm text-gray-600 mt-2">
                {verificationStatus === "pending" && "Your verification is being reviewed"}
                {verificationStatus === "approved" && "You are a verified seller"}
                {verificationStatus === "rejected" && "Your verification was rejected"}
              </p>
            </div>
            {verificationStatus === "approved" && (
              <div className="text-right">
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="h-5 w-5" />
                  <span className="font-medium">Verified</span>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Verification Form */}
      {verificationStatus !== "approved" && (
        <Card>
          <CardHeader>
            <CardTitle>Submit Verification Documents</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-6">
              <div>
                <Label htmlFor="businessName">Business Name (Optional)</Label>
                <Input id="businessName" name="businessName" placeholder="Enter your business name" className="mt-1" />
              </div>

              <div>
                <Label htmlFor="nrcPassport">NRC or Passport Number *</Label>
                <Input
                  id="nrcPassport"
                  name="nrcPassport"
                  required
                  placeholder="Enter your NRC or Passport number"
                  className="mt-1"
                />
              </div>

              <div>
                <Label>Identity Document Upload *</Label>
                <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="mt-4">
                    <label htmlFor="document" className="cursor-pointer">
                      <span className="mt-2 block text-sm font-medium text-gray-900">Upload NRC or Passport</span>
                      <span className="mt-1 block text-sm text-gray-500">PNG, JPG, PDF up to 10MB</span>
                    </label>
                    <input id="document" type="file" accept="image/*,.pdf" className="hidden" />
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-medium text-blue-900 mb-2">Why verify your account?</h3>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Build trust with potential buyers</li>
                  <li>• Get a verified seller badge</li>
                  <li>• Access to premium seller features</li>
                  <li>• Higher visibility in search results</li>
                </ul>
              </div>

              <div className="flex justify-end gap-4">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
                <Button type="submit" disabled={uploading} className="bg-blue-600 hover:bg-blue-700">
                  {uploading ? "Submitting..." : "Submit for Verification"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Benefits */}
      <Card>
        <CardHeader>
          <CardTitle>Verification Benefits</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Shield className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Trusted Seller Badge</h4>
                <p className="text-sm text-gray-600">Display verification badge on your listings</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Higher Visibility</h4>
                <p className="text-sm text-gray-600">Verified listings appear higher in search</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
