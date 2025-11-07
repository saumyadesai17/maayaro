'use client';

import { useState } from 'react';
import { Save, Settings as SettingsIcon, Mail, Phone, MapPin, CreditCard, Truck, Globe } from 'lucide-react';
import { mockData } from '../../data/mockData';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Switch } from '../ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';

export function SettingsPage() {
  const settings = mockData.site_settings;
  const [activeTab, setActiveTab] = useState('general');

  const getSetting = (key: string) => settings.find(s => s.key === key)?.value || '';

  const handleSave = (e: React.FormEvent, group: string) => {
    e.preventDefault();
    // Mock save action
    alert(`${group} settings saved!`);
  };

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl mb-2">Settings</h1>
        <p className="text-muted-foreground">Manage your store configuration</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5 gap-2">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="contact">Contact</TabsTrigger>
          <TabsTrigger value="shipping">Shipping</TabsTrigger>
          <TabsTrigger value="payment">Payment</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general">
          <form onSubmit={(e) => handleSave(e, 'General')} className="bg-white border border-border rounded-lg">
            <div className="p-6 border-b border-border">
              <div className="flex items-center gap-3">
                <Globe className="w-5 h-5" />
                <h3 className="text-lg">General Settings</h3>
              </div>
            </div>
            <div className="p-6 space-y-6">
              <div className="space-y-2">
                <Label htmlFor="site_name">Store Name *</Label>
                <Input id="site_name" defaultValue={getSetting('site_name')} required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="site_description">Store Description</Label>
                <Textarea 
                  id="site_description" 
                  rows={3}
                  placeholder="Tell customers about your store..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <select className="w-full px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:border-foreground transition-colors">
                    <option value="INR">INR (₹)</option>
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <select className="w-full px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:border-foreground transition-colors">
                    <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                    <option value="America/New_York">America/New_York (EST)</option>
                    <option value="Europe/London">Europe/London (GMT)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div>
                  <Label>Maintenance Mode</Label>
                  <p className="text-sm text-muted-foreground">Temporarily disable the storefront</p>
                </div>
                <Switch />
              </div>

              <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div>
                  <Label>Allow Guest Checkout</Label>
                  <p className="text-sm text-muted-foreground">Let customers checkout without creating an account</p>
                </div>
                <Switch defaultChecked />
              </div>
            </div>
            <div className="p-6 border-t border-border bg-secondary/30">
              <button type="submit" className="px-6 py-2.5 bg-foreground text-background hover:bg-primary transition-colors rounded-lg flex items-center gap-2">
                <Save className="w-4 h-4" />
                Save Changes
              </button>
            </div>
          </form>
        </TabsContent>

        {/* Contact Settings */}
        <TabsContent value="contact">
          <form onSubmit={(e) => handleSave(e, 'Contact')} className="bg-white border border-border rounded-lg">
            <div className="p-6 border-b border-border">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5" />
                <h3 className="text-lg">Contact Information</h3>
              </div>
            </div>
            <div className="p-6 space-y-6">
              <div className="space-y-2">
                <Label htmlFor="site_email">Support Email *</Label>
                <Input id="site_email" type="email" defaultValue={getSetting('site_email')} required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="site_phone">Phone Number *</Label>
                <Input id="site_phone" type="tel" defaultValue={getSetting('site_phone')} required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="whatsapp">WhatsApp Number</Label>
                <Input id="whatsapp" type="tel" placeholder="+91 98765 43210" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Store Address</Label>
                <Textarea 
                  id="address" 
                  rows={3}
                  placeholder="Your store address..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input id="city" placeholder="Mumbai" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input id="state" placeholder="Maharashtra" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="pincode">PIN Code</Label>
                  <Input id="pincode" placeholder="400001" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input id="country" placeholder="India" defaultValue="India" />
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-border bg-secondary/30">
              <button type="submit" className="px-6 py-2.5 bg-foreground text-background hover:bg-primary transition-colors rounded-lg flex items-center gap-2">
                <Save className="w-4 h-4" />
                Save Changes
              </button>
            </div>
          </form>
        </TabsContent>

        {/* Shipping Settings */}
        <TabsContent value="shipping">
          <form onSubmit={(e) => handleSave(e, 'Shipping')} className="bg-white border border-border rounded-lg">
            <div className="p-6 border-b border-border">
              <div className="flex items-center gap-3">
                <Truck className="w-5 h-5" />
                <h3 className="text-lg">Shipping Configuration</h3>
              </div>
            </div>
            <div className="p-6 space-y-6">
              <div className="space-y-2">
                <Label htmlFor="free_shipping_threshold">Free Shipping Threshold (₹)</Label>
                <Input 
                  id="free_shipping_threshold" 
                  type="number" 
                  defaultValue={getSetting('free_shipping_threshold')}
                />
                <p className="text-sm text-muted-foreground">Orders above this amount get free shipping</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="standard_shipping">Standard Shipping Fee (₹)</Label>
                <Input id="standard_shipping" type="number" defaultValue="150" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="express_shipping">Express Shipping Fee (₹)</Label>
                <Input id="express_shipping" type="number" defaultValue="300" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="processing_time">Order Processing Time (days)</Label>
                <Input id="processing_time" type="number" defaultValue="1-2" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="delivery_time">Estimated Delivery Time (days)</Label>
                <Input id="delivery_time" defaultValue="5-7" />
              </div>

              <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div>
                  <Label>Enable International Shipping</Label>
                  <p className="text-sm text-muted-foreground">Allow orders from outside India</p>
                </div>
                <Switch />
              </div>

              <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div>
                  <Label>Enable Cash on Delivery</Label>
                  <p className="text-sm text-muted-foreground">Allow COD payment method</p>
                </div>
                <Switch defaultChecked />
              </div>
            </div>
            <div className="p-6 border-t border-border bg-secondary/30">
              <button type="submit" className="px-6 py-2.5 bg-foreground text-background hover:bg-primary transition-colors rounded-lg flex items-center gap-2">
                <Save className="w-4 h-4" />
                Save Changes
              </button>
            </div>
          </form>
        </TabsContent>

        {/* Payment Settings */}
        <TabsContent value="payment">
          <form onSubmit={(e) => handleSave(e, 'Payment')} className="bg-white border border-border rounded-lg">
            <div className="p-6 border-b border-border">
              <div className="flex items-center gap-3">
                <CreditCard className="w-5 h-5" />
                <h3 className="text-lg">Payment Gateway</h3>
              </div>
            </div>
            <div className="p-6 space-y-6">
              <div className="space-y-2">
                <Label htmlFor="tax_rate">Tax Rate (GST %)</Label>
                <Input id="tax_rate" type="number" defaultValue={getSetting('tax_rate')} />
              </div>

              <div className="p-4 border border-border rounded-lg bg-secondary/30">
                <h4 className="mb-4">Razorpay Configuration</h4>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="razorpay_key">API Key</Label>
                    <Input id="razorpay_key" type="password" placeholder="rzp_test_***" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="razorpay_secret">API Secret</Label>
                    <Input id="razorpay_secret" type="password" placeholder="***" />
                  </div>
                  <div className="flex items-center justify-between p-3 border border-border rounded-lg bg-white">
                    <Label>Enable Razorpay</Label>
                    <Switch defaultChecked />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div>
                  <Label>Enable UPI Payments</Label>
                  <p className="text-sm text-muted-foreground">Accept UPI payments via Razorpay</p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div>
                  <Label>Enable Card Payments</Label>
                  <p className="text-sm text-muted-foreground">Accept Credit/Debit cards</p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div>
                  <Label>Enable Net Banking</Label>
                  <p className="text-sm text-muted-foreground">Accept net banking payments</p>
                </div>
                <Switch defaultChecked />
              </div>
            </div>
            <div className="p-6 border-t border-border bg-secondary/30">
              <button type="submit" className="px-6 py-2.5 bg-foreground text-background hover:bg-primary transition-colors rounded-lg flex items-center gap-2">
                <Save className="w-4 h-4" />
                Save Changes
              </button>
            </div>
          </form>
        </TabsContent>

        {/* Advanced Settings */}
        <TabsContent value="advanced">
          <form onSubmit={(e) => handleSave(e, 'Advanced')} className="bg-white border border-border rounded-lg">
            <div className="p-6 border-b border-border">
              <div className="flex items-center gap-3">
                <SettingsIcon className="w-5 h-5" />
                <h3 className="text-lg">Advanced Settings</h3>
              </div>
            </div>
            <div className="p-6 space-y-6">
              <div className="space-y-2">
                <Label htmlFor="google_analytics">Google Analytics ID</Label>
                <Input id="google_analytics" placeholder="G-XXXXXXXXXX" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="facebook_pixel">Facebook Pixel ID</Label>
                <Input id="facebook_pixel" placeholder="123456789012345" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="custom_css">Custom CSS</Label>
                <Textarea 
                  id="custom_css" 
                  rows={6}
                  placeholder="/* Add your custom CSS here */"
                  className="font-mono text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="custom_js">Custom JavaScript</Label>
                <Textarea 
                  id="custom_js" 
                  rows={6}
                  placeholder="// Add your custom JavaScript here"
                  className="font-mono text-sm"
                />
              </div>

              <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div>
                  <Label>Enable Product Reviews</Label>
                  <p className="text-sm text-muted-foreground">Allow customers to leave reviews</p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div>
                  <Label>Auto-Approve Reviews</Label>
                  <p className="text-sm text-muted-foreground">Publish reviews without manual approval</p>
                </div>
                <Switch />
              </div>

              <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div>
                  <Label>Enable Wishlist</Label>
                  <p className="text-sm text-muted-foreground">Allow customers to save favorites</p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div>
                  <Label>Show Stock Quantity</Label>
                  <p className="text-sm text-muted-foreground">Display available stock on product pages</p>
                </div>
                <Switch />
              </div>
            </div>
            <div className="p-6 border-t border-border bg-secondary/30">
              <button type="submit" className="px-6 py-2.5 bg-foreground text-background hover:bg-primary transition-colors rounded-lg flex items-center gap-2">
                <Save className="w-4 h-4" />
                Save Changes
              </button>
            </div>
          </form>
        </TabsContent>
      </Tabs>
    </div>
  );
}
