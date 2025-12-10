import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/Input"
import { createClient } from "@/lib/supabase/server"
import { MoreHorizontal, Search, UserCheck, UserX, Shield } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export default async function AdminUsers() {
  const supabase = createClient()

  const { data: users } = await supabase
    .from("users")
    .select(`
      *,
      _products:products(count),
      _orders_as_buyer:orders!orders_buyer_id_fkey(count),
      _orders_as_seller:orders!orders_seller_id_fkey(count)
    `)
    .order("created_at", { ascending: false })

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800"
      case "seller":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600">Manage platform users and sellers</p>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input placeholder="Search users..." className="pl-10" />
            </div>
            <select className="px-3 py-2 border border-gray-300 rounded-md">
              <option value="">All Roles</option>
              <option value="buyer">Buyers</option>
              <option value="seller">Sellers</option>
              <option value="admin">Admins</option>
            </select>
            <select className="px-3 py-2 border border-gray-300 rounded-md">
              <option value="">All Status</option>
              <option value="verified">Verified</option>
              <option value="unverified">Unverified</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Users List */}
      <div className="space-y-4">
        {users?.map((user) => (
          <Card key={user.id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                    <span className="text-lg font-medium text-gray-600">
                      {user.full_name?.charAt(0) || user.email?.charAt(0)}
                    </span>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-semibold text-gray-900">{user.full_name || "No name"}</h3>
                      <Badge className={getRoleBadgeColor(user.role)}>{user.role}</Badge>
                      {user.is_verified && (
                        <Badge className="bg-green-100 text-green-800">
                          <Shield className="h-3 w-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-1">{user.email}</p>
                    <p className="text-sm text-gray-500">
                      Joined {new Date(user.created_at).toLocaleDateString()}
                      {user.phone && ` • ${user.phone}`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right text-sm text-gray-600">
                    {user.role === "seller" && (
                      <>
                        <p>Products: {user._products?.[0]?.count || 0}</p>
                        <p>Sales: {user._orders_as_seller?.[0]?.count || 0}</p>
                      </>
                    )}
                    {user.role === "buyer" && <p>Orders: {user._orders_as_buyer?.[0]?.count || 0}</p>}
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <UserCheck className="h-4 w-4 mr-2" />
                        View Profile
                      </DropdownMenuItem>
                      {user.role === "seller" && (
                        <DropdownMenuItem>
                          <Shield className="h-4 w-4 mr-2" />
                          {user.is_verified ? "Remove Verification" : "Verify Seller"}
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem className="text-red-600">
                        <UserX className="h-4 w-4 mr-2" />
                        Suspend User
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
