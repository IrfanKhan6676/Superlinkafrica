import { createServerClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Use our server client
    const supabase = createServerClient();
    
    // Test the connection by fetching the current user's session
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) throw error;
    
    return NextResponse.json({
      success: true,
      message: 'Successfully connected to Supabase!',
      session: session ? 'User is authenticated' : 'No active session',
      user: session?.user,
    });
  } catch (error: any) {
    console.error('Error testing Supabase connection:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to connect to Supabase',
        error: error.message,
      },
      { status: 500 }
    );
  }
}
