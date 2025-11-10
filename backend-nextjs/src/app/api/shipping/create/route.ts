import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { shiprocketRequest } from '@/lib/shiprocket'

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
    const orderId = body.order_id || body.orderId
    const { length, breadth, height, weight } = body

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 })
    }

    console.log('Creating shipment for order:', orderId)

    // Get order with items and addresses
    const { data: order, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items(*),
        shipping_address:addresses!orders_shipping_address_id_fkey(*)
      `)
      .eq('id', orderId)
      .eq('user_id', user.id)
      .single()

    if (error || !order) {
      console.error('Order fetch error:', error)
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Check order status - allow pending status if called immediately after payment
    console.log('Checking order status:', order.status)
    if (!['confirmed', 'processing', 'pending'].includes(order.status)) {
      console.error('Order status not valid for shipping:', order.status)
      return NextResponse.json(
        { error: `Order cannot be shipped with status: ${order.status}` },
        { status: 400 }
      )
    }

    console.log('Order found:', order.order_number)
    console.log('Order items:', order.order_items)

    // Check if order has items
    if (!order.order_items || order.order_items.length === 0) {
      return NextResponse.json(
        { error: 'Order has no items' },
        { status: 400 }
      )
    }

    // Map order items for Shiprocket
    // IMPORTANT: Shiprocket's tax calculation is complex and depends on state codes
    // For inter-state (different state codes), they automatically apply IGST
    // We send the tax-INCLUSIVE selling price and let them calculate tax breakdown
    const shiprocketItems = order.order_items.map((item: any) => {
      console.log('Mapping item:', item)
      
      // Calculate proportional tax for this item
      const itemTaxAmount = order.tax ? (item.total_price / order.subtotal) * order.tax : 0;
      
      // Send tax-inclusive price as selling_price
      const taxInclusivePrice = (parseFloat(item.unit_price) || 0) + itemTaxAmount;
      
      return {
        name: item.product_name || 'Product',
        sku: item.variant_details?.sku || item.sku || 'GENERIC-SKU',
        units: parseInt(item.quantity) || 1,
        selling_price: Math.round(taxInclusivePrice), // Tax-inclusive price
        discount: 0,
        tax: 0, // Let Shiprocket calculate tax from the inclusive price
      }
    })

    console.log('Shiprocket items:', shiprocketItems)

    // Create Shiprocket order
    const shiprocketOrder = {
      order_id: order.order_number,
      order_date: new Date(order.created_at).toISOString().split('T')[0],
      pickup_location: 'warehouse', // Use your actual pickup location name
      billing_customer_name: order.shipping_address.full_name,
      billing_last_name: '',
      billing_address: order.shipping_address.address_line1,
      billing_address_2: order.shipping_address.address_line2 || '',
      billing_city: order.shipping_address.city,
      billing_pincode: order.shipping_address.postal_code,
      billing_state: order.shipping_address.state,
      billing_country: order.shipping_address.country,
      billing_email: user.email,
      billing_phone: order.shipping_address.phone,
      shipping_is_billing: true,
      order_items: shiprocketItems,
      payment_method: 'Prepaid',
      shipping_charges: order.shipping_fee || 0,
      giftwrap_charges: 0,
      transaction_charges: 0,
      total_discount: order.discount || 0,
      sub_total: order.subtotal,
      length: length || 20, // In cm - from request or default
      breadth: breadth || 15,
      height: height || 10,
      weight: weight || 0.5, // In kg - from request or default
    }

    console.log('Shiprocket order payload:', JSON.stringify(shiprocketOrder, null, 2))
    
    // Calculate expected Shiprocket total for validation
    const expectedShiprocketTotal = order.subtotal + (order.shipping_fee || 0) + order.tax - (order.discount || 0);
    console.log('Expected Shiprocket Total:', expectedShiprocketTotal, '(should match order.total:', order.total, ')');
    console.log('Breakdown: subtotal', order.subtotal, '+ shipping', order.shipping_fee, '+ tax', order.tax, '- discount', order.discount);

    const data = await shiprocketRequest('/orders/create/adhoc', {
      method: 'POST',
      body: JSON.stringify(shiprocketOrder),
    })

    console.log('Shiprocket response:', data)

    // Save shipment info
    const { data: shipment, error: shipmentError } = await supabase
      .from('shipments')
      .insert({
        order_id: orderId,
        shiprocket_order_id: data.order_id,
        shiprocket_shipment_id: data.shipment_id,
        awb_code: data.awb_code,
        courier_name: data.courier_name,
        status: 'pending',
      })
      .select()
      .single()

    if (shipmentError) {
      console.error('Shipment save error:', shipmentError)
    }

    // Update order status
    await supabase
      .from('orders')
      .update({ status: 'processing' })
      .eq('id', orderId)

    return NextResponse.json({ 
      success: true, 
      shipment,
      shiprocket_data: data 
    })
  } catch (error: any) {
    console.error('Shipment creation error:', error)
    console.error('Error details:', error?.message, error?.response)
    return NextResponse.json(
      { 
        error: 'Failed to create shipment',
        details: error?.message || 'Unknown error'
      },
      { status: 500 }
    )
  }
}