'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export function OrderTracker({ orderId }: { orderId: string }) {
  const [order, setOrder] = useState<any>(null)
  const [shipment, setShipment] = useState<any>(null)
  const supabase = createClient()

  useEffect(() => {
    // Fetch initial data
    fetchOrderData()

    // Subscribe to real-time updates
    const orderChannel = supabase
      .channel(`order-${orderId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `id=eq.${orderId}`,
        },
        (payload) => {
          setOrder(payload.new)
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'shipments',
          filter: `order_id=eq.${orderId}`,
        },
        (payload) => {
          setShipment(payload.new)
        }
      )
      .subscribe()

    return () => {
      orderChannel.unsubscribe()
    }
  }, [orderId])

  async function fetchOrderData() {
    const { data } = await supabase
      .from('orders')
      .select('*, shipments(*)')
      .eq('id', orderId)
      .single()

    setOrder(data)
    setShipment(data?.shipments?.[0])
  }

  return (
    <div>
      <h2>Order Status: {order?.status}</h2>
      {shipment && (
        <div>
          <p>Tracking: {shipment.awb_code}</p>
          <p>Courier: {shipment.courier_name}</p>
          <p>Status: {shipment.status}</p>
        </div>
      )}
    </div>
  )
}