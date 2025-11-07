import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('Shiprocket webhook received:', body)
    
    const supabase = await createClient()

    // Shiprocket sends tracking updates with this structure
    const { 
      shipment_id, 
      awb, 
      current_status, 
      delivered, 
      rto,
      pickup_date,
      delivered_date,
      courier_name,
      // ... other fields
    } = body

    if (!shipment_id) {
      console.error('No shipment_id in webhook')
      return NextResponse.json({ error: 'Missing shipment_id' }, { status: 400 })
    }

    // Find the shipment in our database
    const { data: shipment, error: findError } = await supabase
      .from('shipments')
      .select('*')
      .eq('shiprocket_shipment_id', shipment_id.toString())
      .single()

    if (findError || !shipment) {
      console.error('Shipment not found:', shipment_id)
      return NextResponse.json({ error: 'Shipment not found' }, { status: 404 })
    }

    // Determine new status based on Shiprocket data
    let newStatus = shipment.status
    if (delivered) {
      newStatus = 'delivered'
    } else if (rto) {
      newStatus = 'returned'
    } else if (pickup_date) {
      newStatus = 'in_transit'
    }

    // Update shipment with latest tracking info
    const { error: updateError } = await supabase
      .from('shipments')
      .update({
        status: newStatus,
        awb_code: awb || shipment.awb_code,
        courier_name: courier_name || shipment.courier_name,
        current_status: current_status,
        pickup_date: pickup_date || shipment.pickup_date,
        delivered_date: delivered_date || shipment.delivered_date,
        // Add the webhook data to tracking_updates array
        tracking_updates: [
          ...(shipment.tracking_updates || []),
          {
            timestamp: new Date().toISOString(),
            status: current_status,
            location: body.location || '',
            description: body.description || '',
            webhook_data: body
          }
        ]
      })
      .eq('id', shipment.id)

    if (updateError) {
      console.error('Failed to update shipment:', updateError)
      return NextResponse.json({ error: 'Update failed' }, { status: 500 })
    }

    // If delivered, also update the order status
    if (newStatus === 'delivered') {
      await supabase
        .from('orders')
        .update({ status: 'delivered' })
        .eq('id', shipment.order_id)
    }

    console.log(`Shipment ${shipment_id} updated to status: ${newStatus}`)
    
    return NextResponse.json({ 
      success: true, 
      shipment_id,
      updated_status: newStatus 
    })

  } catch (error) {
    console.error('Shiprocket webhook error:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}

// Shiprocket also sends GET requests to verify webhook endpoint
export async function GET() {
  return NextResponse.json({ status: 'Shiprocket webhook endpoint active' })
}