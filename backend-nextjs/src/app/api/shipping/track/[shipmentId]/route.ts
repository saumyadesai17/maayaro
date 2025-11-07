import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { shiprocketRequest } from '@/lib/shiprocket'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ shipmentId: string }> }
) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { shipmentId } = await params

    const { data: shipment } = await supabase
      .from('shipments')
      .select('*, order:orders(user_id)')
      .eq('id', shipmentId)
      .single()

    if (!shipment || (shipment.order as any)?.user_id !== user.id) {
      return NextResponse.json({ error: 'Shipment not found' }, { status: 404 })
    }

    console.log('Fetching tracking for shipment:', shipment.shiprocket_shipment_id)

    // Get tracking from Shiprocket
    const trackingData = await shiprocketRequest(
      `/courier/track/shipment/${shipment.shiprocket_shipment_id}`
    )

    console.log('Shiprocket tracking response:', trackingData)

    // Handle Shiprocket response structure: response[shipmentId].tracking_data
    let trackingUpdates = []
    let awbCode = shipment.awb_code || ''
    let courierName = shipment.courier_name || ''
    let trackStatus = 0
    let shipmentStatus = 0

    // Get the tracking data for this specific shipment ID
    const shipmentData = trackingData[shipment.shiprocket_shipment_id]
    
    if (shipmentData && shipmentData.tracking_data) {
      const trackingData_inner = shipmentData.tracking_data
      
      trackingUpdates = trackingData_inner.shipment_track || []
      trackStatus = trackingData_inner.track_status || 0
      shipmentStatus = trackingData_inner.shipment_status || 0
      
      // Get AWB and courier info from the first tracking entry if available
      if (trackingUpdates.length > 0) {
        awbCode = trackingUpdates[0].awb_code || awbCode
        courierName = trackingUpdates[0].courier_name || courierName
      }
      
      console.log('Parsed tracking data:', {
        trackingUpdates: trackingUpdates.length,
        awbCode,
        courierName,
        trackStatus,
        shipmentStatus
      })
    }

    // Update shipment with latest info if we got valid data
    if (trackingUpdates.length > 0 || awbCode || courierName) {
      await supabase
        .from('shipments')
        .update({
          tracking_updates: trackingUpdates,
          awb_code: awbCode,
          courier_name: courierName,
        })
        .eq('id', shipmentId)
    }

    // Return formatted response
    return NextResponse.json({
      shipment_id: shipment.shiprocket_shipment_id,
      order_number: shipment.order?.order_number || 'N/A',
      awb_code: awbCode,
      courier_name: courierName,
      status: shipment.status,
      track_status: trackStatus,
      shipment_status: shipmentStatus,
      tracking_updates: trackingUpdates,
      shiprocket_error: shipmentData?.tracking_data?.error || null,
      raw_response: trackingData // Include raw response for debugging
    })
  } catch (error) {
    console.error('Tracking error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tracking' },
      { status: 500 }
    )
  }
}