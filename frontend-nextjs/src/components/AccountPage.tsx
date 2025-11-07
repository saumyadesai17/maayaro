'use client';

import { motion } from 'motion/react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { User, MapPin, Package, Heart, LogOut, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { useStore } from '@/contexts/StoreContext';

interface AccountPageProps {
  onNavigate: (page: string) => void;
}

type Tab = 'profile' | 'orders' | 'addresses' | 'wishlist';

interface SavedAddress {
  id: string;
  type: 'billing' | 'shipping' | 'both';
  first_name: string;
  last_name: string;
  address_line_1: string;
  address_line_2?: string;
  city: string;
  state: string;
  postal_code: string;
  phone: string;
  is_default: boolean;
}

export function AccountPage({ onNavigate }: AccountPageProps) {
  const { getOrders, wishlistItems } = useStore();
  const [activeTab, setActiveTab] = useState<Tab>('orders');

  // Mock user profile data
  const userProfile = {
    first_name: 'Priya',
    last_name: 'Sharma',
    email: 'priya.sharma@example.com',
    phone: '+91 98765 43210',
    date_of_birth: '1995-06-15',
    gender: 'female',
  };

  // Get orders from localStorage via StoreContext
  const orders = getOrders();

  // Mock saved addresses
  const savedAddresses: SavedAddress[] = [
    {
      id: '1',
      type: 'both',
      first_name: 'Priya',
      last_name: 'Sharma',
      address_line_1: 'A-204, Sai Residency',
      address_line_2: 'Link Road, Andheri West',
      city: 'Mumbai',
      state: 'Maharashtra',
      postal_code: '400053',
      phone: '+91 98765 43210',
      is_default: true,
    },
    {
      id: '2',
      type: 'shipping',
      first_name: 'Priya',
      last_name: 'Sharma',
      address_line_1: '12, MG Road',
      city: 'Bangalore',
      state: 'Karnataka',
      postal_code: '560001',
      phone: '+91 98765 43210',
      is_default: false,
    },
  ];

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

  return (
    <div className="pt-16 min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-3xl md:text-4xl mb-2">My Account</h1>
          <p className="text-muted-foreground">
            Welcome back, {userProfile.first_name}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <nav className="space-y-2">
              {[
                { id: 'profile', label: 'Profile', icon: User },
                { id: 'orders', label: 'Orders', icon: Package },
                { id: 'addresses', label: 'Addresses', icon: MapPin },
                { id: 'wishlist', label: 'Wishlist', icon: Heart },
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as Tab)}
                    className={`w-full flex items-center gap-3 px-4 py-3 transition-colors ${
                      activeTab === tab.id
                        ? 'bg-foreground text-background'
                        : 'hover:bg-secondary'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
              <button
                onClick={() => onNavigate('login')}
                className="w-full flex items-center gap-3 px-4 py-3 text-destructive hover:bg-secondary transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </button>
            </nav>
          </aside>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                <div>
                  <h2 className="text-2xl mb-6">Personal Information</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm mb-2 text-muted-foreground">First Name</label>
                      <input
                        type="text"
                        defaultValue={userProfile.first_name}
                        className="w-full px-4 py-3 border border-border bg-white focus:outline-none focus:border-foreground transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm mb-2 text-muted-foreground">Last Name</label>
                      <input
                        type="text"
                        defaultValue={userProfile.last_name}
                        className="w-full px-4 py-3 border border-border bg-white focus:outline-none focus:border-foreground transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm mb-2 text-muted-foreground">Email</label>
                      <input
                        type="email"
                        defaultValue={userProfile.email}
                        className="w-full px-4 py-3 border border-border bg-white focus:outline-none focus:border-foreground transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm mb-2 text-muted-foreground">Phone</label>
                      <input
                        type="tel"
                        defaultValue={userProfile.phone}
                        className="w-full px-4 py-3 border border-border bg-white focus:outline-none focus:border-foreground transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm mb-2 text-muted-foreground">Date of Birth</label>
                      <input
                        type="date"
                        defaultValue={userProfile.date_of_birth}
                        className="w-full px-4 py-3 border border-border bg-white focus:outline-none focus:border-foreground transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm mb-2 text-muted-foreground">Gender</label>
                      <select
                        defaultValue={userProfile.gender}
                        className="w-full px-4 py-3 border border-border bg-white focus:outline-none focus:border-foreground transition-colors"
                      >
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                        <option value="prefer_not_to_say">Prefer not to say</option>
                      </select>
                    </div>
                  </div>
                  <button className="mt-6 px-8 py-3 bg-primary text-primary-foreground hover:bg-foreground transition-colors">
                    Save Changes
                  </button>
                </div>

                <div className="pt-8 border-t border-border">
                  <h2 className="text-2xl mb-6">Change Password</h2>
                  <div className="max-w-md space-y-4">
                    <div>
                      <label className="block text-sm mb-2 text-muted-foreground">Current Password</label>
                      <input
                        type="password"
                        className="w-full px-4 py-3 border border-border bg-white focus:outline-none focus:border-foreground transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm mb-2 text-muted-foreground">New Password</label>
                      <input
                        type="password"
                        className="w-full px-4 py-3 border border-border bg-white focus:outline-none focus:border-foreground transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm mb-2 text-muted-foreground">Confirm New Password</label>
                      <input
                        type="password"
                        className="w-full px-4 py-3 border border-border bg-white focus:outline-none focus:border-foreground transition-colors"
                      />
                    </div>
                    <button className="px-8 py-3 bg-primary text-primary-foreground hover:bg-foreground transition-colors">
                      Update Password
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <h2 className="text-2xl mb-6">Order History</h2>
                {orders.map((order) => (
                  <div key={order.id} className="border border-border p-6 space-y-4">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-border">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Order Number</p>
                        <p className="font-mono">{order.order_number}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Order Date</p>
                        <p>{formatDate(order.created_at)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Total</p>
                        <p>₹{order.total_amount.toLocaleString('en-IN')}</p>
                      </div>
                      <div>
                        <span className={`inline-block px-3 py-1 text-xs ${getStatusColor(order.status)}`}>
                          {getStatusText(order.status)}
                        </span>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="space-y-4">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex gap-4">
                          <div className="w-20 h-24 bg-muted shrink-0 overflow-hidden">
                            <ImageWithFallback
                              src={item.image_url}
                              alt={item.product_name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1">
                            <h3 className="mb-1">{item.product_name}</h3>
                            <p className="text-sm text-muted-foreground mb-1">
                              {item.color} • {item.size} • Qty: {item.quantity}
                            </p>
                            <p className="text-sm">₹{item.unit_price.toLocaleString('en-IN')}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {order.tracking_number && (
                      <div className="pt-4 border-t border-border">
                        <p className="text-sm text-muted-foreground mb-1">Tracking Number</p>
                        <p className="font-mono">{order.tracking_number}</p>
                      </div>
                    )}

                    <div className="flex gap-3 pt-4">
                      <button className="flex-1 py-2 border border-border hover:bg-secondary transition-colors text-sm">
                        View Details
                      </button>
                      {order.status === 'delivered' && (
                        <button className="flex-1 py-2 border border-border hover:bg-secondary transition-colors text-sm">
                          Reorder
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </motion.div>
            )}

            {/* Addresses Tab */}
            {activeTab === 'addresses' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl">Saved Addresses</h2>
                  <button className="px-6 py-2 border border-foreground hover:bg-foreground hover:text-background transition-colors">
                    Add New Address
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {savedAddresses.map((address) => (
                    <div key={address.id} className="border border-border p-6 relative">
                      {address.is_default && (
                        <span className="absolute top-4 right-4 px-2 py-1 bg-foreground text-background text-xs">
                          DEFAULT
                        </span>
                      )}
                      <div className="space-y-2 mb-4">
                        <p>{address.first_name} {address.last_name}</p>
                        <p className="text-sm text-muted-foreground">{address.address_line_1}</p>
                        {address.address_line_2 && (
                          <p className="text-sm text-muted-foreground">{address.address_line_2}</p>
                        )}
                        <p className="text-sm text-muted-foreground">
                          {address.city}, {address.state} {address.postal_code}
                        </p>
                        <p className="text-sm text-muted-foreground">Phone: {address.phone}</p>
                        <p className="text-xs text-muted-foreground mt-2">
                          Type: {address.type.charAt(0).toUpperCase() + address.type.slice(1)}
                        </p>
                      </div>
                      <div className="flex gap-3">
                        <button className="flex-1 py-2 text-sm border border-border hover:bg-secondary transition-colors">
                          Edit
                        </button>
                        <button className="flex-1 py-2 text-sm border border-border text-destructive hover:bg-destructive/10 transition-colors">
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Wishlist Tab */}
            {activeTab === 'wishlist' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl">My Wishlist</h2>
                  <button
                    onClick={() => onNavigate('wishlist')}
                    className="flex items-center gap-2 text-sm hover:text-muted-foreground transition-colors"
                  >
                    <span>View Full Wishlist</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-muted-foreground">
                  View and manage your wishlist items from the dedicated wishlist page
                </p>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
