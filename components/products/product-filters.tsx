import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/Input"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/server"
import Link from "next/link"

interface SearchParams {
  category?: string
  search?: string
  min_price?: string
  max_price?: string
  condition?: string
  sort?: string
  page?: string
}

export default async function ProductFilters({ searchParams }: { searchParams: SearchParams }) {
  const supabase = createClient()
  const { data: categories } = await supabase.from("categories").select("*").eq("is_active", true).order("name")

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Categories */}
          <div>
            <Label className="text-sm font-medium">Category</Label>
            <div className="mt-2 space-y-2">
              <Link
                href="/products"
                className={`block text-sm hover:text-blue-600 ${
                  !searchParams.category ? "text-blue-600 font-medium" : "text-gray-700"
                }`}
              >
                All Categories
              </Link>
              {categories?.map((category) => (
                <Link
                  key={category.id}
                  href={`/products?category=${category.slug}`}
                  className={`block text-sm hover:text-blue-600 ${
                    searchParams.category === category.slug ? "text-blue-600 font-medium" : "text-gray-700"
                  }`}
                >
                  {category.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div>
            <Label className="text-sm font-medium">Price Range (ZMW)</Label>
            <div className="mt-2 flex gap-2">
              <Input type="number" placeholder="Min" defaultValue={searchParams.min_price} className="text-sm" />
              <Input type="number" placeholder="Max" defaultValue={searchParams.max_price} className="text-sm" />
            </div>
          </div>

          {/* Condition */}
          <div>
            <Label className="text-sm font-medium">Condition</Label>
            <div className="mt-2 space-y-2">
              {["new", "used", "refurbished"].map((condition) => (
                <label key={condition} className="flex items-center">
                  <input type="checkbox" defaultChecked={searchParams.condition === condition} className="mr-2" />
                  <span className="text-sm capitalize">{condition}</span>
                </label>
              ))}
            </div>
          </div>

          <Button className="w-full bg-blue-600 hover:bg-blue-700">Apply Filters</Button>
        </CardContent>
      </Card>
    </div>
  )
}
