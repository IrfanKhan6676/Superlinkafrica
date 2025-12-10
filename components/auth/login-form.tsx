"use client"

import { useFormStatus } from "react-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Eye, EyeOff } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { useActionState, useEffect, useState } from "react"
import { signInWithPassword , signInWithOAuth} from "@/app/actions/auth"
import { toast } from "sonner"
import { sign } from "node:crypto"

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button
      type="submit"
      disabled={pending}
      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-base font-medium"
    >
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Signing in...
        </>
      ) : (
        "Sign In"
      )}
    </Button>
  )
}
function GoogleSubmitButton(){
  const { pending } = useFormStatus()
  return (<button
        type="submit"
        disabled={pending}
        className="flex items-center justify-center w-full gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-5 h-5">
          <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12 c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C33.64,6.053,28.983,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20 s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
          <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,16.108,18.961,14,24,14c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657 C33.64,6.053,28.983,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
          <path fill="#4CAF50" d="M24,44c4.874,0,9.292-1.826,12.657-4.839l-5.841-4.941C28.755,35.523,26.486,36,24,36 c-5.202,0-9.623-3.317-11.283-7.949l-6.49,5.006C9.556,39.556,16.227,44,24,44z"/>
          <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.046,5.585c0,0,0.001,0,0.001,0l6.49,5.006 C36.482,39.421,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
        </svg>{pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Continue with Google...
        </>
      ) : (
        "Continue with Google"
      )}
      </button>)
}
function GitHubSubmitButton(){
  const { pending } = useFormStatus()
  return (<button
        type="button"
        disabled={pending}
        className="flex items-center justify-center w-full gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5">
          <path fillRule="evenodd" clipRule="evenodd" d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.387.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.757-1.333-1.757-1.09-.745.083-.73.083-.73 1.205.085 1.84 1.236 1.84 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.775.418-1.305.76-1.605-2.665-.305-5.467-1.332-5.467-5.93 0-1.31.468-2.381 1.235-3.221-.124-.303-.535-1.527.117-3.176 0 0 1.008-.322 3.301 1.23a11.5 11.5 0 013.003-.403c1.018.005 2.042.138 3.003.403 2.291-1.552 3.297-1.23 3.297-1.23.653 1.649.242 2.873.118 3.176.77.84 1.233 1.911 1.233 3.221 0 4.61-2.805 5.622-5.476 5.92.43.37.823 1.096.823 2.211 0 1.595-.015 2.878-.015 3.268 0 .32.216.694.825.576C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12z"/>
        </svg>{pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Continue with GitHub...
        </>
      ) : (
        "Continue with GitHub"
      )}
      </button>)
}
interface LoginState {
  loading: boolean;
  error: string | null;
  success: boolean;
  rememberMe: boolean;
  message?: string;
}

export default function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [showPassword, setShowPassword] = useState(false)
  const [state, setState] = useState<LoginState>({
    loading: false,
    error: null,
    success: false,
    rememberMe: false
  })
  const [email, setEmail] = useState(process.env.NODE_ENV === "development" ? "test@example.com" : "")
  const [password, setPassword] = useState("")
  const [signInstate, formAction] = useActionState<{ success?: boolean; error?: string ;pending?: boolean}, FormData>(signInWithPassword as any, { error: '', pending : true });
  const [signInOAuthstate, formActionOAuth] = useActionState<{ success?: boolean; error?: string ;pending?: boolean}, FormData>(signInWithOAuth as any, { error: '',pending: true });
  // Load remembered email from localStorage on mount
  useEffect(() => {
    try {
      const remembered = typeof window !== 'undefined' ? localStorage.getItem('rememberedEmail') : null
      if (remembered) {
        setEmail(remembered)
        setState(prev => ({ ...prev, rememberMe: true }))
      }
    } catch (e) {
      // ignore localStorage errors
    }
  }, [])

   // SUCCESS HANDLING
  useEffect(() => {
    if (signInstate.success) {
      // capture remember flag up-front to avoid stale state after async calls
    const remember = state.rememberMe
      setState(prev => ({ ...prev, loading: false, success: true }))
      toast.success('Successfully signed in!')
      
      // Persist or remove remembered email based on checkbox
      if (remember) {
          if (typeof window !== 'undefined') localStorage.setItem('rememberedEmail', email.trim())
        } else {
          if (typeof window !== 'undefined') localStorage.removeItem('rememberedEmail')
        }

       // Redirect after a short delay to show the success message
      setTimeout(() => {
        const next = searchParams?.get("next") || "/auth/callback"
        router.push(next)
      }, 500)
    }

    if (signInstate.error) {
      console.error('Login error:', signInstate.error)
      const errorMessage = signInstate.error || 'An error occurred during login'
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
        success: false
      }))
      
      // Show error toast with the formatted message
      const displayMessage = getErrorMessage(errorMessage)
      toast.error(displayMessage)
    }
  }, [signInstate])

  // OAUTH ERRORS
  useEffect(() => {
    if (signInOAuthstate.error) {
      const errorMessage = signInstate.error || 'An error occurred during login'
      setState(prev => ({ ...prev, loading: false , error: errorMessage}));
      setState(prev => ({ ...prev, loading: false }));
      toast.error(signInOAuthstate.error)
    }
  }, [signInOAuthstate])

  // Handle successful login redirect
  useEffect(() => {
    if (state.success) {
      const next = searchParams?.get("next")
      router.push(next || "/auth/post-login")
    }
  }, [state.success, router, searchParams])

  function getErrorMessage(error: string): string{
    if (error.includes("Invalid login credentials")) {
      return "The email or password you entered is incorrect. Please check your credentials and try again."
    }
    if (error.includes("Email not confirmed")) {
      return "Please check your email and click the confirmation link before signing in."
    }
    if (error.includes("Too many requests")) {
      return "Too many login attempts. Please wait a few minutes before trying again."
    }
    if (error.includes("User not found")) {
      return "No account found with this email. Please sign up first or check your email address."
    }
    return error
  }

  return (
    <div className="space-y-6">

      {state.error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Sign in failed</h3>
              <div className="mt-1 text-sm text-red-700">
                <p>{getErrorMessage(state.error)}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {state.success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">Successfully signed in! Redirecting...</p>
            </div>
          </div>
        </div>
      )}

      <form action={formAction} className="space-y-6">
        <div>
        <Label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Email address
        </Label>
        <div className="mt-1">
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="password" className="block text-sm font-medium text-gray-700">
          Password
        </Label>
        <div className="mt-1 relative">
          <Input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            required
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="appearance-none block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
          <button
            type="button"
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff className="h-4 w-4 text-gray-400" /> : <Eye className="h-4 w-4 text-gray-400" />}
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <input
            id="remember-me"
            name="rememberMe"
            type="checkbox"
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            checked={state.rememberMe}
            onChange={(e) => setState(prev => ({ ...prev, rememberMe: e.target.checked }))}
          />
          <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
            Remember me
          </label>
        </div>

        <div className="text-sm">
          <a href="/auth/reset-password" className="font-medium text-blue-600 hover:text-blue-500">
            Forgot your password?
          </a>
        </div>
      </div>
      <div>
        <SubmitButton />
      </div>
      </form>
 <div className="flex items-center justify-center">
        <div className="w-full border-t border-gray-200" />
        <span className="px-3 text-sm text-gray-500">or</span>
        <div className="w-full border-t border-gray-200" />
      </div>
      <form action={formActionOAuth} >
        <input name="provider" type="hidden" value="google" />
        <GoogleSubmitButton />
      </form>
      <form action={formActionOAuth}>
        <input name="provider" type="hidden" value="github" />
        <GitHubSubmitButton />
      </form>
      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">New to Superlink?</span>
          </div>
        </div>

        <div className="mt-6">
          <Button
            type="button"
            variant="outline"
            className="w-full bg-transparent"
            onClick={() => router.push("/auth/sign-up")}
          >
            Create Account
          </Button>
        </div>
      </div>
    </div>
  )
}
