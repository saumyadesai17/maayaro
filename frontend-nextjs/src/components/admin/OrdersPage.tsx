'use client';

import { motion, AnimatePresence } from 'motion/react';
import { Search, Filter, Eye, Download, Truck, ChevronDown, X, ChevronLeft, Package, MapPin, CreditCard } from 'lucide-react';
import { useState } from 'react';
import { mockData } from '../../data/mockData';

interface OrdersPageProps {
  orderId?: string;
  onNavigate?: (page: string, id?: string) => void;
}

export function OrdersPage({ orderId, onNavigate }: OrdersPageProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'list' | 'detail'>(orderId ? 'detail' : 'list');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(orderId || null);

  const orders = mockData.orders.map(order => {
    const user = mockData.profiles.find(p => p.id === order.user_id);
    const items = mockData.order_items.filter(item => item.order_id === order.id);
    const payment = mockData.payments.find(p => p.order_id === order.id);
    const shipment = mockData.shipments.find(s => s.order_id === order.id);
    const address = mockData.addresses.find(a => a.id === order.shipping_address_id);
    
    return {
      ...order,
      customer_name: user?.full_name || 'Unknown',
      customer_email: user?.email || '',
      items_count: items.length,
      items: items,
      payment: payment,
      shipment: shipment,
      shipping_address: address,
    };
  });

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.customer_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || order.status === selectedStatus;
    
    return matchesSearch && matchesStatus;
  });

  const selectedOrder = selectedOrderId ? orders.find(o => o.id === selectedOrderId) : null;

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'delivered':
        return { color: 'bg-green-50 text-green-700 border-green-200', label: 'Delivered' };
      case 'shipped':
        return { color: 'bg-blue-50 text-blue-700 border-blue-200', label: 'Shipped' };
      case 'processing':
        return { color: 'bg-yellow-50 text-yellow-700 border-yellow-200', label: 'Processing' };
      case 'pending':
        return { color: 'bg-gray-50 text-gray-700 border-gray-200', label: 'Pending' };
      case 'cancelled':
        return { color: 'bg-red-50 text-red-700 border-red-200', label: 'Cancelled' };
      default:
        return { color: 'bg-gray-50 text-gray-700 border-gray-200', label: status };
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDateShort = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  if (viewMode === 'detail' && selectedOrder) {
    return (
      <div className="p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => {
              setViewMode('list');
              setSelectedOrderId(null);
            }}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Orders
          </button>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl mb-2">{selectedOrder.order_number}</h1>
              <p className="text-muted-foreground">
                Placed on {formatDate(selectedOrder.created_at)}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className={`px-4 py-2 rounded border text-sm ${getStatusConfig(selectedOrder.status).color}`}>
                {getStatusConfig(selectedOrder.status).label}
              </span>
              <button className="p-2.5 border border-border hover:bg-secondary rounded-lg transition-colors">
                <Download className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Order Items & Timeline */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Items */}
            <div className="bg-white border border-border rounded-lg overflow-hidden">
              <div className="p-6 border-b border-border">
                <h3 className="text-lg">Order Items ({selectedOrder.items.length})</h3>
              </div>
              <div className="divide-y divide-border">
                {selectedOrder.items.map((item) => (
                  <div key={item.id} className="p-4 flex gap-4">
                    <div className="w-20 h-24 bg-muted rounded flex-shrink-0" />
                    <div className="flex-1">
                      <h4 className="mb-2">{item.product_name}</h4>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p>SKU: {item.variant_details.sku}</p>
                        <p>{item.variant_details.color} • {item.variant_details.size}</p>
                        <p>Quantity: {item.quantity} × ₹{item.unit_price.toLocaleString('en-IN')}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg">₹{item.total_price.toLocaleString('en-IN')}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipment Tracking */}
            {selectedOrder.shipment && (
              <div className="bg-white border border-border rounded-lg p-6">
                <h3 className="text-lg mb-6">Shipment Tracking</h3>
                
                <div className="mb-6 p-4 bg-secondary rounded-lg">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground mb-1">AWB Code</p>
                      <p className="font-mono">{selectedOrder.shipment.awb_code}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground mb-1">Courier</p>
                      <p>{selectedOrder.shipment.courier_name}</p>
                    </div>
                    {selectedOrder.shipment.estimated_delivery_date && (
                      <div>
                        <p className="text-muted-foreground mb-1">Est. Delivery</p>
                        <p>{formatDateShort(selectedOrder.shipment.estimated_delivery_date)}</p>
                      </div>
                    )}
                    {selectedOrder.shipment.tracking_url && (
                      <div>
                        <a 
                          href={selectedOrder.shipment.tracking_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline text-sm"
                        >
                          Track Shipment →
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                {/* Tracking Timeline */}
                <div className="relative pl-8 border-l-2 border-border ml-2">
                  {selectedOrder.shipment.tracking_updates.map((update: any, index: number) => (
                    <div key={index} className="relative mb-8 last:mb-0">
                      <div className="absolute -left-[2.1rem] w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                        <div className="w-3 h-3 bg-white rounded-full" />
                      </div>
                      <div>
                        <p className="mb-1">{update.status}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(update.timestamp)} • {update.location}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Order Summary & Details */}
          <div className="lg:col-span-1 space-y-6">
            {/* Order Summary */}
            <div className="bg-white border border-border rounded-lg p-6">
              <h3 className="text-lg mb-4">Order Summary</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>₹{selectedOrder.subtotal.toLocaleString('en-IN')}</span>
                </div>
                {selectedOrder.discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-₹{selectedOrder.discount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>{selectedOrder.shipping_fee === 0 ? 'FREE' : `₹${selectedOrder.shipping_fee.toLocaleString('en-IN')}`}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax (GST)</span>
                  <span>₹{selectedOrder.tax.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between pt-3 border-t border-border text-lg">
                  <span>Total</span>
                  <span>₹{selectedOrder.total.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            {/* Customer Info */}
            <div className="bg-white border border-border rounded-lg p-6">
              <h3 className="text-lg mb-4">Customer Information</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-muted-foreground mb-1">Name</p>
                  <p>{selectedOrder.customer_name}</p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">Email</p>
                  <p className="break-all">{selectedOrder.customer_email}</p>
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            {selectedOrder.shipping_address && (
              <div className="bg-white border border-border rounded-lg p-6">
                <h3 className="text-lg mb-4">Shipping Address</h3>
                <div className="text-sm space-y-1">
                  <p>{selectedOrder.shipping_address.full_name}</p>
                  <p className="text-muted-foreground">{selectedOrder.shipping_address.address_line1}</p>
                  {selectedOrder.shipping_address.address_line2 && (
                    <p className="text-muted-foreground">{selectedOrder.shipping_address.address_line2}</p>
                  )}
                  <p className="text-muted-foreground">
                    {selectedOrder.shipping_address.city}, {selectedOrder.shipping_address.state} {selectedOrder.shipping_address.postal_code}
                  </p>
                  <p className="text-muted-foreground pt-2">Phone: {selectedOrder.shipping_address.phone}</p>
                </div>
              </div>
            )}

            {/* Payment Info */}
            {selectedOrder.payment && (
              <div className="bg-white border border-border rounded-lg p-6">
                <h3 className="text-lg mb-4">Payment Information</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status</span>
                    <span className={`px-2 py-1 rounded ${
                      selectedOrder.payment.status === 'success' 
                        ? 'bg-green-50 text-green-700' 
                        : 'bg-gray-50 text-gray-700'
                    }`}>
                      {selectedOrder.payment.status}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Method</span>
                    <span>{selectedOrder.payment.payment_method}</span>
                  </div>
                  {selectedOrder.payment.razorpay_payment_id && (
                    <div>
                      <p className="text-muted-foreground mb-1">Payment ID</p>
                      <p className="font-mono text-xs break-all">{selectedOrder.payment.razorpay_payment_id}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Update Status */}
            <div className="bg-white border border-border rounded-lg p-6">
              <h3 className="text-lg mb-4">Update Order Status</h3>
              <select className="w-full px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:border-foreground transition-colors mb-3">
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <button className="w-full px-4 py-2.5 bg-foreground text-background hover:bg-primary transition-colors rounded-lg">
                Update Status
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl mb-2">Orders</h1>
        <p className="text-muted-foreground">Manage and track all customer orders</p>
      </div>

      {/* Filters Bar */}
      <div className="bg-white border border-border rounded-lg p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by order number or customer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-border rounded-lg focus:outline-none focus:border-foreground transition-colors"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:border-foreground transition-colors appearance-none bg-white"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="mb-4 text-sm text-muted-foreground">
        Showing {filteredOrders.length} of {orders.length} orders
      </div>

      {/* Orders Table - Desktop */}
      <div className="hidden lg:block bg-white border border-border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-secondary/50 border-b border-border">
            <tr>
              <th className="text-left p-4 text-sm">Order</th>
              <th className="text-left p-4 text-sm">Customer</th>
              <th className="text-left p-4 text-sm">Date</th>
              <th className="text-left p-4 text-sm">Items</th>
              <th className="text-left p-4 text-sm">Total</th>
              <th className="text-left p-4 text-sm">Status</th>
              <th className="text-left p-4 text-sm">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredOrders.map((order) => (
              <tr key={order.id} className="hover:bg-secondary/30 transition-colors">
                <td className="p-4">
                  <span className="font-mono text-sm">{order.order_number}</span>
                </td>
                <td className="p-4">
                  <div>
                    <p className="text-sm">{order.customer_name}</p>
                    <p className="text-xs text-muted-foreground">{order.customer_email}</p>
                  </div>
                </td>
                <td className="p-4">
                  <span className="text-sm">{formatDateShort(order.created_at)}</span>
                </td>
                <td className="p-4">
                  <span className="text-sm">{order.items_count}</span>
                </td>
                <td className="p-4">
                  <span className="text-sm">₹{order.total.toLocaleString('en-IN')}</span>
                </td>
                <td className="p-4">
                  <span className={`text-xs px-2 py-1 rounded border ${getStatusConfig(order.status).color}`}>
                    {getStatusConfig(order.status).label}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setSelectedOrderId(order.id);
                        setViewMode('detail');
                      }}
                      className="p-2 hover:bg-secondary rounded-lg transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className="p-2 hover:bg-secondary rounded-lg transition-colors">
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Orders Grid - Mobile */}
      <div className="lg:hidden grid grid-cols-1 gap-4">
        {filteredOrders.map((order) => (
          <div key={order.id} className="bg-white border border-border rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="font-mono text-sm">{order.order_number}</span>
              <span className={`text-xs px-2 py-1 rounded border ${getStatusConfig(order.status).color}`}>
                {getStatusConfig(order.status).label}
              </span>
            </div>
            
            <div className="space-y-2 text-sm mb-4">
              <p>{order.customer_name}</p>
              <p className="text-muted-foreground">{formatDateShort(order.created_at)}</p>
              <p>{order.items_count} items • ₹{order.total.toLocaleString('en-IN')}</p>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setSelectedOrderId(order.id);
                  setViewMode('detail');
                }}
                className="flex-1 px-4 py-2 border border-border hover:bg-secondary rounded-lg transition-colors text-sm flex items-center justify-center gap-2"
              >
                <Eye className="w-4 h-4" />
                View Details
              </button>
              <button className="p-2 border border-border hover:bg-secondary rounded-lg transition-colors">
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredOrders.length === 0 && (
        <div className="bg-white border border-border rounded-lg p-12 text-center">
          <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg mb-2">No orders found</h3>
          <p className="text-muted-foreground">
            {searchTerm || selectedStatus !== 'all'
              ? 'Try adjusting your filters'
              : 'No orders have been placed yet'}
          </p>
        </div>
      )}
    </div>
  );
}
