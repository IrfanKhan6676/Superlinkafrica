"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Star, ThumbsUp, ThumbsDown } from "lucide-react"

interface Review {
  id: string
  user: {
    full_name: string
  }
  rating: number
  comment: string
  created_at: string
  helpful_count: number
}

interface ProductReviewsProps {
  productId: string
  reviews: Review[]
  averageRating: number
  totalReviews: number
  canReview?: boolean
}

export default function ProductReviews({
  productId,
  reviews,
  averageRating,
  totalReviews,
  canReview = false,
}: ProductReviewsProps) {
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [newRating, setNewRating] = useState(0)
  const [newComment, setNewComment] = useState("")

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-ZM", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const handleSubmitReview = () => {
    // Handle review submission
    console.log("Submitting review:", { rating: newRating, comment: newComment })
    setShowReviewForm(false)
    setNewRating(0)
    setNewComment("")
  }

  const getRatingDistribution = () => {
    const distribution = [0, 0, 0, 0, 0]
    reviews.forEach((review) => {
      distribution[review.rating - 1]++
    })
    return distribution.reverse()
  }

  const ratingDistribution = getRatingDistribution()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Customer Reviews</span>
          {canReview && (
            <Button onClick={() => setShowReviewForm(!showReviewForm)} variant="outline">
              Write Review
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Rating Summary */}
        <div className="flex items-center gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold">{averageRating.toFixed(1)}</div>
            <div className="flex items-center justify-center mb-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < Math.floor(averageRating) ? "text-yellow-400 fill-current" : "text-gray-300"
                  }`}
                />
              ))}
            </div>
            <div className="text-sm text-gray-600">{totalReviews} reviews</div>
          </div>

          <div className="flex-1 space-y-1">
            {ratingDistribution.map((count, index) => (
              <div key={index} className="flex items-center gap-2 text-sm">
                <span className="w-8">{5 - index}★</span>
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-yellow-400 h-2 rounded-full"
                    style={{ width: `${totalReviews > 0 ? (count / totalReviews) * 100 : 0}%` }}
                  />
                </div>
                <span className="w-8 text-gray-600">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Review Form */}
        {showReviewForm && (
          <div className="border rounded-lg p-4 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Rating</label>
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <button key={i} onClick={() => setNewRating(i + 1)} className="p-1">
                    <Star className={`w-6 h-6 ${i < newRating ? "text-yellow-400 fill-current" : "text-gray-300"}`} />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Review</label>
              <Textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Share your experience with this product..."
                rows={4}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSubmitReview} disabled={newRating === 0 || !newComment.trim()}>
                Submit Review
              </Button>
              <Button variant="outline" onClick={() => setShowReviewForm(false)}>
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Reviews List */}
        <div className="space-y-4">
          {reviews.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No reviews yet. Be the first to review this product!</div>
          ) : (
            reviews.map((review) => (
              <div key={review.id} className="border-b pb-4 last:border-b-0">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="font-medium">{review.user.full_name}</div>
                    <div className="flex items-center gap-2">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < review.rating ? "text-yellow-400 fill-current" : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      <Badge variant="outline">{review.rating}/5</Badge>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">{formatDate(review.created_at)}</div>
                </div>
                <p className="text-gray-700 mb-3">{review.comment}</p>
                <div className="flex items-center gap-4 text-sm">
                  <button className="flex items-center gap-1 text-gray-600 hover:text-gray-800">
                    <ThumbsUp className="w-4 h-4" />
                    Helpful ({review.helpful_count})
                  </button>
                  <button className="flex items-center gap-1 text-gray-600 hover:text-gray-800">
                    <ThumbsDown className="w-4 h-4" />
                    Not helpful
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
