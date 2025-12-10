import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Heart, Star, ShoppingCart, X } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export default function WatchlistPage() {
  const watchlistItems = [
    {
      id: 1,
      title: "iPhone 15 Pro Max 256GB",
      price: "K16,999",
      originalPrice: "K18,999",
      image: "https://images.unsplash.com/photo-1697852179680-60e4f9b2b5cf?q=80&w=500&auto=format&fit=crop",
      rating: 4.8,
      inStock: true,
      priceDropped: true,
    },
    {
      id: 2,
      title: "Nike Air Jordan 1 Retro High",
      price: "K2,499",
      image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=500&auto=format&fit=crop",
      rating: 4.6,
      inStock: false,
      priceDropped: false,
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Watchlist</h1>
          <p className="text-gray-600">Keep track of items you're interested in</p>
        </div>

        {watchlistItems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {watchlistItems.map((item) => (
              <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative">
                  <Image
                    src={item.image || "/placeholder.svg"}
                    alt={item.title}
                    width={300}
                    height={200}
                    className="w-full h-48 object-cover"
                  />
                  <Button variant="ghost" size="sm" className="absolute top-2 right-2 bg-white/80 hover:bg-white">
                    <X className="h-4 w-4" />
                  </Button>
                  {item.priceDropped && (
                    <Badge className="absolute top-2 left-2 bg-green-500 hover:bg-green-600">Price Drop!</Badge>
                  )}
                  {!item.inStock && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <Badge variant="secondary">Out of Stock</Badge>
                    </div>
                  )}
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-lg mb-2 line-clamp-2">{item.title}</h3>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex items-center">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm text-gray-600 ml-1">{item.rating}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-2xl font-bold text-blue-600">{item.price}</span>
                    {item.originalPrice && (
                      <span className="text-lg text-gray-500 line-through">{item.originalPrice}</span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button className="flex-1 bg-orange-500 hover:bg-orange-600" disabled={!item.inStock} asChild>
                      <Link href={`/products/${item.id}`}>
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        {item.inStock ? "Add to Cart" : "Notify Me"}
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="text-center py-12">
            <CardContent>
              <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Your watchlist is empty</h3>
              <p className="text-gray-600 mb-6">Start adding items you're interested in to keep track of them</p>
              <Button asChild>
                <Link href="/">Browse Products</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
