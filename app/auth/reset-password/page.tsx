import { createWritableServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { ResetPasswordForm } from "@/components/auth/reset-password-form"

export default async function ResetPasswordPage() {
  const supabase = await createWritableServerClient()
  const { data: { session } } = await supabase.auth.getSession()
  
  // If user is already logged in, redirect to dashboard
  if (session) {
    redirect('/dashboard')
  }
  
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6 rounded-lg border p-6 shadow-md">
        <h1 className="text-2xl font-bold">Reset Password</h1>
        <p className="text-muted-foreground">
          Enter your email address and we'll send you a link to reset your password.
        </p>
        <ResetPasswordForm />
      </div>
    </div>
  )
}
