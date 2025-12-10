'use server';

import { createServerClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

type SignUpState = {
  success: boolean;
  error: string | null;
  message?: string;
  redirectTo?: string;
};

// Site URL for redirects with fallback to localhost
const resolveSiteUrl = () => {
  // return (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000');
   return ('http://localhost:3000');
};

export async function signUp(prevState: SignUpState, formData: FormData): Promise<SignUpState> {
  
  // Input validation
  const email = formData.get('email')?.toString();
  const password = formData.get('password')?.toString();
  const fullName = formData.get('fullName')?.toString();
  const phone = formData.get('phone')?.toString();
  const role = formData.get('role')?.toString() || 'buyer';

  if (!email || !password) {
    return { 
      success: false, 
      error: 'Email and password are required',
      message: '',
      redirectTo: ''
    };
  }

  if (password.length < 6) {
    return { 
      success: false, 
      error: 'Password must be at least 6 characters',
      message: '',
      redirectTo: ''
    };
  }

  const supabase = await createServerClient();

  try {
    // Check if user exists in auth
    const { data: existingUser, error: userError } = await supabase
      .from('users')
      .select('email')
      .eq('email', email)
      .single();
    
    if (existingUser) {
      return { 
        success: false, 
        error: 'An account with this email already exists. Please sign in instead.',
        message: '',
        redirectTo: ''
      };
    }

    // Sign up the user with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${resolveSiteUrl()}/auth/callback`,
        data: {
          full_name: fullName,
          role: role || 'buyer' // Default to 'buyer' if not specified
        }
      }
    });

    if (authError) {
      console.error('Auth error:', authError);
      return { 
        success: false, 
        error: authError.message || 'Failed to create account. Please try again.',
        message: '',
        redirectTo: ''
      };
    }

    // // Create user profile in the database
    // console.log(authData.user)
    // const ses = await supabase.auth.getSession()
    // console.log(ses)
    if (authData.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: authData.user.id,
          email: email.toLowerCase(),
          full_name: fullName,
          role: role || 'buyer',
          phone: phone || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      console.log(profileError)
      if (profileError) {
        console.error('Profile creation error:', profileError);
        // We don't want to fail the entire signup if profile creation fails
        // The user can update their profile later
      }
    }

    // If email confirmation is required, redirect to check-email
    if (!authData.session) {
      return { 
        success: true, 
        error: null,
        message: 'Please check your email to confirm your account.',
        redirectTo: `/auth/check-email?email=${encodeURIComponent(email)}`
      };
    }

    // If no email confirmation needed, log them in and redirect
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session) {
      // Redirect based on role
      const redirectPath = role === 'seller' ? '/dashboard/seller' : 
                         role === 'both' ? '/dashboard/both' : 
                         '/dashboard/buyer';
      
      return { 
        success: true, 
        error: null,
        message: 'Your account has been created successfully!',
        redirectTo: redirectPath
      };
    }

  } catch (error) {
    console.error('Unexpected error during signup:', error);
    return { 
      success: false, 
      error: 'An unexpected error occurred. Please try again.',
      message: '',
      redirectTo: ''
    };
  }
  
  // Default return in case all other conditions fail
  return {
    success: false,
    error: 'An unknown error occurred',
    message: '',
    redirectTo: ''
  };
}

export async function signOut() {
  const supabase = await createServerClient();
  await supabase.auth.signOut();
  return redirect('/login');
}

type ResendState = { success?: boolean; error?: string; pending?: boolean } | null;

export async function resendConfirmation(prevState: ResendState, formData: FormData): Promise<ResendState> {
  const email = formData.get('email')?.toString();
  
  if (!email) {
    return { error: 'Email is required' };
  }

  try {
    const supabase = await createServerClient();
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: {
        emailRedirectTo: `${resolveSiteUrl()}/auth/callback`
      }
    });

    if (error) {
      console.error('Error resending confirmation:', error);
      return { error: error.message || 'Failed to resend confirmation email' };
    }

    return { success: true };
  } catch (error) {
    console.error('Unexpected error:', error);
    return { error: 'An unexpected error occurred. Please try again.' };
  }
}

export async function signInWithPassword(prevState: ResendState, formData: FormData): Promise<ResendState> {
  console.log(formData)
  const email = formData.get('email')?.toString();
  const password = formData.get('password')?.toString();
  if (!email || !password) {
    return { error: 'Email and password are required' };
  }

  const supabase = await createServerClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password,
  });

  if (error) return {success: false, error: error.message , pending : false};

  return { success: true, pending : false };

}

export async function signInWithOAuth(prevState: ResendState, provider: string) : Promise<ResendState> {
  const supabase = await createServerClient();
  const { error } = await supabase.auth.signInWithOAuth({
    provider: provider as any,
    options: {
      redirectTo: `${resolveSiteUrl()}/auth/post-login`
    }
  });if (error) return {success: false, error: error.message, pending : false};

  return { success: true , pending : false};
}
