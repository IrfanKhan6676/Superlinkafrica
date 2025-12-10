"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { PersonalInfoStep } from "./steps/personal-info-step"
import { VerificationStep } from "./steps/verification-step"
import { InterestsStep } from "./steps/interests-step"
import { PreferencesStep } from "./steps/preferences-step"
import { PaymentStep } from "./steps/payment-step"
import { CompletionStep } from "./steps/completion-step"
import { RoleSelectionStep } from "./steps/role-selection-step"
import { ChevronLeft } from "lucide-react"

const STEPS = [
  { id: "role", title: "Select Your Role", component: RoleSelectionStep },
  { id: "personal", title: "Personal Information", component: PersonalInfoStep },
  { id: "verification", title: "Identity Verification", component: VerificationStep },
  { id: "interests", title: "Your Interests", component: InterestsStep },
  { id: "preferences", title: "Preferences", component: PreferencesStep },
  { id: "payment", title: "Payment Methods", component: PaymentStep },
  { id: "completion", title: "Welcome to Superlink!", component: CompletionStep },
]

export function MultiStepOnboarding() {
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState({
    personal: {},
    verification: {},
    interests: {},
    preferences: {},
    payment: {},
  })
  const [isLoading, setIsLoading] = useState(false)

  const progress = ((currentStep + 1) / STEPS.length) * 100
  const CurrentStepComponent = STEPS[currentStep].component

  const handleNext = async (stepData: any) => {
    setIsLoading(true)

    // Update form data
    const stepKey = STEPS[currentStep].id as keyof typeof formData
    setFormData((prev) => ({
      ...prev,
      [stepKey]: { ...prev[stepKey], ...stepData },
    }))

    // Save progress to database
    try {
      const response = await fetch("/api/onboarding/save-progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          step: STEPS[currentStep].id,
          data: stepData,
          currentStep: currentStep + 1,
        }),
      })

      if (response.ok) {
        if (currentStep < STEPS.length - 1) {
          setCurrentStep((prev) => prev + 1)
        }
      }
    } catch (error) {
      console.error("Error saving progress:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1)
    }
  }

  const handleSkip = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900">Complete Your Profile</h1>
          <span className="text-sm text-gray-500">
            Step {currentStep + 1} of {STEPS.length}
          </span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl text-center">{STEPS[currentStep].title}</CardTitle>
        </CardHeader>
        <CardContent>
          <CurrentStepComponent
            data={formData[STEPS[currentStep].id as keyof typeof formData]}
            onNext={handleNext}
            onSkip={handleSkip}
            isLoading={isLoading}
          />
        </CardContent>
      </Card>

      {currentStep > 0 && currentStep < STEPS.length - 1 && (
        <div className="flex justify-between mt-6">
          <Button variant="outline" onClick={handlePrevious} disabled={isLoading}>
            <ChevronLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>
          <Button variant="ghost" onClick={handleSkip} disabled={isLoading} className="text-gray-500">
            Skip for now
          </Button>
        </div>
      )}
    </div>
  )
}
