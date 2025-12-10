"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Star, MapPin, Shield, MessageCircle, Share2, MoreHorizontal, Settings } from "lucide-react"
import { useUser } from "@/hooks/use-user"
import { createClient } from "@/lib/supabase/client"
import Image from "next/image"

interface UserProfileProps {
  userId: string
  isOwnProfile?: boolean
}

interface UserProfile {
  id: string
  full_name: string
  username: string
  bio: string
  profile_image_url: string
  cover_image_url: string
  location: string
  role: string
  is_verified: boolean
  created_at: string
  followers_count: number
  following_count: number
  products_count: number
  avg_rating: number
  total_sales: number
  is_following: boolean
  badges: Array<{
    id: string
    name: string
    icon_url: string
    description: string
  }>
  interests: Array<{
    id: string
    name: string
    interest_level: number
  }>
}

export function UserProfile({ userId, isOwnProfile = false }: UserProfileProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [following, setFollowing] = useState(false)
  const [activeTab, setActiveTab] = useState("products")
  const { user } = useUser()
  const supabase = createClient()

  useEffect(() => {
    fetchUserProfile()
  }, [userId])

  const fetchUserProfile = async () => {
    try {
      setLoading(true)

      // Fetch user profile with social stats
      const { data: profileData, error: profileError } = await supabase
        .from("users")
        .select(`
          *,
          user_badges!inner(
            badges(id, name, icon_url, description)
          ),
          user_interests!inner(
            interest_level,
            categories(id, name)
          )
        `)
        .eq("id", userId)
        .single()

      if (profileError) throw profileError

      // Get social stats
      const [followersResult, followingResult, productsResult, ratingsResult] = await Promise.all([
        supabase.from("user_connections").select("id").eq("following_id", userId).eq("connection_type", "follow"),
        supabase.from("user_connections").select("id").eq("follower_id", userId).eq("connection_type", "follow"),
        supabase.from("products").select("id").eq("seller_id", userId).eq("status", "active"),
        supabase.from("reviews").select("rating").eq("reviewed_user_id", userId).eq("review_type", "seller"),
      ])

      // Check if current user is following this profile
      let isFollowing = false
      if (user && user.id !== userId) {
        const { data: followData } = await supabase
          .from("user_connections")
          .select("id")
          .eq("follower_id", user.id)
          .eq("following_id", userId)
          .eq("connection_type", "follow")
          .single()

        isFollowing = !!followData
      }

      const avgRating = ratingsResult.data?.length
        ? ratingsResult.data.reduce((sum, r) => sum + r.rating, 0) / ratingsResult.data.length
        : 0

      setProfile({
        ...profileData,
        followers_count: followersResult.data?.length || 0,
        following_count: followingResult.data?.length || 0,
        products_count: productsResult.data?.length || 0,
        avg_rating: avgRating,
        total_sales: 0, // Would need to calculate from orders
        is_following: isFollowing,
        badges: profileData.user_badges?.map((ub: any) => ub.badges) || [],
        interests:
          profileData.user_interests?.map((ui: any) => ({
            id: ui.categories.id,
            name: ui.categories.name,
            interest_level: ui.interest_level,
          })) || [],
      })

      setFollowing(isFollowing)
    } catch (error) {
      console.error("Error fetching profile:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleFollow = async () => {
    if (!user || user.id === userId) return

    try {
      if (following) {
        // Unfollow
        await supabase
          .from("user_connections")
          .delete()
          .eq("follower_id", user.id)
          .eq("following_id", userId)
          .eq("connection_type", "follow")

        setFollowing(false)
        setProfile((prev) => (prev ? { ...prev, followers_count: prev.followers_count - 1 } : null))
      } else {
        // Follow
        await supabase.from("user_connections").insert({
          follower_id: user.id,
          following_id: userId,
          connection_type: "follow",
        })

        setFollowing(true)
        setProfile((prev) => (prev ? { ...prev, followers_count: prev.followers_count + 1 } : null))
      }
    } catch (error) {
      console.error("Error updating follow status:", error)
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-48 bg-gray-200 rounded-lg mb-6"></div>
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-24 h-24 bg-gray-200 rounded-full"></div>
            <div className="space-y-2">
              <div className="h-6 bg-gray-200 rounded w-48"></div>
              <div className="h-4 bg-gray-200 rounded w-32"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center">
        <p className="text-gray-500">Profile not found</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Cover Image */}
      <div className="relative h-48 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg mb-6 overflow-hidden">
        {profile.cover_image_url && (
          <Image src={profile.cover_image_url || "/placeholder.svg"} alt="Cover" fill className="object-cover" />
        )}
        {isOwnProfile && (
          <Button variant="secondary" size="sm" className="absolute top-4 right-4">
            <Settings className="w-4 h-4 mr-2" />
            Edit Cover
          </Button>
        )}
      </div>

      {/* Profile Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Avatar className="w-24 h-24 border-4 border-white shadow-lg">
            <AvatarImage src={profile.profile_image_url || "/placeholder.svg"} />
            <AvatarFallback className="text-2xl">
              {profile.full_name?.charAt(0) || profile.username?.charAt(0)}
            </AvatarFallback>
          </Avatar>

          <div>
            <div className="flex items-center space-x-2 mb-1">
              <h1 className="text-2xl font-bold text-gray-900">{profile.full_name}</h1>
              {profile.is_verified && <Shield className="w-5 h-5 text-blue-500" />}
            </div>
            <p className="text-gray-600">@{profile.username}</p>
            {profile.location && (
              <p className="text-sm text-gray-500 flex items-center mt-1">
                <MapPin className="w-4 h-4 mr-1" />
                {profile.location}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {!isOwnProfile && user && user.id !== userId && (
            <>
              <Button onClick={handleFollow} variant={following ? "outline" : "default"} className="min-w-[100px]">
                {following ? "Following" : "Follow"}
              </Button>
              <Button variant="outline" size="icon">
                <MessageCircle className="w-4 h-4" />
              </Button>
            </>
          )}
          <Button variant="outline" size="icon">
            <Share2 className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="icon">
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{profile.followers_count}</div>
            <div className="text-sm text-gray-500">Followers</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{profile.following_count}</div>
            <div className="text-sm text-gray-500">Following</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{profile.products_count}</div>
            <div className="text-sm text-gray-500">Products</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600 flex items-center justify-center">
              {profile.avg_rating.toFixed(1)}
              <Star className="w-4 h-4 ml-1 text-yellow-500" />
            </div>
            <div className="text-sm text-gray-500">Rating</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{profile.total_sales}</div>
            <div className="text-sm text-gray-500">Sales</div>
          </CardContent>
        </Card>
      </div>

      {/* Bio and Badges */}
      <Card className="mb-6">
        <CardContent className="p-6">
          {profile.bio && <p className="text-gray-700 mb-4">{profile.bio}</p>}

          {profile.badges.length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-900 mb-2">Badges</h3>
              <div className="flex flex-wrap gap-2">
                {profile.badges.map((badge) => (
                  <Badge key={badge.id} variant="secondary" className="flex items-center space-x-1">
                    {badge.icon_url && (
                      <Image src={badge.icon_url || "/placeholder.svg"} alt={badge.name} width={16} height={16} />
                    )}
                    <span>{badge.name}</span>
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {profile.interests.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-2">Interests</h3>
              <div className="flex flex-wrap gap-2">
                {profile.interests.map((interest) => (
                  <Badge key={interest.id} variant="outline">
                    {interest.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
          <TabsTrigger value="followers">Followers</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="mt-6">
          <div className="text-center py-8 text-gray-500">Products will be displayed here</div>
        </TabsContent>

        <TabsContent value="reviews" className="mt-6">
          <div className="text-center py-8 text-gray-500">Reviews will be displayed here</div>
        </TabsContent>

        <TabsContent value="followers" className="mt-6">
          <div className="text-center py-8 text-gray-500">Followers list will be displayed here</div>
        </TabsContent>

        <TabsContent value="activity" className="mt-6">
          <div className="text-center py-8 text-gray-500">Activity feed will be displayed here</div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
