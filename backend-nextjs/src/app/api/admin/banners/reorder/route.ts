import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'

export async function POST(request: NextRequest) {
  const auth = await requireAdmin()
  if (auth.error) return auth.error

  const { supabase } = auth
  const { banners } = await request.json() // Array of {id, sort_order}

  const updates = banners.map((banner: any) =>
    supabase
      .from('banners')
      .update({ sort_order: banner.sort_order })
      .eq('id', banner.id)
  )

  await Promise.all(updates)

  return NextResponse.json({ success: true })
}