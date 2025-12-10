"use client"

import { useState } from "react"
import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"
import { resendVerificationEmail } from "@/lib/actions/auth-actions"

export function VerifyEmailRequest() {
  const [state, formAction] = useActionState(resendVerificationEmail, { error: null, success: false })
  const [email, setEmail] = useState("")

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Verify Your Email</h2>
      <p className="text-muted-foreground">
        We've sent a verification link to your email address. Please check your inbox and click the link to verify your email.
      </p>
      
      {state?.error && (
        <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
          {state.error}
        </div>
      )}
      
      {state?.success && (
        <div className="rounded-md bg-green-50 p-3 text-sm text-green-700">
          Verification email sent successfully! Please check your inbox.
        </div>
      )}

      <form action={formAction} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="your@email.com"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        
        <SubmitButton />
      </form>
    </div>
  )
}

function SubmitButton() {
  const { pending } = useFormStatus()
  
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Sending...
        </>
      ) : (
        "Resend Verification Email"
      )}
    </Button>
  )
}
