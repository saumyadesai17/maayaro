import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const {
      razorpay_order_id,
      order_id,
      reason,
      error_code,
      error_description,
    } = await request.json()

    console.log('Payment failure data:', {
      razorpay_order_id,
      order_id,
      reason,
      error_code,
      error_description
    })

    // Find the payment record
    let payment = null
    
    if (razorpay_order_id) {
      console.log('Searching for payment by razorpay_order_id:', razorpay_order_id)
      const { data, error: searchError } = await supabase
        .from('payments')
        .select('id, order_id, status')
        .eq('razorpay_order_id', razorpay_order_id)
        .single()
      
      console.log('Payment search by razorpay_order_id result:', { data, searchError })
      payment = data
    } else if (order_id) {
      console.log('Searching for payment by order_id:', order_id)
      const { data, error: searchError } = await supabase
        .from('payments')
        .select('id, order_id, status')
        .eq('order_id', order_id)
        .single()
      
      console.log('Payment search by order_id result:', { data, searchError })
      payment = data
    }

    if (payment) {
      // Update payment status to failed
      const { error: updateError } = await supabase
        .from('payments')
        .update({
          status: 'failed',
          payment_metadata: {
            failure_reason: reason || 'cancelled',
            error_code,
            error_description,
            failed_at: new Date().toISOString(),
          }
        })
        .eq('id', payment.id)

      if (updateError) {
        console.error('Failed to update payment status:', updateError)
      } else {
        console.log('Payment status updated to failed for payment ID:', payment.id)
      }

      // Update order status to cancelled if payment failed
      const { error: orderError } = await supabase
        .from('orders')
        .update({
          status: 'cancelled',
        })
        .eq('id', payment.order_id)

      if (orderError) {
        console.error('Failed to update order status:', orderError)
      } else {
        console.log('Order status updated to cancelled for order ID:', payment.order_id)
      }

      // Restore stock quantities for cancelled order
      const { data: orderItems } = await supabase
        .from('order_items')
        .select('product_variant_id, quantity')
        .eq('order_id', payment.order_id)

      if (orderItems) {
        for (const item of orderItems) {
          await supabase.rpc('increment_stock', {
            variant_id: item.product_variant_id,
            quantity: item.quantity,
          })
        }
        console.log('Stock restored for cancelled order')
      }

      return NextResponse.json({
        success: true,
        message: 'Payment failure recorded and order cancelled',
      })
    }

    return NextResponse.json({
      success: true,
      message: 'No payment record found to update',
    })
  } catch (error) {
    console.error('Payment failure handling error:', error)
    return NextResponse.json(
      { error: 'Failed to process payment failure' },
      { status: 500 }
    )
  }
}
