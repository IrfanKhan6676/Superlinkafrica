import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Clock, Star, Zap } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export default function DealsPage() {
  const deals = [
    {
      id: 1,
      title: "Samsung Galaxy S24 Ultra",
      originalPrice: "K15,999",
      dealPrice: "K11,999",
      discount: "25%",
      timeLeft: "2h 45m",
      image: "/placeholder.svg?height=200&width=200",
      rating: 4.8,
      sold: 156,
    },
    {
      id: 2,
      title: "Apple MacBook Air M2",
      originalPrice: "K18,500",
      dealPrice: "K14,999",
      discount: "19%",
      timeLeft: "5h 12m",
      image: "/placeholder.svg?height=200&width=200",
      rating: 4.9,
      sold: 89,
    },
    {
      id: 3,
      title: "Sony WH-1000XM5 Headphones",
      originalPrice: "K4,299",
      dealPrice: "K2,999",
      discount: "30%",
      timeLeft: "1h 23m",
      image: "/placeholder.svg?height=200&width=200",
      rating: 4.7,
      sold: 234,
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Daily Deals</h1>
          <p className="text-gray-600">Limited time offers - grab them before they're gone!</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {deals.map((deal) => (
            <Card key={deal.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative">
                <Image
                  src={deal.image || "/placeholder.svg"}
                  alt={deal.title}
                  width={300}
                  height={200}
                  className="w-full h-48 object-cover"
                />
                <Badge className="absolute top-2 left-2 bg-red-500 hover:bg-red-600">-{deal.discount}</Badge>
                <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-sm flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {deal.timeLeft}
                </div>
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold text-lg mb-2 line-clamp-2">{deal.title}</h3>
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex items-center">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm text-gray-600 ml-1">{deal.rating}</span>
                  </div>
                  <span className="text-sm text-gray-500">({deal.sold} sold)</span>
                </div>
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-2xl font-bold text-blue-600">{deal.dealPrice}</span>
                  <span className="text-lg text-gray-500 line-through">{deal.originalPrice}</span>
                </div>
                <Button className="w-full bg-orange-500 hover:bg-orange-600" asChild>
                  <Link href={`/products/${deal.id}`}>
                    <Zap className="h-4 w-4 mr-2" />
                    Buy Now
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
