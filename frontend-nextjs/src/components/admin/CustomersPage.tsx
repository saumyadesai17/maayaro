'use client';

import { useState } from 'react';
import { Search, Eye, Mail, Phone, MapPin, ShoppingBag, ChevronLeft } from 'lucide-react';
import { mockData } from '../../data/mockData';

export function CustomersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);

  const customers = mockData.profiles.filter(p => p.role === 'customer');

  const getCustomerOrders = (userId: string) => mockData.orders.filter(o => o.user_id === userId);
  const getCustomerAddresses = (userId: string) => mockData.addresses.filter(a => a.user_id === userId);
  const getCustomerTotalSpent = (userId: string) => {
    const orders = getCustomerOrders(userId);
    return orders.reduce((sum, order) => sum + order.total, 0);
  };

  const filteredCustomers = customers.filter(customer =>
    customer.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone?.includes(searchTerm)
  ).map(customer => ({
    ...customer,
    totalOrders: getCustomerOrders(customer.id).length,
    totalSpent: getCustomerTotalSpent(customer.id),
  }));

  if (selectedCustomer) {
    const orders = getCustomerOrders(selectedCustomer.id);
    const addresses = getCustomerAddresses(selectedCustomer.id);
    const totalSpent = getCustomerTotalSpent(selectedCustomer.id);

    return (
      <div className="p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => setSelectedCustomer(null)}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Customers
          </button>
          <h1 className="text-3xl mb-2">{selectedCustomer.full_name || 'Customer'}</h1>
          <p className="text-muted-foreground">Customer since {new Date(selectedCustomer.created_at).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Customer Info */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white border border-border rounded-lg p-6">
              <h3 className="text-lg mb-4">Contact Information</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-muted-foreground mb-1">Email</p>
                    <p className="text-sm break-all">{selectedCustomer.email}</p>
                  </div>
                </div>
                {selectedCustomer.phone && (
                  <div className="flex items-start gap-3">
                    <Phone className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground mb-1">Phone</p>
                      <p className="text-sm">{selectedCustomer.phone}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white border border-border rounded-lg p-6">
              <h3 className="text-lg mb-4">Statistics</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Orders</p>
                  <p className="text-2xl">{orders.length}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Spent</p>
                  <p className="text-2xl">₹{totalSpent.toLocaleString('en-IN')}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Average Order Value</p>
                  <p className="text-xl">₹{orders.length > 0 ? (totalSpent / orders.length).toLocaleString('en-IN', { maximumFractionDigits: 0 }) : 0}</p>
                </div>
              </div>
            </div>

            {/* Addresses */}
            {addresses.length > 0 && (
              <div className="bg-white border border-border rounded-lg p-6">
                <h3 className="text-lg mb-4">Saved Addresses</h3>
                <div className="space-y-4">
                  {addresses.map(address => (
                    <div key={address.id} className="text-sm space-y-1 p-3 bg-secondary/30 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs px-2 py-1 bg-background rounded">{address.type}</span>
                        {address.is_default && (
                          <span className="text-xs text-green-600">Default</span>
                        )}
                      </div>
                      <p>{address.full_name}</p>
                      <p className="text-muted-foreground">{address.address_line1}</p>
                      {address.address_line2 && <p className="text-muted-foreground">{address.address_line2}</p>}
                      <p className="text-muted-foreground">
                        {address.city}, {address.state} {address.postal_code}
                      </p>
                      <p className="text-muted-foreground pt-1">{address.phone}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Order History */}
          <div className="lg:col-span-2">
            <div className="bg-white border border-border rounded-lg overflow-hidden">
              <div className="p-6 border-b border-border">
                <h3 className="text-lg">Order History ({orders.length})</h3>
              </div>
              {orders.length > 0 ? (
                <div className="divide-y divide-border">
                  {orders.map(order => {
                    const items = mockData.order_items.filter(i => i.order_id === order.id);
                    const statusConfig: any = {
                      delivered: { color: 'bg-green-50 text-green-700 border-green-200', label: 'Delivered' },
                      shipped: { color: 'bg-blue-50 text-blue-700 border-blue-200', label: 'Shipped' },
                      processing: { color: 'bg-yellow-50 text-yellow-700 border-yellow-200', label: 'Processing' },
                      pending: { color: 'bg-gray-50 text-gray-700 border-gray-200', label: 'Pending' },
                    };
                    const config = statusConfig[order.status] || statusConfig.pending;

                    return (
                      <div key={order.id} className="p-6 hover:bg-secondary/30 transition-colors">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <p className="font-mono text-sm mb-1">{order.order_number}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(order.created_at).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric'
                              })}
                            </p>
                          </div>
                          <span className={`text-xs px-3 py-1 rounded border ${config.color}`}>
                            {config.label}
                          </span>
                        </div>
                        <div className="space-y-2 mb-3">
                          {items.map(item => (
                            <p key={item.id} className="text-sm">
                              {item.quantity}x {item.product_name}
                            </p>
                          ))}
                        </div>
                        <div className="flex items-center justify-between pt-3 border-t border-border">
                          <p className="text-sm text-muted-foreground">{items.length} items</p>
                          <p className="text-lg">₹{order.total.toLocaleString('en-IN')}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-12 text-center text-muted-foreground">
                  <ShoppingBag className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No orders yet</p>
                </div>
              )}
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
        <h1 className="text-3xl mb-2">Customers</h1>
        <p className="text-muted-foreground">Manage your customer base</p>
      </div>

      {/* Search */}
      <div className="bg-white border border-border rounded-lg p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-border rounded-lg focus:outline-none focus:border-foreground transition-colors"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-white border border-border rounded-lg p-6">
          <p className="text-sm text-muted-foreground mb-1">Total Customers</p>
          <p className="text-2xl">{customers.length}</p>
        </div>
        <div className="bg-white border border-border rounded-lg p-6">
          <p className="text-sm text-muted-foreground mb-1">With Orders</p>
          <p className="text-2xl">{customers.filter(c => getCustomerOrders(c.id).length > 0).length}</p>
        </div>
        <div className="bg-white border border-border rounded-lg p-6">
          <p className="text-sm text-muted-foreground mb-1">New This Month</p>
          <p className="text-2xl">
            {customers.filter(c => {
              const created = new Date(c.created_at);
              const now = new Date();
              return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
            }).length}
          </p>
        </div>
        <div className="bg-white border border-border rounded-lg p-6">
          <p className="text-sm text-muted-foreground mb-1">Total Revenue</p>
          <p className="text-2xl">₹{customers.reduce((sum, c) => sum + getCustomerTotalSpent(c.id), 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
        </div>
      </div>

      {/* Customers Table - Desktop */}
      <div className="hidden lg:block bg-white border border-border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-secondary/50 border-b border-border">
            <tr>
              <th className="text-left p-4 text-sm">Customer</th>
              <th className="text-left p-4 text-sm">Contact</th>
              <th className="text-left p-4 text-sm">Orders</th>
              <th className="text-left p-4 text-sm">Total Spent</th>
              <th className="text-left p-4 text-sm">Joined</th>
              <th className="text-left p-4 text-sm">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredCustomers.map((customer) => (
              <tr key={customer.id} className="hover:bg-secondary/30 transition-colors">
                <td className="p-4">
                  <div>
                    <p className="mb-1">{customer.full_name || 'N/A'}</p>
                    <p className="text-sm text-muted-foreground">{customer.email}</p>
                  </div>
                </td>
                <td className="p-4">
                  <p className="text-sm">{customer.phone || 'N/A'}</p>
                </td>
                <td className="p-4">
                  <span className="text-sm">{customer.totalOrders}</span>
                </td>
                <td className="p-4">
                  <span className="text-sm">₹{customer.totalSpent.toLocaleString('en-IN')}</span>
                </td>
                <td className="p-4">
                  <span className="text-sm">
                    {new Date(customer.created_at).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </span>
                </td>
                <td className="p-4">
                  <button
                    onClick={() => setSelectedCustomer(customer)}
                    className="p-2 hover:bg-secondary rounded-lg transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Customers Grid - Mobile */}
      <div className="lg:hidden grid grid-cols-1 gap-4">
        {filteredCustomers.map((customer) => (
          <div key={customer.id} className="bg-white border border-border rounded-lg p-4">
            <div className="mb-3">
              <h3 className="mb-1">{customer.full_name || 'N/A'}</h3>
              <p className="text-sm text-muted-foreground mb-2">{customer.email}</p>
              {customer.phone && <p className="text-sm text-muted-foreground">{customer.phone}</p>}
            </div>
            
            <div className="grid grid-cols-3 gap-3 mb-4 text-sm">
              <div>
                <p className="text-muted-foreground mb-1">Orders</p>
                <p>{customer.totalOrders}</p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">Spent</p>
                <p>₹{customer.totalSpent.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">Joined</p>
                <p>{new Date(customer.created_at).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}</p>
              </div>
            </div>
            
            <button
              onClick={() => setSelectedCustomer(customer)}
              className="w-full px-4 py-2 border border-border hover:bg-secondary rounded-lg transition-colors text-sm flex items-center justify-center gap-2"
            >
              <Eye className="w-4 h-4" />
              View Details
            </button>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredCustomers.length === 0 && (
        <div className="bg-white border border-border rounded-lg p-12 text-center">
          <p className="text-muted-foreground">No customers found</p>
        </div>
      )}
    </div>
  );
}
