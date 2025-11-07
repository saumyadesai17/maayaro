import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireAdmin()
  if (auth.error) return auth.error

  const { supabase } = auth
  const { status } = await request.json()

  const { data: order, error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', params.id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Log activity
  await supabase.rpc('log_admin_activity', {
    p_action: 'update',
    p_entity_type: 'order',
    p_entity_id: order.id,
    p_changes: { status },
  })

  return NextResponse.json({ success: true, order })
}