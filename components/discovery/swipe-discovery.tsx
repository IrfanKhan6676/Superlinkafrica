"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Heart, X, Star, MapPin, MessageCircle, Share2, RotateCcw, Zap, ShoppingBag, Eye, Clock } from "lucide-react"
import { useUser } from "@/hooks/use-user"
import { behaviorTracker } from "@/lib/ai/behavior-tracker"
import { motion, useMotionValue, useTransform, type PanInfo } from "framer-motion"
import Image from "next/image"

interface Product {
  id: string
  title: string
  price: number
  condition: string
  location: string
  images: string[]
  seller: {
    id: string
    name: string
    avatar: string
    rating: number
    verified: boolean
  }
  views_count: number
  likes_count: number
  created_at: string
  tags: string[]
  match_score: number
  match_reason: string
}

interface SwipeDiscoveryProps {
  categoryId?: string
  priceRange?: { min: number; max: number }
  onProductLike?: (productId: string) => void
  onProductPass?: (productId: string) => void
}

export function SwipeDiscovery({ categoryId, priceRange, onProductLike, onProductPass }: SwipeDiscoveryProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [swipeHistory, setSwipeHistory] = useState<Array<{ productId: string; action: "like" | "pass" }>>([])
  const { user } = useUser()

  // Motion values for swipe animation
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const rotate = useTransform(x, [-200, 200], [-25, 25])
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0])

  // Color transforms for swipe feedback
  const likeOpacity = useTransform(x, [0, 100], [0, 1])
  const passOpacity = useTransform(x, [-100, 0], [1, 0])

  useEffect(() => {
    fetchProducts()
  }, [categoryId, priceRange])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      // Mock data for demonstration
      const mockProducts: Product[] = [
        {
          id: "1",
          title: "iPhone 14 Pro Max - 256GB",
          price: 8500,
          condition: "new",
          location: "Lusaka, Zambia",
          images: ["/placeholder.svg?height=400&width=300"],
          seller: {
            id: "seller1",
            name: "TechStore Zambia",
            avatar: "/placeholder.svg?height=40&width=40",
            rating: 4.8,
            verified: true,
          },
          views_count: 234,
          likes_count: 45,
          created_at: "2024-01-15T10:00:00Z",
          tags: ["smartphone", "apple", "premium"],
          match_score: 0.92,
          match_reason: "Perfect match for your tech interests",
        },
        {
          id: "2",
          title: "MacBook Air M2 - 13 inch",
          price: 12000,
          condition: "new",
          location: "Ndola, Zambia",
          images: ["/placeholder.svg?height=400&width=300"],
          seller: {
            id: "seller2",
            name: "Apple Store ZM",
            avatar: "/placeholder.svg?height=40&width=40",
            rating: 4.9,
            verified: true,
          },
          views_count: 189,
          likes_count: 67,
          created_at: "2024-01-14T15:30:00Z",
          tags: ["laptop", "apple", "productivity"],
          match_score: 0.88,
          match_reason: "Popular in your category",
        },
        {
          id: "3",
          title: "Samsung Galaxy S23 Ultra",
          price: 7200,
          condition: "used",
          location: "Kitwe, Zambia",
          images: ["/placeholder.svg?height=400&width=300"],
          seller: {
            id: "seller3",
            name: "Mobile Hub",
            avatar: "/placeholder.svg?height=40&width=40",
            rating: 4.6,
            verified: false,
          },
          views_count: 156,
          likes_count: 23,
          created_at: "2024-01-13T09:15:00Z",
          tags: ["smartphone", "samsung", "camera"],
          match_score: 0.75,
          match_reason: "Similar to items you viewed",
        },
      ]

      setProducts(mockProducts)
      setCurrentIndex(0)
    } catch (error) {
      console.error("Error fetching products:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSwipe = async (direction: "left" | "right", productId: string) => {
    const action = direction === "right" ? "like" : "pass"

    // Track behavior
    if (user) {
      await behaviorTracker.trackSwipe(user.id, productId, direction)
    }

    // Add to history
    setSwipeHistory((prev) => [...prev, { productId, action }])

    // Call callbacks
    if (action === "like" && onProductLike) {
      onProductLike(productId)
    } else if (action === "pass" && onProductPass) {
      onProductPass(productId)
    }

    // Move to next card
    setCurrentIndex((prev) => prev + 1)

    // Reset motion values
    x.set(0)
    y.set(0)
  }

  const handleDragEnd = (event: any, info: PanInfo) => {
    const threshold = 100
    const currentProduct = products[currentIndex]

    if (!currentProduct) return

    if (info.offset.x > threshold) {
      // Swipe right (like)
      x.set(200)
      setTimeout(() => handleSwipe("right", currentProduct.id), 200)
    } else if (info.offset.x < -threshold) {
      // Swipe left (pass)
      x.set(-200)
      setTimeout(() => handleSwipe("left", currentProduct.id), 200)
    } else {
      // Snap back
      x.set(0)
      y.set(0)
    }
  }

  const handleButtonAction = (action: "like" | "pass") => {
    const currentProduct = products[currentIndex]
    if (!currentProduct) return

    const direction = action === "like" ? "right" : "left"
    x.set(direction === "right" ? 200 : -200)
    setTimeout(() => handleSwipe(direction, currentProduct.id), 200)
  }

  const handleUndo = () => {
    if (swipeHistory.length === 0 || currentIndex === 0) return

    setCurrentIndex((prev) => prev - 1)
    setSwipeHistory((prev) => prev.slice(0, -1))
    x.set(0)
    y.set(0)
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) return "Just now"
    if (diffInHours < 24) return `${diffInHours}h ago`
    return `${Math.floor(diffInHours / 24)}d ago`
  }

  if (loading) {
    return (
      <div className="max-w-sm mx-auto p-4">
        <div className="animate-pulse">
          <div className="h-96 bg-gray-200 rounded-2xl mb-4"></div>
          <div className="flex justify-center space-x-4">
            <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
            <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
            <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
          </div>
        </div>
      </div>
    )
  }

  const currentProduct = products[currentIndex]
  const nextProduct = products[currentIndex + 1]

  if (!currentProduct) {
    return (
      <div className="max-w-sm mx-auto p-4 text-center">
        <div className="py-12">
          <Zap className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No more products!</h3>
          <p className="text-gray-500 mb-6">You've seen all available products. Check back later for new items.</p>
          <Button onClick={fetchProducts} className="bg-blue-600 hover:bg-blue-700">
            <RotateCcw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-sm mx-auto p-4">
      {/* Card Stack */}
      <div className="relative h-96 mb-6">
        {/* Next card (background) */}
        {nextProduct && (
          <Card className="absolute inset-0 bg-white shadow-lg rounded-2xl transform scale-95 opacity-50">
            <div className="relative h-full rounded-2xl overflow-hidden">
              <Image
                src={nextProduct.images[0] || "/placeholder.svg"}
                alt={nextProduct.title}
                fill
                className="object-cover"
              />
            </div>
          </Card>
        )}

        {/* Current card */}
        <motion.div
          className="absolute inset-0 cursor-grab active:cursor-grabbing"
          style={{ x, y, rotate, opacity }}
          drag
          dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
          onDragEnd={handleDragEnd}
          whileDrag={{ scale: 1.05 }}
        >
          <Card className="h-full bg-white shadow-xl rounded-2xl overflow-hidden">
            <div className="relative h-full">
              {/* Product Image */}
              <div className="relative h-2/3">
                <Image
                  src={currentProduct.images[0] || "/placeholder.svg"}
                  alt={currentProduct.title}
                  fill
                  className="object-cover"
                />

                {/* Match Score Badge */}
                <Badge className="absolute top-4 left-4 bg-green-500 text-white">
                  <Zap className="w-3 h-3 mr-1" />
                  {Math.round(currentProduct.match_score * 100)}% match
                </Badge>

                {/* Condition Badge */}
                <Badge
                  variant={currentProduct.condition === "new" ? "default" : "secondary"}
                  className="absolute top-4 right-4"
                >
                  {currentProduct.condition}
                </Badge>

                {/* Swipe Feedback Overlays */}
                <motion.div
                  className="absolute inset-0 bg-green-500/20 flex items-center justify-center"
                  style={{ opacity: likeOpacity }}
                >
                  <div className="bg-green-500 text-white p-4 rounded-full">
                    <Heart className="w-8 h-8" />
                  </div>
                </motion.div>

                <motion.div
                  className="absolute inset-0 bg-red-500/20 flex items-center justify-center"
                  style={{ opacity: passOpacity }}
                >
                  <div className="bg-red-500 text-white p-4 rounded-full">
                    <X className="w-8 h-8" />
                  </div>
                </motion.div>
              </div>

              {/* Product Info */}
              <CardContent className="p-4 h-1/3 flex flex-col justify-between">
                <div>
                  <h3 className="font-semibold text-lg text-gray-900 mb-1 line-clamp-2">{currentProduct.title}</h3>
                  <p className="text-2xl font-bold text-blue-600 mb-2">ZMW {currentProduct.price.toLocaleString()}</p>

                  <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
                    <span className="flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      {currentProduct.location}
                    </span>
                    <span className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {formatTimeAgo(currentProduct.created_at)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Avatar className="w-6 h-6">
                        <AvatarImage src={currentProduct.seller.avatar || "/placeholder.svg"} />
                        <AvatarFallback>{currentProduct.seller.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium">{currentProduct.seller.name}</span>
                      <div className="flex items-center">
                        <Star className="w-3 h-3 text-yellow-500 mr-1" />
                        <span className="text-xs">{currentProduct.seller.rating}</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 text-xs text-gray-500">
                      <span className="flex items-center">
                        <Eye className="w-3 h-3 mr-1" />
                        {currentProduct.views_count}
                      </span>
                      <span className="flex items-center">
                        <Heart className="w-3 h-3 mr-1" />
                        {currentProduct.likes_count}
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-gray-600 italic mt-2">{currentProduct.match_reason}</p>
              </CardContent>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-center space-x-4">
        <Button
          variant="outline"
          size="lg"
          className="w-16 h-16 rounded-full border-red-200 hover:bg-red-50 hover:border-red-300 bg-transparent"
          onClick={() => handleButtonAction("pass")}
        >
          <X className="w-6 h-6 text-red-500" />
        </Button>

        <Button
          variant="outline"
          size="lg"
          className="w-12 h-12 rounded-full bg-transparent"
          onClick={handleUndo}
          disabled={swipeHistory.length === 0}
        >
          <RotateCcw className="w-5 h-5 text-gray-500" />
        </Button>

        <Button
          variant="outline"
          size="lg"
          className="w-16 h-16 rounded-full border-green-200 hover:bg-green-50 hover:border-green-300 bg-transparent"
          onClick={() => handleButtonAction("like")}
        >
          <Heart className="w-6 h-6 text-green-500" />
        </Button>
      </div>

      {/* Additional Actions */}
      <div className="flex items-center justify-center space-x-6 mt-4">
        <Button variant="ghost" size="sm" className="text-gray-500">
          <MessageCircle className="w-4 h-4 mr-2" />
          Ask Question
        </Button>
        <Button variant="ghost" size="sm" className="text-gray-500">
          <Share2 className="w-4 h-4 mr-2" />
          Share
        </Button>
        <Button variant="ghost" size="sm" className="text-gray-500">
          <ShoppingBag className="w-4 h-4 mr-2" />
          Buy Now
        </Button>
      </div>

      {/* Progress Indicator */}
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-500">
          {currentIndex + 1} of {products.length} products
        </p>
        <div className="w-full bg-gray-200 rounded-full h-1 mt-2">
          <div
            className="bg-blue-600 h-1 rounded-full transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / products.length) * 100}%` }}
          ></div>
        </div>
      </div>
    </div>
  )
}
