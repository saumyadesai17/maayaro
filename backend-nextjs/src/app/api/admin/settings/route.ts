import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'

export async function GET(request: NextRequest) {
  const auth = await requireAdmin()
  if (auth.error) return auth.error

  const { supabase } = auth
  const { searchParams } = new URL(request.url)
  const group = searchParams.get('group')

  let query = supabase.from('site_settings').select('*')

  if (group) {
    query = query.eq('group_name', group)
  }

  const { data: settings, error } = await query.order('group_name').order('key')

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ settings })
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin()
  if (auth.error) return auth.error

  const { supabase, user } = auth
  const settingData = await request.json()

  const { data: setting, error } = await supabase
    .from('site_settings')
    .insert({
      ...settingData,
      updated_by: user.id,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, setting })
}