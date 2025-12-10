import { Users, Award, Globe, Shield } from "lucide-react"

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-16">
          <h1 className="text-4xl font-bold mb-4">About Superlink</h1>
          <p className="text-xl text-blue-100">
            Zambia's most trusted marketplace connecting buyers and sellers nationwide
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <div className="text-center">
            <Users className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">50,000+</h3>
            <p className="text-gray-600">Active Users</p>
          </div>
          <div className="text-center">
            <Award className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">99.5%</h3>
            <p className="text-gray-600">Customer Satisfaction</p>
          </div>
          <div className="text-center">
            <Globe className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">10</h3>
            <p className="text-gray-600">Provinces Covered</p>
          </div>
          <div className="text-center">
            <Shield className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">100%</h3>
            <p className="text-gray-600">Secure Transactions</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Story</h2>
          <div className="prose max-w-none">
            <p className="text-gray-600 mb-4">
              Founded in 2024, Superlink was born from a simple vision: to create a trusted marketplace where Zambians
              can buy and sell genuine goods at affordable prices. We recognized the need for a platform that
              prioritizes authenticity, security, and user experience.
            </p>
            <p className="text-gray-600 mb-4">
              Today, Superlink serves thousands of users across all 10 provinces of Zambia, facilitating safe and secure
              transactions while building a community of trusted buyers and sellers.
            </p>
            <p className="text-gray-600">
              Our commitment to excellence, combined with cutting-edge technology and local expertise, makes us Zambia's
              premier online marketplace.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
