import { createWritableServerClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

// Hardcoded site URL for redirects
const resolveSiteUrl = () => {
<<<<<<< HEAD
  return (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000');
=======
  return 'http://localhost:3000';
>>>>>>> 0c4e38a90ff868b906bd0973817ce070e17ecf55
};

export async function signUp(prevState: any, formData: FormData) {
  // Input validation
  const email = formData.get('email')?.toString();
  const password = formData.get('password')?.toString();
  const fullName = formData.get('fullName')?.toString();
  const phone = formData.get('phone')?.toString();
  const role = formData.get('role')?.toString() || 'buyer';

  if (!email || !password) {
    return { success: false, error: 'Email and password are required' };
  }

  if (password.length < 6) {
    return { success: false, error: 'Password must be at least 6 characters' };
  }

  const supabase = await createWritableServerClient();

  try {
    // Check if user exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      return { 
        success: false, 
        error: 'An account with this email already exists. Please sign in instead.' 
      };
    }

    // Sign up the user
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${resolveSiteUrl()}/auth/callback`,
        data: {
          full_name: fullName,
          phone,
          role
        }
      }
    });

    if (error) {
      console.error('Sign up error:', error);
      return { 
        success: false, 
        error: error.message || 'Failed to create account. Please try again.' 
      };
    }

    // If we get a session, the user was signed in automatically
    if (data?.session) {
      return { 
        success: true, 
        message: 'Your account has been created successfully!',
        redirectTo: '/dashboard'
      };
    }

    // If no session but also no error, email confirmation was sent
    return { 
      success: true, 
      message: 'Please check your email to confirm your account.',
      redirectTo: `/auth/check-email?email=${encodeURIComponent(email)}`
    };

  } catch (error) {
    console.error('Unexpected error during signup:', error);
    return { 
      success: false, 
      error: 'An unexpected error occurred. Please try again.' 
    };
  }
}
