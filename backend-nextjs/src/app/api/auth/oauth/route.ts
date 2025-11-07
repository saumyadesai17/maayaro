import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { provider } = await request.json()

    // Validate provider
    if (!provider || !['google', 'github', 'facebook'].includes(provider)) {
      return NextResponse.json(
        { error: 'Invalid OAuth provider' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Get the origin for redirect
    const origin = request.headers.get('origin') || 'http://localhost:3000'

    // Sign in with OAuth
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: provider as 'google' | 'github' | 'facebook',
      options: {
        redirectTo: `${origin}/api/auth/callback`,
      },
    })

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      url: data.url,
    })
  } catch (error: any) {
    console.error('OAuth error:', error)
    return NextResponse.json(
      { error: error.message || 'An error occurred during OAuth' },
      { status: 500 }
    )
  }
}
