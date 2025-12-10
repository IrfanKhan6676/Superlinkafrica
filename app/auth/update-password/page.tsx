import { createWritableServerClient } from "@/lib/supabase/server"
import { redirect, useSearchParams } from "next/navigation"
import { UpdatePasswordForm } from "@/components/auth/update-password-form"

export default async function UpdatePasswordPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6 rounded-lg border p-6 shadow-md">
        <h1 className="text-2xl font-bold">Set a New Password</h1>
        <p className="text-muted-foreground">Please enter your new password below.</p>
        <UpdatePasswordForm />
      </div>
    </div>
  )
}
