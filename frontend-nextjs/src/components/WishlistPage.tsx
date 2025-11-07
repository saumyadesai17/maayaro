'use client';

import { motion } from 'motion/react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Heart, ShoppingBag } from 'lucide-react';
import { useState } from 'react';
import QuickAddModal from './QuickAddModal';
import { useStore } from '@/contexts/StoreContext';

interface WishlistPageProps {
  onNavigate: (page: string, productId?: number) => void;
}

export function WishlistPage({ onNavigate }: WishlistPageProps) {
  const { wishlistItems, removeFromWishlist } = useStore();
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<typeof wishlistItems[0] | null>(null);

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
                  onClick={() => onNavigate('product', item.product_id)}
                />

                {/* Remove Button */}
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  onClick={() => removeFromWishlist(item.id)}
                  className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/70 border border-gray-200 hover:bg-white hover:scale-110 flex items-center justify-center transition-all duration-300 z-10"
                  aria-label="Remove from wishlist"
                >
                  <Heart className="w-5 h-5 fill-destructive text-destructive" />
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
                  onClick={() => onNavigate('product', item.product_id)}
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
                  {item.original_price && (
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
            product={{
              id: selectedItem.product_id,
              name: selectedItem.name,
              price: selectedItem.price,
              original_price: selectedItem.original_price,
              image: selectedItem.image,
              sku: selectedItem.sku,
            }}
          />
        )}
      </div>
    </div>
  );
}
