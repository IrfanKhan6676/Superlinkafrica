import { Button } from "@/components/ui/button"

export default function FashionPage() {
  const products = [
    {
      id: 1,
      name: "Designer Dress",
      price: "ZMW 850",
      image: "/placeholder.svg?height=200&width=200",
      rating: 4.5,
      reviews: 67,
    },
    {
      id: 2,
      name: "Men's Suit",
      price: "ZMW 1,200",
      image: "/placeholder.svg?height=200&width=200",
      rating: 4.7,
      reviews: 43,
    },
    {
      id: 3,
      name: "Sneakers",
      price: "ZMW 650",
      image: "/placeholder.svg?height=200&width=200",
      rating: 4.6,
      reviews: 89,
    },
    {
      id: 4,
      name: "Handbag",
      price: "ZMW 450",
      image: "/placeholder.svg?height=200&width=200",
      rating: 4.4,
      reviews: 52,
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Fashion</h1>
          <p className="text-gray-600">1,890+ items available</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
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
  )
}
