'use client';

import { motion } from 'motion/react';
import { ImageWithFallback } from '@/components/figma/ImageWithFallback';
import { useEffect, useState } from 'react';
import { Loader2, Package } from 'lucide-react';

interface OrderItem {
  id: string;
  product_name: string;
  product_variant: {
    product: {
      images: {
        id: string;
        image_url: string;
        alt_text: string | null;
        is_primary: boolean;
        sort_order: number;
      }[];
    };
  };
  variant_details: {
    size: string;
    color: string;
  };
  quantity: number;
  unit_price: number;
  total_price: number;
}

interface Order {
  id: string;
  order_number: string;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  subtotal: number;
  discount: number;
  shipping_fee: number;
  tax: number;
  total: number;
  created_at: string;
  order_items: OrderItem[];
  shipment?: {
    tracking_number?: string;
  }[];
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch('/api/orders');
        const data = await response.json();
        
        if (response.ok && data.orders) {
          setOrders(data.orders);
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const getStatusColor = (status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled') => {
    switch (status) {
      case 'delivered':
        return 'text-green-600 bg-green-50';
      case 'shipped':
        return 'text-blue-600 bg-blue-50';
      case 'processing':
      case 'confirmed':
        return 'text-yellow-600 bg-yellow-50';
      case 'cancelled':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusText = (status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled') => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { 
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {orders.length === 0 ? (
        <div className="border border-dashed border-border bg-background p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center bg-muted rounded-full">
            <Package className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-light mb-2">No orders yet</h3>
          <p className="text-muted-foreground mb-6">
            When you place orders, they will appear here
          </p>
          <a
            href="/collection"
            className="inline-block px-8 py-3 bg-foreground text-background hover:bg-foreground/90 transition-colors"
          >
            Start Shopping
          </a>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="border border-border bg-background hover:shadow-sm transition-shadow">
              {/* Order Header */}
              <div className="p-4 md:p-6 border-b border-border bg-muted/20">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="text-sm text-muted-foreground">Order Number</p>
                      <p className="font-mono font-medium">{order.order_number}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-left sm:text-right">
                      <p className="text-sm text-muted-foreground">Order Date</p>
                      <p className="text-sm">{formatDate(order.created_at)}</p>
                    </div>
                    <span className={`inline-block px-3 py-1.5 text-xs font-medium ${getStatusColor(order.status)}`}>
                      {getStatusText(order.status)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="p-4 md:p-6 space-y-4">
                {order.order_items.map((item: OrderItem) => {
                  const productImage = item.product_variant?.product?.images?.find(img => img.is_primary)?.image_url 
                    || item.product_variant?.product?.images?.[0]?.image_url 
                    || '/placeholder-product.jpg';
                  
                  return (
                    <div key={item.id} className="flex gap-3 md:gap-4 pb-4 border-b border-border last:border-0 last:pb-0">
                      <div className="w-16 h-20 md:w-20 md:h-24 shrink-0 bg-muted overflow-hidden">
                        <ImageWithFallback
                          src={productImage}
                          alt={item.product_name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium line-clamp-2 mb-1">{item.product_name}</h4>
                        <p className="text-sm text-muted-foreground mb-1">
                          {item.variant_details.color} • {item.variant_details.size}
                        </p>
                        <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-medium">₹{item.unit_price.toLocaleString('en-IN')}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Order Footer */}
              <div className="p-4 md:p-6 bg-muted/20 border-t border-border">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    {order.shipment && order.shipment[0]?.tracking_number && (
                      <div>
                        <p className="text-sm text-muted-foreground">Tracking Number</p>
                        <p className="font-mono text-sm">{order.shipment[0].tracking_number}</p>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <div className="text-left sm:text-right">
                      <p className="text-sm text-muted-foreground">Total Amount</p>
                      <p className="text-lg font-medium">₹{order.total.toLocaleString('en-IN')}</p>
                    </div>
                    <div className="flex gap-2">
                      <button className="flex-1 sm:flex-none px-4 py-2 border border-border hover:bg-background transition-colors text-sm">
                        View Details
                      </button>
                      {order.status === 'delivered' && (
                        <button className="flex-1 sm:flex-none px-4 py-2 bg-foreground text-background hover:bg-foreground/90 transition-colors text-sm">
                          Reorder
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
