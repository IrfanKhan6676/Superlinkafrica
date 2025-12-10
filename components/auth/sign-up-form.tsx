"use client"

import { useFormState, useFormStatus } from "react-dom"
import { signUp } from "@/app/actions/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

function SubmitButton({ isSubmitting }: { isSubmitting: boolean }) {
  return (
    <Button type="submit" disabled={isSubmitting} className="w-full">
      {isSubmitting ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Creating account...
        </>
      ) : (
        <>Create Account</>
      )}
    </Button>
  )
}

type FormState = {
  success: boolean;
  error: string | null;
  message?: string;
  redirectTo?: string;
};

export default function SignUpForm() {
  const [state, formAction] = useFormState<FormState, FormData>(signUp, { 
    success: false, 
    error: null 
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true);
    try {
      const result = await signUp({ success: false, error: null }, formData);
      if (result?.success && result.redirectTo) {
        router.push(result.redirectTo);
      } else if (result?.error) {
        // Error will be displayed by the form
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error('Signup error:', error);
      setIsSubmitting(false);
    }
  };

  return (
    <form action={handleSubmit} className="space-y-4">
      {state?.error && (
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-700">{state.error}</p>
        </div>
      )}
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" placeholder="your@email.com" required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input id="password" name="password" type="password" required minLength={6} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="fullName">Full Name</Label>
        <Input id="fullName" name="fullName" type="text" required />
      </div>

      <div className="space-y-2">
        <Label>I want to join as</Label>
        <div className="grid grid-cols-3 gap-4 mt-2">
          <div className="relative">
            <input
              type="radio"
              id="role-buyer"
              name="role"
              value="buyer"
              className="peer hidden"
              defaultChecked
            />
            <label
              htmlFor="role-buyer"
              className="block p-4 border rounded-lg cursor-pointer text-center peer-checked:border-blue-500 peer-checked:ring-2 peer-checked:ring-blue-200"
            >
              🛍️ Buyer
              <p className="text-sm text-gray-500 mt-1">Browse and purchase items</p>
            </label>
          </div>
          <div className="relative">
            <input
              type="radio"
              id="role-seller"
              name="role"
              value="seller"
              className="peer hidden"
            />
            <label
              htmlFor="role-seller"
              className="block p-4 border rounded-lg cursor-pointer text-center peer-checked:border-blue-500 peer-checked:ring-2 peer-checked:ring-blue-200"
            >
              💼 Seller
              <p className="text-sm text-gray-500 mt-1">Sell your products</p>
            </label>
          </div>
          <div className="relative">
            <input
              type="radio"
              id="role-both"
              name="role"
              value="both"
              className="peer hidden"
            />
            <label
              htmlFor="role-both"
              className="block p-4 border rounded-lg cursor-pointer text-center peer-checked:border-blue-500 peer-checked:ring-2 peer-checked:ring-blue-200"
            >
              ⚖️ Both
              <p className="text-sm text-gray-500 mt-1">Buy and sell</p>
            </label>
          </div>
        </div>
      </div>

      {state?.error && (
        <div className="p-4 text-sm text-red-600 bg-red-50 rounded-md">{state.error}</div>
      )}

      <div className="pt-4">
        <SubmitButton isSubmitting={isSubmitting} />
      </div>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/auth/login" className="text-blue-600 hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  )
}
