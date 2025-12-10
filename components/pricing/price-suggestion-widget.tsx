"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { TrendingUp, TrendingDown, Target, Lightbulb, CheckCircle, XCircle } from "lucide-react"

interface PriceSuggestionProps {
  productId?: string
  currentPrice: number
  categoryId: string
  productData: any
  onPriceUpdate?: (newPrice: number) => void
}

interface PriceSuggestion {
  suggestedPrice: number
  confidenceScore: number
  reasoning: string
  factors: {
    marketPosition: string
    demandLevel: string
    competitiveAdvantage: string[]
    seasonalFactors: string[]
  }
}

export function PriceSuggestionWidget({
  productId,
  currentPrice,
  categoryId,
  productData,
  onPriceUpdate,
}: PriceSuggestionProps) {
  const [suggestion, setSuggestion] = useState<PriceSuggestion | null>(null)
  const [loading, setLoading] = useState(false)
  const [accepted, setAccepted] = useState(false)

  useEffect(() => {
    if (categoryId && productData) {
      generateSuggestion()
    }
  }, [categoryId, productData])

  const generateSuggestion = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/pricing/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          currentPrice,
          categoryId,
          productData,
        }),
      })

      const data = await response.json()
      if (data.suggestion) {
        setSuggestion(data.suggestion)
      }
    } catch (error) {
      console.error("Failed to get price suggestion:", error)
    } finally {
      setLoading(false)
    }
  }

  const acceptSuggestion = async () => {
    if (!suggestion) return

    try {
      if (productId) {
        // Update existing product
        await fetch(`/api/products/${productId}/price`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ price: suggestion.suggestedPrice }),
        })
      }

      // Update parent component
      onPriceUpdate?.(suggestion.suggestedPrice)
      setAccepted(true)
    } catch (error) {
      console.error("Failed to update price:", error)
    }
  }

  const rejectSuggestion = () => {
    setSuggestion(null)
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <Lightbulb className="h-4 w-4 animate-pulse" />
            <span className="text-sm">Analyzing market data...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!suggestion) {
    return (
      <Card>
        <CardContent className="p-4">
          <Button onClick={generateSuggestion} variant="outline" size="sm" className="w-full bg-transparent">
            <Lightbulb className="h-4 w-4 mr-2" />
            Get Price Suggestion
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (accepted) {
    return (
      <Alert className="border-green-200 bg-green-50">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-800">
          Price updated to ZMW {suggestion.suggestedPrice.toFixed(2)} based on market analysis.
        </AlertDescription>
      </Alert>
    )
  }

  const priceDifference = suggestion.suggestedPrice - currentPrice
  const percentageChange = (priceDifference / currentPrice) * 100

  return (
    <Card className="border-blue-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center space-x-2">
          <Lightbulb className="h-5 w-5 text-blue-600" />
          <span>AI Price Suggestion</span>
          <Badge variant={suggestion.confidenceScore >= 80 ? "default" : "secondary"}>
            {suggestion.confidenceScore}% confidence
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Price Comparison */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div>
            <p className="text-sm text-gray-600">Current Price</p>
            <p className="text-lg font-semibold">ZMW {currentPrice.toFixed(2)}</p>
          </div>
          <div className="flex items-center space-x-2">
            {priceDifference > 0 ? (
              <TrendingUp className="h-4 w-4 text-green-600" />
            ) : priceDifference < 0 ? (
              <TrendingDown className="h-4 w-4 text-red-600" />
            ) : (
              <Target className="h-4 w-4 text-blue-600" />
            )}
            <div className="text-right">
              <p className="text-sm text-gray-600">Suggested Price</p>
              <p className="text-lg font-semibold text-blue-600">ZMW {suggestion.suggestedPrice.toFixed(2)}</p>
            </div>
          </div>
        </div>

        {/* Price Change Indicator */}
        {Math.abs(percentageChange) > 1 && (
          <div className="flex items-center space-x-2">
            <Badge
              variant={priceDifference > 0 ? "default" : "destructive"}
              className={priceDifference > 0 ? "bg-green-100 text-green-800" : ""}
            >
              {priceDifference > 0 ? "+" : ""}
              {percentageChange.toFixed(1)}%
            </Badge>
            <span className="text-sm text-gray-600">
              {priceDifference > 0 ? "Increase" : "Decrease"} of ZMW {Math.abs(priceDifference).toFixed(2)}
            </span>
          </div>
        )}

        {/* Market Position */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Target className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium">Market Position:</span>
            <Badge
              variant={
                suggestion.factors.marketPosition === "above_market"
                  ? "destructive"
                  : suggestion.factors.marketPosition === "below_market"
                    ? "default"
                    : "secondary"
              }
            >
              {suggestion.factors.marketPosition.replace("_", " ")}
            </Badge>
          </div>

          <div className="flex items-center space-x-2">
            <TrendingUp className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium">Demand Level:</span>
            <Badge
              variant={
                suggestion.factors.demandLevel === "high"
                  ? "default"
                  : suggestion.factors.demandLevel === "low"
                    ? "destructive"
                    : "secondary"
              }
            >
              {suggestion.factors.demandLevel}
            </Badge>
          </div>
        </div>

        {/* Reasoning */}
        <Alert>
          <Lightbulb className="h-4 w-4" />
          <AlertDescription className="text-sm">{suggestion.reasoning}</AlertDescription>
        </Alert>

        {/* Competitive Advantages */}
        {suggestion.factors.competitiveAdvantage.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Key Factors:</p>
            <div className="space-y-1">
              {suggestion.factors.competitiveAdvantage.map((advantage, index) => (
                <div key={index} className="flex items-center space-x-2 text-sm text-gray-600">
                  <CheckCircle className="h-3 w-3 text-green-500" />
                  <span>{advantage}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-2 pt-2">
          <Button onClick={acceptSuggestion} className="flex-1 bg-blue-600 hover:bg-blue-700">
            <CheckCircle className="h-4 w-4 mr-2" />
            Accept Suggestion
          </Button>
          <Button onClick={rejectSuggestion} variant="outline" className="flex-1 bg-transparent">
            <XCircle className="h-4 w-4 mr-2" />
            Keep Current Price
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
