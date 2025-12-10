"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Heart, Smartphone, Car, Home, Shirt, Book, Music, Camera } from "lucide-react"

interface InterestsStepProps {
  data: any
  onNext: (data: any) => void
  onSkip: () => void
  isLoading: boolean
}

const CATEGORIES = [
  { id: "electronics", name: "Electronics", icon: Smartphone, color: "bg-blue-100 text-blue-800" },
  { id: "vehicles", name: "Vehicles", icon: Car, color: "bg-green-100 text-green-800" },
  { id: "home-garden", name: "Home & Garden", icon: Home, color: "bg-purple-100 text-purple-800" },
  { id: "fashion", name: "Fashion", icon: Shirt, color: "bg-pink-100 text-pink-800" },
  { id: "books", name: "Books & Media", icon: Book, color: "bg-yellow-100 text-yellow-800" },
  { id: "music", name: "Music & Instruments", icon: Music, color: "bg-indigo-100 text-indigo-800" },
  { id: "photography", name: "Photography", icon: Camera, color: "bg-gray-100 text-gray-800" },
  { id: "sports", name: "Sports & Outdoors", icon: Heart, color: "bg-red-100 text-red-800" },
]

export function InterestsStep({ data, onNext, onSkip, isLoading }: InterestsStepProps) {
  const [selectedInterests, setSelectedInterests] = useState<string[]>(data.interests || [])

  const toggleInterest = (categoryId: string) => {
    setSelectedInterests((prev) =>
      prev.includes(categoryId) ? prev.filter((id) => id !== categoryId) : [...prev, categoryId],
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onNext({ interests: selectedInterests })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="text-center mb-6">
        <Heart className="w-12 h-12 mx-auto text-red-600 mb-2" />
        <h3 className="text-lg font-semibold mb-2">What interests you?</h3>
        <p className="text-gray-600">Select categories you're interested in to get personalized recommendations</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {CATEGORIES.map((category) => {
          const Icon = category.icon
          const isSelected = selectedInterests.includes(category.id)

          return (
            <Card
              key={category.id}
              className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                isSelected ? "ring-2 ring-blue-500 bg-blue-50" : "hover:bg-gray-50"
              }`}
              onClick={() => toggleInterest(category.id)}
            >
              <CardContent className="p-4 text-center">
                <Icon className={`w-8 h-8 mx-auto mb-2 ${isSelected ? "text-blue-600" : "text-gray-600"}`} />
                <p className={`text-sm font-medium ${isSelected ? "text-blue-900" : "text-gray-900"}`}>
                  {category.name}
                </p>
                {isSelected && <Badge className="mt-2 bg-blue-600">Selected</Badge>}
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="text-center">
        <p className="text-sm text-gray-500">Selected {selectedInterests.length} categories</p>
      </div>

      <div className="flex justify-between pt-6">
        <Button type="button" variant="ghost" onClick={onSkip} disabled={isLoading}>
          Skip for now
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : "Continue"}
        </Button>
      </div>
    </form>
  )
}
