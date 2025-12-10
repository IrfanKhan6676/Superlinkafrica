'use server'

import { createWritableServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export async function resendVerificationEmail(prevState: any, formData: FormData) {
  const email = formData.get('email') as string
  
  if (!email) {
    return { error: 'Email is required' }
  }

  const supabase = await createWritableServerClient()
  
  // Check if user exists and is not verified
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('email_confirmed_at')
    .eq('email', email)
    .single()

  if (userError || !userData) {
    return { error: 'No account found with this email' }
  }

  if (userData.email_confirmed_at) {
    return { error: 'This email is already verified' }
  }

  // Send verification email
  const { error } = await supabase.auth.resend({
    type: 'signup',
    email,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/verify-email`,
    },
  })

  if (error) {
    console.error('Error resending verification email:', error)
    return { error: error.message || 'Failed to send verification email' }
  }

  return { success: true, error: null }
}

export async function resetPassword(prevState: any, formData: FormData) {
  const email = formData.get('email') as string
  
  if (!email) {
    return { error: 'Email is required' }
  }

  const supabase = await createWritableServerClient()
  // Send password reset email
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `http://localhost:3000/auth/update-password`,
  })

  if (error) {
    console.error('Error sending password reset email:', error)
    return {success : false, error: error.message || 'Failed to send password reset email' }
  }

  return { success: true, error: null }
}

export async function updatePassword(prevState: any, formData: FormData) {
  const password = formData.get('password') as string
  const confirmPassword = formData.get('confirmPassword') as string
  
  if (!password || !confirmPassword) {
    return { error: 'All fields are required' }
  }
  
  if (password !== confirmPassword) {
    return { error: 'Passwords do not match' }
  }
  
  if (password.length < 8) {
    return { error: 'Password must be at least 8 characters long' }
  }

  const supabase = await createWritableServerClient()
  
  // Update the user's password
  const { error } = await supabase.auth.updateUser({
    password : password,
  })
console.log()
  if (error) {
    console.error('Error updating password:', error)
    return { error: error.message || 'Failed to update password' }
  }

  // Redirect to login page after successful password update
  redirect('/auth/login?message=password_updated')
}

// Role-based access control middleware
export async function requireRole(requiredRole: string) {
  const supabase = await createWritableServerClient()
  
  // Get the current user
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    redirect('/auth/login?message=Please sign in to access this page')
  }
  
  // Get the user's role from the database
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()
  
  if (userError || !userData) {
    console.error('Error fetching user role:', userError)
    redirect('/auth/login?message=Error verifying permissions')
  }
  
  // Define role hierarchy (admin > editor > user)
  const roleHierarchy = {
    admin: 3,
    editor: 2,
    user: 1
  }
  
  // Check if user has the required role or higher
  const userRoleLevel = roleHierarchy[userData.role as keyof typeof roleHierarchy] || 0
  const requiredRoleLevel = roleHierarchy[requiredRole as keyof typeof roleHierarchy] || 0
  
  if (userRoleLevel < requiredRoleLevel) {
    // User doesn't have permission
    redirect('/dashboard?error=unauthorized')
  }
  
  return { user, role: userData.role }
}
