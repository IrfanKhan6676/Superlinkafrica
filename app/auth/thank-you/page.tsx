export default function ThankYouPage({
  searchParams,
}: {
  searchParams: { email?: string }
}) {
  const email = searchParams?.email
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6">
      <div className="max-w-md w-full bg-white shadow rounded-lg p-8 text-center">
        <h1 className="text-3xl font-bold mb-4">Thank you for creating your account!</h1>
        <p className="mb-6 text-center text-gray-700">
          {email
            ? `We've sent a confirmation link to ${email}. Please check your inbox to activate your account.`
            : "We've sent a confirmation link to your email. Please check your inbox to activate your account."}
        </p>

        <div className="flex gap-4 justify-center">
          <a
            href="/auth/login"
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            Go to Login
          </a>
          <a
            href="/"
            className="px-6 py-2 bg-gray-200 rounded hover:bg-gray-300 transition"
          >
            Back to Home
          </a>
        </div>

        <p className="mt-6 text-gray-500 text-sm">
          Didn’t receive the email? You can resend it on the <a className="text-blue-600 hover:underline" href={email ? `/auth/check-email?email=${encodeURIComponent(email)}` : "/auth/check-email"}>Check Email</a> page.
        </p>
      </div>
    </div>
  )
}
