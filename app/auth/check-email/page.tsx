"use client"

import { useActionState } from "react"
import { useSearchParams } from "next/navigation"
import { resendConfirmation } from "@/app/actions/auth"

export default function CheckEmailPage() {
  const searchParams = useSearchParams()
  const email = searchParams.get("email") || ""
  type ResendState = { success?: boolean; error?: string } | null
  const [state, formAction] = useActionState<ResendState, FormData>(resendConfirmation as any, null)

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white shadow rounded-lg p-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Confirm your email</h1>
        <p className="text-gray-600 mb-4">
          {email
            ? `We sent a confirmation link to ${email}. Please click the link to activate your account.`
            : "We sent a confirmation link to your email. Please click the link to activate your account."}
        </p>

        {state?.error && (
          <div className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded p-3">
            {state.error}
          </div>
        )}

        {state?.success && (
          <div className="mb-4 text-sm text-green-700 bg-green-50 border border-green-200 rounded p-3">
            Confirmation email resent. Please check your inbox.
          </div>
        )}

        <form action={formAction} className="space-y-3">
          <input type="hidden" name="email" value={email} />
          <button
            type="submit"
            className="w-full px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
            disabled={!email}
          >
            Resend confirmation email
          </button>
        </form>

        <p className="mt-6 text-sm text-gray-500">
          After confirming, come back and <a className="text-blue-600 hover:underline" href="/auth/login">sign in</a>.
        </p>
      </div>
    </div>
  )
}
