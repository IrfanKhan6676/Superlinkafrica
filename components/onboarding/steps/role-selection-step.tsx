'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

type Role = 'buyer' | 'seller' | 'both'

interface RoleCardProps {
  role: Role
  title: string
  description: string
  icon: React.ReactNode
  selected: boolean
  onSelect: () => void
}

const RoleCard = ({ role, title, description, icon, selected, onSelect }: RoleCardProps) => (
  <Card 
    className={`cursor-pointer transition-all duration-200 ${selected ? 'border-primary ring-2 ring-primary' : 'hover:border-muted-foreground/50'}`}
    onClick={onSelect}
  >
    <CardHeader>
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10 text-primary">
          {icon}
        </div>
        <CardTitle className="text-lg">{title}</CardTitle>
      </div>
      <CardDescription>{description}</CardDescription>
    </CardHeader>
  </Card>
)

export function RoleSelectionStep({ onNext }: { onNext: (role: Role) => void }) {
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async () => {
    if (!selectedRole) {
      toast.error('Please select a role')
      return
    }

    setIsLoading(true)
    try {
      // Save the selected role to the user's profile
      const response = await fetch('/api/user/update-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: selectedRole })
      })

      if (!response.ok) {
        throw new Error('Failed to update role')
      }

      // Proceed to the next step with the selected role
      onNext(selectedRole)
    } catch (error) {
      console.error('Error updating role:', error)
      toast.error('Failed to update role. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Welcome to Superlink! 🎉</h2>
        <p className="text-muted-foreground">What brings you to Superlink Marketplace?</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <RoleCard
          role="buyer"
          title="Buyer"
          description="I want to browse and purchase products"
          icon="🛍️"
          selected={selectedRole === 'buyer'}
          onSelect={() => setSelectedRole('buyer')}
        />
        <RoleCard
          role="seller"
          title="Seller"
          description="I want to sell my products"
          icon="💼"
          selected={selectedRole === 'seller'}
          onSelect={() => setSelectedRole('seller')}
        />
        <RoleCard
          role="both"
          title="Both"
          description="I want to buy and sell"
          icon="⚖️"
          selected={selectedRole === 'both'}
          onSelect={() => setSelectedRole('both')}
        />
      </div>

      <div className="flex justify-end pt-4">
        <Button 
          onClick={handleSubmit}
          disabled={!selectedRole || isLoading}
          className="w-full sm:w-auto"
        >
          {isLoading ? 'Saving...' : 'Continue'}
        </Button>
      </div>
    </div>
  )
}
