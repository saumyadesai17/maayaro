'use client';

import { motion } from 'motion/react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { X, Plus, Minus, ShoppingBag, ArrowRight, Tag, ChevronDown } from 'lucide-react';
import { useState } from 'react';
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
import { useStore } from '@/contexts/StoreContext';

interface CartPageProps {
  onNavigate: (page: string) => void;
}

export function CartPage({ onNavigate }: CartPageProps) {
  const { cartItems, updateCartItemSize, updateCartItemQuantity, removeFromCart, cartTotal } = useStore();
  const [removeConfirmOpen, setRemoveConfirmOpen] = useState(false);
  const [itemToRemove, setItemToRemove] = useState<string | null>(null);
  const [sizeDropdownOpen, setSizeDropdownOpen] = useState<number | null>(null);

  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<{code: string, discount: number} | null>(null);

  const updateQuantity = (id: number, newQuantity: number) => {
    const item = cartItems.find(i => i.id === id);
    if (!item) return;
    
    const maxQty = item.max_quantity || 10;
    if (newQuantity < 1 || newQuantity > maxQty) return;
    
    updateCartItemQuantity(id, newQuantity);
  };

  const updateSize = (id: number, newSize: string) => {
    updateCartItemSize(id, newSize);
    setSizeDropdownOpen(null);
  };

  const initiateRemove = (id: number) => {
    setItemToRemove(String(id));
    setRemoveConfirmOpen(true);
  };

  const confirmRemove = () => {
    if (itemToRemove) {
      removeFromCart(Number(itemToRemove));
      setItemToRemove(null);
    }
    setRemoveConfirmOpen(false);
  };

  const cancelRemove = () => {
    setItemToRemove(null);
    setRemoveConfirmOpen(false);
  };

  const applyPromoCode = () => {
    // Mock promo code validation
    if (promoCode.toUpperCase() === 'MAAYARO10') {
      setAppliedPromo({ code: promoCode, discount: 10 });
    } else if (promoCode.toUpperCase() === 'FIRST500') {
      setAppliedPromo({ code: promoCode, discount: 500 });
    }
  };

  const subtotal = cartTotal;
  const discount = appliedPromo?.discount || 0;
  const shipping = subtotal > 5000 ? 0 : 150;
  const tax = Math.round((subtotal - discount) * 0.18);
  const total = subtotal - discount + shipping + tax;

  if (cartItems.length === 0) {
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
            {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'} in your bag
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-6">
            {cartItems.map((item, index) => (
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
                      onClick={() => initiateRemove(item.id)}
                      className="p-1 hover:bg-secondary rounded transition-colors shrink-0"
                      aria-label="Remove item"
                    >
                      <X className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                  </div>

                  {/* SKU - Desktop only */}
                  <p className="text-xs text-muted-foreground mb-3 hidden sm:block">SKU: {item.sku}</p>
                  
                  {/* Color and Size */}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-4">
                    <div className="text-xs sm:text-sm">
                      <span className="text-muted-foreground">Color: </span>
                      <span className="text-foreground font-medium">{item.color}</span>
                    </div>
                    
                    {/* Size Selector */}
                    {item.available_sizes && item.available_sizes.length > 1 ? (
                      <div className="relative">
                        <button
                          onClick={() => setSizeDropdownOpen(sizeDropdownOpen === item.id ? null : item.id)}
                          className="flex items-center gap-2 px-3 py-1 border border-border rounded hover:border-foreground transition-colors bg-white text-xs sm:text-sm"
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
                              {item.available_sizes.map((size) => (
                                <button
                                  key={size}
                                  onClick={() => updateSize(item.id, size)}
                                  className={`w-full px-4 py-2 text-sm text-left transition-colors ${
                                    size === item.size 
                                      ? 'bg-foreground text-background font-medium' 
                                      : 'hover:bg-secondary'
                                  }`}
                                >
                                  {size}
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
                      <div className="flex items-center border border-border rounded">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className={`w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center transition-all ${
                            item.quantity <= 1
                              ? 'cursor-not-allowed opacity-40 bg-secondary/50'
                              : 'hover:bg-secondary cursor-pointer'
                          }`}
                          disabled={item.quantity <= 1}
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-10 sm:w-11 text-center text-sm font-medium">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className={`w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center transition-all ${
                            item.quantity >= (item.max_quantity || 10)
                              ? 'cursor-not-allowed opacity-40 bg-secondary/50'
                              : 'hover:bg-secondary cursor-pointer'
                          }`}
                          disabled={item.quantity >= (item.max_quantity || 10)}
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      {item.quantity >= (item.max_quantity || 10) && (
                        <p className="text-xs text-amber-600">Max reached</p>
                      )}
                    </div>

                    {/* Price - Desktop */}
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
                    onClick={() => onNavigate('checkout')}
                    className="w-full py-3.5 sm:py-4 bg-primary text-primary-foreground hover:bg-foreground transition-colors flex items-center justify-center gap-3 text-sm sm:text-base font-medium"
                  >
                    <span>Proceed to Checkout</span>
                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
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
              Are you sure you want to remove this item from your shopping bag? This action cannot be undone.
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
