import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'

export async function GET(request: NextRequest) {
  const auth = await requireAdmin()
  if (auth.error) return auth.error

  const { supabase } = auth

  // Get various stats in parallel
  const [
    { count: totalOrders },
    { count: pendingOrders },
    { count: totalProducts },
    { count: totalUsers },
    { data: recentOrders },
  ] = await Promise.all([
    supabase.from('orders').select('*', { count: 'exact', head: true }),
    supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('products').select('*', { count: 'exact', head: true }),
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase
      .from('orders')
      .select('*, user:profiles(full_name, email)')
      .order('created_at', { ascending: false })
      .limit(10),
  ])

  // Calculate revenue
  const { data: orders } = await supabase
    .from('orders')
    .select('total')
    .eq('status', 'delivered')

  const totalRevenue = orders?.reduce((sum, order) => sum + order.total, 0) || 0

  return NextResponse.json({
    stats: {
      totalOrders: totalOrders || 0,
      pendingOrders: pendingOrders || 0,
      totalProducts: totalProducts || 0,
      totalUsers: totalUsers || 0,
      totalRevenue,
    },
    recentOrders: recentOrders || [],
  })
}