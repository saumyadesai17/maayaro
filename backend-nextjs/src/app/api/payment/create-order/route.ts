import { NextRequest, NextResponse } from 'next/server'
import { razorpay } from '@/lib/razorpay'
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

    const body = await request.json()
    console.log('Payment API received body:', body)
    const orderId = body.order_id || body.orderId // Support both formats
    console.log('Extracted order ID:', orderId)

    if (!orderId) {
      console.log('No order ID provided')
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 })
    }

    // Get order from database
    console.log('Fetching order from database with ID:', orderId, 'for user:', user.id)
    const { data: order, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .eq('user_id', user.id)
      .single()

    console.log('Order fetch result:', { order, error })

    if (error || !order) {
      console.log('Order not found or error:', error)
      return NextResponse.json({ error: `Order not found: ${error?.message || 'Unknown error'}` }, { status: 404 })
    }

    // Validate order data
    if (!order.total || order.total <= 0) {
      console.log('Invalid order total:', order.total)
      return NextResponse.json({ error: 'Invalid order total' }, { status: 400 })
    }

    if (!order.order_number) {
      console.log('Missing order number')
      return NextResponse.json({ error: 'Order number is missing' }, { status: 400 })
    }

    // Create Razorpay order
    console.log('Creating Razorpay order with:', {
      amount: Math.round(order.total * 100),
      currency: 'INR',
      receipt: order.order_number,
      order_total: order.total
    })
    
    let razorpayOrder
    try {
      razorpayOrder = await razorpay.orders.create({
        amount: Math.round(order.total * 100), // Amount in paise
        currency: 'INR',
        receipt: order.order_number,
        notes: {
          order_id: order.id,
          user_id: user.id,
        },
      })
      console.log('Razorpay order created successfully:', razorpayOrder.id)
    } catch (razorpayError) {
      console.error('Razorpay order creation failed:', razorpayError)
      const errorMessage = razorpayError instanceof Error ? razorpayError.message : 'Unknown Razorpay error'
      return NextResponse.json({ error: `Razorpay error: ${errorMessage}` }, { status: 400 })
    }

    // Save payment record - check if exists first
    console.log('Checking for existing payment record for order:', order.id)
    
    const { data: existingPayment } = await supabase
      .from('payments')
      .select('id, razorpay_order_id')
      .eq('order_id', order.id)
      .single()

    if (existingPayment) {
      console.log('Payment record already exists:', existingPayment)
      // Update with new Razorpay order ID if different
      if (existingPayment.razorpay_order_id !== razorpayOrder.id) {
        console.log('Updating existing payment record:', existingPayment.id, 'with razorpay_order_id:', razorpayOrder.id)
        
        const { data: updatedPayment, error: updateError } = await supabase
          .from('payments')
          .update({ razorpay_order_id: razorpayOrder.id })
          .eq('order_id', order.id)
          .select('id, razorpay_order_id')
          .single()
        
        console.log('Payment update result:', { updatedPayment, updateError })
        
        if (updateError) {
          console.error('Failed to update payment record:', updateError)
        } else {
          console.log('Successfully updated payment record with new Razorpay order ID:', updatedPayment.razorpay_order_id)
        }
      }
    } else {
      // Insert new payment record
      console.log('Inserting new payment record:', {
        order_id: order.id,
        razorpay_order_id: razorpayOrder.id,
        amount: order.total,
        currency: 'INR',
        status: 'created',
      })

      const { data: paymentRecord, error: paymentInsertError } = await supabase.from('payments').insert({
        order_id: order.id,
        razorpay_order_id: razorpayOrder.id,
        amount: order.total,
        currency: 'INR',
        status: 'created',
      }).select().single()

      console.log('Payment record insert result:', { paymentRecord, paymentInsertError })

      if (paymentInsertError) {
        console.error('Failed to create payment record:', paymentInsertError)
        // Continue anyway - we can still process the payment
      }
    }

    return NextResponse.json({
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    })
  } catch (error: any) {
    console.error('Payment creation error:', error)
    console.error('Error details:', error?.message, error?.error)
    return NextResponse.json(
      { 
        error: 'Failed to create payment order',
        details: error?.message || 'Unknown error'
      },
      { status: 500 }
    )
  }
}