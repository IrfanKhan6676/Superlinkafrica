"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Heart, MessageCircle, Share2, ShoppingBag, Star, UserPlus, TrendingUp } from "lucide-react"
import { useUser } from "@/hooks/use-user"
import { createClient } from "@/lib/supabase/client"
import { formatDistanceToNow } from "date-fns"
import Image from "next/image"

interface ActivityItem {
  id: string
  type: "like" | "follow" | "purchase" | "review" | "new_product" | "achievement"
  created_at: string
  user: {
    id: string
    full_name: string
    username: string
    profile_image_url: string
    is_verified: boolean
  }
  target?: {
    id: string
    title?: string
    image_url?: string
    price?: number
  }
  metadata?: Record<string, any>
}

interface SocialActivityFeedProps {
  userId?: string // If provided, shows activity for specific user
  followingOnly?: boolean // If true, shows only activity from followed users
  limit?: number
}

export function SocialActivityFeed({ userId, followingOnly = false, limit = 20 }: SocialActivityFeedProps) {
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [loading, setLoading] = useState(true)
  const [hasMore, setHasMore] = useState(true)
  const { user } = useUser()
  const supabase = createClient()

  useEffect(() => {
    fetchActivities()
  }, [userId, followingOnly])

  const fetchActivities = async (offset = 0) => {
    try {
      setLoading(offset === 0)

      // This would be a complex query combining multiple activity types
      // For now, let's simulate with some mock data
      const mockActivities: ActivityItem[] = [
        {
          id: "1",
          type: "like",
          created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
          user: {
            id: "user1",
            full_name: "Sarah Johnson",
            username: "sarah_j",
            profile_image_url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=100&auto=format&fit=crop&w=100&q=80",
            is_verified: true,
          },
          target: {
            id: "product1",
            title: "iPhone 14 Pro Max",
            image_url: "https://images.unsplash.com/photo-1697852179680-60e4f9b2b5cf?q=80&w=200&auto=format&fit=crop&w=200&q=80",
            price: 8500,
          },
        },
        {
          id: "2",
          type: "follow",
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
          user: {
            id: "user2",
            full_name: "Mike Chen",
            username: "mike_c",
            profile_image_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=100&auto=format&fit=crop&w=100&q=80",
            is_verified: false,
          },
          target: {
            id: "user3",
            title: "TechStore Zambia",
          },
        },
        {
          id: "3",
          type: "new_product",
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
          user: {
            id: "user3",
            full_name: "TechStore Zambia",
            username: "techstore_zm",
            profile_image_url: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=100&auto=format&fit=crop&w=100&q=80",
            is_verified: true,
          },
          target: {
            id: "product2",
            title: "MacBook Air M2",
            image_url: "https://images.unsplash.com/photo-1611186871348-b1ce696e5c09?q=80&w=200&auto=format&fit=crop&w=200&q=80",
            price: 12000,
          },
        },
        {
          id: "4",
          type: "review",
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
          user: {
            id: "user4",
            full_name: "David Mwanza",
            username: "david_m",
            profile_image_url: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=100&auto=format&fit=crop&w=100&q=80",
            is_verified: false,
          },
          target: {
            id: "product3",
            title: "Samsung Galaxy S23",
          },
          metadata: {
            rating: 5,
            comment: "Excellent phone, fast delivery!",
          },
        },
        {
          id: "5",
          type: "achievement",
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
          user: {
            id: "user5",
            full_name: "Electronics Hub",
            username: "electronics_hub",
            profile_image_url: "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=100&auto=format&fit=crop&w=100&q=80",
            is_verified: true,
          },
          metadata: {
            badge_name: "Top Seller",
            badge_description: "Achieved 100+ successful sales",
          },
        },
      ]

      if (offset === 0) {
        setActivities(mockActivities)
      } else {
        setActivities((prev) => [...prev, ...mockActivities])
      }

      setHasMore(mockActivities.length === limit)
    } catch (error) {
      console.error("Error fetching activities:", error)
    } finally {
      setLoading(false)
    }
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "like":
        return <Heart className="w-4 h-4 text-red-500" />
      case "follow":
        return <UserPlus className="w-4 h-4 text-blue-500" />
      case "purchase":
        return <ShoppingBag className="w-4 h-4 text-green-500" />
      case "review":
        return <Star className="w-4 h-4 text-yellow-500" />
      case "new_product":
        return <TrendingUp className="w-4 h-4 text-purple-500" />
      case "achievement":
        return <Badge className="w-4 h-4 text-orange-500" />
      default:
        return <MessageCircle className="w-4 h-4 text-gray-500" />
    }
  }

  const getActivityText = (activity: ActivityItem) => {
    switch (activity.type) {
      case "like":
        return (
          <span>
            <strong>{activity.user.full_name}</strong> liked <strong>{activity.target?.title}</strong>
          </span>
        )
      case "follow":
        return (
          <span>
            <strong>{activity.user.full_name}</strong> started following <strong>{activity.target?.title}</strong>
          </span>
        )
      case "purchase":
        return (
          <span>
            <strong>{activity.user.full_name}</strong> purchased <strong>{activity.target?.title}</strong>
          </span>
        )
      case "review":
        return (
          <span>
            <strong>{activity.user.full_name}</strong> reviewed <strong>{activity.target?.title}</strong>
            {activity.metadata?.rating && <span className="ml-2">{"★".repeat(activity.metadata.rating)}</span>}
          </span>
        )
      case "new_product":
        return (
          <span>
            <strong>{activity.user.full_name}</strong> listed a new product <strong>{activity.target?.title}</strong>
          </span>
        )
      case "achievement":
        return (
          <span>
            <strong>{activity.user.full_name}</strong> earned the <strong>{activity.metadata?.badge_name}</strong> badge
          </span>
        )
      default:
        return <span>Unknown activity</span>
    }
  }

  if (loading && activities.length === 0) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="flex space-x-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          {followingOnly ? "Following Activity" : "Recent Activity"}
        </h2>
      </div>

      {activities.map((activity) => (
        <Card key={activity.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex space-x-3">
              <div className="relative">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={activity.user.profile_image_url || "/placeholder.svg"} />
                  <AvatarFallback>
                    {activity.user.full_name?.charAt(0) || activity.user.username?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1">
                  {getActivityIcon(activity.type)}
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm text-gray-900 mb-1">{getActivityText(activity)}</p>
                    <p className="text-xs text-gray-500">
                      {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                    </p>

                    {activity.metadata?.comment && (
                      <p className="text-sm text-gray-600 mt-2 italic">"{activity.metadata.comment}"</p>
                    )}
                  </div>

                  {activity.target?.image_url && (
                    <div className="ml-3 flex-shrink-0">
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100">
                        <Image
                          src={activity.target.image_url || "/placeholder.svg"}
                          alt={activity.target.title || ""}
                          width={64}
                          height={64}
                          className="object-cover"
                        />
                      </div>
                      {activity.target.price && (
                        <p className="text-xs font-medium text-blue-600 mt-1 text-center">
                          ZMW {activity.target.price.toLocaleString()}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-4 mt-3">
                  <Button variant="ghost" size="sm" className="text-gray-500">
                    <Heart className="w-4 h-4 mr-1" />
                    Like
                  </Button>
                  <Button variant="ghost" size="sm" className="text-gray-500">
                    <MessageCircle className="w-4 h-4 mr-1" />
                    Comment
                  </Button>
                  <Button variant="ghost" size="sm" className="text-gray-500">
                    <Share2 className="w-4 h-4 mr-1" />
                    Share
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {hasMore && (
        <div className="text-center py-4">
          <Button variant="outline" onClick={() => fetchActivities(activities.length)} disabled={loading}>
            {loading ? "Loading..." : "Load More"}
          </Button>
        </div>
      )}

      {activities.length === 0 && !loading && (
        <div className="text-center py-8 text-gray-500">
          <MessageCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>No activity to show yet.</p>
          <p className="text-sm">Follow some users to see their activity here!</p>
        </div>
      )}
    </div>
  )
}
