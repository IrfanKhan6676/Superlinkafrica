import { Search, Grid, List } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/Input"

export default function ElectronicsPage() {
  const products = [
    {
      id: 1,
      name: "iPhone 15 Pro",
      price: "ZMW 18,500",
      image: "/placeholder.svg?height=200&width=200",
      rating: 4.8,
      reviews: 124,
    },
    {
      id: 2,
      name: "Samsung Galaxy S24",
      price: "ZMW 15,200",
      image: "/placeholder.svg?height=200&width=200",
      rating: 4.7,
      reviews: 89,
    },
    {
      id: 3,
      name: "MacBook Air M3",
      price: "ZMW 25,800",
      image: "/placeholder.svg?height=200&width=200",
      rating: 4.9,
      reviews: 156,
    },
    {
      id: 4,
      name: "Sony WH-1000XM5",
      price: "ZMW 2,450",
      image: "/placeholder.svg?height=200&width=200",
      rating: 4.6,
      reviews: 78,
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Electronics</h1>
          <p className="text-gray-600">2,450+ items available</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Filters Sidebar */}
          <div className="lg:w-64 space-y-6">
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h3 className="font-semibold mb-3">Price Range</h3>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  Under ZMW 1,000
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  ZMW 1,000 - 5,000
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  ZMW 5,000 - 15,000
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  Over ZMW 15,000
                </label>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h3 className="font-semibold mb-3">Brand</h3>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  Apple
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  Samsung
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  Sony
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  LG
                </label>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Search and Sort */}
            <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="flex-1 max-w-md">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input placeholder="Search electronics..." className="pl-10" />
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <select className="border rounded-md px-3 py-2">
                    <option>Sort by: Best Match</option>
                    <option>Price: Low to High</option>
                    <option>Price: High to Low</option>
                    <option>Newest First</option>
                  </select>
                  <div className="flex border rounded-md">
                    <Button variant="ghost" size="sm">
                      <Grid className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <List className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <div key={product.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                  <img
                    src={product.image || "/placeholder.svg"}
                    alt={product.name}
                    className="w-full h-48 object-cover rounded-t-lg"
                  />
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">{product.name}</h3>
                    <p className="text-xl font-bold text-blue-600 mb-2">{product.price}</p>
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <span className="text-yellow-500">★</span>
                      <span>{product.rating}</span>
                      <span>({product.reviews})</span>
                    </div>
                    <Button className="w-full mt-3">Add to Cart</Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
