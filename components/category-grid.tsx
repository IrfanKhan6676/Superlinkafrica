import { Card, CardContent } from "@/components/ui/card"
import Image from "next/image"
import Link from "next/link"

const categories = [
  {
    name: "Electronics",
    href: "/category/electronics",
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=400&auto=format&fit=crop",
    itemCount: "2,450+ items",
  },
  {
    name: "Fashion",
    href: "/category/fashion",
    image: "https://images.unsplash.com/photo-1445205170230-053b83016042?q=80&w=400&auto=format&fit=crop",
    itemCount: "1,890+ items",
  },
  {
    name: "Home & Garden",
    href: "/category/home-garden",
    image: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=400&auto=format&fit=crop",
    itemCount: "3,200+ items",
  },
  {
    name: "Sports & Outdoors",
    href: "/category/sports",
    image: "https://images.unsplash.com/photo-1530137073521-3e5085696f88?q=80&w=400&auto=format&fit=crop",
    itemCount: "980+ items",
  },
  {
    name: "Health & Beauty",
    href: "/category/health",
    image: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=400&auto=format&fit=crop",
    itemCount: "1,560+ items",
  },
  {
    name: "Motors",
    href: "/category/motors",
    image: "https://images.unsplash.com/photo-1609525312921-a5d33a5ea536?q=80&w=400&auto=format&fit=crop",
    itemCount: "450+ items",
  },
]

export default function CategoryGrid() {
  return (
    <section>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Shop by Category</h2>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {categories.map((category) => (
          <Link key={category.name} href={category.href}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-4 text-center">
                <Image
                  src={category.image || "/placeholder.svg"}
                  alt={category.name}
                  width={200}
                  height={150}
                  className="w-full h-24 object-cover rounded-md mb-3"
                />
                <h3 className="font-medium text-gray-900 mb-1">{category.name}</h3>
                <p className="text-sm text-gray-600">{category.itemCount}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  )
}
