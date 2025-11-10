'use client';

import { motion, AnimatePresence } from 'motion/react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Check, CreditCard, Truck, MapPin, ArrowLeft, Wallet, Smartphone, Building2, DollarSign, Shield, Package, ChevronDown, ChevronUp, ShoppingBag, Loader2, Plus } from 'lucide-react';
import { useState, useMemo, useEffect } from 'react';
import { State, City } from 'country-state-city';

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface CheckoutPageProps {
  onNavigate: (page: string, orderData?: any) => void;
}

type CheckoutStep = 'shipping' | 'payment' | 'review';

interface Address {
  id?: string;
  type?: string;
  full_name: string;
  phone: string;
  address_line1: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  is_default?: boolean;
}

interface CartItem {
  id: string;
  quantity: number;
  product_variant: {
    id: string;
    sku: string;
    size: string;
    color: string;
    color_hex: string;
    price: number | null;
    stock_quantity: number;
    product: {
      id: string;
      name: string;
      slug: string;
      base_price: number;
      images: Array<{
        id: string;
        image_url: string;
        alt_text: string;
        is_primary: boolean;
        sort_order: number;
      }>;
    };
  };
}

export function CheckoutPage({ onNavigate }: CheckoutPageProps) {
  const [currentStep, setCurrentStep] = useState<CheckoutStep>('shipping');
  const [showOrderSummary, setShowOrderSummary] = useState(false);
  const [isProcessingOrder, setIsProcessingOrder] = useState(false);
  
  // API state
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loadingCart, setLoadingCart] = useState(true);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [cartError, setCartError] = useState<string | null>(null);
  
  // Site settings state
  const [siteSettings, setSiteSettings] = useState<{
    tax_rate: number;
    free_shipping_threshold: number;
    standard_shipping_fee: number;
  }>({
    tax_rate: 0.18,
    free_shipping_threshold: 500,
    standard_shipping_fee: 50,
  });
  
  // Address form state
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [selectedShippingAddress, setSelectedShippingAddress] = useState<string>('');
  const [selectedBillingAddress, setSelectedBillingAddress] = useState<string>('');
  const [creatingAddress, setCreatingAddress] = useState(false);
  const [newAddress, setNewAddress] = useState<Address>({
    type: 'shipping',
    full_name: '',
    phone: '',
    address_line1: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'India',
  });
  const [sameAsBilling, setSameAsBilling] = useState(true);
  const [selectedShipping, setSelectedShipping] = useState('standard');
  const [selectedPayment, setSelectedPayment] = useState('razorpay');

  // Fetch site settings
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/settings');
        if (response.ok) {
          const settings = await response.json();
          console.log('Site settings loaded:', settings);
          setSiteSettings({
            tax_rate: settings.tax_rate || 0.18,
            free_shipping_threshold: settings.free_shipping_threshold || 500,
            standard_shipping_fee: settings.standard_shipping_fee || 50,
          });
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
        // Use defaults if fetch fails
      }
    };

    fetchSettings();
  }, []);

  // Fetch cart data
  useEffect(() => {
    const fetchCart = async () => {
      try {
        setLoadingCart(true);
        const response = await fetch('/api/cart');
        if (!response.ok) {
          throw new Error('Failed to fetch cart');
        }
        const cartData = await response.json();
        console.log('Cart data received:', cartData);
        console.log('Cart items:', cartData.cart_items);
        setCartItems(cartData.cart_items || []);
      } catch (error) {
        console.error('Error fetching cart:', error);
        setCartError('Failed to load cart data');
        setCartItems([]);
      } finally {
        setLoadingCart(false);
      }
    };

    fetchCart();
  }, []);

  // Fetch addresses
  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        setLoadingAddresses(true);
        console.log('Fetching addresses...');
        
        const response = await fetch('/api/addresses');
        console.log('Addresses response status:', response.status);
        
        if (!response.ok) {
          if (response.status === 401) {
            console.error('User not authenticated');
            throw new Error('Please log in to continue');
          }
          const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
          throw new Error(errorData.error || `Failed to fetch addresses (${response.status})`);
        }
        
        const data = await response.json();
        console.log('Addresses data:', data);
        
        setAddresses(data.addresses || []);
        
        // Set default addresses if available
        const defaultAddress = data.addresses?.find((addr: Address) => addr.is_default);
        if (defaultAddress) {
          setSelectedShippingAddress(defaultAddress.id!);
          setSelectedBillingAddress(defaultAddress.id!);
        }
      } catch (error) {
        console.error('Error fetching addresses:', error);
        setAddresses([]);
        // Don't show alert for authentication issues, let the parent handle it
      } finally {
        setLoadingAddresses(false);
      }
    };

    fetchAddresses();
  }, []);

  // Calculate cart total from API data
  const cartTotal = useMemo(() => {
    const total = cartItems.reduce((total, item) => {
      const price = item.product_variant.price !== null 
        ? item.product_variant.price 
        : item.product_variant.product.base_price || 0;
      console.log(`Item "${item.product_variant.product.name}": variant_price=${item.product_variant.price}, base_price=${item.product_variant.product.base_price}, used_price=${price}, quantity=${item.quantity}, line_total=${price * item.quantity}`);
      return total + (price * item.quantity);
    }, 0);
    console.log('Calculated cart total:', total);
    return total;
  }, [cartItems]);

  const shippingMethods = [
    {
      id: 'standard',
      name: 'Standard Delivery',
      description: '5-7 business days',
      cost: siteSettings.standard_shipping_fee,
      free_threshold: siteSettings.free_shipping_threshold,
    },
    {
      id: 'express',
      name: 'Express Delivery',
      description: '2-3 business days',
      cost: 200,
    },
    {
      id: 'same-day',
      name: 'Same Day Delivery',
      description: 'Same business day',
      cost: 300,
    },
  ];

  const subtotal = cartTotal;
  const discount = 0; // TODO: Apply promo codes when implemented
  const shippingCost = selectedShipping === 'standard' && subtotal >= siteSettings.free_shipping_threshold 
    ? 0 
    : shippingMethods.find(m => m.id === selectedShipping)?.cost || 0;
  const tax = Math.round((subtotal - discount + shippingCost) * siteSettings.tax_rate);
  const total = subtotal - discount + shippingCost + tax;

  const steps = [
    { id: 'shipping', label: 'Shipping', icon: MapPin },
    { id: 'payment', label: 'Payment', icon: CreditCard },
    { id: 'review', label: 'Review', icon: Check },
  ];

  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentStep('payment');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentStep('review');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Create address function
  const createAddress = async (addressData: Address) => {
    try {
      const response = await fetch('/api/addresses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(addressData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('Address creation failed:', response.status, errorData);
        throw new Error(errorData.error || `Failed to create address (${response.status})`);
      }

      const result = await response.json();
      
      // Refresh addresses
      const addressesResponse = await fetch('/api/addresses');
      if (addressesResponse.ok) {
        const addressesData = await addressesResponse.json();
        setAddresses(addressesData.addresses || []);
      }
      
      return result.address;
    } catch (error) {
      console.error('Error creating address:', error);
      throw error;
    }
  };

  const handlePlaceOrder = async () => {
    if (isProcessingOrder) return;
    
    // Validate required fields
    if (!selectedShippingAddress) {
      alert('Please select a shipping address');
      return;
    }
    
    setIsProcessingOrder(true);

    try {
      // Create order using API
      const orderResponse = await fetch('/api/orders/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          shipping_address_id: selectedShippingAddress,
          billing_address_id: selectedBillingAddress || selectedShippingAddress,
          payment_method: selectedPayment,
          shipping_method: selectedShipping,
          notes: `Shipping method: ${selectedShipping}`,
        }),
      });

      if (!orderResponse.ok) {
        const errorData = await orderResponse.json();
        throw new Error(errorData.error || 'Failed to create order');
      }

      const orderData = await orderResponse.json();
      const order = orderData.order;
      console.log('Order data received:', orderData);
      console.log('Extracted order:', order);

      if (selectedPayment === 'cod') {
        // For Cash on Delivery - order is already created, create shipment
        try {
          await fetch('/api/shipping/create', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              order_id: order.id,
              length: 30, // Default package dimensions
              breadth: 20,
              height: 10,
              weight: 1,
            }),
          });
        } catch (error) {
          console.error('Shipment creation failed:', error);
          // Continue anyway - shipment can be created manually
        }

        // Clear cart after successful order
        await fetch('/api/cart', { method: 'DELETE' });

        onNavigate('order-confirmation', {
          success: true,
          orderNumber: order.order_number,
          orderId: order.id,
          total: order.total,
          paymentMethod: 'cod',
        });
      } else {
        // For Razorpay payment - create Razorpay order
        console.log('Creating payment order for order:', order.id);
        const paymentOrderResponse = await fetch('/api/payment/create-order', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            order_id: order.id,
          }),
        });

        if (!paymentOrderResponse.ok) {
          const errorData = await paymentOrderResponse.json().catch(() => ({ error: 'Unknown error' }));
          console.error('Payment order creation failed:', paymentOrderResponse.status, errorData);
          throw new Error(errorData.error || `Failed to create payment order (${paymentOrderResponse.status})`);
        }

        const paymentOrder = await paymentOrderResponse.json();
        console.log('Payment order received:', paymentOrder);

        // Load Razorpay script if not already loaded
        if (!window.Razorpay) {
          const script = document.createElement('script');
          script.src = 'https://checkout.razorpay.com/v1/checkout.js';
          script.async = true;
          document.body.appendChild(script);
          await new Promise((resolve) => {
            script.onload = resolve;
          });
        }

        // Get shipping address for prefill
        const shippingAddr = addresses.find(addr => addr.id === selectedShippingAddress);

        // Initialize Razorpay
        const options = {
          key: paymentOrder.key,
          amount: paymentOrder.amount,
          currency: 'INR',
          name: 'Maayaro',
          description: `Order #${order.order_number}`,
          order_id: paymentOrder.orderId,
          handler: async function (response: any) {
            try {
              console.log('Razorpay response received:', response);
              
              // Verify payment
              const verifyResponse = await fetch('/api/payment/verify', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  order_id: order.id,
                }),
              });

              if (verifyResponse.ok) {
                // Create shipment after successful payment
                try {
                  await fetch('/api/shipping/create', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                      order_id: order.id,
                      length: 30, // Default package dimensions
                      breadth: 20,
                      height: 10,
                      weight: 1,
                    }),
                  });
                } catch (error) {
                  console.error('Shipment creation failed:', error);
                  // Continue anyway - shipment can be created manually
                }

                // Cart is cleared automatically by the payment verification API
                
                onNavigate('order-confirmation', {
                  success: true,
                  orderNumber: order.order_number,
                  orderId: order.id,
                  total: order.total,
                  paymentMethod: 'razorpay',
                  paymentId: response.razorpay_payment_id,
                });
              } else {
                throw new Error('Payment verification failed');
              }
            } catch (error) {
              console.error('Payment verification error:', error);
              onNavigate('order-confirmation', {
                success: false,
                message: 'Payment verification failed. Please contact support.',
                paymentMethod: 'razorpay',
              });
            }
          },
          prefill: {
            name: shippingAddr?.full_name || '',
            contact: shippingAddr?.phone || '',
          },
          notes: {
            order_id: order.id,
            shipping_method: selectedShipping,
          },
          theme: {
            color: '#000000',
          },
          modal: {
            ondismiss: async function () {
              // Call API to mark payment as failed/cancelled
              try {
                await fetch('/api/payment/fail', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    razorpay_order_id: paymentOrder.orderId, // Use the actual Razorpay order ID
                    order_id: order.id,
                    reason: 'cancelled_by_user',
                  }),
                });
              } catch (error) {
                console.error('Error updating payment status:', error);
              }
              
              setIsProcessingOrder(false);
              onNavigate('order-confirmation', {
                success: false,
                message: 'Payment was cancelled. Your cart items are still saved.',
                paymentMethod: 'razorpay',
              });
            },
          },
        };

        const razorpay = new window.Razorpay(options);
        
        razorpay.on('payment.failed', async function (response: any) {
          // Call API to mark payment as failed
          try {
            await fetch('/api/payment/fail', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.error?.metadata?.order_id || paymentOrder.orderId, // Use from error or fallback
                order_id: order.id,
                reason: 'payment_failed',
                error_code: response.error?.code,
                error_description: response.error?.description,
              }),
            });
          } catch (error) {
            console.error('Error updating payment status:', error);
          }
          
          setIsProcessingOrder(false);
          onNavigate('order-confirmation', {
            success: false,
            message: response.error.description || 'Payment failed. Please try again.',
            paymentMethod: 'razorpay',
          });
        });
        
        razorpay.open();
      }
    } catch (error) {
      console.error('Order placement error:', error);
      setIsProcessingOrder(false);
      onNavigate('order-confirmation', {
        success: false,
        message: 'Failed to initialize payment. Please try again.',
        paymentMethod: selectedPayment,
      });
    }
  };

  // Get all states of India dynamically
  const indianStates = useMemo(() => State.getStatesOfCountry('IN'), []);

  // Get cities for selected state dynamically
  const availableCities = useMemo(() => {
    if (!newAddress.state) return [];
    
    // Find the state code from the state name
    const selectedState = indianStates.find(s => s.name === newAddress.state);
    if (!selectedState) return [];
    
    return City.getCitiesOfState('IN', selectedState.isoCode);
  }, [newAddress.state, indianStates]);

  // Show loading state while fetching cart data
  if (loadingCart) {
    return (
      <div className="pt-16 min-h-screen bg-white flex items-center justify-center">
        <div className="flex items-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Loading checkout...</span>
        </div>
      </div>
    );
  }

  // Show error state if cart failed to load
  if (cartError) {
    return (
      <div className="pt-16 min-h-screen bg-white flex items-center justify-center">
        <div className="max-w-md w-full mx-auto px-6 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-6"
          >
            <div className="space-y-3">
              <h1 className="text-3xl font-medium">Error Loading Cart</h1>
              <p className="text-muted-foreground">{cartError}</p>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="px-8 py-4 bg-primary text-primary-foreground hover:bg-foreground transition-colors"
            >
              Retry
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  // Redirect to cart if cart is empty
  if (cartItems.length === 0) {
    return (
      <div className="pt-16 min-h-screen bg-white flex items-center justify-center">
        <div className="max-w-md w-full mx-auto px-6 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-6"
          >
            <div className="flex justify-center">
              <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center">
                <ShoppingBag className="w-12 h-12 text-muted-foreground" />
              </div>
            </div>
            <div className="space-y-3">
              <h1 className="text-3xl font-medium">Your Cart is Empty</h1>
              <p className="text-muted-foreground">
                Add items to your cart before checking out
              </p>
            </div>
            <button
              onClick={() => onNavigate('collection')}
              className="px-8 py-4 bg-primary text-primary-foreground hover:bg-foreground transition-colors"
            >
              Continue Shopping
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-16 min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-6 sm:py-8">
        {/* Header with Back Button */}
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl">Checkout</h1>
          <button
            onClick={() => onNavigate('cart')}
            className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Cart</span>
          </button>
        </div>

        {/* Progress Steps */}
        <div className="mb-6 sm:mb-10">
          <div className="flex items-center justify-center gap-2 sm:gap-4 md:gap-8">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = step.id === currentStep;
              const isCompleted = steps.findIndex(s => s.id === currentStep) > index;

              return (
                <div key={step.id} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center border-2 transition-all ${
                        isCompleted
                          ? 'bg-primary border-primary text-primary-foreground'
                          : isActive
                          ? 'border-primary text-primary'
                          : 'border-border text-muted-foreground'
                      }`}
                    >
                      {isCompleted ? <Check className="w-5 h-5 sm:w-6 sm:h-6" /> : <Icon className="w-5 h-5 sm:w-6 sm:h-6" />}
                    </div>
                    <span
                      className={`mt-1.5 sm:mt-2 text-xs ${
                        isActive || isCompleted ? 'text-foreground font-medium' : 'text-muted-foreground'
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`w-8 sm:w-12 md:w-24 h-0.5 mx-1 sm:mx-2 ${
                        isCompleted ? 'bg-primary' : 'bg-border'
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Mobile Order Summary Toggle */}
        <div className="lg:hidden mb-6">
          <button
            onClick={() => setShowOrderSummary(!showOrderSummary)}
            className="w-full flex items-center justify-between p-4 border-2 border-border bg-secondary transition-colors"
          >
            <div className="flex items-center gap-3">
              <ShoppingBag className="w-5 h-5" />
              <div className="text-left">
                <p className="text-sm font-medium">Order Summary</p>
                <p className="text-xs text-muted-foreground">{cartItems.length} items</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-semibold">₹{total.toLocaleString('en-IN')}</span>
              <motion.div
                animate={{ rotate: showOrderSummary ? 180 : 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
              >
                <ChevronDown className="w-5 h-5" />
              </motion.div>
            </div>
          </button>
          
          <AnimatePresence initial={false}>
            {showOrderSummary && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ 
                  opacity: 1, 
                  height: 'auto',
                }}
                exit={{ 
                  opacity: 0, 
                  height: 0,
                }}
                transition={{ 
                  duration: 0.3,
                  ease: "easeInOut",
                  opacity: { duration: 0.2 }
                }}
                className="border-2 border-t-0 border-border overflow-hidden"
              >
                <div className="p-4 space-y-4">
              {/* Items */}
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {cartItems.map((item) => {
                  const primaryImage = item.product_variant.product.images.find(img => img.is_primary) || item.product_variant.product.images[0];
                  return (
                    <div key={item.id} className="flex gap-3">
                      <div className="w-16 h-20 bg-muted shrink-0 overflow-hidden">
                        <ImageWithFallback
                          src={primaryImage?.image_url || 'https://images.unsplash.com/photo-1610030469956-f0c75c6eabd8?w=400&q=80'}
                          alt={primaryImage?.alt_text || item.product_variant.product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0 text-xs">
                        <p className="line-clamp-2 mb-2 font-medium text-sm">{item.product_variant.product.name}</p>
                        
                        {/* Color and Size - Mobile optimized */}
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex items-center gap-1">
                            <div 
                              className="w-2.5 h-2.5 rounded-full border border-gray-300"
                              style={{ backgroundColor: item.product_variant.color_hex }}
                            />
                            <span className="text-muted-foreground">{item.product_variant.color}</span>
                          </div>
                          <span className="text-muted-foreground">•</span>
                          <span className="px-1 py-0.5 bg-muted rounded text-foreground text-xs font-medium">
                            {item.product_variant.size}
                          </span>
                        </div>
                        
                        {/* Quantity and Price - Mobile layout */}
                        <div className="flex items-center justify-between">
                          <span className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
                            Qty {item.quantity}
                          </span>
                          <p className="font-semibold text-sm">₹{(() => {
                            const price = item.product_variant.price !== null 
                              ? item.product_variant.price 
                              : item.product_variant.product.base_price || 0;
                            return (price * item.quantity).toLocaleString('en-IN');
                          })()}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Totals */}
              <div className="space-y-2 text-sm pt-3 border-t border-border">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>{shippingCost === 0 ? 'FREE' : `₹${shippingCost}`}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax (GST 18%)</span>
                  <span>₹{tax.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-border font-semibold">
                  <span>Total</span>
                  <span>₹{total.toLocaleString('en-IN')}</span>
                </div>
              </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {/* Shipping Step */}
              {currentStep === 'shipping' && (
                <motion.div
                  key="shipping"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <form onSubmit={handleShippingSubmit} className="space-y-8">
                    {/* Shipping Address Selection */}
                    <div>
                      <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl">Shipping Address</h2>
                        <button
                          type="button"
                          onClick={() => setShowAddressForm(true)}
                          className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                          Add New Address
                        </button>
                      </div>

                      {loadingAddresses ? (
                        <div className="flex items-center justify-center py-8">
                          <Loader2 className="w-6 h-6 animate-spin" />
                          <span className="ml-2">Loading addresses...</span>
                        </div>
                      ) : addresses.length === 0 ? (
                        <div className="text-center py-8">
                          <p className="text-muted-foreground mb-4">No saved addresses found</p>
                          <button
                            type="button"
                            onClick={() => setShowAddressForm(true)}
                            className="px-6 py-3 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                          >
                            Add Your First Address
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {addresses.map((address) => (
                            <label
                              key={address.id}
                              className={`block p-4 border-2 cursor-pointer transition-colors ${
                                selectedShippingAddress === address.id
                                  ? 'border-primary bg-primary/5'
                                  : 'border-border hover:border-muted-foreground'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <input
                                  type="radio"
                                  name="shipping_address"
                                  value={address.id}
                                  checked={selectedShippingAddress === address.id}
                                  onChange={(e) => setSelectedShippingAddress(e.target.value)}
                                  className="w-4 h-4"
                                  required
                                />
                                <div className="flex-1">
                                  <p className="font-medium">
                                    {address.full_name}
                                    {address.is_default && (
                                      <span className="ml-2 px-2 py-1 text-xs bg-primary text-primary-foreground rounded">
                                        Default
                                      </span>
                                    )}
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    {address.address_line1}
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    {address.city}, {address.state} {address.postal_code}
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    Phone: {address.phone}
                                  </p>
                                </div>
                              </div>
                            </label>
                          ))}
                        </div>
                      )}

                      {/* Add New Address Form */}
                      {showAddressForm && (
                        <div className="mt-6 p-6 border-2 border-dashed border-border">
                          <h3 className="text-lg mb-4">Add New Address</h3>
                          <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm mb-2">Full Name *</label>
                                <input
                                  type="text"
                                  required
                                  value={newAddress.full_name}
                                  onChange={(e) => setNewAddress({ ...newAddress, full_name: e.target.value })}
                                  className="w-full px-4 py-3 border border-border bg-white focus:outline-none focus:border-foreground transition-colors"
                                  placeholder="John Doe"
                                />
                              </div>
                              <div>
                                <label className="block text-sm mb-2">Phone *</label>
                                <input
                                  type="tel"
                                  required
                                  value={newAddress.phone}
                                  onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                                  placeholder="9876543210"
                                  className="w-full px-4 py-3 border border-border bg-white focus:outline-none focus:border-foreground transition-colors"
                                />
                              </div>
                            </div>
                            <div>
                              <label className="block text-sm mb-2">Address *</label>
                              <input
                                type="text"
                                required
                                value={newAddress.address_line1}
                                onChange={(e) => setNewAddress({ ...newAddress, address_line1: e.target.value })}
                                className="w-full px-4 py-3 border border-border bg-white focus:outline-none focus:border-foreground transition-colors"
                                placeholder="B/102, Vasant Sangeet, Sainagar, Vasai West"
                              />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div>
                                <label className="block text-sm mb-2">State *</label>
                                <select
                                  required
                                  value={newAddress.state}
                                  onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value, city: '' })}
                                  className="w-full px-4 py-3 border border-border bg-white focus:outline-none focus:border-foreground transition-colors"
                                >
                                  <option value="">Select State</option>
                                  {indianStates.map(state => (
                                    <option key={state.isoCode} value={state.name}>{state.name}</option>
                                  ))}
                                </select>
                              </div>
                              <div>
                                <label className="block text-sm mb-2">City *</label>
                                <select
                                  required
                                  value={newAddress.city}
                                  onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                                  disabled={!newAddress.state}
                                  className="w-full px-4 py-3 border border-border bg-white focus:outline-none focus:border-foreground transition-colors disabled:bg-secondary disabled:cursor-not-allowed"
                                >
                                  <option value="">
                                    {newAddress.state ? 'Select City' : 'Select State First'}
                                  </option>
                                  {availableCities.map(city => (
                                    <option key={city.name} value={city.name}>{city.name}</option>
                                  ))}
                                </select>
                              </div>
                              <div>
                                <label className="block text-sm mb-2">PIN Code *</label>
                                <input
                                  type="text"
                                  required
                                  pattern="[0-9]{6}"
                                  value={newAddress.postal_code}
                                  onChange={(e) => setNewAddress({ ...newAddress, postal_code: e.target.value })}
                                  placeholder="400001"
                                  className="w-full px-4 py-3 border border-border bg-white focus:outline-none focus:border-foreground transition-colors"
                                />
                              </div>
                            </div>
                            <div className="flex gap-4">
                              <button
                                type="button"
                                onClick={async () => {
                                  if (creatingAddress) return;
                                  
                                  // Validate required fields
                                  if (!newAddress.full_name || !newAddress.phone || !newAddress.address_line1 || 
                                      !newAddress.city || !newAddress.state || !newAddress.postal_code) {
                                    alert('Please fill in all required fields');
                                    return;
                                  }

                                  setCreatingAddress(true);
                                  try {
                                    console.log('Creating address with data:', { ...newAddress, is_default: addresses.length === 0 });
                                    
                                    const createdAddress = await createAddress({ ...newAddress, is_default: addresses.length === 0 });
                                    
                                    console.log('Address created successfully:', createdAddress);
                                    
                                    // Reset form
                                    setNewAddress({
                                      type: 'shipping',
                                      full_name: '',
                                      phone: '',
                                      address_line1: '',
                                      city: '',
                                      state: '',
                                      postal_code: '',
                                      country: 'India',
                                    });
                                    setShowAddressForm(false);
                                    
                                    // Set as selected if it's the first address or the one we just created
                                    if (createdAddress && createdAddress.id) {
                                      setSelectedShippingAddress(createdAddress.id);
                                    }
                                  } catch (error) {
                                    console.error('Address creation error:', error);
                                    alert(`Failed to create address: ${error instanceof Error ? error.message : 'Please try again.'}`);
                                  } finally {
                                    setCreatingAddress(false);
                                  }
                                }}
                                disabled={creatingAddress}
                                className="px-6 py-3 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                              >
                                {creatingAddress && <Loader2 className="w-4 h-4 animate-spin" />}
                                {creatingAddress ? 'Creating...' : 'Save Address'}
                              </button>
                              <button
                                type="button"
                                onClick={() => setShowAddressForm(false)}
                                className="px-6 py-3 border border-border hover:bg-secondary transition-colors"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>


                    {/* Shipping Method */}
                    <div>
                      <h2 className="text-xl mb-6">Shipping Method</h2>
                      <div className="space-y-3">
                        {shippingMethods.map((method) => {
                          const isFree = method.id === 'standard' && subtotal >= siteSettings.free_shipping_threshold;
                          const cost = isFree ? 0 : method.cost;
                          
                          return (
                            <label
                              key={method.id}
                              className={`flex items-center gap-4 p-4 border-2 cursor-pointer transition-colors ${
                                selectedShipping === method.id
                                  ? 'border-foreground bg-secondary'
                                  : 'border-border hover:border-muted-foreground'
                              }`}
                            >
                              <input
                                type="radio"
                                name="shipping"
                                value={method.id}
                                checked={selectedShipping === method.id}
                                onChange={(e) => setSelectedShipping(e.target.value)}
                                className="w-4 h-4"
                              />
                              
                              <div className="w-10 h-10 shrink-0 bg-muted flex items-center justify-center">
                                <Truck className="w-5 h-5 text-muted-foreground" />
                              </div>
                              
                              <div className="flex-1 min-w-0">
                                <p className="font-medium">{method.name}</p>
                                <p className="text-sm text-muted-foreground">{method.description}</p>
                              </div>
                              
                              <span className="font-medium shrink-0">
                                {cost === 0 ? 'FREE' : `₹${cost}`}
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-4 bg-primary text-primary-foreground hover:bg-foreground transition-colors"
                    >
                      Choose Payment Method
                    </button>
                  </form>
                </motion.div>
              )}

              {/* Payment Step */}
              {currentStep === 'payment' && (
                <motion.div
                  key="payment"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <form onSubmit={handlePaymentSubmit} className="space-y-8">
                    <div>
                      <h2 className="text-xl mb-6">Payment Method</h2>
                      <div className="space-y-3">
                        <label
                          className={`flex items-start gap-4 p-4 border-2 cursor-pointer transition-colors ${
                            selectedPayment === 'razorpay'
                              ? 'border-foreground bg-secondary'
                              : 'border-border hover:border-muted-foreground'
                          }`}
                        >
                          <input
                            type="radio"
                            name="payment"
                            value="razorpay"
                            checked={selectedPayment === 'razorpay'}
                            onChange={(e) => setSelectedPayment(e.target.value)}
                            className="sr-only"
                          />
                          
                          <div className="w-10 h-10 shrink-0 bg-muted flex items-center justify-center">
                            <CreditCard className="w-5 h-5 text-muted-foreground" />
                          </div>
                          
                          <div className="flex-1">
                            <p className="font-medium mb-1">UPI / Cards / Netbanking / Wallets</p>
                            <p className="text-sm text-muted-foreground mb-3">
                              Pay securely using Razorpay
                            </p>
                            <div className="flex items-center gap-2 flex-wrap">
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Smartphone className="w-3.5 h-3.5" />
                                <span>UPI</span>
                              </div>
                              <span className="text-muted-foreground">•</span>
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <CreditCard className="w-3.5 h-3.5" />
                                <span>Cards</span>
                              </div>
                              <span className="text-muted-foreground">•</span>
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Building2 className="w-3.5 h-3.5" />
                                <span>Netbanking</span>
                              </div>
                              <span className="text-muted-foreground">•</span>
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Wallet className="w-3.5 h-3.5" />
                                <span>Wallets</span>
                              </div>
                            </div>
                          </div>
                        </label>

                        <label
                          className={`flex items-start gap-4 p-4 border-2 cursor-pointer transition-colors ${
                            selectedPayment === 'cod'
                              ? 'border-foreground bg-secondary'
                              : 'border-border hover:border-muted-foreground'
                          }`}
                        >
                          <input
                            type="radio"
                            name="payment"
                            value="cod"
                            checked={selectedPayment === 'cod'}
                            onChange={(e) => setSelectedPayment(e.target.value)}
                            className="sr-only"
                          />
                          
                          <div className="w-10 h-10 shrink-0 bg-muted flex items-center justify-center">
                            <DollarSign className="w-5 h-5 text-muted-foreground" />
                          </div>
                          
                          <div className="flex-1">
                            <p className="font-medium mb-1">Cash on Delivery</p>
                            <p className="text-sm text-muted-foreground">
                              Pay when you receive your order
                            </p>
                          </div>
                        </label>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <button
                        type="button"
                        onClick={() => {
                          setCurrentStep('shipping');
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="flex-1 py-4 border border-border hover:bg-secondary transition-colors"
                      >
                        Back
                      </button>
                      <button
                        type="submit"
                        className="flex-1 py-4 bg-primary text-primary-foreground hover:bg-foreground transition-colors"
                      >
                        Review Order
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}

              {/* Review Step */}
              {currentStep === 'review' && (
                <motion.div
                  key="review"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  {/* Shipping Address */}
                  <div className="border-2 border-border p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg font-medium">Shipping Address</h2>
                      <button
                        onClick={() => {
                          setCurrentStep('shipping');
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="text-sm text-muted-foreground hover:text-foreground underline underline-offset-2 transition-colors"
                      >
                        Edit
                      </button>
                    </div>
                    {(() => {
                      const shippingAddr = addresses.find(addr => addr.id === selectedShippingAddress);
                      return shippingAddr ? (
                        <div className="space-y-1 text-sm">
                          <p className="font-medium">{shippingAddr.full_name}</p>
                          <p className="text-muted-foreground">{shippingAddr.address_line1}</p>
                          <p className="text-muted-foreground">{shippingAddr.city}, {shippingAddr.state} {shippingAddr.postal_code}</p>
                          <p className="text-muted-foreground pt-2">Phone: {shippingAddr.phone}</p>
                        </div>
                      ) : (
                        <p className="text-muted-foreground">No address selected</p>
                      );
                    })()}
                  </div>

                  {/* Shipping Method & Payment Method - Side by Side on Large Screens */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Shipping Method */}
                    <div className="border-2 border-border p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-medium">Shipping Method</h2>
                        <button
                          onClick={() => {
                            setCurrentStep('shipping');
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          className="text-sm text-muted-foreground hover:text-foreground underline underline-offset-2 transition-colors"
                        >
                          Edit
                        </button>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 shrink-0 bg-muted flex items-center justify-center">
                          <Truck className="w-5 h-5 text-muted-foreground" />
                        </div>
                        <div className="flex-1 text-sm">
                          <p className="font-medium">
                            {shippingMethods.find(m => m.id === selectedShipping)?.name}
                          </p>
                          <p className="text-muted-foreground">
                            {shippingMethods.find(m => m.id === selectedShipping)?.description}
                          </p>
                        </div>
                        <span className="font-medium text-sm">
                          {shippingCost === 0 ? 'FREE' : `₹${shippingCost}`}
                        </span>
                      </div>
                    </div>

                    {/* Payment Method */}
                    <div className="border-2 border-border p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-medium">Payment Method</h2>
                        <button
                          onClick={() => {
                            setCurrentStep('payment');
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          className="text-sm text-muted-foreground hover:text-foreground underline underline-offset-2 transition-colors"
                        >
                          Edit
                        </button>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 shrink-0 bg-muted flex items-center justify-center">
                          {selectedPayment === 'razorpay' ? (
                            <CreditCard className="w-5 h-5 text-muted-foreground" />
                          ) : (
                            <DollarSign className="w-5 h-5 text-muted-foreground" />
                          )}
                        </div>
                        <div className="text-sm">
                          <p className="font-medium">
                            {selectedPayment === 'razorpay' ? 'UPI / Cards / Netbanking / Wallets' : 'Cash on Delivery'}
                          </p>
                          <p className="text-muted-foreground">
                            {selectedPayment === 'razorpay' ? 'Pay securely using Razorpay' : 'Pay when you receive your order'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-4 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setCurrentStep('payment');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      disabled={isProcessingOrder}
                      className="flex-1 py-4 border-2 border-border hover:bg-secondary transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Back
                    </button>
                    <button
                      onClick={handlePlaceOrder}
                      disabled={isProcessingOrder}
                      className="flex-1 py-4 bg-primary text-primary-foreground hover:bg-foreground transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isProcessingOrder ? 'Processing...' : (selectedPayment === 'razorpay' ? 'Proceed to Payment' : 'Place Order')}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Order Summary Sidebar */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="sticky top-24 border border-border p-6 space-y-6">
              <h2 className="text-lg pb-4 border-b border-border">Order Summary</h2>

              {/* Items */}
              <div className="space-y-4 pb-4 border-b border-border max-h-64 overflow-y-auto">
                {cartItems.map((item) => {
                  const primaryImage = item.product_variant.product.images.find(img => img.is_primary) || item.product_variant.product.images[0];
                  return (
                    <div key={item.id} className="flex gap-4">
                      <div className="w-20 h-24 bg-muted shrink-0 overflow-hidden">
                        <ImageWithFallback
                          src={primaryImage?.image_url || 'https://images.unsplash.com/photo-1610030469956-f0c75c6eabd8?w=400&q=80'}
                          alt={primaryImage?.alt_text || item.product_variant.product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0 text-sm">
                        <p className="line-clamp-2 mb-2 font-medium">{item.product_variant.product.name}</p>
                        
                        {/* Color and Size with visual elements */}
                        <div className="flex items-center gap-3 mb-2">
                          <div className="flex items-center gap-1.5">
                            <div 
                              className="w-3 h-3 rounded-full border border-gray-300 shrink-0"
                              style={{ backgroundColor: item.product_variant.color_hex }}
                              title={item.product_variant.color}
                            />
                            <span className="text-xs text-muted-foreground">{item.product_variant.color}</span>
                          </div>
                          <div className="w-px h-3 bg-border" />
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-muted-foreground">Size:</span>
                            <span className="text-xs font-medium px-1.5 py-0.5 bg-muted rounded text-foreground">
                              {item.product_variant.size}
                            </span>
                          </div>
                        </div>
                        
                        {/* Quantity with better styling */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-muted-foreground">Qty:</span>
                            <span className="text-xs font-medium px-2 py-1 bg-primary/10 text-primary rounded-full">
                              {item.quantity}
                            </span>
                          </div>
                          <p className="font-semibold">₹{(() => {
                            const price = item.product_variant.price !== null 
                              ? item.product_variant.price 
                              : item.product_variant.product.base_price || 0;
                            return (price * item.quantity).toLocaleString('en-IN');
                          })()}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Totals */}
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>{shippingCost === 0 ? 'FREE' : `₹${shippingCost}`}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax (GST 18%)</span>
                  <span>₹{tax.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-border">
                <div className="flex justify-between text-lg">
                  <span>Total</span>
                  <span>₹{total.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
