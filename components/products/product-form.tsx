"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, X, Loader2 } from "lucide-react"
import { createProduct } from "@/lib/product-actions"
import MultipleImageUpload from "./MultipleImageUpload"

interface Category {
  id: string
  name: string
  slug: string
}

interface ProductFormProps {
  categories: Category[]
}

export default function ProductForm({ categories }: ProductFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [images, setImages] = useState<File[]>([])
  const [listingType, setListingType] = useState("fixed")

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setImages((prev) => [...prev, ...files].slice(0, 5)) // Max 5 images
  }

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (formData: FormData) => {
    setLoading(true)
    try {
      // Add images to form data
      images.forEach((image, index) => {
        formData.append(`image_${index}`, image)
      })

      const result = await createProduct(formData)
      if (result.success) {
        router.push(`/products/${result.productId}`)
      } else {
        alert(result.error || "Failed to create product")
      }
    } catch (error) {
      alert("An error occurred while creating the product")
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
    <form action={handleSubmit} className="space-y-8">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="title">Product Title *</Label>
            <Input
              id="title"
              name="title"
              required
              placeholder="Enter a descriptive title for your product"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              name="description"
              required
              rows={4}
              placeholder="Describe your product in detail..."
              className="mt-1"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category">Category *</Label>
              <select
                id="category"
                name="category_id"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="condition">Condition *</Label>
              <select
                id="condition"
                name="condition"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="new">New</option>
                <option value="used">Used</option>
                <option value="refurbished">Refurbished</option>
              </select>
            </div>
          </div>

          <div>
            <Label htmlFor="location">Location *</Label>
            <Input id="location" name="location" required placeholder="City, Province" className="mt-1" />
          </div>
        </CardContent>
      </Card>

      {/* Pricing & Listing Type */}
      <Card>
        <CardHeader>
          <CardTitle>Pricing & Listing Type</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Listing Type *</Label>
            <div className="mt-2 space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="listing_type"
                  value="fixed"
                  checked={listingType === "fixed"}
                  onChange={(e) => setListingType(e.target.value)}
                  className="mr-2"
                />
                Fixed Price - Sell at a set price
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="listing_type"
                  value="auction"
                  checked={listingType === "auction"}
                  onChange={(e) => setListingType(e.target.value)}
                  className="mr-2"
                />
                Auction - Let buyers bid on your item
              </label>
            </div>
          </div>

          {listingType === "fixed" ? (
            <div>
              <Label htmlFor="price">Price (ZMW) *</Label>
              <Input
                id="price"
                name="price"
                type="number"
                step="0.01"
                min="0"
                required
                placeholder="0.00"
                className="mt-1"
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="starting_bid">Starting Bid (ZMW) *</Label>
                <Input
                  id="starting_bid"
                  name="starting_bid"
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  placeholder="0.00"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="buy_now_price">Buy Now Price (ZMW)</Label>
                <Input
                  id="buy_now_price"
                  name="buy_now_price"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="Optional"
                  className="mt-1"
                />
              </div>
            </div>
          )}

          <div>
            <Label htmlFor="quantity">Quantity *</Label>
            <Input id="quantity" name="quantity" type="number" min="1" defaultValue="1" required className="mt-1" />
          </div>
        </CardContent>
      </Card>

      {/* Images */}
      <Card>
        <CardHeader>
          <CardTitle>Product Images</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <div className="mt-4">
                <label htmlFor="images" className="cursor-pointer">
                  <span className="mt-2 block text-sm font-medium text-gray-900">Upload product images</span>
                  <span className="mt-1 block text-sm text-gray-500">PNG, JPG, GIF up to 10MB each (max 5 images)</span>
                </label>
                <input
                  id="images"
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>
            </div>

            {images.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {images.map((image, index) => (
                  <div key={index} className="relative">
                    <img
                      src={URL.createObjectURL(image) || "/placeholder.svg"}
                      alt={`Product ${index + 1}`}
                      className="w-full h-24 object-cover rounded-md"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                    >
                      <X className="h-3 w-3" />
                    </button>
                    {index === 0 && (
                      <span className="absolute bottom-1 left-1 bg-blue-500 text-white text-xs px-1 rounded">Main</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Submit */}
      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700">
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating...
            </>
          ) : (
            "List Product"
          )}
        </Button>
      </div>
    </form>
    <MultipleImageUpload />
    <input type="file" onChange={(e) => console.log(e.target)} />
    <Input type="text" onChange={(e) => console.log("Khan")}/>
    </>
  )
}
