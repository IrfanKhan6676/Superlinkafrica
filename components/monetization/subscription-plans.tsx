"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check, Star, Shield, Crown } from "lucide-react"
import { motion } from "framer-motion"

interface SubscriptionPlan {
  id: string
  name: string
  price: number
  currency: string
  interval: "monthly" | "yearly"
  features: string[]
  limits: {
    listings: number | "unlimited"
    photos_per_listing: number
    promoted_listings: number
    analytics_retention: string
    commission_rate: number
  }
  popular?: boolean
  premium?: boolean
}

const plans: SubscriptionPlan[] = [
  {
    id: "basic",
    name: "Basic",
    price: 0,
    currency: "ZMW",
    interval: "monthly",
    features: [
      "Up to 10 active listings",
      "5 photos per listing",
      "Basic seller profile",
      "Standard customer support",
      "7-day analytics",
    ],
    limits: {
      listings: 10,
      photos_per_listing: 5,
      promoted_listings: 0,
      analytics_retention: "7 days",
      commission_rate: 5.0,
    },
  },
  {
    id: "pro",
    name: "Pro",
    price: 299,
    currency: "ZMW",
    interval: "monthly",
    popular: true,
    features: [
      "Up to 100 active listings",
      "15 photos per listing",
      "Enhanced seller profile",
      "Priority customer support",
      "30-day analytics",
      "2 promoted listings/month",
      "Bulk listing tools",
      "Advanced search visibility",
    ],
    limits: {
      listings: 100,
      photos_per_listing: 15,
      promoted_listings: 2,
      analytics_retention: "30 days",
      commission_rate: 3.5,
    },
  },
  {
    id: "premium",
    name: "Premium",
    price: 599,
    currency: "ZMW",
    interval: "monthly",
    premium: true,
    features: [
      "Unlimited active listings",
      "25 photos per listing",
      "Premium seller badge",
      "Dedicated account manager",
      "90-day analytics",
      "10 promoted listings/month",
      "Advanced bulk tools",
      "Featured seller placement",
      "Custom store branding",
      "API access",
    ],
    limits: {
      listings: "unlimited",
      photos_per_listing: 25,
      promoted_listings: 10,
      analytics_retention: "90 days",
      commission_rate: 2.0,
    },
  },
]

interface SubscriptionPlansProps {
  currentPlan?: string
  onSelectPlan?: (planId: string) => void
}

export function SubscriptionPlans({ currentPlan, onSelectPlan }: SubscriptionPlansProps) {
  const [billingInterval, setBillingInterval] = useState<"monthly" | "yearly">("monthly")

  const getPlanIcon = (planId: string) => {
    switch (planId) {
      case "basic":
        return <Shield className="w-6 h-6" />
      case "pro":
        return <Star className="w-6 h-6" />
      case "premium":
        return <Crown className="w-6 h-6" />
      default:
        return <Shield className="w-6 h-6" />
    }
  }

  const getPlanColor = (planId: string) => {
    switch (planId) {
      case "basic":
        return "text-gray-600"
      case "pro":
        return "text-blue-600"
      case "premium":
        return "text-purple-600"
      default:
        return "text-gray-600"
    }
  }

  const getDiscountedPrice = (price: number) => {
    return billingInterval === "yearly" ? Math.round(price * 12 * 0.8) : price
  }

  return (
    <div className="space-y-8">
      {/* Billing Toggle */}
      <div className="flex items-center justify-center">
        <div className="flex items-center space-x-4 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setBillingInterval("monthly")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              billingInterval === "monthly" ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingInterval("yearly")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              billingInterval === "yearly" ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Yearly
            <Badge className="ml-2 bg-green-100 text-green-700" variant="secondary">
              Save 20%
            </Badge>
          </button>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan, index) => (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card
              className={`relative h-full transition-all hover:shadow-lg ${
                plan.popular ? "ring-2 ring-blue-500 shadow-lg" : ""
              } ${plan.premium ? "ring-2 ring-purple-500 shadow-lg" : ""} ${
                currentPlan === plan.id ? "ring-2 ring-green-500" : ""
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-blue-500 text-white">Most Popular</Badge>
                </div>
              )}
              {plan.premium && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-purple-500 text-white">Premium</Badge>
                </div>
              )}

              <CardHeader className="text-center pb-4">
                <div className={`flex items-center justify-center mb-4 ${getPlanColor(plan.id)}`}>
                  {getPlanIcon(plan.id)}
                </div>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <div className="space-y-2">
                  <div className="text-4xl font-bold">
                    {plan.price === 0 ? (
                      "Free"
                    ) : (
                      <>
                        {plan.currency} {getDiscountedPrice(plan.price).toLocaleString()}
                        {billingInterval === "yearly" && plan.price > 0 && (
                          <div className="text-sm text-gray-500 line-through">
                            {plan.currency} {(plan.price * 12).toLocaleString()}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                  {plan.price > 0 && (
                    <div className="text-sm text-gray-500">per {billingInterval === "yearly" ? "year" : "month"}</div>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Features */}
                <div className="space-y-3">
                  {plan.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-start space-x-3">
                      <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-600">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Limits */}
                <div className="border-t pt-4 space-y-2">
                  <div className="text-sm font-medium text-gray-900">Plan Limits:</div>
                  <div className="space-y-1 text-sm text-gray-600">
                    <div>Listings: {plan.limits.listings}</div>
                    <div>Photos: {plan.limits.photos_per_listing} per listing</div>
                    <div>Commission: {plan.limits.commission_rate}%</div>
                    <div>Analytics: {plan.limits.analytics_retention}</div>
                  </div>
                </div>

                {/* Action Button */}
                <Button
                  onClick={() => onSelectPlan?.(plan.id)}
                  className={`w-full ${
                    currentPlan === plan.id
                      ? "bg-green-600 hover:bg-green-700"
                      : plan.popular
                        ? "bg-blue-600 hover:bg-blue-700"
                        : plan.premium
                          ? "bg-purple-600 hover:bg-purple-700"
                          : ""
                  }`}
                  variant={currentPlan === plan.id ? "default" : plan.popular || plan.premium ? "default" : "outline"}
                >
                  {currentPlan === plan.id ? "Current Plan" : plan.price === 0 ? "Get Started" : "Upgrade Now"}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
