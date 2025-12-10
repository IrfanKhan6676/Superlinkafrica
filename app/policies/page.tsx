export default function PoliciesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gray-800 text-white">
        <div className="max-w-7xl mx-auto px-4 py-16">
          <h1 className="text-4xl font-bold mb-4">Policies</h1>
          <p className="text-xl text-gray-300">Our terms and conditions for using Superlink</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="prose max-w-none">
            <h2 className="text-2xl font-bold mb-4">User Agreement</h2>
            <p className="text-gray-600 mb-6">
              By using Superlink, you agree to comply with our terms and conditions. This agreement governs your use of
              our platform and services.
            </p>

            <h3 className="text-xl font-semibold mb-3">Prohibited Items</h3>
            <ul className="list-disc pl-6 text-gray-600 mb-6">
              <li>Illegal or stolen goods</li>
              <li>Counterfeit products</li>
              <li>Weapons and dangerous items</li>
              <li>Adult content</li>
              <li>Prescription medications</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3">Account Responsibilities</h3>
            <p className="text-gray-600 mb-6">
              Users are responsible for maintaining account security, providing accurate information, and following
              community guidelines.
            </p>

            <h3 className="text-xl font-semibold mb-3">Dispute Resolution</h3>
            <p className="text-gray-600">
              We provide mediation services for transaction disputes. Our team works to ensure fair resolution for all
              parties involved.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
