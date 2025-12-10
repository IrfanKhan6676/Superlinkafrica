import { Suspense } from "react"
import ProductGrid from "@/components/products/product-grid"
import ProductFilters from "@/components/products/product-filters"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Book, BookOpen, Headphones, Film } from "lucide-react"

export default function BooksPage({
  searchParams,
}: { searchParams: { [key: string]: string | string[] | undefined } }) {
  const subcategories = [
    { name: "Books", icon: Book, count: 567 },
    { name: "Textbooks", icon: BookOpen, count: 234 },
    { name: "Audiobooks", icon: Headphones, count: 89 },
    { name: "Movies & Music", icon: Film, count: 156 },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Category Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
            <span>Home</span>
            <span>/</span>
            <span className="text-blue-600">Books & Media</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Books & Media</h1>
          <p className="text-gray-600">Explore a vast collection of books, textbooks, and entertainment media</p>
        </div>
      </div>

      {/* Subcategories */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <h2 className="text-xl font-semibold mb-4">Shop by Category</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {subcategories.map((category) => (
            <Card key={category.name} className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-4 text-center">
                <category.icon className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                <h3 className="font-medium mb-1">{category.name}</h3>
                <Badge variant="secondary">{category.count} items</Badge>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content */}
        <div className="flex gap-6">
          {/* Filters Sidebar */}
          <div className="w-64 flex-shrink-0">
            <ProductFilters searchParams={{ ...searchParams, category: "books" }} />
          </div>

          {/* Products Grid */}
          <div className="flex-1">
            <div className="flex justify-between items-center mb-6">
              <p className="text-gray-600">Showing results for Books & Media</p>
              <Button variant="outline">Sort by: Best Match</Button>
            </div>

            <Suspense fallback={<div>Loading products...</div>}>
              <ProductGrid searchParams={{ ...searchParams, category: "books" }} />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  )
}
