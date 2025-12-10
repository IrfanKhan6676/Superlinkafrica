"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Settings, Bell, Truck, Shield } from "lucide-react"

interface PreferencesStepProps {
  data: any
  onNext: (data: any) => void
  onSkip: () => void
  isLoading: boolean
}

export function PreferencesStep({ data, onNext, onSkip, isLoading }: PreferencesStepProps) {
  const [preferences, setPreferences] = useState({
    emailNotifications: data.emailNotifications ?? true,
    smsNotifications: data.smsNotifications ?? false,
    pushNotifications: data.pushNotifications ?? true,
    priceAlerts: data.priceAlerts ?? true,
    newListingAlerts: data.newListingAlerts ?? true,
    preferredDelivery: data.preferredDelivery || "biker",
    language: data.language || "english",
    currency: data.currency || "zmw",
    privacyLevel: data.privacyLevel || "public",
    ...data,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onNext(preferences)
  }

  const updatePreference = (key: string, value: any) => {
    setPreferences((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="text-center mb-6">
        <Settings className="w-12 h-12 mx-auto text-purple-600 mb-2" />
        <h3 className="text-lg font-semibold mb-2">Your Preferences</h3>
        <p className="text-gray-600">Customize your Superlink experience</p>
      </div>

      <div className="space-y-6">
        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-base">
              <Bell className="w-5 h-5 mr-2" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="email-notifications">Email notifications</Label>
              <Switch
                id="email-notifications"
                checked={preferences.emailNotifications}
                onCheckedChange={(checked) => updatePreference("emailNotifications", checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="sms-notifications">SMS notifications</Label>
              <Switch
                id="sms-notifications"
                checked={preferences.smsNotifications}
                onCheckedChange={(checked) => updatePreference("smsNotifications", checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="push-notifications">Push notifications</Label>
              <Switch
                id="push-notifications"
                checked={preferences.pushNotifications}
                onCheckedChange={(checked) => updatePreference("pushNotifications", checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="price-alerts">Price drop alerts</Label>
              <Switch
                id="price-alerts"
                checked={preferences.priceAlerts}
                onCheckedChange={(checked) => updatePreference("priceAlerts", checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="listing-alerts">New listing alerts</Label>
              <Switch
                id="listing-alerts"
                checked={preferences.newListingAlerts}
                onCheckedChange={(checked) => updatePreference("newListingAlerts", checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Delivery Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-base">
              <Truck className="w-5 h-5 mr-2" />
              Delivery Preferences
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <Label htmlFor="delivery-method">Preferred delivery method</Label>
              <Select
                value={preferences.preferredDelivery}
                onValueChange={(value) => updatePreference("preferredDelivery", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="biker">Biker delivery (same city)</SelectItem>
                  <SelectItem value="bus">Bus transport (intercity)</SelectItem>
                  <SelectItem value="pickup">Self pickup</SelectItem>
                  <SelectItem value="any">Any available method</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* General Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-base">
              <Shield className="w-5 h-5 mr-2" />
              General Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="language">Language</Label>
              <Select value={preferences.language} onValueChange={(value) => updatePreference("language", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="english">English</SelectItem>
                  <SelectItem value="bemba">Bemba</SelectItem>
                  <SelectItem value="nyanja">Nyanja</SelectItem>
                  <SelectItem value="tonga">Tonga</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="currency">Currency</Label>
              <Select value={preferences.currency} onValueChange={(value) => updatePreference("currency", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="zmw">Zambian Kwacha (ZMW)</SelectItem>
                  <SelectItem value="usd">US Dollar (USD)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="privacy">Profile visibility</Label>
              <Select
                value={preferences.privacyLevel}
                onValueChange={(value) => updatePreference("privacyLevel", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Public (recommended)</SelectItem>
                  <SelectItem value="friends">Friends only</SelectItem>
                  <SelectItem value="private">Private</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-between pt-6">
        <Button type="button" variant="ghost" onClick={onSkip} disabled={isLoading}>
          Skip for now
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : "Continue"}
        </Button>
      </div>
    </form>
  )
}
