import { ChevronDown } from "lucide-react"
import Link from "next/link"

const categories = [
  { name: "Electronics", href: "/category/electronics", featured: true },
  { name: "Fashion", href: "/category/fashion" },
  { name: "Home & Garden", href: "/category/home-garden" },
  { name: "Sports & Outdoors", href: "/category/sports" },
  { name: "Motors", href: "/category/motors" },
  { name: "Collectibles", href: "/category/collectibles" },
  { name: "Books & Media", href: "/category/books" },
  { name: "Health & Beauty", href: "/category/health" },
]

export default function CategoryNav() {
  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center gap-8 py-3 overflow-x-auto">
          <div className="flex items-center gap-2 text-gray-700 hover:text-blue-600 cursor-pointer whitespace-nowrap">
            <span className="font-medium">Shop by Category</span>
            <ChevronDown className="h-4 w-4" />
          </div>

          {categories.map((category) => (
            <Link
              key={category.name}
              href={category.href}
              className={`whitespace-nowrap hover:text-blue-600 transition-colors ${
                category.featured ? "text-blue-600 font-medium" : "text-gray-700"
              }`}
            >
              {category.name}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  )
}
