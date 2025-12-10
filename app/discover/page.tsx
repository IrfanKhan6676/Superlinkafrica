import { SwipeDiscovery } from "@/components/discovery/swipe-discovery"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Zap, Filter, TrendingUp, Heart } from "lucide-react"

export default function DiscoverPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                <Zap className="w-6 h-6 mr-2 text-blue-600" />
                Discover
              </h1>
              <p className="text-gray-600 mt-1">Swipe through personalized product recommendations</p>
            </div>
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Swipe Interface */}
          <div className="lg:col-span-2">
            <SwipeDiscovery
              onProductLike={(productId) => {
                console.log("Liked product:", productId)
                // Handle like action (add to wishlist, etc.)
              }}
              onProductPass={(productId) => {
                console.log("Passed on product:", productId)
                // Handle pass action (improve recommendations)
              }}
            />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Your Discovery Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Products viewed today</span>
                  <Badge variant="secondary">23</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Items liked</span>
                  <Badge variant="secondary" className="bg-green-100 text-green-700">
                    <Heart className="w-3 h-3 mr-1" />8
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Match accuracy</span>
                  <Badge variant="default">87%</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Trending Categories */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2" />
                  Trending Now
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Electronics</span>
                    <Badge variant="outline">+15%</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Fashion</span>
                    <Badge variant="outline">+12%</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Home & Garden</span>
                    <Badge variant="outline">+8%</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Sports</span>
                    <Badge variant="outline">+5%</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tips */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Discovery Tips</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-gray-600 space-y-2">
                <p>• Swipe right on items you like to improve recommendations</p>
                <p>• Use the undo button if you accidentally swipe</p>
                <p>• Tap the filter button to narrow down results</p>
                <p>• Your swipe patterns help us learn your preferences</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
