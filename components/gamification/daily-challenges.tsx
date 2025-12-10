"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Target, Gift, CheckCircle, Star, Zap, Calendar, Trophy } from "lucide-react"
import { useUser } from "@/hooks/use-user"
import { createClient } from "@/lib/supabase/client"
import { motion, AnimatePresence } from "framer-motion"

interface Challenge {
  id: string
  title: string
  description: string
  type: "daily" | "weekly" | "special"
  category: "selling" | "buying" | "social" | "discovery"
  target: number
  current_progress: number
  points_reward: number
  bonus_reward?: string
  expires_at: string
  is_completed: boolean
  difficulty: "easy" | "medium" | "hard"
}

interface DailyChallengesProps {
  compact?: boolean
}

export function DailyChallenges({ compact = false }: DailyChallengesProps) {
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [loading, setLoading] = useState(true)
  const [streak, setStreak] = useState(0)
  const [completedToday, setCompletedToday] = useState(0)
  const [totalPointsToday, setTotalPointsToday] = useState(0)
  const { user } = useUser()
  const supabase = createClient()

  useEffect(() => {
    if (user) {
      fetchChallenges()
      fetchUserStats()
    }
  }, [user])

  const fetchChallenges = async () => {
    try {
      setLoading(true)

      // Mock challenges data
      const mockChallenges: Challenge[] = [
        {
          id: "1",
          title: "List 3 Products",
          description: "Add 3 new products to your store today",
          type: "daily",
          category: "selling",
          target: 3,
          current_progress: 1,
          points_reward: 50,
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          is_completed: false,
          difficulty: "easy",
        },
        {
          id: "2",
          title: "Swipe Discovery",
          description: "Discover 20 products using swipe interface",
          type: "daily",
          category: "discovery",
          target: 20,
          current_progress: 15,
          points_reward: 30,
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          is_completed: false,
          difficulty: "easy",
        },
        {
          id: "3",
          title: "Social Butterfly",
          description: "Follow 5 new sellers and like 10 products",
          type: "daily",
          category: "social",
          target: 15,
          current_progress: 8,
          points_reward: 40,
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          is_completed: false,
          difficulty: "medium",
        },
        {
          id: "4",
          title: "First Purchase",
          description: "Make your first purchase this week",
          type: "weekly",
          category: "buying",
          target: 1,
          current_progress: 0,
          points_reward: 100,
          bonus_reward: "Free shipping coupon",
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          is_completed: false,
          difficulty: "medium",
        },
        {
          id: "5",
          title: "Review Master",
          description: "Leave 3 helpful reviews",
          type: "daily",
          category: "social",
          target: 3,
          current_progress: 3,
          points_reward: 60,
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          is_completed: true,
          difficulty: "medium",
        },
      ]

      setChallenges(mockChallenges)
    } catch (error) {
      console.error("Error fetching challenges:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchUserStats = async () => {
    // Mock user stats
    setStreak(7)
    setCompletedToday(2)
    setTotalPointsToday(110)
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-100 text-green-700"
      case "medium":
        return "bg-yellow-100 text-yellow-700"
      case "hard":
        return "bg-red-100 text-red-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "selling":
        return <Target className="w-4 h-4" />
      case "buying":
        return <Gift className="w-4 h-4" />
      case "social":
        return <Star className="w-4 h-4" />
      case "discovery":
        return <Zap className="w-4 h-4" />
      default:
        return <Target className="w-4 h-4" />
    }
  }

  const getTimeRemaining = (expiresAt: string) => {
    const now = new Date()
    const expires = new Date(expiresAt)
    const diffInHours = Math.floor((expires.getTime() - now.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((expires.getTime() - now.getTime()) / (1000 * 60))
      return `${diffInMinutes}m left`
    } else if (diffInHours < 24) {
      return `${diffInHours}h left`
    } else {
      const diffInDays = Math.floor(diffInHours / 24)
      return `${diffInDays}d left`
    }
  }

  if (loading) {
    return (
      <Card className={compact ? "w-full" : "w-full max-w-2xl"}>
        <CardHeader>
          <CardTitle>Daily Challenges</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (compact) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center">
            <Target className="w-5 h-5 mr-2 text-blue-600" />
            Today's Challenges
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {challenges.slice(0, 3).map((challenge) => (
            <div key={challenge.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50">
              <div className={`p-2 rounded-full ${challenge.is_completed ? "bg-green-500 text-white" : "bg-gray-100"}`}>
                {challenge.is_completed ? <CheckCircle className="w-4 h-4" /> : getCategoryIcon(challenge.category)}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm truncate">{challenge.title}</h4>
                <div className="flex items-center space-x-2 mt-1">
                  <Progress value={(challenge.current_progress / challenge.target) * 100} className="flex-1 h-1" />
                  <span className="text-xs text-gray-500">
                    {challenge.current_progress}/{challenge.target}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs font-medium text-blue-600">+{challenge.points_reward}</div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Zap className="w-6 h-6 text-orange-500" />
            </div>
            <div className="text-2xl font-bold text-orange-600">{streak}</div>
            <div className="text-sm text-gray-500">Day Streak</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <CheckCircle className="w-6 h-6 text-green-500" />
            </div>
            <div className="text-2xl font-bold text-green-600">{completedToday}</div>
            <div className="text-sm text-gray-500">Completed Today</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Trophy className="w-6 h-6 text-blue-500" />
            </div>
            <div className="text-2xl font-bold text-blue-600">{totalPointsToday}</div>
            <div className="text-sm text-gray-500">Points Today</div>
          </CardContent>
        </Card>
      </div>

      {/* Challenges List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
            Active Challenges
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <AnimatePresence>
            {challenges.map((challenge) => (
              <motion.div
                key={challenge.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`p-4 rounded-lg border transition-all ${
                  challenge.is_completed
                    ? "bg-green-50 border-green-200"
                    : "bg-white border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div
                      className={`p-2 rounded-full ${
                        challenge.is_completed ? "bg-green-500 text-white" : "bg-gray-100"
                      }`}
                    >
                      {challenge.is_completed ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : (
                        getCategoryIcon(challenge.category)
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold">{challenge.title}</h3>
                      <p className="text-sm text-gray-600">{challenge.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={getDifficultyColor(challenge.difficulty)} variant="secondary">
                      {challenge.difficulty}
                    </Badge>
                    <Badge variant={challenge.type === "daily" ? "default" : "secondary"}>{challenge.type}</Badge>
                  </div>
                </div>

                {!challenge.is_completed && (
                  <div className="mb-3">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-gray-600">
                        Progress: {challenge.current_progress} / {challenge.target}
                      </span>
                      <span className="font-medium">
                        {Math.round((challenge.current_progress / challenge.target) * 100)}%
                      </span>
                    </div>
                    <Progress value={(challenge.current_progress / challenge.target) * 100} className="h-2" />
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center text-sm text-blue-600">
                      <Gift className="w-4 h-4 mr-1" />+{challenge.points_reward} points
                    </div>
                    {challenge.bonus_reward && (
                      <div className="flex items-center text-sm text-purple-600">
                        <Star className="w-4 h-4 mr-1" />
                        {challenge.bonus_reward}
                      </div>
                    )}
                  </div>
                  <div className="text-sm text-gray-500">{getTimeRemaining(challenge.expires_at)}</div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  )
}
