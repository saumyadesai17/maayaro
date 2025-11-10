import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { validatePaymentVerification } from 'razorpay/dist/utils/razorpay-utils'

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
      razorpay_payment_id,
      razorpay_signature,
    } = await request.json()

    console.log('Payment verification data:', {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    })

    // Validate required parameters
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { error: 'Missing required payment parameters' },
        { status: 400 }
      )
    }

    // Verify signature using Razorpay's official utility
    const isValid = validatePaymentVerification(
      {
        order_id: razorpay_order_id,
        payment_id: razorpay_payment_id
      },
      razorpay_signature,
      process.env.RAZORPAY_KEY_SECRET!
    )
    
    console.log('Razorpay signature verification result:', isValid)

    if (!isValid) {
      console.error('Payment signature verification failed')
      return NextResponse.json(
        { error: 'Invalid payment signature' },
        { status: 400 }
      )
    }

    console.log('Payment signature verified successfully')

    // First, find the payment record
    console.log('Looking for payment record with razorpay_order_id:', razorpay_order_id)
    
    const { data: existingPayment, error: findError } = await supabase
      .from('payments')
      .select('id, order_id, status')
      .eq('razorpay_order_id', razorpay_order_id)
      .single()

    console.log('Payment find result:', { existingPayment, findError })

    let payment = null
    
    if (existingPayment) {
      // Update the existing payment record
      const { data: updatedPayment, error: updateError } = await supabase
        .from('payments')
        .update({
          razorpay_payment_id,
          razorpay_signature,
          status: 'captured',
        })
        .eq('id', existingPayment.id)
        .select('order_id')
        .single()

      console.log('Payment update result:', { updatedPayment, updateError })
      payment = updatedPayment
      
      if (updateError) {
        console.error('Failed to update payment record:', updateError)
        return NextResponse.json(
          { error: 'Failed to update payment record' },
          { status: 500 }
        )
      }
    }

    console.log('Final payment result:', { payment })

    if (!payment) {
      console.error('Payment record not found by razorpay_order_id, trying alternative approach')
      
      // Try to find payment record by order_id (fallback for cases where razorpay_order_id wasn't updated properly)
      const { data: orderRecord, error: orderError } = await supabase
        .from('orders')
        .select('id, total')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (orderError || !orderRecord) {
        console.error('Could not find recent order:', orderError)
        return NextResponse.json(
          { error: 'Payment record and order not found' },
          { status: 404 }
        )
      }

      console.log('Found recent order:', orderRecord.id, 'looking for payment record')

      // Try to find existing payment record by order_id
      const { data: existingByOrder, error: existingError } = await supabase
        .from('payments')
        .select('id, order_id')
        .eq('order_id', orderRecord.id)
        .single()

      console.log('Payment search by order_id result:', { existingByOrder, existingError })

      if (existingByOrder) {
        // Update the existing payment record with all payment details
        console.log('Updating existing payment record by order_id:', existingByOrder.id)
        
        const { data: updatedPayment, error: updateError } = await supabase
          .from('payments')
          .update({
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            status: 'captured',
          })
          .eq('id', existingByOrder.id)
          .select('order_id')
          .single()

        console.log('Payment update by order_id result:', { updatedPayment, updateError })

        if (updateError || !updatedPayment) {
          console.error('Failed to update existing payment record:', updateError)
          return NextResponse.json(
            { error: 'Failed to update payment record' },
            { status: 500 }
          )
        }

        payment = updatedPayment
        console.log('Successfully updated existing payment record')
      } else {
        // Create new payment record as last resort
        console.log('Creating new payment record as fallback')
        
        const { data: newPayment, error: createError } = await supabase
          .from('payments')
          .insert({
            order_id: orderRecord.id,
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            amount: orderRecord.total,
            currency: 'INR',
            status: 'captured',
          })
          .select('order_id')
          .single()

        if (createError || !newPayment) {
          console.error('Failed to create payment record:', createError)
          return NextResponse.json(
            { error: 'Failed to create payment record' },
            { status: 500 }
          )
        }

        payment = newPayment
        console.log('Created payment record successfully:', payment)
      }
    }

    // Update order status
    console.log('Updating order status for order_id:', payment.order_id)
    await supabase
      .from('orders')
      .update({ status: 'confirmed' })
      .eq('id', payment.order_id)

    // Clear cart after successful payment verification
    console.log('Fetching user cart to clear items')
    const { data: userCart } = await supabase
      .from('carts')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (userCart) {
      console.log('Clearing cart_id:', userCart.id)
      const { error: clearError } = await supabase
        .from('cart_items')
        .delete()
        .eq('cart_id', userCart.id)
      
      if (clearError) {
        console.error('Cart clearing error:', clearError)
      } else {
        console.log('Cart cleared successfully')
      }
    } else {
      console.log('No cart found for user:', user.id)
    }

    return NextResponse.json({ success: true, orderId: payment.order_id })
  } catch (error) {
    console.error('Payment verification error:', error)
    return NextResponse.json(
      { error: 'Failed to verify payment' },
      { status: 500 }
    )
  }
}