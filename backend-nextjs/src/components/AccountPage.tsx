'use client';

import { motion } from 'motion/react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { User, MapPin, Package, Heart, LogOut, ChevronRight, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface AccountPageProps {
  onNavigate: (page: string) => void;
}

type Tab = 'profile' | 'orders' | 'addresses' | 'wishlist';

interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

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

interface SavedAddress {
  id: string;
  type: 'billing' | 'shipping' | 'both';
  full_name: string;
  phone: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  is_default: boolean;
}

export function AccountPage({ onNavigate }: AccountPageProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>('orders');
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [profileForm, setProfileForm] = useState({
    full_name: '',
    phone: '',
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Fetch user profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch('/api/user/profile');
        const data = await response.json();
        
        if (response.ok && data.success) {
          setUserProfile(data.profile);
          setProfileForm({
            full_name: data.profile.full_name || '',
            phone: data.profile.phone || '',
          });
        } else if (response.status === 401) {
          // Not authenticated, redirect to login
          router.push('/login');
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

  // Fetch orders
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
      }
    };

    if (userProfile) {
      fetchOrders();
    }
  }, [userProfile]);

  // Fetch addresses
  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const response = await fetch('/api/user/addresses');
        const data = await response.json();
        
        if (response.ok && data.success) {
          setAddresses(data.addresses);
        }
      } catch (error) {
        console.error('Error fetching addresses:', error);
      }
    };

    if (userProfile) {
      fetchAddresses();
    }
  }, [userProfile]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileForm),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setUserProfile(data.profile);
        setMessage({ type: 'success', text: 'Profile updated successfully' });
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to update profile' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred' });
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters' });
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      const response = await fetch('/api/user/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setMessage({ type: 'success', text: 'Password updated successfully' });
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to update password' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred' });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    if (!confirm('Are you sure you want to delete this address?')) {
      return;
    }

    try {
      const response = await fetch(`/api/user/addresses/${addressId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setAddresses(addresses.filter(addr => addr.id !== addressId));
        setMessage({ type: 'success', text: 'Address deleted successfully' });
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to delete address' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred' });
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

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
      <div className="pt-16 min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-12">
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        </div>
      </div>
    );
  }

  if (!userProfile) {
    return null;
  }

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
            Welcome back, {userProfile.full_name || 'User'}
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
                onClick={() => handleLogout()}
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
                {message && (
                  <div className={`p-4 ${message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                    {message.text}
                  </div>
                )}

                <form onSubmit={handleProfileUpdate}>
                  <h2 className="text-2xl mb-6">Personal Information</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm mb-2 text-muted-foreground">Full Name</label>
                      <input
                        type="text"
                        value={profileForm.full_name}
                        onChange={(e) => setProfileForm({ ...profileForm, full_name: e.target.value })}
                        className="w-full px-4 py-3 border border-border bg-white focus:outline-none focus:border-foreground transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm mb-2 text-muted-foreground">Email</label>
                      <input
                        type="email"
                        value={userProfile.email}
                        disabled
                        className="w-full px-4 py-3 border border-border bg-gray-50 text-gray-500 cursor-not-allowed"
                      />
                    </div>
                    <div>
                      <label className="block text-sm mb-2 text-muted-foreground">Phone</label>
                      <input
                        type="tel"
                        value={profileForm.phone}
                        onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                        className="w-full px-4 py-3 border border-border bg-white focus:outline-none focus:border-foreground transition-colors"
                      />
                    </div>
                  </div>
                  <button 
                    type="submit"
                    disabled={saving}
                    className="mt-6 px-8 py-3 bg-primary text-primary-foreground hover:bg-foreground transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </form>

                <div className="pt-8 border-t border-border">
                  <form onSubmit={handlePasswordChange}>
                    <h2 className="text-2xl mb-6">Change Password</h2>
                    <div className="max-w-md space-y-4">
                      <div>
                        <label className="block text-sm mb-2 text-muted-foreground">Current Password</label>
                        <input
                          type="password"
                          value={passwordForm.currentPassword}
                          onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                          className="w-full px-4 py-3 border border-border bg-white focus:outline-none focus:border-foreground transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-sm mb-2 text-muted-foreground">New Password</label>
                        <input
                          type="password"
                          value={passwordForm.newPassword}
                          onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                          className="w-full px-4 py-3 border border-border bg-white focus:outline-none focus:border-foreground transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-sm mb-2 text-muted-foreground">Confirm New Password</label>
                        <input
                          type="password"
                          value={passwordForm.confirmPassword}
                          onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                          className="w-full px-4 py-3 border border-border bg-white focus:outline-none focus:border-foreground transition-colors"
                        />
                      </div>
                      <button 
                        type="submit"
                        disabled={saving}
                        className="px-8 py-3 bg-primary text-primary-foreground hover:bg-foreground transition-colors disabled:opacity-50 flex items-center gap-2"
                      >
                        {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                        {saving ? 'Updating...' : 'Update Password'}
                      </button>
                    </div>
                  </form>
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
                {orders.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    No orders found
                  </div>
                ) : (
                  orders.map((order) => (
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
                          <p>₹{order.total.toLocaleString('en-IN')}</p>
                        </div>
                        <div>
                          <span className={`inline-block px-3 py-1 text-xs ${getStatusColor(order.status)}`}>
                            {getStatusText(order.status)}
                          </span>
                        </div>
                      </div>

                      {/* Order Items */}
                      <div className="space-y-4">
                        {order.order_items.map((item: OrderItem) => {
                          // Get primary image or first image from the product
                          const productImage = item.product_variant?.product?.images?.find(img => img.is_primary)?.image_url 
                            || item.product_variant?.product?.images?.[0]?.image_url 
                            || '/placeholder-product.jpg';
                          
                          return (
                            <div key={item.id} className="flex gap-4">
                              <div className="w-20 h-24 bg-muted shrink-0 overflow-hidden">
                                <ImageWithFallback
                                  src={productImage}
                                  alt={item.product_name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="flex-1">
                                <h3 className="mb-1">{item.product_name}</h3>
                                <p className="text-sm text-muted-foreground mb-1">
                                  {item.variant_details.color} • {item.variant_details.size} • Qty: {item.quantity}
                                </p>
                                <p className="text-sm">₹{item.unit_price.toLocaleString('en-IN')}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {order.shipment && order.shipment[0]?.tracking_number && (
                        <div className="pt-4 border-t border-border">
                          <p className="text-sm text-muted-foreground mb-1">Tracking Number</p>
                          <p className="font-mono">{order.shipment[0].tracking_number}</p>
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
                  ))
                )}
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

                {addresses.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    No saved addresses. Add your first address to get started.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {addresses.map((address) => (
                      <div key={address.id} className="border border-border p-6 relative">
                        {address.is_default && (
                          <span className="absolute top-4 right-4 px-2 py-1 bg-foreground text-background text-xs">
                            DEFAULT
                          </span>
                        )}
                        <div className="space-y-2 mb-4">
                          <p>{address.full_name}</p>
                          <p className="text-sm text-muted-foreground">{address.address_line1}</p>
                          {address.address_line2 && (
                            <p className="text-sm text-muted-foreground">{address.address_line2}</p>
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
                          <button 
                            onClick={() => handleDeleteAddress(address.id)}
                            className="flex-1 py-2 text-sm border border-border text-destructive hover:bg-destructive/10 transition-colors"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
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
