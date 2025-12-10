import { type NextRequest, NextResponse } from "next/server"
import { createWritableServerClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const error = requestUrl.searchParams.get("error")
  const errorDescription = requestUrl.searchParams.get("error_description")

  // Handle OAuth errors
  if (error) {
    console.error('Auth callback error:', { error, errorDescription })
    return NextResponse.redirect(
      new URL(`/auth/login?error=${encodeURIComponent(errorDescription || 'Authentication failed')}`, requestUrl.origin)
    )
  }
console.log(code)
console.log(error)
console.log(errorDescription)
  // If code is present, exchange it for a session
  if (code) {
    try {
      const supabase = await createWritableServerClient()
      const { error: authError } = await supabase.auth.exchangeCodeForSession(code)

      if (authError) {
        console.error('Error exchanging code for session:', authError)
        throw authError
      }

      // Get the user's session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()

      if (sessionError || !session) {
        console.error('Failed to get session after code exchange:', sessionError)
        throw new Error('Failed to create session')
      }

      // Get user profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single()

      // Create profile if it doesn't exist
      if (!profile) {
        const { error: insertError } = await supabase
          .from('profiles')
          .insert([
            {
              id: session.user.id,
              email: session.user.email,
              full_name: session.user.user_metadata?.full_name || '',
              avatar_url: session.user.user_metadata?.avatar_url || '',
              updated_at: new Date().toISOString(),
            },
          ])

        if (insertError) {
          console.error('Error creating user profile:', insertError)
          // Continue even if profile creation fails
        }
      }

      if (profileError) {
        console.error('Error fetching user profile:', profileError)
        // Continue even if profile fetch fails
      }

      // Use next-url cookie if present, otherwise go to dashboard
      const cookieStore = await cookies()
      const nextUrl = cookieStore.get('next-url')?.value
      const redirectTarget = nextUrl || '/dashboard'

      const response = NextResponse.redirect(new URL(redirectTarget, requestUrl.origin))

      // Clear the next-url cookie if it was used
      if (nextUrl) {
        response.cookies.set({
          name: 'next-url',
          value: '',
          path: '/',
          expires: new Date(0),
          sameSite: 'lax',
          secure: process.env.NODE_ENV === 'production',
          httpOnly: true,
        })
      }

      return response

    } catch (err) {
      console.error('Error in auth callback:', err)
      return NextResponse.redirect(
        new URL(`/auth/login?error=${encodeURIComponent('Authentication failed. Please try again.')}`, requestUrl.origin)
      )
    }
  }

  // No code: try redirecting to next-url cookie or post-login
  const cookieStore = await cookies()
  const nextUrl = cookieStore.get('next-url')?.value
  const redirectUrl = new URL(nextUrl || '/auth/post-login', requestUrl.origin)
  const response = NextResponse.redirect(redirectUrl)

  if (nextUrl) {
    response.cookies.set({
      name: 'next-url',
      value: '',
      path: '/',
      expires: new Date(0), // Expire immediately
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
    })
  }

  return response

  // This line is now handled by the redirectResponse above
}
