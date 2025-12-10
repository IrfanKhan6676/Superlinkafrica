"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { LayoutDashboard, Package, ShoppingCart, BarChart3, Shield, Settings, Plus } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"

const navigation = [
  { name: "Dashboard", href: "/seller/dashboard", icon: LayoutDashboard },
  { name: "Products", href: "/seller/products", icon: Package },
  { name: "Orders", href: "/seller/orders", icon: ShoppingCart },
  { name: "Analytics", href: "/seller/analytics", icon: BarChart3 },
  { name: "Verification", href: "/seller/verification", icon: Shield },
  { name: "Settings", href: "/seller/settings", icon: Settings },
]

export default function SellerSidebar() {
  const pathname = usePathname()

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <div className="text-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Seller Dashboard</h2>
            <Badge variant="secondary" className="mt-2">
              Verified Seller
            </Badge>
          </div>

          <Button asChild className="w-full bg-blue-600 hover:bg-blue-700">
            <Link href="/sell">
              <Plus className="h-4 w-4 mr-2" />
              List New Product
            </Link>
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <nav className="space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-4 py-3 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700"
                      : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <item.icon className="h-5 w-5 mr-3" />
                  {item.name}
                </Link>
              )
            })}
          </nav>
        </CardContent>
      </Card>
    </div>
  )
}
