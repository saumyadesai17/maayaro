import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: orders, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items(
          *,
          product_variant:product_variants(
            *,
            product:products(
              *,
              images:product_images(
                id,
                image_url,
                alt_text,
                is_primary,
                sort_order
              )
            )
          )
        ),
        payment:payments(*),
        shipment:shipments(*)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Filter out orders with failed payments (pending orders without successful payment)
    const validOrders = orders?.filter(order => {
      // If order status is not pending, it's valid (confirmed/processing/shipped/etc)
      if (order.status !== 'pending') return true;
      
      // For pending orders, check if payment was successful
      const payment = Array.isArray(order.payment) ? order.payment[0] : order.payment;
      
      // Keep pending orders that have successful payment or are confirmed
      return payment && (payment.status === 'success' || payment.status === 'captured');
    }) || [];

    return NextResponse.json({ orders: validOrders })
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    )
  }
}