'use client';

import { useState } from 'react';
import { Plus, Search, Edit, Trash2, Copy, Percent, Tag, Calendar } from 'lucide-react';
import { mockData } from '../../data/mockData';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Switch } from '../ui/switch';

export function CouponsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<any>(null);

  const coupons = mockData.coupons;

  const filteredCoupons = coupons.filter(coupon =>
    coupon.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    coupon.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeCoupons = coupons.filter(c => c.is_active);
  const totalUsage = coupons.reduce((sum, c) => sum + c.used_count, 0);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsDialogOpen(false);
    setEditingCoupon(null);
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl mb-2">Coupons</h1>
          <p className="text-muted-foreground">Create and manage discount coupons</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <button 
              className="px-6 py-3 bg-foreground text-background hover:bg-primary transition-colors rounded-lg flex items-center justify-center gap-2"
              onClick={() => setEditingCoupon(null)}
            >
              <Plus className="w-5 h-5" />
              <span>Create Coupon</span>
            </button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingCoupon ? 'Edit Coupon' : 'Create New Coupon'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSave} className="space-y-6 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="code">Coupon Code *</Label>
                  <Input 
                    id="code" 
                    placeholder="e.g., SUMMER2025" 
                    defaultValue={editingCoupon?.code} 
                    className="uppercase font-mono"
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Discount Type *</Label>
                  <select 
                    id="type" 
                    className="w-full px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:border-foreground transition-colors"
                    defaultValue={editingCoupon?.discount_type || 'percentage'}
                  >
                    <option value="percentage">Percentage</option>
                    <option value="fixed">Fixed Amount</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description" 
                  placeholder="Describe the coupon offer..." 
                  rows={2} 
                  defaultValue={editingCoupon?.description} 
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="value">Discount Value *</Label>
                  <Input 
                    id="value" 
                    type="number" 
                    placeholder="e.g., 10 or 500" 
                    defaultValue={editingCoupon?.discount_value}
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="max_discount">Max Discount (₹)</Label>
                  <Input 
                    id="max_discount" 
                    type="number" 
                    placeholder="e.g., 1000" 
                    defaultValue={editingCoupon?.max_discount}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="min_order">Min Order Value (₹)</Label>
                  <Input 
                    id="min_order" 
                    type="number" 
                    placeholder="e.g., 2000" 
                    defaultValue={editingCoupon?.min_order_value}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="usage_limit">Usage Limit</Label>
                  <Input 
                    id="usage_limit" 
                    type="number" 
                    placeholder="Leave empty for unlimited" 
                    defaultValue={editingCoupon?.usage_limit || ''}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="valid_from">Valid From *</Label>
                  <Input 
                    id="valid_from" 
                    type="date" 
                    defaultValue={editingCoupon?.valid_from?.split('T')[0]}
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="valid_until">Valid Until *</Label>
                  <Input 
                    id="valid_until" 
                    type="date" 
                    defaultValue={editingCoupon?.valid_until?.split('T')[0]}
                    required 
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div>
                  <Label htmlFor="active">Active Status</Label>
                  <p className="text-sm text-muted-foreground">Enable or disable this coupon</p>
                </div>
                <Switch id="active" defaultChecked={editingCoupon?.is_active ?? true} />
              </div>

              <div className="flex gap-3 pt-4">
                <button type="submit" className="flex-1 px-4 py-2.5 bg-foreground text-background hover:bg-primary transition-colors rounded-lg">
                  {editingCoupon ? 'Update Coupon' : 'Create Coupon'}
                </button>
                <button 
                  type="button" 
                  onClick={() => setIsDialogOpen(false)}
                  className="px-6 py-2.5 border border-border hover:bg-secondary transition-colors rounded-lg"
                >
                  Cancel
                </button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="bg-white border border-border rounded-lg p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search coupons..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-border rounded-lg focus:outline-none focus:border-foreground transition-colors"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-white border border-border rounded-lg p-6">
          <p className="text-sm text-muted-foreground mb-1">Total Coupons</p>
          <p className="text-2xl">{coupons.length}</p>
        </div>
        <div className="bg-white border border-border rounded-lg p-6">
          <p className="text-sm text-muted-foreground mb-1">Active Coupons</p>
          <p className="text-2xl">{activeCoupons.length}</p>
        </div>
        <div className="bg-white border border-border rounded-lg p-6">
          <p className="text-sm text-muted-foreground mb-1">Total Usage</p>
          <p className="text-2xl">{totalUsage}</p>
        </div>
        <div className="bg-white border border-border rounded-lg p-6">
          <p className="text-sm text-muted-foreground mb-1">Avg. Usage</p>
          <p className="text-2xl">{coupons.length > 0 ? Math.round(totalUsage / coupons.length) : 0}</p>
        </div>
      </div>

      {/* Coupons List */}
      <div className="grid grid-cols-1 gap-4">
        {filteredCoupons.map(coupon => {
          const isExpired = new Date(coupon.valid_until) < new Date();
          const usagePercent = coupon.usage_limit ? (coupon.used_count / coupon.usage_limit) * 100 : 0;

          return (
            <div key={coupon.id} className="bg-white border border-border rounded-lg p-6 hover:shadow-sm transition-shadow">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                {/* Left: Coupon Info */}
                <div className="flex-1">
                  <div className="flex items-start gap-4 mb-3">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Percent className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <code className="text-lg px-3 py-1 bg-secondary rounded font-mono">{coupon.code}</code>
                        <button
                          onClick={() => copyCode(coupon.code)}
                          className="p-1.5 hover:bg-secondary rounded transition-colors"
                          title="Copy code"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        {!coupon.is_active && (
                          <span className="text-xs px-2 py-1 bg-gray-50 text-gray-700 rounded">Inactive</span>
                        )}
                        {isExpired && (
                          <span className="text-xs px-2 py-1 bg-red-50 text-red-700 rounded">Expired</span>
                        )}
                      </div>
                      <p className="text-muted-foreground mb-3">{coupon.description}</p>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground mb-1">Discount</p>
                          <p>
                            {coupon.discount_type === 'percentage' 
                              ? `${coupon.discount_value}%` 
                              : `₹${coupon.discount_value}`}
                            {coupon.max_discount && <span className="text-muted-foreground"> (max ₹{coupon.max_discount})</span>}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground mb-1">Min. Order</p>
                          <p>₹{coupon.min_order_value.toLocaleString('en-IN')}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground mb-1">Usage</p>
                          <p>
                            {coupon.used_count}
                            {coupon.usage_limit && ` / ${coupon.usage_limit}`}
                            {coupon.usage_limit && (
                              <span className="text-muted-foreground"> ({usagePercent.toFixed(0)}%)</span>
                            )}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground mb-1">Valid Period</p>
                          <p className="text-xs">
                            {formatDate(coupon.valid_from)} - {formatDate(coupon.valid_until)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2 lg:flex-col lg:items-end">
                  <button
                    onClick={() => {
                      setEditingCoupon(coupon);
                      setIsDialogOpen(true);
                    }}
                    className="px-4 py-2 border border-border hover:bg-secondary rounded-lg transition-colors flex items-center gap-2"
                  >
                    <Edit className="w-4 h-4" />
                    <span className="text-sm">Edit</span>
                  </button>
                  <button className="px-4 py-2 border border-destructive/20 text-destructive hover:bg-destructive/10 rounded-lg transition-colors flex items-center gap-2">
                    <Trash2 className="w-4 h-4" />
                    <span className="text-sm">Delete</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredCoupons.length === 0 && (
        <div className="bg-white border border-border rounded-lg p-12 text-center">
          <Tag className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg mb-2">No coupons found</h3>
          <p className="text-muted-foreground mb-6">Create your first coupon to boost sales</p>
          <button 
            onClick={() => setIsDialogOpen(true)}
            className="px-6 py-3 bg-foreground text-background hover:bg-primary transition-colors rounded-lg inline-flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Create Coupon
          </button>
        </div>
      )}
    </div>
  );
}
