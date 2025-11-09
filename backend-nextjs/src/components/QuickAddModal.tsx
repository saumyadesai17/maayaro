"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { ShoppingBag, Plus, Minus, Loader2, Check } from "lucide-react";
import { useStore } from "@/contexts/StoreContext";
import { useCounts } from "@/contexts/CountsContext";

interface ProductColor {
  name: string;
  hex: string;
  in_stock: boolean;
}

interface ProductSize {
  id: string;
  sku: string;
  size: string;
  price: number;
  stock_quantity: number;
  in_stock: boolean;
}

interface ProductVariant {
  color: string;
  color_hex: string;
  sizes: ProductSize[];
}

interface ProductDetail {
  id: string;
  name: string;
  slug: string;
  description: string;
  material: string;
  care_instructions: string;
  price: number;
  original_price: number | null;
  price_range: {
    min: number;
    max: number;
  };
  images: Array<{
    url: string;
    alt: string;
    is_primary: boolean;
  }>;
  colors: ProductColor[];
  sizes: string[];
  variants_by_color: Record<string, ProductVariant>;
  in_stock: boolean;
  total_stock: number;
  category: {
    id: string;
    name: string;
    slug: string;
    parent: any;
  };
  reviews: {
    average_rating: number;
    total_reviews: number;
    rating_distribution: Record<string, number>;
    reviews: any[];
  };
  created_at: string;
}

interface QuickAddModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productSlug: string;
}

export default function QuickAddModal({ open, onOpenChange, productSlug }: QuickAddModalProps) {
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [qty, setQty] = useState(1);
  const [productDetail, setProductDetail] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [addingToCart, setAddingToCart] = useState(false);
  const [addedSuccess, setAddedSuccess] = useState(false);
  const { refreshCounts } = useCounts();

  // Fetch product details when modal opens
  useEffect(() => {
    if (open && productSlug) {
      setLoading(true);
      setError(null);
      fetch(`/api/products/${productSlug}`)
        .then(res => {
          if (!res.ok) throw new Error('Failed to fetch product details');
          return res.json();
        })
        .then((data: ProductDetail) => {
          setProductDetail(data);
          // Reset selections when product changes
          setSelectedColor('');
          setSelectedSize('');
          setQty(1);
          setAddingToCart(false);
          setAddedSuccess(false);
        })
        .catch(err => {
          setError(err.message);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [open, productSlug]);

  const handleAdd = async () => {
    if (!selectedSize || !selectedColor || !productDetail) {
      return; // optionally show validation
    }
    
    try {
      setAddingToCart(true);
      setError(null);
      
      // Find the selected variant
      const colorVariant = productDetail.variants_by_color[selectedColor];
      const selectedVariant = colorVariant?.sizes.find(s => s.size === selectedSize);
      
      if (!selectedVariant) {
        throw new Error('Selected variant not found');
      }

      // Call the cart API
      const response = await fetch('/api/cart/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          product_variant_id: selectedVariant.id,
          quantity: qty,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add to cart');
      }

      // Show success feedback
      setAddedSuccess(true);
      
      // Refresh cart count in header
      refreshCounts();
      
      // Close modal after a brief success display
      setTimeout(() => {
        onOpenChange(false);
        setAddedSuccess(false);
      }, 800);
    } catch (err) {
      console.error('Error adding to cart:', err);
      setError(err instanceof Error ? err.message : 'Failed to add to cart');
    } finally {
      setAddingToCart(false);
    }
  };

  if (!productDetail && !loading && !error) return null;

  const displayPrice = `₹${productDetail?.price.toLocaleString('en-IN') || '0'}`;
  const hasDiscount = productDetail?.original_price && productDetail.original_price > 0;
  const discount = hasDiscount && productDetail?.original_price 
    ? Math.round(((productDetail.original_price - productDetail.price) / productDetail.original_price) * 100) 
    : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="w-[95vw] sm:max-w-[600px] md:max-w-[750px] lg:max-w-[900px] max-h-[90vh] overflow-y-auto p-4 sm:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <DialogHeader className="sr-only">
          <DialogTitle>Quick Add</DialogTitle>
        </DialogHeader>

        {error && (
          <div className="flex items-center justify-center p-8">
            <div className="text-center">
              <p className="text-destructive mb-2">Error loading product</p>
              <p className="text-sm text-muted-foreground">{error}</p>
            </div>
          </div>
        )}

        {!error && (
          <div className="grid grid-cols-1 lg:grid-cols-[45%_1fr] gap-6 lg:gap-8 pt-2">
            {/* Product Image */}
            <div className="w-full flex items-start">
              <div className="w-full aspect-3/4 bg-muted overflow-hidden relative">
                {loading || !productDetail ? (
                  <div className="w-full h-full bg-muted animate-pulse" />
                ) : (
                  <ImageWithFallback
                    src={productDetail.images.find(img => img.is_primary)?.url || productDetail.images[0]?.url || ''}
                    alt={productDetail.name}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
            </div>

            {/* Product Info & Options */}
            <div className="space-y-5">
              {/* Brand & Title */}
              <div>
                {loading || !productDetail ? (
                  <>
                    <div className="h-3 bg-muted animate-pulse rounded w-20 mb-2" />
                    <div className="h-7 bg-muted animate-pulse rounded w-3/4" />
                  </>
                ) : (
                  <>
                    {productDetail.category.parent && (
                      <div className="text-xs tracking-widest text-muted-foreground mb-2">{productDetail.category.parent.name}</div>
                    )}
                    <h2 className="text-xl md:text-2xl leading-tight">{productDetail.name}</h2>
                  </>
                )}
              </div>

              {/* Price */}
              <div className="flex items-center gap-3 pb-5 border-b border-border">
                {loading || !productDetail ? (
                  <div className="h-8 bg-muted animate-pulse rounded w-32" />
                ) : (
                  <>
                    <span className="text-2xl font-medium">{displayPrice}</span>
                    {hasDiscount && productDetail.original_price && (
                      <>
                        <span className="text-base text-muted-foreground line-through">
                          ₹{productDetail.original_price.toLocaleString('en-IN')}
                        </span>
                        <span className="px-2 py-0.5 bg-destructive text-white text-xs">
                          {discount}% OFF
                        </span>
                      </>
                    )}
                  </>
                )}
              </div>

              {/* Product Description */}
              <div className="text-sm text-muted-foreground leading-relaxed">
                {loading || !productDetail ? (
                  <div className="space-y-2">
                    <div className="h-4 bg-muted animate-pulse rounded w-full" />
                    <div className="h-4 bg-muted animate-pulse rounded w-4/5" />
                  </div>
                ) : (
                  <p>{productDetail.description || 'Premium quality fabric with excellent craftsmanship. Perfect for any occasion.'}</p>
                )}
              </div>

              {/* Color Selection */}
              <div>
                <div className="mb-3">
                  <label className="text-sm font-medium tracking-wide">
                    COLOUR: <span className="text-muted-foreground font-normal">{selectedColor || 'Select'}</span>
                  </label>
                </div>
                <div className="flex gap-2">
                  {loading || !productDetail ? (
                    // Skeleton for colors
                    Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="w-12 h-12 bg-muted animate-pulse rounded" />
                    ))
                  ) : (
                    productDetail.colors.filter(color => color.in_stock).map((color) => (
                    <motion.button
                      key={color.name}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedColor(color.name);
                      }}
                      className={`relative w-12 h-12 border-2 transition-all ${
                        selectedColor === color.name ? 'border-foreground' : 'border-border hover:border-muted-foreground'
                      }`}
                      style={{ backgroundColor: color.hex }}
                      aria-label={color.name}
                      aria-pressed={selectedColor === color.name}
                    >
                      {selectedColor === color.name && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute inset-0 flex items-center justify-center"
                        >
                          <div className="w-2.5 h-2.5 bg-foreground rounded-full" />
                        </motion.div>
                      )}
                    </motion.button>
                  ))
                  )}
                </div>
              </div>

              {/* Size Selection */}
            <div>
              <div className="mb-3">
                <label className="text-sm font-medium tracking-wide">SELECT SIZE</label>
              </div>
              <div className="grid grid-cols-6 gap-2">
                {loading || !productDetail ? (
                  // Skeleton for sizes
                  Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="py-3 h-11 bg-muted animate-pulse rounded border-2 border-transparent" />
                  ))
                ) : (
                  productDetail.sizes.map((sizeName) => {
                    // Check if this size is available for the selected color
                    const isAvailableForColor = selectedColor && productDetail.variants_by_color[selectedColor]
                      ? productDetail.variants_by_color[selectedColor].sizes.some(s => s.size === sizeName && s.in_stock)
                      : false;
                    
                    // If no color is selected, disable all sizes
                    const isDisabled = !selectedColor || !isAvailableForColor;
                    
                    return (
                      <motion.button
                        key={sizeName}
                        whileHover={!isDisabled ? { scale: 1.05 } : {}}
                        whileTap={!isDisabled ? { scale: 0.95 } : {}}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!isDisabled) setSelectedSize(sizeName);
                        }}
                        disabled={isDisabled}
                        className={`py-3 text-sm border-2 transition-all relative ${
                          isDisabled
                            ? 'border-border text-muted-foreground cursor-not-allowed'
                            : selectedSize === sizeName
                            ? 'border-foreground bg-foreground text-background'
                            : 'border-border hover:border-foreground'
                        }`}
                      >
                        {sizeName}
                        {isDisabled && (
                          <div className="absolute inset-0">
                            <svg 
                              className="w-full h-full" 
                              viewBox="0 0 100 100" 
                              preserveAspectRatio="none"
                            >
                              <line 
                                x1="0" 
                                y1="0" 
                                x2="100" 
                                y2="100" 
                                stroke="currentColor" 
                                strokeWidth="1" 
                                className="text-muted-foreground"
                              />
                            </svg>
                          </div>
                        )}
                      </motion.button>
                    );
                  })
                )}
              </div>
            </div>            {/* Quantity */}
            <div>
              <label className="text-sm font-medium tracking-wide mb-3 block">QUANTITY</label>
              {loading || !productDetail ? (
                <div className="h-11 w-32 bg-muted animate-pulse rounded border-2 border-transparent" />
              ) : (
                <div className="flex items-center border-2 border-border w-fit">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setQty(Math.max(1, qty - 1));
                    }}
                    className="w-11 h-11 hover:bg-secondary transition-colors flex items-center justify-center"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-14 text-center font-medium">{qty}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setQty(qty + 1);
                    }}
                    className="w-11 h-11 hover:bg-secondary transition-colors flex items-center justify-center"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Add to Cart Button */}
            <div className="pt-2">
              {loading || !productDetail ? (
                <div className="w-full h-12 bg-muted animate-pulse rounded" />
              ) : (
                <motion.button
                  whileHover={{ scale: addingToCart || addedSuccess ? 1 : 1.02 }}
                  whileTap={{ scale: addingToCart || addedSuccess ? 1 : 0.98 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAdd();
                  }}
                  disabled={!selectedSize || !selectedColor || addingToCart || addedSuccess}
                  className={`w-full py-3.5 transition-all flex items-center justify-center gap-2.5 tracking-wide text-sm disabled:cursor-not-allowed ${
                    addedSuccess 
                      ? 'bg-green-500 text-white' 
                      : 'bg-foreground text-background hover:bg-primary disabled:opacity-50'
                  }`}
                >
                  {addingToCart ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>ADDING...</span>
                    </>
                  ) : addedSuccess ? (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="flex items-center gap-2.5"
                    >
                      <Check className="w-5 h-5" />
                      <span>ADDED TO BAG!</span>
                    </motion.div>
                  ) : (
                    <>
                      <ShoppingBag className="w-5 h-5" />
                      <span>ADD TO BAG</span>
                    </>
                  )}
                </motion.button>
              )}
            </div>
          </div>
        </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
