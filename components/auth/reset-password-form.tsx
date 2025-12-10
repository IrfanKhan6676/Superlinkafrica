"use client"

import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"
import { resetPassword } from "@/lib/actions/auth-actions"

export function ResetPasswordForm() {
  const [state, formAction] = useActionState(resetPassword, { error: null, success: false })
  
  if (state?.success) {
    return (
      <div className="space-y-4">
        <div className="rounded-md bg-green-50 p-4">
          <p className="text-sm text-green-700">
            If an account exists with this email, you will receive a password reset link shortly.
          </p>
        </div>
        <Button asChild className="w-full">
          <a href="/auth/login">Back to Login</a>
        </Button>
      </div>
    )
  }

  return (
    <form action={formAction} className="space-y-4">
      {state?.error && (
        <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
          {state.error}
        </div>
      )}
      
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="your@email.com"
          required
        />
      </div>
      
      <SubmitButton />
    </form>
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
        "Send Reset Link"
      )}
    </Button>
  )
}
