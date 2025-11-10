import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin()
  if (auth.error) return auth.error

  const { supabase, profile } = auth
  const { id } = await params

  // Only super_admin can change roles
  if (profile.role !== 'super_admin') {
    return NextResponse.json(
      { error: 'Only super admins can change user roles' },
      { status: 403 }
    )
  }

  const { role } = await request.json()

  const { data: user, error } = await supabase
    .from('profiles')
    .update({ role })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, user })
}