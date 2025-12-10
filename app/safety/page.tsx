import { Shield, Eye } from "lucide-react"

export default function SafetyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-green-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-16">
          <h1 className="text-4xl font-bold mb-4">Safety Tips</h1>
          <p className="text-xl text-green-100">
            Your security is our priority. Follow these guidelines for safe trading.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <Shield className="h-8 w-8 text-green-600 mb-4" />
            <h3 className="text-xl font-semibold mb-3">For Buyers</h3>
            <ul className="space-y-2 text-gray-600">
              <li>• Verify seller ratings and reviews</li>
              <li>• Use secure payment methods</li>
              <li>• Meet in public places for exchanges</li>
              <li>• Inspect items before payment</li>
              <li>• Report suspicious activities</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <Eye className="h-8 w-8 text-blue-600 mb-4" />
            <h3 className="text-xl font-semibold mb-3">For Sellers</h3>
            <ul className="space-y-2 text-gray-600">
              <li>• Provide accurate item descriptions</li>
              <li>• Use clear, authentic photos</li>
              <li>• Communicate promptly with buyers</li>
              <li>• Meet in safe, public locations</li>
              <li>• Keep transaction records</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
