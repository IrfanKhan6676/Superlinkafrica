"use client"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { CheckCircle, Sparkles, Gift, Shield } from "lucide-react"

interface CompletionStepProps {
  data: any
  onNext: (data: any) => void
  onSkip: () => void
  isLoading: boolean
}

export function CompletionStep({ data, onNext, onSkip, isLoading }: CompletionStepProps) {
  const router = useRouter()

  const handleComplete = async () => {
    // Mark onboarding as completed
    await fetch("/api/onboarding/complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    })

    router.push("/")
  }

  return (
    <div className="text-center space-y-6">
      <div className="mb-8">
        <CheckCircle className="w-16 h-16 mx-auto text-green-600 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome to Superlink! 🎉</h2>
        <p className="text-gray-600">Your profile is now set up and ready to go</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="p-4 bg-blue-50 rounded-lg">
          <Sparkles className="w-8 h-8 mx-auto text-blue-600 mb-2" />
          <h3 className="font-semibold text-blue-900">Personalized Feed</h3>
          <p className="text-sm text-blue-700">Get recommendations based on your interests</p>
        </div>
        <div className="p-4 bg-green-50 rounded-lg">
          <Shield className="w-8 h-8 mx-auto text-green-600 mb-2" />
          <h3 className="font-semibold text-green-900">Verified Account</h3>
          <p className="text-sm text-green-700">Higher trust score and better visibility</p>
        </div>
        <div className="p-4 bg-purple-50 rounded-lg">
          <Gift className="w-8 h-8 mx-auto text-purple-600 mb-2" />
          <h3 className="font-semibold text-purple-900">Welcome Bonus</h3>
          <p className="text-sm text-purple-700">100 loyalty points to get you started</p>
        </div>
      </div>

      <div className="space-y-4">
        <Button onClick={handleComplete} size="lg" className="w-full" disabled={isLoading}>
          {isLoading ? "Setting up..." : "Start Shopping!"}
        </Button>

        <p className="text-xs text-gray-500">You can always update your preferences in your profile settings</p>
      </div>
    </div>
  )
}
