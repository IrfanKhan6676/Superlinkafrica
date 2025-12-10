"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Heart, Share2, MessageCircle, Eye } from "lucide-react"
import { behaviorTracker } from "@/lib/ai/behavior-tracker"
import { useUser } from "@/hooks/use-user"
import Image from "next/image"

interface Recommendation {
  id: string
  type: "product" | "seller" | "category"
  score: number
  reason: string
  metadata?: any
}

interface SuggestedFeedProps {
  type?: "products" | "sellers" | "categories" | "bundles"
  limit?: number
  categoryId?: string
  className?: string
}

export function SuggestedFeed({ type = "products", limit = 20, categoryId, className = "" }: SuggestedFeedProps) {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useUser()

  useEffect(() => {
    if (user) {
      fetchRecommendations()
    }
  }, [user, type, categoryId])

  const fetchRecommendations = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        type,
        limit: limit.toString(),
      })

      if (categoryId) params.append("categoryId", categoryId)

      const response = await fetch(`/api/recommendations?${params}`)
      const data = await response.json()

      if (data.error) {
        setError(data.error)
      } else {
        setRecommendations(data.recommendations)
      }
    } catch (err) {
      setError("Failed to load recommendations")
    } finally {
      setLoading(false)
    }
  }

  const handleProductClick = async (productId: string) => {
    if (user) {
      await behaviorTracker.trackProductView(user.id, productId, {
        source: "suggested_feed",
        recommendation_type: type,
      })
    }
  }

  const handleLike = async (productId: string) => {
    if (user) {
      await behaviorTracker.trackLike(user.id, productId)
      // Update UI optimistically
      // You would also need to call your like API here
    }
  }

  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="flex space-x-4">
                <div className="w-20 h-20 bg-gray-200 rounded-lg"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={fetchRecommendations} variant="outline">
          Try Again
        </Button>
      </div>
    )
  }

  if (recommendations.length === 0) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <p className="text-gray-500 mb-4">No recommendations available</p>
        <Button onClick={fetchRecommendations} variant="outline">
          Refresh
        </Button>
      </div>
    )
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Suggested for You</h2>
        <Button onClick={fetchRecommendations} variant="ghost" size="sm">
          Refresh
        </Button>
      </div>

      {recommendations.map((rec) => (
        <Card key={rec.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex space-x-4">
              <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-gray-100">
                {rec.metadata?.image_url ? (
                  <Image
                    src={rec.metadata.image_url || "/placeholder.svg"}
                    alt={rec.metadata.title || "Product"}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                    <span className="text-blue-600 text-xs font-medium">{rec.metadata?.title?.charAt(0) || "?"}</span>
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3
                      className="font-medium text-gray-900 truncate cursor-pointer hover:text-blue-600"
                      onClick={() => handleProductClick(rec.id)}
                    >
                      {rec.metadata?.title || "Product"}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">{rec.reason}</p>
                    {rec.metadata?.price && (
                      <p className="text-lg font-semibold text-blue-600 mt-1">
                        ZMW {rec.metadata.price.toLocaleString()}
                      </p>
                    )}
                  </div>
                  <Badge variant="secondary" className="ml-2">
                    {Math.round(rec.score * 100)}% match
                  </Badge>
                </div>

                <div className="flex items-center space-x-4 mt-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleLike(rec.id)}
                    className="text-gray-500 hover:text-red-500"
                  >
                    <Heart className="w-4 h-4 mr-1" />
                    Like
                  </Button>
                  <Button variant="ghost" size="sm" className="text-gray-500">
                    <Share2 className="w-4 h-4 mr-1" />
                    Share
                  </Button>
                  <Button variant="ghost" size="sm" className="text-gray-500">
                    <MessageCircle className="w-4 h-4 mr-1" />
                    Ask
                  </Button>
                  {rec.metadata?.views_count && (
                    <span className="text-xs text-gray-400 flex items-center">
                      <Eye className="w-3 h-3 mr-1" />
                      {rec.metadata.views_count}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
