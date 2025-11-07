import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { orderId } = await params

    // Check if orderId is a UUID or order number
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(orderId)

    let query = supabase
      .from('orders')
      .select(`
        *,
        order_items(
          *,
          product_variant:product_variants(
            *,
            product:products(
              *,
              images:product_images(*)
            )
          )
        ),
        shipping_address:addresses!orders_shipping_address_id_fkey(
          id,
          type,
          full_name,
          phone,
          address_line1,
          address_line2,
          city,
          state,
          postal_code,
          country
        ),
        billing_address:addresses!orders_billing_address_id_fkey(
          id,
          type,
          full_name,
          phone,
          address_line1,
          address_line2,
          city,
          state,
          postal_code,
          country
        ),
        payment:payments(*),
        shipment:shipments(*)
      `)
      .eq('user_id', user.id)

    // Search by UUID or order number
    if (isUUID) {
      query = query.eq('id', orderId)
    } else {
      query = query.eq('order_number', orderId)
    }

    const { data: order, error } = await query.single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Order not found' }, { status: 404 })
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    return NextResponse.json({ order })
  } catch (error) {
    console.error('Error fetching order:', error)
    return NextResponse.json(
      { error: 'Failed to fetch order' },
      { status: 500 }
    )
  }
}
