"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Star, Gift, Users, Calendar, Trophy, Coins, TrendingUp, Share2, CheckCircle, Clock, Crown } from "lucide-react"

interface LoyaltyData {
  profile: {
    totalPoints: number
    availablePoints: number
    tierLevel: string
    tierProgress: number
    lifetimeSpent: number
    referralCount: number
    nextTierThreshold: number
    tierBenefits: string[]
  }
  pointsHistory: Array<{
    id: string
    transactionType: string
    pointsAmount: number
    source: string
    description: string
    createdAt: string
  }>
  availableRewards: Array<{
    id: string
    title: string
    description: string
    rewardType: string
    pointsCost: number
    monetaryValue?: number
    discountPercentage?: number
  }>
}

export function LoyaltyDashboard() {
  const [loyaltyData, setLoyaltyData] = useState<LoyaltyData | null>(null)
  const [loading, setLoading] = useState(true)
  const [checkinLoading, setCheckinLoading] = useState(false)
  const [referralCode, setReferralCode] = useState("")

  useEffect(() => {
    fetchLoyaltyData()
    fetchReferralCode()
  }, [])

  const fetchLoyaltyData = async () => {
    try {
      const response = await fetch("/api/loyalty/dashboard")
      const data = await response.json()
      setLoyaltyData(data)
    } catch (error) {
      console.error("Failed to fetch loyalty data:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchReferralCode = async () => {
    try {
      const response = await fetch("/api/loyalty/referral-code")
      const data = await response.json()
      setReferralCode(data.code)
    } catch (error) {
      console.error("Failed to fetch referral code:", error)
    }
  }

  const handleDailyCheckin = async () => {
    setCheckinLoading(true)
    try {
      const response = await fetch("/api/loyalty/daily-checkin", { method: "POST" })
      const data = await response.json()

      if (data.success) {
        fetchLoyaltyData() // Refresh data
      }
    } catch (error) {
      console.error("Failed to process daily checkin:", error)
    } finally {
      setCheckinLoading(false)
    }
  }

  const redeemReward = async (rewardId: string) => {
    try {
      const response = await fetch("/api/loyalty/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rewardId }),
      })

      const data = await response.json()
      if (data.success) {
        fetchLoyaltyData() // Refresh data
        alert(`Reward redeemed! Code: ${data.redemptionCode}`)
      }
    } catch (error) {
      console.error("Failed to redeem reward:", error)
    }
  }

  const copyReferralCode = () => {
    navigator.clipboard.writeText(referralCode)
    alert("Referral code copied!")
  }

  const shareReferral = () => {
    const shareText = `Join Superlink marketplace with my referral code ${referralCode} and get bonus points!`
    if (navigator.share) {
      navigator.share({ text: shareText })
    } else {
      navigator.clipboard.writeText(shareText)
      alert("Referral message copied!")
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center p-8">Loading loyalty dashboard...</div>
  }

  if (!loyaltyData) {
    return <div className="text-center p-8">Failed to load loyalty data</div>
  }

  const { profile, pointsHistory, availableRewards } = loyaltyData

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case "platinum":
        return <Crown className="h-5 w-5 text-purple-600" />
      case "gold":
        return <Trophy className="h-5 w-5 text-yellow-600" />
      case "silver":
        return <Star className="h-5 w-5 text-gray-600" />
      default:
        return <Coins className="h-5 w-5 text-orange-600" />
    }
  }

  const getTierColor = (tier: string) => {
    switch (tier) {
      case "platinum":
        return "bg-purple-100 text-purple-800 border-purple-200"
      case "gold":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "silver":
        return "bg-gray-100 text-gray-800 border-gray-200"
      default:
        return "bg-orange-100 text-orange-800 border-orange-200"
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Loyalty Dashboard</h1>
        <Button onClick={handleDailyCheckin} disabled={checkinLoading} className="bg-green-600 hover:bg-green-700">
          <Calendar className="h-4 w-4 mr-2" />
          {checkinLoading ? "Checking in..." : "Daily Check-in"}
        </Button>
      </div>

      {/* Loyalty Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Coins className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium text-gray-600">Available Points</p>
                <p className="text-2xl font-bold text-blue-600">{profile.availablePoints.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              {getTierIcon(profile.tierLevel)}
              <div>
                <p className="text-sm font-medium text-gray-600">Current Tier</p>
                <Badge className={getTierColor(profile.tierLevel)}>{profile.tierLevel.toUpperCase()}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm font-medium text-gray-600">Lifetime Spent</p>
                <p className="text-2xl font-bold text-green-600">ZMW {profile.lifetimeSpent.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm font-medium text-gray-600">Referrals</p>
                <p className="text-2xl font-bold text-purple-600">{profile.referralCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tier Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Trophy className="h-5 w-5" />
            <span>Tier Progress</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="font-medium">{profile.tierLevel.toUpperCase()}</span>
            <span className="text-sm text-gray-600">
              {profile.totalPoints} / {profile.nextTierThreshold} points
            </span>
          </div>
          <Progress value={profile.tierProgress} className="h-3" />

          <div className="space-y-2">
            <h4 className="font-medium">Current Tier Benefits:</h4>
            <ul className="space-y-1">
              {profile.tierBenefits.map((benefit, index) => (
                <li key={index} className="flex items-center space-x-2 text-sm">
                  <CheckCircle className="h-3 w-3 text-green-500" />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs defaultValue="rewards" className="w-full">
        <TabsList>
          <TabsTrigger value="rewards">Available Rewards ({availableRewards.length})</TabsTrigger>
          <TabsTrigger value="history">Points History</TabsTrigger>
          <TabsTrigger value="referral">Referral Program</TabsTrigger>
        </TabsList>

        <TabsContent value="rewards" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {availableRewards.map((reward) => (
              <Card key={reward.id} className="border-2 hover:border-blue-200 transition-colors">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{reward.title}</CardTitle>
                    <Gift className="h-5 w-5 text-blue-500" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-gray-600">{reward.description}</p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Coins className="h-4 w-4 text-blue-500" />
                      <span className="font-semibold text-blue-600">{reward.pointsCost} points</span>
                    </div>
                    {reward.monetaryValue && (
                      <Badge variant="outline">ZMW {reward.monetaryValue.toFixed(2)} value</Badge>
                    )}
                    {reward.discountPercentage && <Badge variant="outline">{reward.discountPercentage}% off</Badge>}
                  </div>

                  <Button
                    onClick={() => redeemReward(reward.id)}
                    disabled={profile.availablePoints < reward.pointsCost}
                    className="w-full"
                  >
                    {profile.availablePoints < reward.pointsCost ? "Insufficient Points" : "Redeem Reward"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {availableRewards.length === 0 && (
            <Alert>
              <Gift className="h-4 w-4" />
              <AlertDescription>
                No rewards available at your current points level. Keep earning points to unlock more rewards!
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Points Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pointsHistory.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div
                        className={`p-2 rounded-full ${
                          transaction.transactionType === "earned"
                            ? "bg-green-100"
                            : transaction.transactionType === "redeemed"
                              ? "bg-red-100"
                              : "bg-gray-100"
                        }`}
                      >
                        {transaction.transactionType === "earned" ? (
                          <TrendingUp className="h-4 w-4 text-green-600" />
                        ) : transaction.transactionType === "redeemed" ? (
                          <Gift className="h-4 w-4 text-red-600" />
                        ) : (
                          <Clock className="h-4 w-4 text-gray-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{transaction.description}</p>
                        <p className="text-sm text-gray-600">
                          {transaction.source.replace("_", " ")} •{" "}
                          {new Date(transaction.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p
                        className={`font-semibold ${
                          transaction.transactionType === "earned"
                            ? "text-green-600"
                            : transaction.transactionType === "redeemed"
                              ? "text-red-600"
                              : "text-gray-600"
                        }`}
                      >
                        {transaction.transactionType === "earned" ? "+" : "-"}
                        {transaction.pointsAmount}
                      </p>
                      <p className="text-xs text-gray-500">points</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="referral" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>Referral Program</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert className="border-blue-200 bg-blue-50">
                <Gift className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  Invite friends and earn 1,000 points for each successful referral! Your friends get 500 bonus points
                  too.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Your Referral Code</label>
                  <div className="flex items-center space-x-2 mt-1">
                    <div className="flex-1 p-3 bg-gray-50 rounded border font-mono text-lg text-center">
                      {referralCode}
                    </div>
                    <Button onClick={copyReferralCode} variant="outline">
                      Copy
                    </Button>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button onClick={shareReferral} className="flex-1">
                    <Share2 className="h-4 w-4 mr-2" />
                    Share Referral
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">{profile.referralCount}</p>
                    <p className="text-sm text-green-800">Successful Referrals</p>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">{profile.referralCount * 1000}</p>
                    <p className="text-sm text-blue-800">Points Earned</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
