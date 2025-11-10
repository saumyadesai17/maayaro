import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  const auth = await requireAdmin()
  if (auth.error) return auth.error

  const { supabase, user } = auth
  const { key } = await params
  const { value } = await request.json()

  const { data: setting, error } = await supabase
    .from('site_settings')
    .update({
      value,
      updated_by: user.id,
    })
    .eq('key', key)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, setting })
}