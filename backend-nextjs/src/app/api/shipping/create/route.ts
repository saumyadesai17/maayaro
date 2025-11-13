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
        shipping_address:addresses!orders_shipping_address_id_fkey(*),
        billing_address:addresses!orders_billing_address_id_fkey(*)
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

    // Check if shipment already exists
    const { data: existingShipment } = await supabase
      .from('shipments')
      .select('*')
      .eq('order_id', orderId)
      .single()

    if (existingShipment) {
      return NextResponse.json({
        success: true,
        message: 'Shipment already exists',
        shipment: existingShipment,
      })
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

    // Use Shiprocket payload from order metadata if available (from new finance function)
    let shiprocketOrder = order.metadata?.shiprocket_payload

    if (shiprocketOrder) {
      // Update with actual order number
      shiprocketOrder = {
        ...shiprocketOrder,
        order_id: order.order_number,
        invoice_number: `INV-${order.order_number}`,
        order_date: new Date(order.created_at).toISOString().split('T')[0] + ' ' + 
                    new Date(order.created_at).toTimeString().split(' ')[0].substring(0, 5),
      }
      console.log('Using pre-computed Shiprocket payload from order metadata')
    } else {
      // Fallback: Build payload manually (for older orders)
      console.log('Building Shiprocket payload manually (legacy order)')
      
      const shiprocketItems = order.order_items.map((item: any) => {
        const itemTaxAmount = order.tax ? (item.total_price / order.subtotal) * order.tax : 0
        const taxInclusivePrice = (parseFloat(item.unit_price) || 0) + itemTaxAmount
        
        return {
          name: item.product_name || 'Product',
          sku: item.variant_details?.sku || item.sku || 'GENERIC-SKU',
          units: parseInt(item.quantity) || 1,
          selling_price: Math.round(taxInclusivePrice),
          discount: 0,
          tax: 18, // Default GST
        }
      })

      shiprocketOrder = {
        order_id: order.order_number,
        order_date: new Date(order.created_at).toISOString().split('T')[0] + ' ' + 
                    new Date(order.created_at).toTimeString().split(' ')[0].substring(0, 5),
        pickup_location: 'warehouse',
        
        billing_customer_name: order.billing_address?.full_name?.split(' ')[0] || 'Customer',
        billing_last_name: order.billing_address?.full_name?.split(' ').slice(1).join(' ') || '',
        billing_address: order.billing_address?.address_line1 || '',
        billing_address_2: order.billing_address?.address_line2 || '',
        billing_city: order.billing_address?.city || '',
        billing_pincode: order.billing_address?.postal_code || '',
        billing_state: order.billing_address?.state || '',
        billing_country: order.billing_address?.country || 'India',
        billing_email: user.email || '',
        billing_phone: order.billing_address?.phone || '',
        billing_isd_code: '+91',
        
        shipping_is_billing: order.shipping_address_id === order.billing_address_id,
        shipping_customer_name: order.shipping_address_id !== order.billing_address_id ? 
          order.shipping_address?.full_name?.split(' ')[0] : undefined,
        shipping_last_name: order.shipping_address_id !== order.billing_address_id ? 
          order.shipping_address?.full_name?.split(' ').slice(1).join(' ') : undefined,
        shipping_address: order.shipping_address_id !== order.billing_address_id ? 
          order.shipping_address?.address_line1 : undefined,
        shipping_city: order.shipping_address_id !== order.billing_address_id ? 
          order.shipping_address?.city : undefined,
        shipping_pincode: order.shipping_address_id !== order.billing_address_id ? 
          order.shipping_address?.postal_code : undefined,
        shipping_state: order.shipping_address_id !== order.billing_address_id ? 
          order.shipping_address?.state : undefined,
        shipping_country: order.shipping_address_id !== order.billing_address_id ? 
          order.shipping_address?.country : undefined,
        shipping_email: order.shipping_address_id !== order.billing_address_id ? 
          user.email : undefined,
        shipping_phone: order.shipping_address_id !== order.billing_address_id ? 
          order.shipping_address?.phone : undefined,
        
        order_items: shiprocketItems,
        payment_method: 'Prepaid',
        shipping_charges: order.shipping_fee || 0,
        total_discount: order.discount || 0,
        sub_total: order.subtotal,
        
        length: body.length || 20,
        breadth: body.breadth || 15,
        height: body.height || 10,
        weight: body.weight || 0.5,
      }
    }

    console.log('Shiprocket order payload:', JSON.stringify(shiprocketOrder, null, 2))

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