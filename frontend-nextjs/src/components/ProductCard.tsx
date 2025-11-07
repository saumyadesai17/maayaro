'use client';

import { motion } from 'motion/react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Heart, ShoppingBag } from 'lucide-react';
import QuickAddModal from './QuickAddModal';
import { useState } from 'react';
import { useStore } from '@/contexts/StoreContext';

interface ProductCardProps {
  id: number;
  name: string;
  price: string | number;
  original_price?: number | null;
  image: string;
  hoverImage?: string;
  category?: string;
  colors?: number;
  brand?: string;
  sku?: string;
  onProductClick?: (id: number) => void;
}

export function ProductCard({
  id,
  name,
  price,
  original_price,
  image,
  hoverImage,
  category,
  colors,
  sku,
  onProductClick,
}: ProductCardProps) {
  const { isInWishlist, addToWishlist, removeFromWishlist } = useStore();
  const [currentImage, setCurrentImage] = useState(image);
  const [quickAddOpen, setQuickAddOpen] = useState(false);

  const isWishlisted = isInWishlist(id);
  const numericPrice = typeof price === 'number' ? price : parseFloat(price.replace(/[^\d.]/g, ''));
  const displayPrice = typeof price === 'string' ? price : `₹${price.toLocaleString('en-IN')}`;
  const hasDiscount = original_price && original_price > 0;
  const discount = hasDiscount ? Math.round(((original_price - numericPrice) / original_price) * 100) : 0;

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isWishlisted) {
      removeFromWishlist(id);
    } else {
      addToWishlist({
        product_id: id,
        name,
        sku: sku || `MAAY-${id}`,
        price: numericPrice,
        original_price: original_price || undefined,
        image,
        hoverImage,
        colors,
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="group relative"
      onMouseEnter={() => hoverImage && setCurrentImage(hoverImage)}
      onMouseLeave={() => setCurrentImage(image)}
    >
      {/* Image Container */}
      <div 
        className="relative aspect-3/4 overflow-hidden bg-muted cursor-pointer mb-4"
        onClick={() => onProductClick?.(id)}
      >
        <motion.div
          className="w-full h-full"
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.6, ease: [0.43, 0.13, 0.23, 0.96] }}
        >
          <ImageWithFallback
            src={currentImage}
            alt={name}
            className="w-full h-full object-cover"
          />
        </motion.div>
        
        {/* Overlay Gradient */}
        <motion.div
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="absolute inset-0 bg-linear-to-t from-black/20 to-transparent pointer-events-none"
        />

        {/* Sale Badge */}
        {hasDiscount && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="absolute top-4 left-4 px-3 py-1.5 bg-destructive text-white text-xs tracking-wider z-10"
          >
            SALE
          </motion.div>
        )}

        {/* Category Badge */}
        {category && !hasDiscount && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="absolute top-4 left-4 px-3 py-1.5 bg-foreground text-background text-xs tracking-wider z-10"
          >
            {category}
          </motion.div>
        )}

        {/* Wishlist Button - Option 1: minimal ghost circle */}
        <motion.button
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          whileTap={{ scale: 0.96 }}
          onClick={handleWishlistClick}
          aria-pressed={isWishlisted}
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/70 border border-gray-200 dark:border-gray-700 flex items-center justify-center backdrop-blur-sm transition-colors duration-200 shadow-sm z-10 hover:bg-white/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-destructive/30"
        >
          <Heart
            className={`w-5 h-5 transition-all duration-200 ${
              isWishlisted ? 'text-destructive fill-destructive scale-105' : 'text-foreground'
            }`}
          />
        </motion.button>

        {/* Quick Add Button (CSS-driven group hover for proper alignment & style) */}
        <div
          className="absolute bottom-0 left-0 right-0 transform translate-y-6 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 ease-out z-20 pointer-events-none"
        >
          <motion.button
            whileHover={{ backgroundColor: 'rgb(26, 26, 26)' }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.18 }}
            onClick={(e) => {
              e.stopPropagation();
              // open quick add modal
              setQuickAddOpen(true);
            }}
            className="w-full py-3 bg-white/95 text-foreground hover:text-white transition-colors duration-200 flex items-center justify-center gap-2 tracking-wide text-sm backdrop-blur-sm shadow-sm rounded-t-md border-t border-gray-100 group-hover:border-transparent hover:border-transparent focus:border-transparent pointer-events-auto"
          >
            <ShoppingBag className="w-4 h-4" />
            <span className="font-medium">QUICK ADD</span>
          </motion.button>
        </div>
        <QuickAddModal
          open={quickAddOpen}
          onOpenChange={setQuickAddOpen}
          product={{ id, name, price, original_price, image, sku }}
        />
      </div>

      {/* Product Info */}
      <div className="space-y-2">
        <motion.h3 
          className="text-sm leading-tight line-clamp-2 cursor-pointer min-h-10"
          onClick={() => onProductClick?.(id)}
          whileHover={{ color: 'rgb(115, 115, 115)' }}
          transition={{ duration: 0.2 }}
        >
          {name}
        </motion.h3>
        
        {colors && colors > 0 && (
          <p className="text-xs text-muted-foreground">
            {colors} {colors === 1 ? 'Colour' : 'Colours'}
          </p>
        )}

        <div className="flex items-center gap-2 flex-wrap">
          <motion.span 
            className="text-base"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {displayPrice}
          </motion.span>
          {hasDiscount && (
            <>
              <motion.span 
                className="text-sm text-muted-foreground line-through"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.25 }}
              >
                ₹{original_price.toLocaleString('en-IN')}
              </motion.span>
              <motion.span 
                className="text-xs px-2 py-0.5 bg-destructive/10 text-destructive"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
              >
                {discount}% OFF
              </motion.span>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}
