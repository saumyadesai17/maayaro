'use client';

import { motion, AnimatePresence } from 'motion/react';
import { useEffect, useState, useMemo } from 'react';
import { Loader2, MapPin, Plus, X } from 'lucide-react';
import { State, City } from 'country-state-city';

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

interface AddressFormData {
  full_name: string;
  phone: string;
  address_line1: string;
  address_line2: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  type: 'billing' | 'shipping' | 'both';
  is_default: boolean;
}

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState<SavedAddress | null>(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<AddressFormData>({
    full_name: '',
    phone: '+91',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'India',
    type: 'both',
    is_default: false,
  });

  // Get Indian states and cities
  const indianStates = useMemo(() => State.getStatesOfCountry('IN'), []);
  const cities = useMemo(() => {
    if (!formData.state) return [];
    const state = indianStates.find(s => s.name === formData.state);
    return state ? City.getCitiesOfState('IN', state.isoCode) : [];
  }, [formData.state, indianStates]);

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      const response = await fetch('/api/user/addresses');
      const data = await response.json();
      
      if (response.ok && data.success) {
        setAddresses(data.addresses);
      }
    } catch (error) {
      console.error('Error fetching addresses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (address?: SavedAddress) => {
    // Prevent body scroll when modal opens
    document.body.style.overflow = 'hidden';
    
    if (address) {
      setEditingAddress(address);
      // Ensure phone has +91 prefix
      const phone = address.phone.startsWith('+91') ? address.phone : `+91${address.phone}`;
      setFormData({
        full_name: address.full_name,
        phone: phone,
        address_line1: address.address_line1,
        address_line2: address.address_line2 || '',
        city: address.city,
        state: address.state,
        postal_code: address.postal_code,
        country: address.country,
        type: address.type,
        is_default: address.is_default,
      });
    } else {
      setEditingAddress(null);
      setFormData({
        full_name: '',
        phone: '+91',
        address_line1: '',
        address_line2: '',
        city: '',
        state: '',
        postal_code: '',
        country: 'India',
        type: 'both',
        is_default: false,
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    // Restore body scroll when modal closes
    document.body.style.overflow = 'unset';
    setShowModal(false);
    setEditingAddress(null);
    setSaving(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const url = editingAddress 
        ? `/api/user/addresses/${editingAddress.id}`
        : '/api/user/addresses';
      
      const method = editingAddress ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setMessage({ 
          type: 'success', 
          text: editingAddress ? 'Address updated successfully' : 'Address added successfully' 
        });
        handleCloseModal();
        fetchAddresses();
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to save address' });
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred' });
      setTimeout(() => setMessage(null), 3000);
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
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to delete address' });
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred' });
      setTimeout(() => setMessage(null), 3000);
    }
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
      {/* Success/Error Message */}
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 border ${
            message.type === 'success' 
              ? 'bg-green-50 border-green-200 text-green-800' 
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          {message.text}
        </motion.div>
      )}

      {/* Header with Add Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-light">Saved Addresses</h2>
          <p className="text-sm text-muted-foreground mt-1">Manage your delivery addresses</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 md:px-6 py-2.5 bg-foreground text-background hover:bg-foreground/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Add Address</span>
        </button>
      </div>

      {addresses.length === 0 ? (
        <div className="border border-dashed border-border bg-background p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center bg-muted rounded-full">
            <MapPin className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-light mb-2">No saved addresses</h3>
          <p className="text-muted-foreground mb-6">
            Add your first address to make checkout faster
          </p>
          <button 
            onClick={() => handleOpenModal()}
            className="px-8 py-3 bg-foreground text-background hover:bg-foreground/90 transition-colors"
          >
            Add New Address
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {addresses.map((address) => (
            <div key={address.id} className="border border-border bg-background hover:shadow-sm transition-shadow">
              <div className="p-5 space-y-3">
                {/* Address Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium">{address.full_name}</h3>
                      {address.is_default && (
                        <span className="px-2 py-0.5 bg-foreground text-background text-xs">
                          DEFAULT
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground capitalize">
                      {address.type === 'both' ? 'Billing & Shipping' : address.type} Address
                    </p>
                  </div>
                </div>

                {/* Address Details */}
                <div className="text-sm text-muted-foreground space-y-1 py-3 border-y border-border">
                  <p>{address.address_line1}</p>
                  {address.address_line2 && <p>{address.address_line2}</p>}
                  <p>
                    {address.city}, {address.state} {address.postal_code}
                  </p>
                  <p className="pt-2">Phone: {address.phone}</p>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <button 
                    onClick={() => handleOpenModal(address)}
                    className="flex-1 py-2 text-sm border border-border hover:bg-secondary transition-colors"
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDeleteAddress(address.id)}
                    className="flex-1 py-2 text-sm border border-border text-destructive hover:bg-destructive/5 transition-colors"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Address Form Modal */}
      <AnimatePresence>
        {showModal && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50 overflow-y-auto"
              onClick={handleCloseModal}
            />
            
            {/* Modal Container - Centered with proper responsive sizing */}
            <div className="fixed inset-0 z-50 overflow-y-auto">
              <div className="min-h-full flex items-center justify-center p-0 sm:p-4 md:p-6">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 20 }}
                  transition={{ duration: 0.2 }}
                  onClick={(e) => e.stopPropagation()}
                  className="relative bg-background border-0 sm:border border-border w-full max-w-2xl shadow-xl min-h-screen sm:min-h-0 sm:my-8"
                >
                  {/* Modal Header */}
                  <div className="sticky top-0 bg-background border-b border-border px-4 py-4 sm:px-6 flex items-center justify-between z-10">
                    <h3 className="text-lg sm:text-xl font-medium">
                      {editingAddress ? 'Edit Address' : 'Add New Address'}
                    </h3>
                    <button
                      onClick={handleCloseModal}
                      className="p-2 hover:bg-secondary transition-colors rounded"
                      type="button"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Modal Body - Scrollable */}
                  <div className="max-h-[calc(100vh-8rem)] sm:max-h-[calc(100vh-12rem)] overflow-y-auto scrollbar-hide">
                    <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-5">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                  <div className="space-y-2">
                    <label className="block text-sm font-light text-muted-foreground">
                      Full Name <span className="text-destructive">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      className="w-full px-4 py-2.5 border border-border bg-background focus:outline-none focus:ring-1 focus:ring-foreground transition-all"
                      placeholder="Enter full name"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-light text-muted-foreground">
                      Phone Number <span className="text-destructive">*</span>
                    </label>
                    <div className="flex gap-2">
                      <div className="w-20 px-4 py-2.5 border border-border bg-muted flex items-center justify-center text-sm">
                        +91
                      </div>
                      <input
                        type="tel"
                        required
                        pattern="[0-9]{10}"
                        value={formData.phone.replace('+91', '').trim()}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                          setFormData({ ...formData, phone: `+91${value}` });
                        }}
                        className="flex-1 px-4 py-2.5 border border-border bg-background focus:outline-none focus:ring-1 focus:ring-foreground transition-all"
                        placeholder="XXXXX XXXXX"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-light text-muted-foreground">
                    Address Line 1 <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.address_line1}
                    onChange={(e) => setFormData({ ...formData, address_line1: e.target.value })}
                    className="w-full px-4 py-2.5 border border-border bg-background focus:outline-none focus:ring-1 focus:ring-foreground transition-all"
                    placeholder="House No., Building Name"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-light text-muted-foreground">
                    Address Line 2
                  </label>
                  <input
                    type="text"
                    value={formData.address_line2}
                    onChange={(e) => setFormData({ ...formData, address_line2: e.target.value })}
                    className="w-full px-4 py-2.5 border border-border bg-background focus:outline-none focus:ring-1 focus:ring-foreground transition-all"
                    placeholder="Road Name, Area, Colony"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div className="space-y-2">
                    <label className="block text-sm font-light text-muted-foreground">
                      State <span className="text-destructive">*</span>
                    </label>
                    <select
                      required
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value, city: '' })}
                      className="w-full px-4 py-2.5 border border-border bg-background focus:outline-none focus:ring-1 focus:ring-foreground transition-all"
                    >
                      <option value="">Select State</option>
                      {indianStates.map((state) => (
                        <option key={state.isoCode} value={state.name}>
                          {state.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-light text-muted-foreground">
                      City <span className="text-destructive">*</span>
                    </label>
                    <select
                      required
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      disabled={!formData.state}
                      className="w-full px-4 py-2.5 border border-border bg-background focus:outline-none focus:ring-1 focus:ring-foreground transition-all disabled:bg-muted disabled:cursor-not-allowed"
                    >
                      <option value="">Select City</option>
                      {cities.map((city) => (
                        <option key={city.name} value={city.name}>
                          {city.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-light text-muted-foreground">
                      PIN Code <span className="text-destructive">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      pattern="[0-9]{6}"
                      value={formData.postal_code}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                        setFormData({ ...formData, postal_code: value });
                      }}
                      className="w-full px-4 py-2.5 border border-border bg-background focus:outline-none focus:ring-1 focus:ring-foreground transition-all"
                      placeholder="123456"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-light text-muted-foreground">
                    Address Type <span className="text-destructive">*</span>
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="type"
                        value="shipping"
                        checked={formData.type === 'shipping'}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value as 'shipping' })}
                        className="w-4 h-4"
                      />
                      <span className="text-sm">Shipping</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="type"
                        value="billing"
                        checked={formData.type === 'billing'}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value as 'billing' })}
                        className="w-4 h-4"
                      />
                      <span className="text-sm">Billing</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="type"
                        value="both"
                        checked={formData.type === 'both'}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value as 'both' })}
                        className="w-4 h-4"
                      />
                      <span className="text-sm">Both</span>
                    </label>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is_default"
                    checked={formData.is_default}
                    onChange={(e) => setFormData({ ...formData, is_default: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <label htmlFor="is_default" className="text-sm cursor-pointer">
                    Set as default address
                  </label>
                </div>

                <div className="flex gap-3 pt-4 border-t border-border">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="flex-1 px-6 py-3 border border-border hover:bg-secondary transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 px-6 py-3 bg-foreground text-background hover:bg-foreground/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                    {saving ? 'Saving...' : (editingAddress ? 'Update Address' : 'Add Address')}
                  </button>
                </div>
                    </form>
                  </div>
                </motion.div>
              </div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
