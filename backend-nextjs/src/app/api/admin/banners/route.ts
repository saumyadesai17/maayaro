import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'

export async function GET(request: NextRequest) {
  const auth = await requireAdmin()
  if (auth.error) return auth.error

  const { supabase } = auth
  const { searchParams } = new URL(request.url)
  const position = searchParams.get('position')

  let query = supabase.from('banners').select('*')

  if (position) {
    query = query.eq('position', position)
  }

  const { data: banners, error } = await query.order('sort_order')

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ banners })
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin()
  if (auth.error) return auth.error

  const { supabase } = auth
  const bannerData = await request.json()

  const { data: banner, error } = await supabase
    .from('banners')
    .insert(bannerData)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, banner })
}