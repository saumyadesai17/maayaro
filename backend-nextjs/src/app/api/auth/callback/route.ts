import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const origin = requestUrl.origin

  if (code) {
    const supabase = await createClient()
    
    // Exchange code for session
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (error) {
      console.error('Auth callback error:', error)
      return NextResponse.redirect(`${origin}/login?error=${error.message}`)
    }

    // Get user data
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      // Check if profile exists, create/update if needed
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single()

      if (!existingProfile) {
        // Create profile from OAuth data
        await supabase
          .from('profiles')
          .insert({
            id: user.id,
            email: user.email!,
            full_name: user.user_metadata.full_name || user.user_metadata.name || '',
            avatar_url: user.user_metadata.avatar_url || user.user_metadata.picture || '',
          })
      }
    }
  }

  // Redirect to home page or dashboard
  return NextResponse.redirect(`${origin}/`)
}
