import { createWritableServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const token = searchParams.token as string
  const type = searchParams.type as string
  const next = (searchParams.next as string) ?? "/dashboard"
  
  if (!token || !type) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6 rounded-lg border p-6 shadow-md">
          <h1 className="text-2xl font-bold">Invalid Verification Link</h1>
          <p className="text-muted-foreground">
            The verification link is invalid or has expired. Please request a new verification email.
          </p>
          <Button asChild className="w-full">
            <Link href="/auth/login">Back to Login</Link>
          </Button>
        </div>
      </div>
    )
  }

  const supabase = await createWritableServerClient()
  const { error } = await supabase.auth.verifyOtp({
    token_hash: token,
    type: type as any,
  })

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6 rounded-lg border p-6 shadow-md">
          <h1 className="text-2xl font-bold">Verification Failed</h1>
          <p className="text-muted-foreground">
            {error.message || 'The verification link is invalid or has expired.'}
          </p>
          <Button asChild className="w-full">
            <Link href="/auth/login">Back to Login</Link>
          </Button>
        </div>
      </div>
    )
  }

  // If we have a next URL, redirect there
  if (next) {
    return redirect(next)
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6 rounded-lg border p-6 shadow-md">
        <h1 className="text-2xl font-bold">Email Verified</h1>
        <p className="text-muted-foreground">
          Your email has been successfully verified. You can now log in to your account.
        </p>
        <Button asChild className="w-full">
          <Link href="/dashboard">Go to Dashboard</Link>
        </Button>
      </div>
    </div>
  )
}
