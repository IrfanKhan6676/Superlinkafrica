"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CreditCard, Smartphone, Plus } from "lucide-react"

interface PaymentStepProps {
  data: any
  onNext: (data: any) => void
  onSkip: () => void
  isLoading: boolean
}

export function PaymentStep({ data, onNext, onSkip, isLoading }: PaymentStepProps) {
  const [paymentMethods, setPaymentMethods] = useState(data.paymentMethods || [])
  const [showAddCard, setShowAddCard] = useState(false)
  const [showAddMobile, setShowAddMobile] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onNext({ paymentMethods })
  }

  const addMobileMethod = (provider: string, number: string) => {
    setPaymentMethods((prev: any[]) => [
      ...prev,
      {
        id: Date.now(),
        type: "mobile",
        provider,
        number,
        isDefault: prev.length === 0,
      },
    ])
    setShowAddMobile(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="text-center mb-6">
        <CreditCard className="w-12 h-12 mx-auto text-green-600 mb-2" />
        <h3 className="text-lg font-semibold mb-2">Payment Methods</h3>
        <p className="text-gray-600">Add payment methods for faster checkout (optional)</p>
      </div>

      <div className="space-y-4">
        {/* Mobile Money */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-base">
              <Smartphone className="w-5 h-5 mr-2" />
              Mobile Money
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!showAddMobile ? (
              <Button type="button" variant="outline" onClick={() => setShowAddMobile(true)} className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Add Mobile Money Account
              </Button>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      const number = prompt("Enter your MTN number:")
                      if (number) addMobileMethod("MTN", number)
                    }}
                    className="h-16"
                  >
                    <div className="text-center">
                      <div className="font-semibold text-yellow-600">MTN</div>
                      <div className="text-xs">Mobile Money</div>
                    </div>
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      const number = prompt("Enter your Airtel number:")
                      if (number) addMobileMethod("Airtel", number)
                    }}
                    className="h-16"
                  >
                    <div className="text-center">
                      <div className="font-semibold text-red-600">Airtel</div>
                      <div className="text-xs">Money</div>
                    </div>
                  </Button>
                </div>
                <Button type="button" variant="ghost" onClick={() => setShowAddMobile(false)} className="w-full">
                  Cancel
                </Button>
              </div>
            )}

            {/* Display added mobile methods */}
            {paymentMethods
              .filter((method: any) => method.type === "mobile")
              .map((method: any) => (
                <div key={method.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg mt-2">
                  <div className="flex items-center">
                    <Smartphone className="w-4 h-4 mr-2" />
                    <span className="font-medium">{method.provider}</span>
                    <span className="text-gray-500 ml-2">{method.number}</span>
                  </div>
                  {method.isDefault && (
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Default</span>
                  )}
                </div>
              ))}
          </CardContent>
        </Card>

        {/* Credit/Debit Cards */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-base">
              <CreditCard className="w-5 h-5 mr-2" />
              Credit/Debit Cards
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!showAddCard ? (
              <Button type="button" variant="outline" onClick={() => setShowAddCard(true)} className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Add Card
              </Button>
            ) : (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="cardNumber">Card Number</Label>
                  <Input id="cardNumber" placeholder="1234 5678 9012 3456" maxLength={19} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="expiry">Expiry Date</Label>
                    <Input id="expiry" placeholder="MM/YY" maxLength={5} />
                  </div>
                  <div>
                    <Label htmlFor="cvv">CVV</Label>
                    <Input id="cvv" placeholder="123" maxLength={3} />
                  </div>
                </div>
                <div>
                  <Label htmlFor="cardName">Name on Card</Label>
                  <Input id="cardName" placeholder="John Doe" />
                </div>
                <div className="flex gap-2">
                  <Button type="button" size="sm">
                    Add Card
                  </Button>
                  <Button type="button" variant="ghost" size="sm" onClick={() => setShowAddCard(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
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
