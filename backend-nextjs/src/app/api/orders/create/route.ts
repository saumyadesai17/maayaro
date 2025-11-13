import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import computeOrderFinancials from '@/lib/finance/computeOrderFinancials'

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
      package_dimensions,
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

    // Fetch addresses
    const { data: shippingAddress, error: shippingError } = await supabase
      .from('addresses')
      .select('*')
      .eq('id', shipping_address_id)
      .eq('user_id', user.id)
      .single()

    if (shippingError || !shippingAddress) {
      return NextResponse.json({ error: 'Invalid shipping address' }, { status: 400 })
    }

    const billingAddressId = billing_address_id || shipping_address_id
    const { data: billingAddress, error: billingError } = await supabase
      .from('addresses')
      .select('*')
      .eq('id', billingAddressId)
      .eq('user_id', user.id)
      .single()

    if (billingError || !billingAddress) {
      return NextResponse.json({ error: 'Invalid billing address' }, { status: 400 })
    }

    // Transform address format for finance function
    const transformAddress = (addr: any) => ({
      customer_name: addr.full_name.split(' ')[0] || addr.full_name,
      last_name: addr.full_name.split(' ').slice(1).join(' ') || '',
      address: addr.address_line1,
      address_2: addr.address_line2 || '',
      city: addr.city,
      pincode: addr.postal_code,
      state: addr.state,
      country: addr.country,
      email: user.email || '',
      phone: addr.phone,
      alternate_phone: addr.alternate_phone || '',
      isd_code: '+91',
    })

    // Prepare cart items for finance calculation
    const cartItemsInput = cart.cart_items.map((item: any) => ({
      product_variant_id: item.product_variant_id,
      quantity: item.quantity,
      gstRate: item.product_variant?.product?.gst_rate,
    }))

    // Compute order financials using the unified function
    const financialResult = await computeOrderFinancials({
      cartItems: cartItemsInput,
      shippingMethod: shipping_method || 'standard',
      discount: 0, // TODO: Apply coupon discount
      userId: user.id,
      billingAddress: transformAddress(billingAddress),
      shippingAddress: billing_address_id ? transformAddress(shippingAddress) : undefined,
      shippingIsBilling: !billing_address_id,
      paymentMethod: payment_method === 'cod' ? 'COD' : 'Prepaid',
      pickupLocation: 'warehouse',
      dimensions: package_dimensions,
    })

    console.log('Financial calculation result:', financialResult)

    // Check validation warnings
    if (!financialResult.validation.is_valid) {
      console.warn('Order validation warnings:', financialResult.validation.warnings)
    }

    // Generate unique order number
    const { data: orderNumber } = await supabase.rpc('generate_order_number')

    // Prepare order items from financial calculation
    const orderItems = financialResult.order_items.map((item) => ({
      product_variant_id: item.product_variant_id,
      product_name: item.product_name,
      variant_details: {
        sku: item.sku,
      },
      quantity: item.quantity,
      unit_price: item.unit_price,
      total_price: item.total_with_tax,
      tax_amount: item.tax_amount,
      gst_rate: item.gst_rate,
    }))

    // Create order with calculated financials (include metadata in initial insert)
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        order_number: orderNumber,
        user_id: user.id,
        status: 'pending',
        subtotal: financialResult.order.subtotal,
        discount: financialResult.order.discount,
        shipping_fee: financialResult.order.shipping_fee,
        tax: financialResult.order.tax,
        total: financialResult.order.total,
        shipping_address_id,
        billing_address_id: billingAddressId,
        notes,
        metadata: {
          shiprocket_payload: financialResult.shiprocket_payload,
          financial_breakdown: financialResult.order,
        },
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
        amount: financialResult.order.total,
        currency: 'INR',
        status: payment_method === 'cod' ? 'created' : 'created',
        payment_method: payment_method || 'cod',
        payment_metadata: {
          created_via: 'web',
          user_agent: request.headers.get('user-agent') || 'unknown',
          razorpay_amount_paise: financialResult.razorpay_amount_paise,
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

    // Return order with Shiprocket payload for potential shipment creation
    return NextResponse.json({
      success: true,
      order,
      financials: financialResult.order,
      shiprocket_ready: true,
      shiprocket_payload: financialResult.shiprocket_payload,
    })
  } catch (error) {
    console.error('Order creation error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create order' },
      { status: 500 }
    )
  }
}