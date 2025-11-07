import { NextRequest } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import type { SupabaseClient, User } from '@supabase/supabase-js'

/**
 * Creates a Supabase client for API routes that supports both:
 * 1. Cookie-based auth (for browser requests)
 * 2. Bearer token auth (for Postman/API testing)
 * 
 * This allows testing API routes with Postman while maintaining
 * normal browser authentication flow.
 */
export async function createApiClient(
  request: NextRequest
): Promise<{ supabase: SupabaseClient; user: User | null }> {
  const authHeader = request.headers.get('authorization')

  // Check for Bearer token (Postman/API testing)
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.substring(7)
    const supabase = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      }
    )

    const { data, error } = await supabase.auth.getUser()
    return {
      supabase,
      user: error || !data.user ? null : data.user,
    }
  }

  // Use cookie-based auth (browser requests)
  const supabase = await createServerClient()
  const { data } = await supabase.auth.getUser()
  
  return {
    supabase,
    user: data.user || null,
  }
}
