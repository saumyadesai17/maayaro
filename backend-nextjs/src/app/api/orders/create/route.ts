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
      shipping_address_id,
      billing_address_id,
      payment_method,
      coupon_code,
      notes,
    } = await request.json()

    // Get cart with items
    const { data: cart } = await supabase
      .from('carts')
      .select(`
        *,
        cart_items(
          *,
          product_variant:product_variants(
            *,
            product:products(*)
          )
        )
      `)
      .eq('user_id', user.id)
      .single()

    console.log('Cart data:', cart)
    console.log('Cart items:', cart?.cart_items)

    if (!cart || !cart.cart_items || cart.cart_items.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 })
    }

    // Calculate totals
    let subtotal = 0
    const orderItems = []

    for (const item of cart.cart_items) {
      const variant = item.product_variant
      
      if (variant.stock_quantity < item.quantity) {
        return NextResponse.json(
          { error: `Insufficient stock for ${variant.product.name}` },
          { status: 400 }
        )
      }

      const price = variant.price || variant.product.base_price
      const itemTotal = price * item.quantity
      subtotal += itemTotal

      orderItems.push({
        product_variant_id: variant.id,
        product_name: variant.product.name,
        variant_details: {
          size: variant.size,
          color: variant.color,
          sku: variant.sku,
        },
        quantity: item.quantity,
        unit_price: price,
        total_price: itemTotal,
      })
    }

    // Apply coupon if provided
    let discount = 0
    if (coupon_code) {
      // Validate and apply coupon logic here
      // ...discount calculation
    }

    const tax = subtotal * 0.18 // 18% GST
    const shipping_fee = subtotal > 500 ? 0 : 50
    const total = subtotal - discount + tax + shipping_fee

    // Generate unique order number
    const { data: orderNumber } = await supabase.rpc('generate_order_number')

    // Create order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        order_number: orderNumber,
        user_id: user.id,
        status: 'pending',
        subtotal,
        discount,
        shipping_fee,
        tax,
        total,
        shipping_address_id,
        billing_address_id,
        notes,
      })
      .select()
      .single()

    if (orderError) {
      console.error('Order creation error:', orderError)
      return NextResponse.json(
        { error: orderError.message },
        { status: 500 }
      )
    }

    // Create order items
    const itemsWithOrderId = orderItems.map((item) => ({
      ...item,
      order_id: order.id,
    }))
    
    console.log('Creating order items:', itemsWithOrderId)
    
    const { data: createdItems, error: itemsError } = await supabase
      .from('order_items')
      .insert(itemsWithOrderId)
      .select()

    if (itemsError) {
      console.error('Order items creation failed:', itemsError)
      // Rollback: Delete the order since items failed
      await supabase.from('orders').delete().eq('id', order.id)
      return NextResponse.json(
        { error: `Failed to create order items: ${itemsError.message}` },
        { status: 500 }
      )
    }

    console.log('Order items created successfully:', createdItems)

    // Create payment record
    const { error: paymentError } = await supabase
      .from('payments')
      .insert({
        order_id: order.id,
        amount: total,
        currency: 'INR',
        status: payment_method === 'cod' ? 'created' : 'created',
        payment_method: payment_method || 'cod',
        payment_metadata: {
          created_via: 'web',
          user_agent: request.headers.get('user-agent') || 'unknown',
        },
      })

    if (paymentError) {
      console.error('Payment record creation failed:', paymentError)
      // Continue anyway - payment can be created later
    }

    // Update stock
    for (const item of cart.cart_items) {
      await supabase.rpc('decrement_stock', {
        variant_id: item.product_variant_id,
        quantity: item.quantity,
      })
    }

    // Clear cart
    await supabase.from('cart_items').delete().eq('cart_id', cart.id)

    return NextResponse.json({ success: true, order })
  } catch (error) {
    console.error('Order creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    )
  }
}