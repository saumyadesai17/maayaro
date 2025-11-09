'use client';

import { motion } from 'motion/react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { X, Plus, Minus, ShoppingBag, ArrowRight, Tag, ChevronDown, Loader2 } from 'lucide-react';
import { useState, useEffect, useCallback, memo, useRef } from 'react';
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
import { useCounts } from '@/contexts/CountsContext';

interface CartPageProps {
  onNavigate: (page: string) => void;
}

interface CartItemVariant {
  id: string;
  sku: string;
  size: string;
  color: string;
  color_hex: string;
  price: number | null;
  stock_quantity: number;
  is_active: boolean;
  product: {
    id: string;
    name: string;
    slug: string;
    description: string;
    base_price: number;
    images: Array<{
      id: string;
      image_url: string;
      alt_text: string;
      is_primary: boolean;
    }>;
  };
}

interface CartItem {
  id: string;
  cart_id: string;
  product_variant_id: string;
  quantity: number;
  created_at: string;
  updated_at: string;
  product_variant: CartItemVariant;
}

interface Cart {
  id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  cart_items: CartItem[];
}

export function CartPage({ onNavigate }: CartPageProps) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [removeConfirmOpen, setRemoveConfirmOpen] = useState(false);
  const [itemToRemove, setItemToRemove] = useState<{ cartItemId: string; productName: string } | null>(null);
  const [sizeDropdownOpen, setSizeDropdownOpen] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);
  const [availableSizes, setAvailableSizes] = useState<Record<string, any[]>>({});
  const isOptimisticUpdate = useRef(false);
  const { refreshCounts } = useCounts();

  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<{code: string, discount: number} | null>(null);

  // Fetch cart data
  useEffect(() => {
    fetchCart();
  }, []);

  // Populate available sizes for all cart items when cart loads initially
  useEffect(() => {
    if (cart?.cart_items && !loading && !isOptimisticUpdate.current) {
      cart.cart_items.forEach(item => {
        // Only fetch if not already cached
        if (!availableSizes[item.id]) {
          fetchAvailableSizes(item.product_variant.product.slug, item.product_variant.color, item.id);
        }
      });
    }
    // Reset optimistic update flag
    isOptimisticUpdate.current = false;
  }, [cart?.cart_items?.length, loading]); // Only trigger when cart items count changes or initial load

  const fetchCart = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/cart');
      if (!response.ok) {
        throw new Error('Failed to fetch cart');
      }
      const cartData = await response.json();
      isOptimisticUpdate.current = false;
      setCart(cartData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load cart');
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (cartItemId: string, newQuantity: number) => {
    const cartItem = cart?.cart_items.find(item => item.id === cartItemId);
    if (!cartItem) return;

    const maxQty = cartItem.product_variant.stock_quantity || 10;
    if (newQuantity < 1 || newQuantity > maxQty) return;

    // Optimistic update - update local state immediately
    const optimisticUpdate = () => {
      if (!cart) return;
      isOptimisticUpdate.current = true;
      const updatedCart = {
        ...cart,
        cart_items: cart.cart_items.map(item =>
          item.id === cartItemId
            ? { ...item, quantity: newQuantity }
            : item
        )
      };
      setCart(updatedCart);
    };

    try {
      setUpdating(cartItemId);
      
      // Update UI immediately for better UX
      optimisticUpdate();
      
      const response = await fetch('/api/cart/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cart_item_id: cartItemId,
          quantity: newQuantity,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update quantity');
        // Revert optimistic update on error
        await fetchCart();
      }
      // Note: No need to refresh counts for quantity changes since we count unique items, not quantities
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update quantity');
      // Revert optimistic update on error
      await fetchCart();
    } finally {
      setUpdating(null);
    }
  };

  const initiateRemove = (cartItemId: string, productName: string) => {
    setItemToRemove({ cartItemId, productName });
    setRemoveConfirmOpen(true);
  };

  const confirmRemove = async () => {
    if (!itemToRemove) return;

    // Optimistic update - remove from local state immediately
    const optimisticUpdate = () => {
      if (!cart) return;
      isOptimisticUpdate.current = true;
      const updatedCart = {
        ...cart,
        cart_items: cart.cart_items.filter(item => item.id !== itemToRemove.cartItemId)
      };
      setCart(updatedCart);
    };

    try {
      // Update UI immediately for better UX
      optimisticUpdate();
      setRemoveConfirmOpen(false);
      setItemToRemove(null);

      const response = await fetch(`/api/cart/remove/${itemToRemove.cartItemId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to remove item');
        // Revert optimistic update on error
        await fetchCart();
      } else {
        // Update header counts after successful removal
        refreshCounts();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove item');
      // Revert optimistic update on error
      await fetchCart();
    }
  };

  const cancelRemove = () => {
    setItemToRemove(null);
    setRemoveConfirmOpen(false);
  };

  // Fetch available sizes for a product when size dropdown is opened
  const fetchAvailableSizes = async (productSlug: string, currentColor: string, cartItemId: string) => {
    try {
      const response = await fetch(`/api/products/${productSlug}`);
      if (!response.ok) return;

      const productData = await response.json();
      const colorVariant = productData.variants_by_color[currentColor];
      
      if (colorVariant) {
        // Show ALL sizes, including out-of-stock ones (they'll be disabled in UI)
        const sizes = colorVariant.sizes.map((size: any) => ({
          size: size.size,
          variant_id: size.id,
          price: size.price,
          in_stock: size.in_stock,
          stock_quantity: size.stock_quantity || 0,
        }));
        
        setAvailableSizes(prev => ({
          ...prev,
          [cartItemId]: sizes
        }));
      }
    } catch (error) {
      console.error('Error fetching available sizes:', error);
    }
  };

  // Handle size change by replacing the cart item with new variant
  const updateSize = async (cartItemId: string, newVariantId: string, currentQuantity: number) => {
    const newSize = availableSizes[cartItemId]?.find(s => s.variant_id === newVariantId);
    if (!newSize) return;

    // Optimistic update - update size in local state immediately
    const optimisticUpdate = () => {
      if (!cart) return;
      isOptimisticUpdate.current = true;
      const updatedCart = {
        ...cart,
        cart_items: cart.cart_items.map(item =>
          item.id === cartItemId
            ? { 
                ...item, 
                product_variant: {
                  ...item.product_variant,
                  id: newVariantId,
                  size: newSize.size,
                  price: newSize.price || item.product_variant.price
                }
              }
            : item
        )
      };
      setCart(updatedCart);
    };

    try {
      setUpdating(cartItemId);
      
      // Update UI immediately for better UX
      optimisticUpdate();
      setSizeDropdownOpen(null);
      
      // Remove current item
      const removeResponse = await fetch(`/api/cart/remove/${cartItemId}`, {
        method: 'DELETE',
      });

      if (!removeResponse.ok) {
        throw new Error('Failed to remove current item');
      }

      // Add new variant
      const addResponse = await fetch('/api/cart/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          product_variant_id: newVariantId,
          quantity: currentQuantity,
        }),
      });

      if (!addResponse.ok) {
        const errorData = await addResponse.json();
        throw new Error(errorData.error || 'Failed to add new size');
      }

      // Get the new cart item data without full refresh
      const cartResponse = await fetch('/api/cart');
      if (cartResponse.ok) {
        const newCartData = await cartResponse.json();
        const newItem = newCartData.cart_items.find((item: any) => 
          item.product_variant_id === newVariantId && item.quantity === currentQuantity
        );
        
        if (newItem && cart) {
          // Update only the specific item with the new cart item ID
          const updatedCart = {
            ...cart,
            cart_items: cart.cart_items.map(item =>
              item.id === cartItemId
                ? { ...newItem }
                : item
            )
          };
          isOptimisticUpdate.current = false;
          setCart(updatedCart);
          
          // Refresh cart count since size change involves remove + add operation
          refreshCounts();
          
          // Cache available sizes for the new item
          setAvailableSizes(prev => ({
            ...prev,
            [newItem.id]: prev[cartItemId] // Transfer cached sizes to new item ID
          }));
          
          // Remove old cache
          setAvailableSizes(prev => {
            const newSizes = { ...prev };
            delete newSizes[cartItemId];
            return newSizes;
          });
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to change size');
      // Revert optimistic update on error - minimal refresh
      const cartResponse = await fetch('/api/cart');
      if (cartResponse.ok) {
        const revertCartData = await cartResponse.json();
        isOptimisticUpdate.current = false;
        setCart(revertCartData);
      }
    } finally {
      setUpdating(null);
    }
  };



  const applyPromoCode = () => {
    // Mock promo code validation
    if (promoCode.toUpperCase() === 'MAAYARO10') {
      setAppliedPromo({ code: promoCode, discount: 10 });
    } else if (promoCode.toUpperCase() === 'FIRST500') {
      setAppliedPromo({ code: promoCode, discount: 500 });
    }
  };

  // Calculate totals from cart data
  const subtotal = cart?.cart_items?.reduce((total, item) => {
    const price = item.product_variant.price !== null 
      ? item.product_variant.price 
      : item.product_variant.product.base_price || 0;
    return total + (price * item.quantity);
  }, 0) || 0;

  const discount = appliedPromo?.discount || 0;
  const shipping = subtotal > 5000 ? 0 : 150;
  const tax = Math.round((subtotal - discount) * 0.18);
  const total = subtotal - discount + shipping + tax;

  // Transform cart items to match the UI expectations
  const transformedCartItems = cart?.cart_items?.map(item => {
    // Use variant price if available, otherwise fall back to product base_price
    const price = item.product_variant.price !== null 
      ? Number(item.product_variant.price) 
      : Number(item.product_variant.product.base_price) || 0;
    
    return {
      id: item.id,
      name: item.product_variant.product.name,
      sku: item.product_variant.sku,
      price: price,
      color: item.product_variant.color,
      size: item.product_variant.size,
      quantity: item.quantity,
      image: item.product_variant.product.images.find(img => img.is_primary)?.image_url || 
             item.product_variant.product.images[0]?.image_url || '',
      available_sizes: availableSizes[item.id] || [],
      max_quantity: item.product_variant.stock_quantity || 10,
      product_id: item.product_variant.product.id,
      product_slug: item.product_variant.product.slug,
      current_variant_id: item.product_variant_id,
      // Add stock information for display
      product_variant: {
        is_active: item.product_variant.is_active,
        stock_quantity: item.product_variant.stock_quantity || 0,
      }
    };
  }) || [];

  // Check for out-of-stock items
  const hasOutOfStockItems = transformedCartItems.some(item => 
    !item.product_variant.is_active || 
    item.product_variant.stock_quantity === 0 ||
    item.product_variant.stock_quantity < item.quantity
  );

  if (loading) {
    return (
      <div className="pt-16 min-h-screen bg-white flex items-center justify-center">
        <div className="flex items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin" />
          <span>Loading your cart...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pt-16 min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive mb-2">Error loading cart</p>
          <p className="text-sm text-muted-foreground">{error}</p>
          <button 
            onClick={fetchCart} 
            className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!cart || transformedCartItems.length === 0) {
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
                <ShoppingBag className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 text-muted-foreground" />
              </div>
            </div>

            {/* Heading */}
            <div className="space-y-3">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-medium">
                Your Bag is Empty
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground max-w-sm mx-auto leading-relaxed">
                Looks like you haven't added anything to your bag yet. Start shopping to fill it up!
              </p>
            </div>

            {/* Action Button */}
            <div className="pt-4">
              <button
                onClick={() => onNavigate('collection')}
                className="px-8 sm:px-10 py-3 sm:py-4 bg-primary text-primary-foreground hover:bg-foreground transition-colors inline-flex items-center gap-3 text-sm sm:text-base font-medium tracking-wide"
              >
                <span>CONTINUE SHOPPING</span>
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>

            {/* Additional Info */}
            <div className="pt-6 border-t border-border">
              <p className="text-xs sm:text-sm text-muted-foreground">
                Need help? Visit our <button onClick={() => onNavigate('account')} className="underline hover:text-foreground transition-colors">Help Center</button>
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-16 min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-6 sm:py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 sm:mb-12"
        >
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-medium mb-2">Shopping Bag</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            {transformedCartItems.length} {transformedCartItems.length === 1 ? 'item' : 'items'} in your bag
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-6">
            {transformedCartItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex gap-4 pb-6 border-b border-border last:border-0"
              >
                {/* Image */}
                <div className="w-28 h-36 sm:w-32 sm:h-40 shrink-0 bg-muted overflow-hidden">
                  <ImageWithFallback
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500 cursor-pointer"
                    onClick={() => onNavigate('product')}
                  />
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0 flex flex-col">
                  {/* Header: Title and Remove */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <h3
                      className="text-sm sm:text-base font-medium cursor-pointer hover:text-muted-foreground transition-colors line-clamp-2 leading-snug"
                      onClick={() => onNavigate('product')}
                    >
                      {item.name}
                    </h3>
                    <button
                      onClick={() => initiateRemove(item.id, item.name)}
                      className="p-1 hover:bg-secondary rounded transition-colors shrink-0"
                      aria-label="Remove item"
                    >
                      <X className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                  </div>

                  {/* SKU - Desktop only */}
                  <p className="text-xs text-muted-foreground mb-3 hidden sm:block">SKU: {item.sku}</p>
                  
                  {/* Stock Status */}
                  {item.product_variant && (
                    <div className="mb-2">
                      {!item.product_variant.is_active || item.product_variant.stock_quantity === 0 ? (
                        <div className="inline-flex items-center gap-1 px-2 py-1 bg-destructive/10 text-destructive text-xs rounded-md">
                          <div className="w-1.5 h-1.5 bg-destructive rounded-full"></div>
                          Out of Stock
                        </div>
                      ) : item.product_variant.stock_quantity < item.quantity ? (
                        <div className="inline-flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-md">
                          <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
                          Only {item.product_variant.stock_quantity} left
                        </div>
                      ) : item.product_variant.stock_quantity <= 5 ? (
                        <div className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-md">
                          <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></div>
                          Low Stock ({item.product_variant.stock_quantity} left)
                        </div>
                      ) : null}
                    </div>
                  )}

                  {/* Color and Size */}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-4">
                    <div className="text-xs sm:text-sm">
                      <span className="text-muted-foreground">Color: </span>
                      <span className="text-foreground font-medium">{item.color}</span>
                    </div>
                    
                    {/* Size Selector */}
                    {availableSizes[item.id] && availableSizes[item.id].length > 1 ? (
                      <div className="relative">
                        <button
                          onClick={() => setSizeDropdownOpen(sizeDropdownOpen === item.id ? null : item.id)}
                          disabled={updating === item.id || !item.product_variant.is_active || item.product_variant.stock_quantity === 0}
                          className="flex items-center gap-2 px-3 py-1 border border-border rounded hover:border-foreground transition-colors bg-white text-xs sm:text-sm disabled:opacity-50"
                        >
                          <span className="text-muted-foreground">Size:</span>
                          <span className="font-medium">{item.size}</span>
                          <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${
                            sizeDropdownOpen === item.id ? 'rotate-180' : ''
                          }`} />
                        </button>
                        
                        {sizeDropdownOpen === item.id && (
                          <>
                            {/* Backdrop to close dropdown */}
                            <div
                              className="fixed inset-0 z-10"
                              onClick={() => setSizeDropdownOpen(null)}
                            />
                            
                            {/* Dropdown Menu */}
                            <div className="absolute top-full left-0 mt-2 bg-white border border-border shadow-lg z-20 min-w-[100px]">
                              {availableSizes[item.id].map((sizeOption: any) => (
                                <button
                                  key={sizeOption.size}
                                  onClick={() => updateSize(item.id, sizeOption.variant_id, item.quantity)}
                                  disabled={!sizeOption.in_stock || updating === item.id}
                                  className={`w-full px-4 py-2 text-sm text-left transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                                    sizeOption.size === item.size 
                                      ? 'bg-foreground text-background font-medium' 
                                      : 'hover:bg-secondary'
                                  }`}
                                >
                                  <div className="flex justify-between items-center">
                                    <span>{sizeOption.size}</span>
                                    {sizeOption.in_stock && sizeOption.stock_quantity <= 5 && (
                                      <span className="text-xs text-orange-600 ml-2">({sizeOption.stock_quantity} left)</span>
                                    )}
                                  </div>
                                </button>
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                    ) : (
                      <div className="text-xs sm:text-sm">
                        <span className="text-muted-foreground">Size: </span>
                        <span className="text-foreground font-medium">{item.size}</span>
                      </div>
                    )}
                  </div>

                  {/* Price - Mobile */}
                  <div className="sm:hidden mb-3">
                    <p className="text-base font-semibold">
                      ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                    </p>
                    {item.quantity > 1 && (
                      <p className="text-xs text-muted-foreground">
                        ₹{item.price.toLocaleString('en-IN')} each
                      </p>
                    )}
                  </div>

                  {/* Quantity Controls */}
                    <div className="flex items-center justify-between mt-auto">
                    <div className="flex flex-col gap-1.5">
                      <span className="text-xs text-muted-foreground uppercase tracking-wide">Qty</span>
                      <div className="flex items-center border border-border rounded relative">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className={`w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center transition-all ${
                            item.quantity <= 1 || updating === item.id || !item.product_variant.is_active
                              ? 'cursor-not-allowed opacity-40 bg-secondary/50'
                              : 'hover:bg-secondary cursor-pointer'
                          }`}
                          disabled={item.quantity <= 1 || updating === item.id || !item.product_variant.is_active}
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <div className="w-10 sm:w-11 text-center text-sm font-medium flex items-center justify-center">
                          {updating === item.id ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            item.quantity
                          )}
                        </div>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className={`w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center transition-all ${
                            item.quantity >= (item.product_variant.stock_quantity || 10) || 
                            updating === item.id || 
                            !item.product_variant.is_active || 
                            item.product_variant.stock_quantity === 0
                              ? 'cursor-not-allowed opacity-40 bg-secondary/50'
                              : 'hover:bg-secondary cursor-pointer'
                          }`}
                          disabled={
                            item.quantity >= (item.product_variant.stock_quantity || 10) || 
                            updating === item.id || 
                            !item.product_variant.is_active || 
                            item.product_variant.stock_quantity === 0
                          }
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      {item.quantity >= (item.max_quantity || 10) && (
                        <p className="text-xs text-amber-600">Max reached</p>
                      )}
                    </div>                    {/* Price - Desktop */}
                    <div className="hidden sm:block text-right">
                      <p className="text-lg font-semibold">
                        ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                      </p>
                      {item.quantity > 1 && (
                        <p className="text-xs text-muted-foreground mt-1">
                          ₹{item.price.toLocaleString('en-IN')} each
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:sticky lg:top-24 space-y-4 sm:space-y-6"
            >
              {/* Promo Code */}
              <div className="p-4 sm:p-6 bg-secondary">
                <h3 className="text-sm font-medium mb-4 flex items-center gap-2">
                  <Tag className="w-4 h-4" />
                  <span>Promo Code</span>
                </h3>
                {!appliedPromo ? (
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      placeholder="Enter code"
                      className="flex-1 px-4 py-2.5 sm:py-2 border border-border bg-white focus:outline-none focus:border-foreground transition-colors text-sm"
                    />
                    <button
                      onClick={applyPromoCode}
                      className="px-6 py-2.5 sm:py-2 bg-foreground text-background hover:bg-primary transition-colors text-sm font-medium whitespace-nowrap"
                    >
                      Apply
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-3 bg-white border border-border">
                    <span className="text-sm font-medium">{appliedPromo.code}</span>
                    <button
                      onClick={() => {
                        setAppliedPromo(null);
                        setPromoCode('');
                      }}
                      className="text-sm text-muted-foreground hover:text-foreground underline"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>

              {/* Summary */}
              <div className="border border-border p-4 sm:p-6 space-y-4">
                <h2 className="text-base sm:text-lg font-medium pb-4 border-b border-border">Order Summary</h2>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>₹{subtotal.toLocaleString('en-IN')}</span>
                  </div>

                  {appliedPromo && (
                    <div className="flex justify-between text-destructive">
                      <span>Discount ({appliedPromo.code})</span>
                      <span>-₹{discount.toLocaleString('en-IN')}</span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipping</span>
                    <span>{shipping === 0 ? 'FREE' : `₹${shipping}`}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tax (GST 18%)</span>
                    <span>₹{tax.toLocaleString('en-IN')}</span>
                  </div>

                  {subtotal < 5000 && (
                    <p className="text-xs text-muted-foreground pt-2">
                      Add ₹{(5000 - subtotal).toLocaleString('en-IN')} more for free shipping
                    </p>
                  )}
                </div>

                <div className="pt-4 border-t border-border">
                  <div className="flex justify-between text-base sm:text-lg font-medium mb-6">
                    <span>Total</span>
                    <span>₹{total.toLocaleString('en-IN')}</span>
                  </div>
                  <button
                    onClick={() => !hasOutOfStockItems && onNavigate('checkout')}
                    disabled={hasOutOfStockItems}
                    className={`w-full py-3.5 sm:py-4 transition-colors flex items-center justify-center gap-3 text-sm sm:text-base font-medium ${
                      hasOutOfStockItems 
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                        : 'bg-primary text-primary-foreground hover:bg-foreground'
                    }`}
                  >
                    <span>{hasOutOfStockItems ? 'Items Out of Stock' : 'Proceed to Checkout'}</span>
                    {!hasOutOfStockItems && <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />}
                  </button>
                </div>
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-3 gap-3 sm:gap-4 pt-4 sm:pt-6 text-center text-xs">
                <div>
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-secondary mx-auto mb-2 flex items-center justify-center rounded">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-muted-foreground">Secure Payment</p>
                </div>
                <div>
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-secondary mx-auto mb-2 flex items-center justify-center rounded">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                    </svg>
                  </div>
                  <p className="text-muted-foreground">Free Shipping</p>
                </div>
                <div>
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-secondary mx-auto mb-2 flex items-center justify-center rounded">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </div>
                  <p className="text-muted-foreground">Easy Returns</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Remove Confirmation Dialog */}
      <AlertDialog open={removeConfirmOpen} onOpenChange={setRemoveConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove item from cart?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove "{itemToRemove?.productName}" from your shopping bag? This action cannot be undone.
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
  );
}
