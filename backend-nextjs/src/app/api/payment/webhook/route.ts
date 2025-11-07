import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('x-razorpay-signature')

    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET!)
      .update(body)
      .digest('hex')

    if (signature !== expectedSignature) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    const event = JSON.parse(body)
    const supabase = await createClient()

    switch (event.event) {
      case 'payment.captured':
        // Update payment status
        const { data: payment } = await supabase
          .from('payments')
          .update({
            status: 'captured',
            payment_metadata: event.payload.payment.entity,
          })
          .eq('razorpay_payment_id', event.payload.payment.entity.id)
          .select('order_id')
          .single()

        // Also update order status to confirmed when payment is captured
        if (payment?.order_id) {
          await supabase
            .from('orders')
            .update({ status: 'confirmed' })
            .eq('id', payment.order_id)
          
          console.log(`Payment captured, order ${payment.order_id} confirmed`)
        }
        break

      case 'payment.failed':
        // Update payment status
        const { data: failedPayment } = await supabase
          .from('payments')
          .update({ status: 'failed' })
          .eq('razorpay_payment_id', event.payload.payment.entity.id)
          .select('order_id')
          .single()

        // Update order status to failed when payment fails
        if (failedPayment?.order_id) {
          await supabase
            .from('orders')
            .update({ status: 'failed' })
            .eq('id', failedPayment.order_id)
        }
        break

      case 'refund.created':
        // Update payment status
        const { data: refundedPayment } = await supabase
          .from('payments')
          .update({ status: 'refunded' })
          .eq('razorpay_payment_id', event.payload.refund.entity.payment_id)
          .select('order_id')
          .single()

        // Update order status to refunded
        if (refundedPayment?.order_id) {
          await supabase
            .from('orders')
            .update({ status: 'refunded' })
            .eq('id', refundedPayment.order_id)
        }
        break
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Webhook failed' }, { status: 500 })
  }
}