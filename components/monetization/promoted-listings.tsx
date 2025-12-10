"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/Input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TrendingUp, Target, DollarSign, Eye, MousePointer } from "lucide-react"
import { motion } from "framer-motion"

interface PromotedListing {
  id: string
  product_id: string
  product_title: string
  product_image: string
  campaign_name: string
  budget: number
  duration_days: number
  target_audience: string
  status: "active" | "paused" | "completed" | "draft"
  impressions: number
  clicks: number
  conversions: number
  spent: number
  created_at: string
  ends_at: string
}

interface PromotedListingsProps {
  productId?: string
}

export function PromotedListings({ productId }: PromotedListingsProps) {
  const [campaigns, setCampaigns] = useState<PromotedListing[]>([])
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [loading, setLoading] = useState(true)

  // Form state
  const [campaignName, setCampaignName] = useState("")
  const [budget, setBudget] = useState("")
  const [duration, setDuration] = useState("")
  const [targetAudience, setTargetAudience] = useState("")

  useEffect(() => {
    fetchCampaigns()
  }, [])

  const fetchCampaigns = async () => {
    try {
      setLoading(true)
      // Mock data
      const mockCampaigns: PromotedListing[] = [
        {
          id: "1",
          product_id: "prod_1",
          product_title: "iPhone 14 Pro Max",
          product_image: "/placeholder.svg?height=100&width=100",
          campaign_name: "iPhone Holiday Sale",
          budget: 500,
          duration_days: 7,
          target_audience: "tech_enthusiasts",
          status: "active",
          impressions: 12500,
          clicks: 340,
          conversions: 12,
          spent: 245,
          created_at: new Date().toISOString(),
          ends_at: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: "2",
          product_id: "prod_2",
          product_title: "MacBook Air M2",
          product_image: "/placeholder.svg?height=100&width=100",
          campaign_name: "Back to School Promo",
          budget: 800,
          duration_days: 14,
          target_audience: "students",
          status: "completed",
          impressions: 25600,
          clicks: 680,
          conversions: 28,
          spent: 800,
          created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
          ends_at: new Date().toISOString(),
        },
      ]
      setCampaigns(mockCampaigns)
    } catch (error) {
      console.error("Error fetching campaigns:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-700"
      case "paused":
        return "bg-yellow-100 text-yellow-700"
      case "completed":
        return "bg-blue-100 text-blue-700"
      case "draft":
        return "bg-gray-100 text-gray-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  const calculateCTR = (clicks: number, impressions: number) => {
    return impressions > 0 ? ((clicks / impressions) * 100).toFixed(2) : "0.00"
  }

  const calculateCPC = (spent: number, clicks: number) => {
    return clicks > 0 ? (spent / clicks).toFixed(2) : "0.00"
  }

  const handleCreateCampaign = async () => {
    // Handle campaign creation
    console.log("Creating campaign:", {
      campaignName,
      budget,
      duration,
      targetAudience,
    })
    setShowCreateForm(false)
    // Reset form
    setCampaignName("")
    setBudget("")
    setDuration("")
    setTargetAudience("")
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Promoted Listings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center">
            <TrendingUp className="w-5 h-5 mr-2" />
            Promoted Listings
          </CardTitle>
          <Button onClick={() => setShowCreateForm(true)}>Create Campaign</Button>
        </CardHeader>
        <CardContent>
          {campaigns.length === 0 ? (
            <div className="text-center py-8">
              <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No campaigns yet</h3>
              <p className="text-gray-500 mb-4">Create your first promoted listing to boost visibility</p>
              <Button onClick={() => setShowCreateForm(true)}>Get Started</Button>
            </div>
          ) : (
            <div className="space-y-4">
              {campaigns.map((campaign) => (
                <motion.div
                  key={campaign.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <img
                        src={campaign.product_image || "/placeholder.svg"}
                        alt={campaign.product_title}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div>
                        <h3 className="font-semibold">{campaign.campaign_name}</h3>
                        <p className="text-sm text-gray-600">{campaign.product_title}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge className={getStatusColor(campaign.status)} variant="secondary">
                            {campaign.status}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {campaign.status === "active" ? "Ends" : "Ended"}{" "}
                            {new Date(campaign.ends_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500">Budget</div>
                      <div className="font-semibold">ZMW {campaign.budget.toLocaleString()}</div>
                      <div className="text-xs text-gray-500">Spent: ZMW {campaign.spent.toLocaleString()}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <Eye className="w-5 h-5 text-blue-500 mx-auto mb-1" />
                      <div className="text-lg font-semibold">{campaign.impressions.toLocaleString()}</div>
                      <div className="text-xs text-gray-500">Impressions</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <MousePointer className="w-5 h-5 text-green-500 mx-auto mb-1" />
                      <div className="text-lg font-semibold">{campaign.clicks.toLocaleString()}</div>
                      <div className="text-xs text-gray-500">Clicks</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <Target className="w-5 h-5 text-purple-500 mx-auto mb-1" />
                      <div className="text-lg font-semibold">
                        {calculateCTR(campaign.clicks, campaign.impressions)}%
                      </div>
                      <div className="text-xs text-gray-500">CTR</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <DollarSign className="w-5 h-5 text-orange-500 mx-auto mb-1" />
                      <div className="text-lg font-semibold">ZMW {calculateCPC(campaign.spent, campaign.clicks)}</div>
                      <div className="text-xs text-gray-500">CPC</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Campaign Form */}
      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create Promoted Listing Campaign</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="campaign-name">Campaign Name</Label>
              <Input
                id="campaign-name"
                value={campaignName}
                onChange={(e) => setCampaignName(e.target.value)}
                placeholder="Enter campaign name"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="budget">Budget (ZMW)</Label>
                <Input
                  id="budget"
                  type="number"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  placeholder="500"
                />
              </div>
              <div>
                <Label htmlFor="duration">Duration (days)</Label>
                <Input
                  id="duration"
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="7"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="target-audience">Target Audience</Label>
              <Select value={targetAudience} onValueChange={setTargetAudience}>
                <SelectTrigger>
                  <SelectValue placeholder="Select target audience" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  <SelectItem value="tech_enthusiasts">Tech Enthusiasts</SelectItem>
                  <SelectItem value="students">Students</SelectItem>
                  <SelectItem value="professionals">Professionals</SelectItem>
                  <SelectItem value="families">Families</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex space-x-2">
              <Button onClick={handleCreateCampaign} className="flex-1">
                Create Campaign
              </Button>
              <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
