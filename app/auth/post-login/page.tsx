import { redirect } from "next/navigation"
import { createServerClient, isSupabaseConfigured } from "@/lib/supabase/server"
import { logger } from "@/lib/observability/logger"
class CustomError extends Error {
  error?: string;
  userId?: string;
  
  constructor(message: string, options: { error?: string; userId?: string } = {}) {
    super(message);
    this.name = 'CustomError';
    this.error = options.error;
    this.userId = options.userId;
    
    // Set the prototype explicitly for TypeScript
    Object.setPrototypeOf(this, CustomError.prototype);
  }
}

// Safe redirect function to prevent open redirects
const safeRedirect = (url: string, defaultPath = '/') => {
  try {
    // Only allow relative URLs or absolute URLs that match our domain
    if (url.startsWith('/') && !url.startsWith('//')) {
      return redirect(url)
    }
    
    // If it's an absolute URL, verify it's from our domain
    const urlObj = new URL(url, 'http://dummy-base.com')
    if (urlObj.origin === 'http://dummy-base.com') {
      return redirect(urlObj.pathname + urlObj.search)
    }
  } catch (error) {
    logger.warn('Invalid redirect URL', { url, error })
  }
  
  return redirect(defaultPath)
}

export default async function PostLoginRouter({ searchParams }: {
  searchParams: Promise<{ [key: string]: string | undefined }>
}) {
    // ⬅️ You MUST await this
  const resolvedParams = await searchParams;
  if (!(await isSupabaseConfigured())) {
    logger.error('Supabase not configured')
    return safeRedirect('/error?code=misconfiguration')
  }

 const finalRedirect = async () => {
   try {
    const supabase = await createServerClient()

    // Get the current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    if (sessionError) {
      throw new CustomError('Failed to get session', {
        error: sessionError.message,
        userId: session?.user?.id
      })
    }
    if (!session?.user) {
      // If no session but we have an error in query params, preserve it
      const errorParam = resolvedParams.error ? `&error=${encodeURIComponent(resolvedParams.error)}` : ''
      return `/auth/login${errorParam}`;
    }

    const userId = session.user.id
    
    // If a "next" param exists and is a safe internal path, honor it
    console.log(resolvedParams.next)
    console.log(session.user)
    if (resolvedParams?.next) {
      return (resolvedParams.next,'/')
    }

    // Try to fetch profile data to determine routing
    // const { data: profile, error: profileError } = await supabase
    //   .from('users')
    //   .select('id, role, onboarding_completed, full_name, phone, email_verified')
    //   .eq('id', userId)
    //   .single()
    const profile = session.user
    if (!profile) {
      const customError = new Error('Failed to fetch user profile') as CustomError
      customError.error = 'Failed to fetch user profile'
      customError.userId = userId
      throw customError
    }

    // If email not verified, redirect to verification page
    if (!profile.user_metadata.email_verified) {
      return '/auth/verify-email'
    }

    // If onboarding not completed, redirect to onboarding
    // if (!profile.onboarding_completed) {
    //   return safeRedirect('/onboarding')
    // }

    // Role-based redirects
    const role = (profile.user_metadata.role as string | null)?.toLowerCase() || 'buyer'
    console.log(role)
    let redirectUrl: string;
    switch (role) {
      case 'admin':
        redirectUrl = '/admin/dashboard';
        break;
      case 'seller':
        redirectUrl = '/seller/dashboard';
        break;
      case 'both':
        redirectUrl = '/both/home';
        break;
      case 'buyer':
      default:
        redirectUrl = '/';
    }
    console.log(redirectUrl)
    return redirectUrl;
    
  } catch (error: any) {
    console.log(error)
    let errorMessage = 'An unknown error occurred';
    
    if (error instanceof CustomError) {
      errorMessage = error.message;
      // Log with context as meta data
      logger.error(
        `Error in post-login handler: ${errorMessage}`, 
        new Error(errorMessage), 
        { 
          errorDetails: error.error || 'No error details',
          userId: error.userId || 'unknown' 
        }
      );
    } else if (error instanceof Error) {
      errorMessage = error.message;
      logger.error(`Error in post-login handler: ${errorMessage}`);
    } else {
      errorMessage = String(error);
      logger.error(`Unknown error in post-login handler: ${errorMessage}`);
    }
    
    // Create a basic error URL with the error message
    const base = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    const errorUrl = new URL('/error', base);
    errorUrl.searchParams.set('code', 'auth_error');
    errorUrl.searchParams.set('message', encodeURIComponent(errorMessage));
    
    // Log the error with contextual metadata
    if (error instanceof CustomError) {
      logger.error(`Error in post-login handler: ${errorMessage}`, undefined, {
        errorDetails: error.error || 'No error details',
        userId: error.userId || 'unknown',
      })
    } else {
      logger.error(`Error in post-login handler: ${errorMessage}`)
    }

    // Redirect to the error page
    return errorUrl.pathname + errorUrl.search;
  }
 }
 const url = await finalRedirect();
  return redirect("/about");
}
