import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, Heart } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

const featuredProducts = [
  {
    id: 1,
    title: "iPhone 15 Pro Max - 256GB",
    price: "K18,500",
    originalPrice: "K22,000",
    rating: 4.8,
    reviews: 124,
    image: "https://images.unsplash.com/photo-1697852179680-60e4f9b2b5cf?q=80&w=400&auto=format&fit=crop",
    badge: "Hot Deal",
    seller: "TechHub Zambia",
  },
  {
    id: 2,
    title: 'Samsung 55" 4K Smart TV',
    price: "K8,900",
    originalPrice: "K12,500",
    rating: 4.6,
    reviews: 89,
    image: "https://images.unsplash.com/photo-1593784991095-a205069470b6?q=80&w=400&auto=format&fit=crop",
    badge: "Featured",
    seller: "ElectroWorld",
  },
  {
    id: 3,
    title: "MacBook Air M2 - 13 inch",
    price: "K15,200",
    originalPrice: "K18,000",
    rating: 4.9,
    reviews: 67,
    image: "https://images.unsplash.com/photo-1611186871348-b1ce696e5c09?q=80&w=400&auto=format&fit=crop",
    badge: "Best Seller",
    seller: "Apple Store ZM",
  },
  {
    id: 4,
    title: "Sony WH-1000XM5 Headphones",
    price: "K2,800",
    originalPrice: "K3,500",
    rating: 4.7,
    reviews: 156,
    image: "https://images.unsplash.com/photo-1612444530582-fc66183b16f7?q=80&w=400&auto=format&fit=crop",
    badge: "New",
    seller: "AudioTech",
  },
]

export default function FeaturedProducts() {
  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Featured Products</h2>
        <Link href="/products" className="text-blue-600 hover:text-blue-800 font-medium">
          View All →
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {featuredProducts.map((product) => (
          <Card key={product.id} className="group hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-4">
              <div className="relative mb-4">
                <Image
                  src={product.image || "/placeholder.svg"}
                  alt={product.title}
                  width={200}
                  height={200}
                  className="w-full h-48 object-cover rounded-md"
                />
                <Badge className="absolute top-2 left-2 bg-orange-500">{product.badge}</Badge>
                <button className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity">
                  <Heart className="h-4 w-4 text-gray-600" />
                </button>
              </div>

              <div className="space-y-2">
                <h3 className="font-medium text-gray-900 line-clamp-2 group-hover:text-blue-600">{product.title}</h3>

                <div className="flex items-center gap-2">
                  <div className="flex items-center">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm text-gray-600 ml-1">
                      {product.rating} ({product.reviews})
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-gray-900">{product.price}</span>
                  <span className="text-sm text-gray-500 line-through">{product.originalPrice}</span>
                </div>

                <p className="text-sm text-gray-600">by {product.seller}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}
