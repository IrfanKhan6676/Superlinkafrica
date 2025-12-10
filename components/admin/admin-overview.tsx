import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/server"
import { Users, Package, ShoppingCart, DollarSign, AlertTriangle, Shield } from "lucide-react"

export default async function AdminOverview() {
  const supabase = createClient()

  // Get platform statistics
  const [
    { count: totalUsers },
    { count: totalSellers },
    { count: totalProducts },
    { count: activeProducts },
    { count: totalOrders },
    { count: pendingVerifications },
    { count: activeDisputes },
  ] = await Promise.all([
    supabase.from("users").select("*", { count: "exact", head: true }),
    supabase.from("users").select("*", { count: "exact", head: true }).eq("role", "seller"),
    supabase.from("products").select("*", { count: "exact", head: true }),
    supabase.from("products").select("*", { count: "exact", head: true }).eq("status", "active"),
    supabase.from("orders").select("*", { count: "exact", head: true }),
    supabase
      .from("seller_verifications")
      .select("*", { count: "exact", head: true })
      .eq("verification_status", "pending"),
    supabase.from("disputes").select("*", { count: "exact", head: true }).in("status", ["open", "in_progress"]),
  ])

  // Get recent activity
  const { data: recentUsers } = await supabase
    .from("users")
    .select("full_name, email, role, created_at")
    .order("created_at", { ascending: false })
    .limit(5)

  const { data: recentProducts } = await supabase
    .from("products")
    .select(`
      title, status, created_at,
      seller:users!products_seller_id_fkey(full_name)
    `)
    .order("created_at", { ascending: false })
    .limit(5)

  // Calculate total revenue (simplified)
  const { data: completedOrders } = await supabase.from("orders").select("total_amount").eq("order_status", "delivered")

  const totalRevenue = completedOrders?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0

  const stats = [
    {
      title: "Total Users",
      value: totalUsers || 0,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Active Products",
      value: activeProducts || 0,
      icon: Package,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Total Orders",
      value: totalOrders || 0,
      icon: ShoppingCart,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      title: "Platform Revenue",
      value: `K${totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
    {
      title: "Pending Verifications",
      value: pendingVerifications || 0,
      icon: Shield,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
    },
    {
      title: "Active Disputes",
      value: activeDisputes || 0,
      icon: AlertTriangle,
      color: "text-red-600",
      bgColor: "bg-red-100",
    },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
        <p className="text-gray-600">Monitor and manage the Superlink marketplace</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-full ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Recent Users</CardTitle>
          </CardHeader>
          <CardContent>
            {recentUsers && recentUsers.length > 0 ? (
              <div className="space-y-4">
                {recentUsers.map((user, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{user.full_name}</p>
                      <p className="text-sm text-gray-600">{user.email}</p>
                      <p className="text-sm text-gray-500">{new Date(user.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          user.role === "seller"
                            ? "bg-blue-100 text-blue-800"
                            : user.role === "admin"
                              ? "bg-red-100 text-red-800"
                              : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {user.role}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No recent users</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Products</CardTitle>
          </CardHeader>
          <CardContent>
            {recentProducts && recentProducts.length > 0 ? (
              <div className="space-y-4">
                {recentProducts.map((product, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{product.title}</p>
                      <p className="text-sm text-gray-600">by {product.seller?.full_name}</p>
                      <p className="text-sm text-gray-500">{new Date(product.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          product.status === "active"
                            ? "bg-green-100 text-green-800"
                            : product.status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {product.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No recent products</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-yellow-50 rounded-lg">
              <h3 className="font-medium text-yellow-900 mb-2">Pending Verifications</h3>
              <p className="text-sm text-yellow-700 mb-3">
                {pendingVerifications || 0} sellers waiting for verification
              </p>
              <a href="/admin/verifications" className="text-yellow-600 hover:text-yellow-800 text-sm font-medium">
                Review Verifications →
              </a>
            </div>

            <div className="p-4 bg-red-50 rounded-lg">
              <h3 className="font-medium text-red-900 mb-2">Active Disputes</h3>
              <p className="text-sm text-red-700 mb-3">{activeDisputes || 0} disputes need attention</p>
              <a href="/admin/disputes" className="text-red-600 hover:text-red-800 text-sm font-medium">
                Resolve Disputes →
              </a>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-medium text-blue-900 mb-2">Platform Health</h3>
              <p className="text-sm text-blue-700 mb-3">Monitor system performance and metrics</p>
              <a href="/admin/analytics" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                View Analytics →
              </a>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
