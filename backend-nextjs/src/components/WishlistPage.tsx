'use client';

import { motion } from 'motion/react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Heart, ShoppingBag, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import QuickAddModal from './QuickAddModal';
import { useCounts } from '@/contexts/CountsContext';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';

interface WishlistItem {
  id: string;
  product_id: string;
  name: string;
  slug: string;
  description?: string;
  price: number;
  original_price?: number;
  sku: string;
  image: string;
  hoverImage?: string;
  colors: number;
  variants: any[];
  category?: string;
  material?: string;
  is_featured?: boolean;
  created_at: string;
}

interface WishlistPageProps {
  onNavigate: (page: string, productSlug?: string) => void;
}

export function WishlistPage({ onNavigate }: WishlistPageProps) {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [removing, setRemoving] = useState<string | null>(null);
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<WishlistItem | null>(null);
  const [removeConfirmOpen, setRemoveConfirmOpen] = useState(false);
  const [itemToRemove, setItemToRemove] = useState<{ productId: string; productName: string } | null>(null);
  const { refreshCounts, refreshWishlist } = useCounts();

  // Fetch wishlist data
  const fetchWishlist = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/wishlist');
      
      if (!response.ok) {
        throw new Error('Failed to fetch wishlist');
      }
      
      const data = await response.json();
      setWishlistItems(data.wishlist || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load wishlist');
    } finally {
      setLoading(false);
    }
  };

  // Confirmation functions
  const initiateRemove = (productId: string, productName: string) => {
    setItemToRemove({ productId, productName });
    setRemoveConfirmOpen(true);
  };

  const cancelRemove = () => {
    setItemToRemove(null);
    setRemoveConfirmOpen(false);
  };

  const confirmRemove = () => {
    if (itemToRemove) {
      removeFromWishlist(itemToRemove.productId);
    }
    setItemToRemove(null);
    setRemoveConfirmOpen(false);
  };

  // Remove from wishlist
  const removeFromWishlist = async (productId: string) => {
    try {
      setRemoving(productId);
      
      // Optimistic update
      setWishlistItems(prev => prev.filter(item => item.product_id !== productId));
      
      const response = await fetch(`/api/wishlist/${productId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to remove from wishlist');
      }
      
      // Update header counts and refresh wishlist cache
      refreshWishlist();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove from wishlist');
      // Revert optimistic update on error
      await fetchWishlist();
    } finally {
      setRemoving(null);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="pt-16 min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          <p className="text-muted-foreground">Loading your wishlist...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="pt-16 min-h-screen bg-white flex items-center justify-center">
        <div className="max-w-md w-full mx-auto px-6 py-12 text-center space-y-4">
          <div className="text-destructive mb-4">
            <p className="font-medium">Error loading wishlist</p>
            <p className="text-sm text-muted-foreground">{error}</p>
          </div>
          <button
            onClick={() => fetchWishlist()}
            className="px-6 py-3 bg-primary text-primary-foreground hover:bg-foreground transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (wishlistItems.length === 0) {
    return (
      <div className="pt-16 min-h-screen bg-white flex items-center justify-center">
        <div className="max-w-md w-full mx-auto px-6 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-6"
          >
            {/* Icon */}
            <div className="flex justify-center">
              <div className="w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32 rounded-full bg-muted flex items-center justify-center">
                <Heart className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 text-muted-foreground" />
              </div>
            </div>

            {/* Heading */}
            <div className="space-y-3">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-medium">
                Your Wishlist is Empty
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground max-w-sm mx-auto leading-relaxed">
                Save your favorite items here and never lose track of what you love
              </p>
            </div>

            {/* Action Button */}
            <div className="pt-4">
              <button
                onClick={() => onNavigate('collection')}
                className="px-8 sm:px-10 py-3 sm:py-4 bg-primary text-primary-foreground hover:bg-foreground transition-colors text-sm sm:text-base font-medium tracking-wide"
              >
                EXPLORE COLLECTION
              </button>
            </div>

            {/* Additional Info */}
            <div className="pt-6 border-t border-border">
              <p className="text-xs sm:text-sm text-muted-foreground">
                Click the <Heart className="w-4 h-4 inline mx-1" /> icon on any product to add it to your wishlist
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    );
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
          <h1 className="text-3xl md:text-4xl mb-2">Wishlist</h1>
          <p className="text-muted-foreground">
            {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'} saved
          </p>
        </motion.div>

        {/* Wishlist Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {wishlistItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="group relative"
            >
              {/* Image */}
              <div className="relative aspect-3/4 bg-muted overflow-hidden mb-4 cursor-pointer">
                <ImageWithFallback
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onClick={() => onNavigate('product', item.slug)}
                />

                {/* Remove Button */}
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  onClick={() => initiateRemove(item.product_id, item.name)}
                  disabled={removing === item.product_id}
                  className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/70 border border-gray-200 hover:bg-white hover:scale-110 flex items-center justify-center transition-all duration-300 z-10 disabled:opacity-50"
                  aria-label="Remove from wishlist"
                >
                  {removing === item.product_id ? (
                    <Loader2 className="w-5 h-5 animate-spin text-destructive" />
                  ) : (
                    <Heart className="w-5 h-5 fill-destructive text-destructive" />
                  )}
                </motion.button>

                {/* Quick Add Button */}
                <button
                  onClick={() => {
                    setSelectedItem(item);
                    setQuickAddOpen(true);
                  }}
                  className="absolute bottom-0 left-0 right-0 py-4 bg-white text-foreground hover:bg-primary hover:text-primary-foreground transition-all duration-300 flex items-center justify-center gap-2 text-sm tracking-wide opacity-0 translate-y-full group-hover:opacity-100 group-hover:translate-y-0"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>ADD TO BAG</span>
                </button>
              </div>

              {/* Product Info */}
              <div className="space-y-2">
                <h3
                  className="text-sm leading-tight line-clamp-2 cursor-pointer hover:text-muted-foreground transition-colors min-h-10"
                  onClick={() => onNavigate('product', item.slug)}
                >
                  {item.name}
                </h3>

                {item.colors && (
                  <p className="text-xs text-muted-foreground">
                    {item.colors} {item.colors === 1 ? 'Colour' : 'Colours'}
                  </p>
                )}

                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-base">
                    ₹{item.price.toLocaleString('en-IN')}
                  </span>
                  {item.original_price && item.original_price > 0 && item.original_price > item.price && (
                    <>
                      <span className="text-sm text-muted-foreground line-through">
                        ₹{item.original_price.toLocaleString('en-IN')}
                      </span>
                      <span className="text-xs px-2 py-0.5 bg-destructive/10 text-destructive">
                        {Math.round(((item.original_price - item.price) / item.original_price) * 100)}% OFF
                      </span>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Quick Add Modal */}
        {selectedItem && (
          <QuickAddModal
            open={quickAddOpen}
            onOpenChange={setQuickAddOpen}
            productSlug={selectedItem.slug}
          />
        )}

        {/* Remove Confirmation Dialog */}
        <AlertDialog open={removeConfirmOpen} onOpenChange={setRemoveConfirmOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Remove from wishlist?</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to remove "{itemToRemove?.productName}" from your wishlist? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={cancelRemove}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmRemove} className="bg-destructive/70 text-destructive-foreground hover:bg-destructive">
                Remove
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
