'use client';

import { motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { Loader2, MapPin, Plus } from 'lucide-react';

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

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

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
        <button className="flex items-center gap-2 px-4 md:px-6 py-2.5 bg-foreground text-background hover:bg-foreground/90 transition-colors">
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
          <button className="px-8 py-3 bg-foreground text-background hover:bg-foreground/90 transition-colors">
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
                  <button className="flex-1 py-2 text-sm border border-border hover:bg-secondary transition-colors">
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
    </div>
  );
}
