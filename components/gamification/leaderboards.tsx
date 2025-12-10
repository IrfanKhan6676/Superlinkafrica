"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Trophy, Crown, Medal, Star, TrendingUp, ShoppingBag, Heart, MessageCircle, Zap } from "lucide-react"
import { useUser } from "@/hooks/use-user"
import { createClient } from "@/lib/supabase/client"

interface LeaderboardEntry {
  id: string
  user: {
    id: string
    full_name: string
    username: string
    profile_image_url: string
    is_verified: boolean
  }
  score: number
  rank: number
  change: number // Position change from last period
  badge?: string
  level: number
}

interface LeaderboardsProps {
  period?: "daily" | "weekly" | "monthly" | "all_time"
  limit?: number
}

export function Leaderboards({ period = "weekly", limit = 50 }: LeaderboardsProps) {
  const [activeTab, setActiveTab] = useState("sellers")
  const [leaderboards, setLeaderboards] = useState<{
    sellers: LeaderboardEntry[]
    buyers: LeaderboardEntry[]
    social: LeaderboardEntry[]
    points: LeaderboardEntry[]
  }>({
    sellers: [],
    buyers: [],
    social: [],
    points: [],
  })
  const [loading, setLoading] = useState(true)
  const [userRank, setUserRank] = useState<{ [key: string]: number }>({})
  const { user } = useUser()
  const supabase = createClient()

  useEffect(() => {
    fetchLeaderboards()
  }, [period])

  const fetchLeaderboards = async () => {
    try {
      setLoading(true)

      // For demonstration, using mock data
      // In a real implementation, these would be complex queries
      const mockSellers: LeaderboardEntry[] = [
        {
          id: "1",
          user: {
            id: "seller1",
            full_name: "TechStore Zambia",
            username: "techstore_zm",
            profile_image_url: "/placeholder.svg?height=40&width=40",
            is_verified: true,
          },
          score: 2450,
          rank: 1,
          change: 0,
          badge: "Top Seller",
          level: 25,
        },
        {
          id: "2",
          user: {
            id: "seller2",
            full_name: "Electronics Hub",
            username: "electronics_hub",
            profile_image_url: "/placeholder.svg?height=40&width=40",
            is_verified: true,
          },
          score: 2180,
          rank: 2,
          change: 1,
          badge: "Rising Star",
          level: 22,
        },
        {
          id: "3",
          user: {
            id: "seller3",
            full_name: "Mobile World",
            username: "mobile_world",
            profile_image_url: "/placeholder.svg?height=40&width=40",
            is_verified: false,
          },
          score: 1950,
          rank: 3,
          change: -1,
          level: 19,
        },
      ]

      const mockBuyers: LeaderboardEntry[] = [
        {
          id: "1",
          user: {
            id: "buyer1",
            full_name: "Sarah Johnson",
            username: "sarah_j",
            profile_image_url: "/placeholder.svg?height=40&width=40",
            is_verified: true,
          },
          score: 156,
          rank: 1,
          change: 2,
          badge: "Super Buyer",
          level: 18,
        },
        {
          id: "2",
          user: {
            id: "buyer2",
            full_name: "Mike Chen",
            username: "mike_c",
            profile_image_url: "/placeholder.svg?height=40&width=40",
            is_verified: false,
          },
          score: 134,
          rank: 2,
          change: 0,
          level: 15,
        },
      ]

      const mockSocial: LeaderboardEntry[] = [
        {
          id: "1",
          user: {
            id: "social1",
            full_name: "Community Leader",
            username: "community_lead",
            profile_image_url: "/placeholder.svg?height=40&width=40",
            is_verified: true,
          },
          score: 890,
          rank: 1,
          change: 0,
          badge: "Influencer",
          level: 20,
        },
      ]

      const mockPoints: LeaderboardEntry[] = [
        {
          id: "1",
          user: {
            id: "points1",
            full_name: "Point Master",
            username: "point_master",
            profile_image_url: "/placeholder.svg?height=40&width=40",
            is_verified: true,
          },
          score: 15420,
          rank: 1,
          change: 0,
          badge: "Legend",
          level: 35,
        },
      ]

      setLeaderboards({
        sellers: mockSellers,
        buyers: mockBuyers,
        social: mockSocial,
        points: mockPoints,
      })

      // Set user ranks (mock data)
      if (user) {
        setUserRank({
          sellers: 15,
          buyers: 8,
          social: 23,
          points: 12,
        })
      }
    } catch (error) {
      console.error("Error fetching leaderboards:", error)
    } finally {
      setLoading(false)
    }
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-500" />
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />
      case 3:
        return <Medal className="w-6 h-6 text-amber-600" />
      default:
        return <span className="w-6 h-6 flex items-center justify-center text-sm font-bold text-gray-500">{rank}</span>
    }
  }

  const getChangeIndicator = (change: number) => {
    if (change > 0) {
      return (
        <div className="flex items-center text-green-600">
          <TrendingUp className="w-3 h-3 mr-1" />
          <span className="text-xs">+{change}</span>
        </div>
      )
    } else if (change < 0) {
      return (
        <div className="flex items-center text-red-600">
          <TrendingUp className="w-3 h-3 mr-1 rotate-180" />
          <span className="text-xs">{change}</span>
        </div>
      )
    }
    return <div className="w-8 h-4"></div>
  }

  const getTabIcon = (tab: string) => {
    switch (tab) {
      case "sellers":
        return <ShoppingBag className="w-4 h-4" />
      case "buyers":
        return <Heart className="w-4 h-4" />
      case "social":
        return <MessageCircle className="w-4 h-4" />
      case "points":
        return <Zap className="w-4 h-4" />
      default:
        return <Trophy className="w-4 h-4" />
    }
  }

  const renderLeaderboard = (entries: LeaderboardEntry[], type: string) => {
    if (loading) {
      return (
        <div className="space-y-3">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="animate-pulse flex items-center space-x-3 p-3">
              <div className="w-8 h-8 bg-gray-200 rounded"></div>
              <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                <div className="h-3 bg-gray-200 rounded w-1/4"></div>
              </div>
              <div className="w-16 h-4 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      )
    }

    return (
      <div className="space-y-2">
        {entries.map((entry, index) => (
          <div
            key={entry.id}
            className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
              entry.rank <= 3
                ? "bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200"
                : "hover:bg-gray-50"
            }`}
          >
            <div className="flex items-center justify-center w-8">{getRankIcon(entry.rank)}</div>

            <Avatar className="w-10 h-10">
              <AvatarImage src={entry.user.profile_image_url || "/placeholder.svg"} />
              <AvatarFallback>{entry.user.full_name.charAt(0)}</AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <h3 className="font-semibold text-sm truncate">{entry.user.full_name}</h3>
                {entry.user.is_verified && <Star className="w-4 h-4 text-blue-500" />}
                {entry.badge && (
                  <Badge variant="secondary" className="text-xs">
                    {entry.badge}
                  </Badge>
                )}
              </div>
              <div className="flex items-center space-x-2 text-xs text-gray-500">
                <span>@{entry.user.username}</span>
                <span>•</span>
                <span>Level {entry.level}</span>
              </div>
            </div>

            <div className="text-right">
              <div className="font-bold text-lg">{entry.score.toLocaleString()}</div>
              {getChangeIndicator(entry.change)}
            </div>
          </div>
        ))}

        {/* User's rank if not in top entries */}
        {user && userRank[type] && userRank[type] > entries.length && (
          <div className="border-t pt-3 mt-4">
            <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center justify-center w-8">
                <span className="text-sm font-bold text-blue-600">#{userRank[type]}</span>
              </div>
              <Avatar className="w-10 h-10">
                <AvatarImage src={user.user_metadata?.avatar_url || "/placeholder.svg"} />
                <AvatarFallback>{user.user_metadata?.full_name?.charAt(0) || user.email?.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3 className="font-semibold text-sm">You</h3>
                <p className="text-xs text-gray-500">Your current position</p>
              </div>
              <div className="text-right">
                <div className="font-bold text-lg text-blue-600">1,234</div>
                <div className="text-xs text-gray-500">Your score</div>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <Trophy className="w-5 h-5 mr-2 text-yellow-500" />
            Leaderboards
          </CardTitle>
          <div className="flex space-x-2">
            <Button variant={period === "daily" ? "default" : "outline"} size="sm">
              Daily
            </Button>
            <Button variant={period === "weekly" ? "default" : "outline"} size="sm">
              Weekly
            </Button>
            <Button variant={period === "monthly" ? "default" : "outline"} size="sm">
              Monthly
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="sellers" className="flex items-center space-x-2">
              {getTabIcon("sellers")}
              <span>Sellers</span>
            </TabsTrigger>
            <TabsTrigger value="buyers" className="flex items-center space-x-2">
              {getTabIcon("buyers")}
              <span>Buyers</span>
            </TabsTrigger>
            <TabsTrigger value="social" className="flex items-center space-x-2">
              {getTabIcon("social")}
              <span>Social</span>
            </TabsTrigger>
            <TabsTrigger value="points" className="flex items-center space-x-2">
              {getTabIcon("points")}
              <span>Points</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="sellers" className="mt-6">
            <div className="mb-4">
              <h3 className="font-semibold text-lg mb-2">Top Sellers</h3>
              <p className="text-sm text-gray-600">Ranked by total sales and customer satisfaction</p>
            </div>
            {renderLeaderboard(leaderboards.sellers, "sellers")}
          </TabsContent>

          <TabsContent value="buyers" className="mt-6">
            <div className="mb-4">
              <h3 className="font-semibold text-lg mb-2">Top Buyers</h3>
              <p className="text-sm text-gray-600">Ranked by purchases and community engagement</p>
            </div>
            {renderLeaderboard(leaderboards.buyers, "buyers")}
          </TabsContent>

          <TabsContent value="social" className="mt-6">
            <div className="mb-4">
              <h3 className="font-semibold text-lg mb-2">Social Leaders</h3>
              <p className="text-sm text-gray-600">Ranked by followers, reviews, and community contributions</p>
            </div>
            {renderLeaderboard(leaderboards.social, "social")}
          </TabsContent>

          <TabsContent value="points" className="mt-6">
            <div className="mb-4">
              <h3 className="font-semibold text-lg mb-2">Point Leaders</h3>
              <p className="text-sm text-gray-600">Ranked by total points earned across all activities</p>
            </div>
            {renderLeaderboard(leaderboards.points, "points")}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
