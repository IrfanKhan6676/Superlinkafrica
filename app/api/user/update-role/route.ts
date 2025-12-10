import { createWritableServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { role } = await request.json()
    
    if (!['buyer', 'seller', 'both'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role' },
        { status: 400 }
      )
    }

    const supabase = await createWritableServerClient()
    
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Update the user's role in the profiles table
    const { error: updateError } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        role,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'id'
      })

    if (updateError) {
      console.error('Error updating user role:', updateError)
      throw updateError
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in update-role API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
