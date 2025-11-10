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
      shipping_method,
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

    // Fetch site settings for tax and shipping calculations
    const { data: settings } = await supabase
      .from('site_settings')
      .select('key, value, type')
      .in('key', ['tax_rate', 'free_shipping_threshold', 'standard_shipping_fee'])

    // Convert settings to object
    const settingsMap: Record<string, number> = {}
    settings?.forEach((setting) => {
      settingsMap[setting.key] = parseFloat(setting.value)
    })

    // Get tax rate from settings (default to 0.18 if not found)
    const taxRate = settingsMap['tax_rate'] || 0.18
    
    // Calculate shipping fee based on shipping method and database settings
    let shipping_fee = 0
    const freeShippingThreshold = settingsMap['free_shipping_threshold'] || 500
    const standardShippingFee = settingsMap['standard_shipping_fee'] || 50

    if (shipping_method === 'standard') {
      // Free shipping if order meets threshold
      shipping_fee = subtotal >= freeShippingThreshold ? 0 : standardShippingFee
    } else if (shipping_method === 'express') {
      shipping_fee = 200
    } else if (shipping_method === 'same-day') {
      shipping_fee = 300
    } else {
      // Default to standard shipping rules if method not specified
      shipping_fee = subtotal >= freeShippingThreshold ? 0 : standardShippingFee
    }
    
    // Calculate tax on (subtotal - discount + shipping_fee) to match frontend
    const tax = Math.round((subtotal - discount + shipping_fee) * taxRate)
    
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

    // Note: Cart will be cleared after successful payment verification
    // For COD orders, cart is cleared immediately in the frontend
    // For online payments, cart is cleared after payment success verification

    return NextResponse.json({ success: true, order })
  } catch (error) {
    console.error('Order creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    )
  }
}