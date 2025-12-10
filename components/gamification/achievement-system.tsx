"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Trophy, Star, Zap, Crown, Heart, MessageCircle, ShoppingBag, Award, Gift } from "lucide-react"
import { useUser } from "@/hooks/use-user"
import { createClient } from "@/lib/supabase/client"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"

interface Achievement {
  id: string
  name: string
  description: string
  icon_url?: string
  badge_type: "seller" | "buyer" | "social" | "achievement"
  criteria: {
    type: string
    target: number
    current?: number
  }
  is_active: boolean
  rarity: "common" | "rare" | "epic" | "legendary"
  points_reward: number
  is_earned: boolean
  earned_at?: string
  progress_percentage: number
}

interface UserStats {
  level: number
  total_points: number
  points_to_next_level: number
  current_streak: number
  total_sales: number
  total_purchases: number
  reviews_given: number
  followers_count: number
  achievements_count: number
}

interface AchievementSystemProps {
  userId?: string
  showProgress?: boolean
}

export function AchievementSystem({ userId, showProgress = true }: AchievementSystemProps) {
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [userStats, setUserStats] = useState<UserStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<"all" | "seller" | "buyer" | "social">("all")
  const [newAchievement, setNewAchievement] = useState<Achievement | null>(null)
  const { user } = useUser()
  const supabase = createClient()

  const targetUserId = userId || user?.id

  useEffect(() => {
    if (targetUserId) {
      fetchAchievements()
      fetchUserStats()
    }
  }, [targetUserId, selectedCategory])

  const fetchAchievements = async () => {
    try {
      setLoading(true)

      // Fetch all badges and user's earned badges
      let query = supabase.from("badges").select(`
        *,
        user_badges!left(earned_at, metadata)
      `)

      if (selectedCategory !== "all") {
        query = query.eq("badge_type", selectedCategory)
      }

      const { data: badgesData, error } = await query.eq("is_active", true)

      if (error) throw error

      // Calculate progress for each achievement
      const achievementsWithProgress = await Promise.all(
        (badgesData || []).map(async (badge) => {
          const isEarned = badge.user_badges?.some((ub: any) => ub.earned_at)
          let currentProgress = 0
          let progressPercentage = 0

          if (!isEarned && badge.criteria) {
            currentProgress = await calculateProgress(badge.criteria, targetUserId!)
            progressPercentage = Math.min((currentProgress / badge.criteria.target) * 100, 100)
          } else if (isEarned) {
            progressPercentage = 100
          }

          return {
            id: badge.id,
            name: badge.name,
            description: badge.description,
            icon_url: badge.icon_url,
            badge_type: badge.badge_type,
            criteria: {
              ...badge.criteria,
              current: currentProgress,
            },
            is_active: badge.is_active,
            rarity: badge.metadata?.rarity || "common",
            points_reward: badge.metadata?.points_reward || 10,
            is_earned: isEarned,
            earned_at: badge.user_badges?.[0]?.earned_at,
            progress_percentage: progressPercentage,
          }
        }),
      )

      setAchievements(achievementsWithProgress)
    } catch (error) {
      console.error("Error fetching achievements:", error)
    } finally {
      setLoading(false)
    }
  }

  const calculateProgress = async (criteria: any, userId: string): Promise<number> => {
    try {
      switch (criteria.type) {
        case "sales_count":
          const { count: salesCount } = await supabase
            .from("orders")
            .select("*", { count: "exact", head: true })
            .eq("seller_id", userId)
            .eq("order_status", "delivered")
          return salesCount || 0

        case "purchases_count":
          const { count: purchasesCount } = await supabase
            .from("orders")
            .select("*", { count: "exact", head: true })
            .eq("buyer_id", userId)
            .eq("order_status", "delivered")
          return purchasesCount || 0

        case "reviews_given":
          const { count: reviewsCount } = await supabase
            .from("reviews")
            .select("*", { count: "exact", head: true })
            .eq("reviewer_id", userId)
          return reviewsCount || 0

        case "followers_count":
          const { count: followersCount } = await supabase
            .from("user_connections")
            .select("*", { count: "exact", head: true })
            .eq("following_id", userId)
            .eq("connection_type", "follow")
          return followersCount || 0

        case "products_listed":
          const { count: productsCount } = await supabase
            .from("products")
            .select("*", { count: "exact", head: true })
            .eq("seller_id", userId)
            .eq("status", "active")
          return productsCount || 0

        case "total_revenue":
          const { data: revenueData } = await supabase
            .from("orders")
            .select("total_amount")
            .eq("seller_id", userId)
            .eq("order_status", "delivered")

          return revenueData?.reduce((sum, order) => sum + order.total_amount, 0) || 0

        default:
          return 0
      }
    } catch (error) {
      console.error("Error calculating progress:", error)
      return 0
    }
  }

  const fetchUserStats = async () => {
    if (!targetUserId) return

    try {
      // This would typically be a more complex calculation
      // For now, using mock data
      const mockStats: UserStats = {
        level: 12,
        total_points: 2450,
        points_to_next_level: 550,
        current_streak: 7,
        total_sales: 23,
        total_purchases: 45,
        reviews_given: 18,
        followers_count: 156,
        achievements_count: achievements.filter((a) => a.is_earned).length,
      }

      setUserStats(mockStats)
    } catch (error) {
      console.error("Error fetching user stats:", error)
    }
  }

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "common":
        return "bg-gray-100 text-gray-700 border-gray-300"
      case "rare":
        return "bg-blue-100 text-blue-700 border-blue-300"
      case "epic":
        return "bg-purple-100 text-purple-700 border-purple-300"
      case "legendary":
        return "bg-yellow-100 text-yellow-700 border-yellow-300"
      default:
        return "bg-gray-100 text-gray-700 border-gray-300"
    }
  }

  const getRarityIcon = (rarity: string) => {
    switch (rarity) {
      case "common":
        return <Star className="w-4 h-4" />
      case "rare":
        return <Award className="w-4 h-4" />
      case "epic":
        return <Crown className="w-4 h-4" />
      case "legendary":
        return <Trophy className="w-4 h-4" />
      default:
        return <Star className="w-4 h-4" />
    }
  }

  const getAchievementIcon = (badgeType: string, iconUrl?: string) => {
    if (iconUrl) {
      return <Image src={iconUrl || "/placeholder.svg"} alt="Achievement" width={24} height={24} />
    }

    switch (badgeType) {
      case "seller":
        return <ShoppingBag className="w-6 h-6" />
      case "buyer":
        return <Heart className="w-6 h-6" />
      case "social":
        return <MessageCircle className="w-6 h-6" />
      default:
        return <Trophy className="w-6 h-6" />
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-32 bg-gray-200 rounded-lg mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-40 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* User Stats Overview */}
      {showProgress && userStats && (
        <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold">Level {userStats.level}</h2>
                <p className="text-blue-100">
                  {userStats.total_points.toLocaleString()} points • {userStats.points_to_next_level} to next level
                </p>
              </div>
              <div className="text-right">
                <div className="flex items-center space-x-2 mb-2">
                  <Zap className="w-5 h-5 text-yellow-300" />
                  <span className="text-lg font-semibold">{userStats.current_streak} day streak</span>
                </div>
                <Badge variant="secondary" className="bg-white/20 text-white">
                  {userStats.achievements_count} achievements
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{userStats.total_sales}</div>
                <div className="text-sm text-blue-100">Sales</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{userStats.total_purchases}</div>
                <div className="text-sm text-blue-100">Purchases</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{userStats.reviews_given}</div>
                <div className="text-sm text-blue-100">Reviews</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{userStats.followers_count}</div>
                <div className="text-sm text-blue-100">Followers</div>
              </div>
            </div>

            <Progress value={(userStats.total_points % 1000) / 10} className="bg-white/20" />
          </CardContent>
        </Card>
      )}

      {/* Category Filters */}
      <div className="flex space-x-2">
        <Button
          variant={selectedCategory === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setSelectedCategory("all")}
        >
          All
        </Button>
        <Button
          variant={selectedCategory === "seller" ? "default" : "outline"}
          size="sm"
          onClick={() => setSelectedCategory("seller")}
        >
          <ShoppingBag className="w-4 h-4 mr-2" />
          Seller
        </Button>
        <Button
          variant={selectedCategory === "buyer" ? "default" : "outline"}
          size="sm"
          onClick={() => setSelectedCategory("buyer")}
        >
          <Heart className="w-4 h-4 mr-2" />
          Buyer
        </Button>
        <Button
          variant={selectedCategory === "social" ? "default" : "outline"}
          size="sm"
          onClick={() => setSelectedCategory("social")}
        >
          <MessageCircle className="w-4 h-4 mr-2" />
          Social
        </Button>
      </div>

      {/* Achievements Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence>
          {achievements.map((achievement) => (
            <motion.div
              key={achievement.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
            >
              <Card
                className={`relative overflow-hidden transition-all duration-200 hover:shadow-lg ${
                  achievement.is_earned
                    ? "bg-gradient-to-br from-green-50 to-green-100 border-green-200"
                    : "hover:shadow-md"
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div
                      className={`p-3 rounded-full ${
                        achievement.is_earned ? "bg-green-500 text-white" : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {getAchievementIcon(achievement.badge_type, achievement.icon_url)}
                    </div>
                    <Badge className={`${getRarityColor(achievement.rarity)} border`}>
                      {getRarityIcon(achievement.rarity)}
                      <span className="ml-1 capitalize">{achievement.rarity}</span>
                    </Badge>
                  </div>

                  <h3 className="font-semibold text-lg mb-1">{achievement.name}</h3>
                  <p className="text-sm text-gray-600 mb-3">{achievement.description}</p>

                  {achievement.is_earned ? (
                    <div className="flex items-center justify-between">
                      <Badge variant="default" className="bg-green-500">
                        <Trophy className="w-3 h-3 mr-1" />
                        Earned
                      </Badge>
                      <div className="flex items-center text-sm text-green-600">
                        <Gift className="w-4 h-4 mr-1" />+{achievement.points_reward} points
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">
                          {achievement.criteria.current || 0} / {achievement.criteria.target}
                        </span>
                        <span className="font-medium">{Math.round(achievement.progress_percentage)}%</span>
                      </div>
                      <Progress value={achievement.progress_percentage} className="h-2" />
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          {achievement.criteria.target - (achievement.criteria.current || 0)} more to go
                        </span>
                        <div className="flex items-center text-xs text-gray-500">
                          <Gift className="w-3 h-3 mr-1" />+{achievement.points_reward} points
                        </div>
                      </div>
                    </div>
                  )}

                  {achievement.is_earned && (
                    <div className="absolute top-2 right-2">
                      <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
                        <Crown className="w-4 h-4 text-yellow-800" />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {achievements.length === 0 && (
        <div className="text-center py-12">
          <Trophy className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No achievements found</h3>
          <p className="text-gray-500">Start using the platform to unlock achievements!</p>
        </div>
      )}

      {/* Achievement Notification */}
      <AnimatePresence>
        {newAchievement && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-4 right-4 z-50"
          >
            <Card className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-2xl">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-white/20 rounded-full">
                    <Trophy className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold">Achievement Unlocked!</h4>
                    <p className="text-sm">{newAchievement.name}</p>
                    <p className="text-xs text-yellow-100">+{newAchievement.points_reward} points</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setNewAchievement(null)}
                    className="text-white hover:bg-white/20"
                  >
                    ×
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
