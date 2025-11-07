'use client';

import { motion } from 'motion/react';
import { 
  TrendingUp, TrendingDown, Package, ShoppingCart, Users, 
  IndianRupee, Eye, Star, Clock
} from 'lucide-react';
import { mockData } from '../../data/mockData';

interface AdminDashboardProps {
  onNavigate: (page: string, id?: string) => void;
}

export function AdminDashboard({ onNavigate }: AdminDashboardProps) {
  // Calculate stats from mock data
  const totalOrders = mockData.orders.length;
  const totalRevenue = mockData.orders.reduce((sum, order) => sum + order.total, 0);
  const totalProducts = mockData.products.length;
  const totalCustomers = mockData.profiles.filter(p => p.role === 'customer').length;
  
  const pendingOrders = mockData.orders.filter(o => o.status === 'processing' || o.status === 'pending').length;
  const shippedOrders = mockData.orders.filter(o => o.status === 'shipped').length;
  const deliveredOrders = mockData.orders.filter(o => o.status === 'delivered').length;
  
  const activeProducts = mockData.products.filter(p => p.is_active).length;
  const lowStockProducts = mockData.product_variants.filter(v => v.stock_quantity < 10 && v.stock_quantity > 0).length;
  const outOfStockProducts = mockData.product_variants.filter(v => v.stock_quantity === 0).length;

  const stats = [
    {
      label: 'Total Revenue',
      value: `₹${totalRevenue.toLocaleString('en-IN')}`,
      change: '+12.5%',
      isPositive: true,
      icon: IndianRupee,
      color: 'bg-green-50 text-green-600',
    },
    {
      label: 'Total Orders',
      value: totalOrders,
      change: '+8.2%',
      isPositive: true,
      icon: ShoppingCart,
      color: 'bg-blue-50 text-blue-600',
    },
    {
      label: 'Total Products',
      value: totalProducts,
      change: '+3',
      isPositive: true,
      icon: Package,
      color: 'bg-purple-50 text-purple-600',
    },
    {
      label: 'Total Customers',
      value: totalCustomers,
      change: '+15.3%',
      isPositive: true,
      icon: Users,
      color: 'bg-orange-50 text-orange-600',
    },
  ];

  const recentOrders = mockData.orders
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  const lowStockItems = mockData.product_variants
    .filter(v => v.stock_quantity < 10 && v.stock_quantity > 0)
    .sort((a, b) => a.stock_quantity - b.stock_quantity)
    .slice(0, 5);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'shipped':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'processing':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'pending':
        return 'bg-gray-50 text-gray-700 border-gray-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here's what's happening with your store.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white border border-border rounded-lg p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${stat.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className={`flex items-center gap-1 text-sm ${stat.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                  {stat.isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  <span>{stat.change}</span>
                </div>
              </div>
              <p className="text-2xl mb-1">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Order Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white border border-border rounded-lg p-6"
        >
          <h3 className="text-lg mb-4">Order Status</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Pending/Processing</span>
              <span className="text-sm px-3 py-1 bg-yellow-50 text-yellow-700 rounded-full">{pendingOrders}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Shipped</span>
              <span className="text-sm px-3 py-1 bg-blue-50 text-blue-700 rounded-full">{shippedOrders}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Delivered</span>
              <span className="text-sm px-3 py-1 bg-green-50 text-green-700 rounded-full">{deliveredOrders}</span>
            </div>
          </div>
        </motion.div>

        {/* Product Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white border border-border rounded-lg p-6"
        >
          <h3 className="text-lg mb-4">Inventory Status</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Active Products</span>
              <span className="text-sm px-3 py-1 bg-green-50 text-green-700 rounded-full">{activeProducts}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Low Stock</span>
              <span className="text-sm px-3 py-1 bg-orange-50 text-orange-700 rounded-full">{lowStockProducts}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Out of Stock</span>
              <span className="text-sm px-3 py-1 bg-red-50 text-red-700 rounded-full">{outOfStockProducts}</span>
            </div>
          </div>
        </motion.div>

        {/* Coupon Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white border border-border rounded-lg p-6"
        >
          <h3 className="text-lg mb-4">Active Coupons</h3>
          <div className="space-y-3">
            {mockData.coupons.slice(0, 3).map((coupon) => (
              <div key={coupon.id} className="flex items-center justify-between">
                <span className="text-sm font-mono">{coupon.code}</span>
                <span className="text-xs text-muted-foreground">{coupon.used_count} used</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white border border-border rounded-lg overflow-hidden"
        >
          <div className="p-6 border-b border-border flex items-center justify-between">
            <h3 className="text-lg">Recent Orders</h3>
            <button
              onClick={() => onNavigate('orders')}
              className="text-sm text-muted-foreground hover:text-foreground underline"
            >
              View All
            </button>
          </div>
          <div className="divide-y divide-border">
            {recentOrders.map((order) => (
              <div
                key={order.id}
                className="p-4 hover:bg-secondary/30 transition-colors cursor-pointer"
                onClick={() => onNavigate('orders', order.id)}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-mono">{order.order_number}</span>
                  <span className={`text-xs px-2 py-1 rounded border ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{formatDate(order.created_at)}</span>
                  <span>₹{order.total.toLocaleString('en-IN')}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Low Stock Alerts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-white border border-border rounded-lg overflow-hidden"
        >
          <div className="p-6 border-b border-border flex items-center justify-between">
            <h3 className="text-lg">Low Stock Alerts</h3>
            <button
              onClick={() => onNavigate('products')}
              className="text-sm text-muted-foreground hover:text-foreground underline"
            >
              View All
            </button>
          </div>
          <div className="divide-y divide-border">
            {lowStockItems.map((variant) => {
              const product = mockData.products.find(p => p.id === variant.product_id);
              return (
                <div
                  key={variant.id}
                  className="p-4 hover:bg-secondary/30 transition-colors cursor-pointer"
                  onClick={() => onNavigate('products', variant.product_id)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm line-clamp-1">{product?.name}</span>
                    <span className={`text-xs px-2 py-1 rounded ${
                      variant.stock_quantity < 5 ? 'bg-red-50 text-red-700' : 'bg-orange-50 text-orange-700'
                    }`}>
                      {variant.stock_quantity} left
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    SKU: {variant.sku} • {variant.color} • {variant.size}
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
