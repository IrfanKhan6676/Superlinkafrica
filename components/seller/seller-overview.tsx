import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createServerClient } from "@/lib/supabase/server-utils"
import { create } from "domain"
import { Package, ShoppingCart, DollarSign, Eye } from "lucide-react"

export default async function SellerOverview({ sellerId }: { sellerId: string }) {
  const supabase = await createServerClient()

  // Get seller statistics
  const [{ count: totalProducts }, { count: activeProducts }, { count: totalOrders }, { count: pendingOrders }] =
    await Promise.all([
      supabase.from("products").select("*", { count: "exact", head: true }).eq("seller_id", sellerId),
      supabase
        .from("products")
        .select("*", { count: "exact", head: true })
        .eq("seller_id", sellerId)
        .eq("status", "active"),
      supabase.from("orders").select("*", { count: "exact", head: true }).eq("seller_id", sellerId),
      supabase
        .from("orders")
        .select("*", { count: "exact", head: true })
        .eq("seller_id", sellerId)
        .eq("order_status", "pending"),
    ])

  // Get recent orders
  const { data: recentOrders } = await supabase
    .from("orders")
    .select(`
      *,
      buyer:users!orders_buyer_id_fkey(full_name),
      product:products(title)
    `)
    .eq("seller_id", sellerId)
    .order("created_at", { ascending: false })
    .limit(5)

  // Get total revenue (simplified calculation)
  const { data: completedOrders } = await supabase
    .from("orders")
    .select("total_amount")
    .eq("seller_id", sellerId)
    .eq("order_status", "delivered")

  const totalRevenue = completedOrders?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0

  const stats = [
    {
      title: "Total Products",
      value: totalProducts || 0,
      icon: Package,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Active Listings",
      value: activeProducts || 0,
      icon: Eye,
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
      title: "Total Revenue",
      value: `K${totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard Overview</h1>
        <p className="text-gray-600">Welcome back! Here's what's happening with your store.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            {recentOrders && recentOrders.length > 0 ? (
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{order.product?.title}</p>
                      <p className="text-sm text-gray-600">by {order.buyer?.full_name}</p>
                      <p className="text-sm text-gray-500">{new Date(order.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">K{order.total_amount?.toLocaleString()}</p>
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          order.order_status === "delivered"
                            ? "bg-green-100 text-green-800"
                            : order.order_status === "shipped"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {order.order_status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No recent orders</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="font-medium text-blue-900 mb-2">Pending Orders</h3>
                <p className="text-sm text-blue-700 mb-3">
                  You have {pendingOrders || 0} orders waiting for your attention
                </p>
                <a href="/seller/orders" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                  View Orders →
                </a>
              </div>

              <div className="p-4 bg-green-50 rounded-lg">
                <h3 className="font-medium text-green-900 mb-2">Boost Your Sales</h3>
                <p className="text-sm text-green-700 mb-3">Add more products or promote existing ones</p>
                <a href="/sell" className="text-green-600 hover:text-green-800 text-sm font-medium">
                  List Product →
                </a>
              </div>

              <div className="p-4 bg-orange-50 rounded-lg">
                <h3 className="font-medium text-orange-900 mb-2">Get Verified</h3>
                <p className="text-sm text-orange-700 mb-3">Increase buyer trust with seller verification</p>
                <a href="/seller/verification" className="text-orange-600 hover:text-orange-800 text-sm font-medium">
                  Start Verification →
                </a>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
