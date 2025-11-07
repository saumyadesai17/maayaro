'use client';

import { motion, AnimatePresence } from 'motion/react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Check, CreditCard, Truck, MapPin, ArrowLeft, Wallet, Smartphone, Building2, DollarSign, Shield, Package, ChevronDown, ChevronUp, ShoppingBag } from 'lucide-react';
import { useState, useMemo } from 'react';
import { State, City } from 'country-state-city';
import { useStore } from '@/contexts/StoreContext';

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
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  address_line_1: string;
  address_line_2: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
}

export function CheckoutPage({ onNavigate }: CheckoutPageProps) {
  const { cartItems, cartTotal, clearCart, createOrder } = useStore();
  const [currentStep, setCurrentStep] = useState<CheckoutStep>('shipping');
  const [showOrderSummary, setShowOrderSummary] = useState(false);
  const [isProcessingOrder, setIsProcessingOrder] = useState(false);
  const [shippingAddress, setShippingAddress] = useState<Address>({
    first_name: '',
    last_name: '',
    phone: '',
    email: '',
    address_line_1: '',
    address_line_2: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'IN',
  });
  const [sameAsBilling, setSameAsBilling] = useState(true);
  const [selectedShipping, setSelectedShipping] = useState('standard');
  const [selectedPayment, setSelectedPayment] = useState('razorpay');

  const shippingMethods = [
    {
      id: 'standard',
      name: 'Standard Delivery',
      description: '5-7 business days',
      cost: 0,
      free_threshold: 5000,
    },
    {
      id: 'express',
      name: 'Express Delivery',
      description: '2-3 business days',
      cost: 299,
    },
    {
      id: 'overnight',
      name: 'Overnight Delivery',
      description: 'Next business day',
      cost: 599,
    },
  ];

  const subtotal = cartTotal;
  const shippingCost = selectedShipping === 'standard' && subtotal >= 5000 ? 0 : shippingMethods.find(m => m.id === selectedShipping)?.cost || 0;
  const tax = Math.round((subtotal + shippingCost) * 0.18);
  const total = subtotal + shippingCost + tax;

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

  const handlePlaceOrder = async () => {
    if (isProcessingOrder) return;
    
    setIsProcessingOrder(true);

    try {
      const orderNumber = `MAAY-ORD-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`;
      
      // Create order data
      const orderData = {
        order_number: orderNumber,
        status: 'pending' as const,
        payment_status: selectedPayment === 'cod' ? ('pending' as const) : ('pending' as const),
        payment_method: selectedPayment,
        subtotal,
        discount: 0,
        shipping_fee: shippingCost,
        tax,
        total_amount: total,
        items: cartItems.map(item => ({
          product_name: item.name,
          sku: item.sku,
          color: item.color,
          size: item.size,
          quantity: item.quantity,
          unit_price: item.price,
          image_url: item.image,
        })),
        shipping_address: shippingAddress,
      };

      if (selectedPayment === 'cod') {
        // For Cash on Delivery
        const order = createOrder({
          ...orderData,
          status: 'confirmed',
          payment_status: 'pending',
        });
        
        // Clear cart after successful order
        clearCart();
        
        setTimeout(() => {
          onNavigate('order-confirmation', {
            success: true,
            orderNumber: order.order_number,
            orderId: order.id,
            total,
            paymentMethod: 'cod',
          });
          setIsProcessingOrder(false);
        }, 1000);
      } else {
        // For Razorpay payment
        const amount = Math.round(total * 100); // Amount in paise

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

        // Initialize Razorpay
        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          amount: amount,
          currency: 'INR',
          name: 'Maayaro',
          description: `Order #${orderNumber}`,
          image: '/logo.png', // Add your logo
          handler: async function (response: any) {
            // Payment successful - create order
            const order = createOrder({
              ...orderData,
              status: 'confirmed',
              payment_status: 'paid',
            });
            
            // Clear cart after successful payment
            clearCart();
            
            onNavigate('order-confirmation', {
              success: true,
              orderNumber: order.order_number,
              orderId: order.id,
              total,
              paymentMethod: 'razorpay',
              paymentId: response.razorpay_payment_id,
            });
          },
          prefill: {
            name: `${shippingAddress.first_name} ${shippingAddress.last_name}`,
            email: shippingAddress.email,
            contact: shippingAddress.phone,
          },
          notes: {
            order_id: orderNumber,
            shipping_method: selectedShipping,
          },
          theme: {
            color: '#000000',
          },
          modal: {
            ondismiss: function () {
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
        
        razorpay.on('payment.failed', function (response: any) {
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
    if (!shippingAddress.state) return [];
    
    // Find the state code from the state name
    const selectedState = indianStates.find(s => s.name === shippingAddress.state);
    if (!selectedState) return [];
    
    return City.getCitiesOfState('IN', selectedState.isoCode);
  }, [shippingAddress.state, indianStates]);

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
                {cartItems.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <div className="w-16 h-20 bg-muted shrink-0 overflow-hidden">
                      <ImageWithFallback
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0 text-xs">
                      <p className="line-clamp-2 mb-1 font-medium">{item.name}</p>
                      <p className="text-muted-foreground mb-1">
                        {item.color} • {item.size}
                      </p>
                      <p className="text-muted-foreground">Qty: {item.quantity}</p>
                      <p className="mt-1 font-medium">₹{(item.price * item.quantity).toLocaleString('en-IN')}</p>
                    </div>
                  </div>
                ))}
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
                    {/* Contact Information */}
                    <div>
                      <h2 className="text-xl mb-6">Contact Information</h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm mb-2">First Name *</label>
                          <input
                            type="text"
                            required
                            value={shippingAddress.first_name}
                            onChange={(e) => setShippingAddress({ ...shippingAddress, first_name: e.target.value })}
                            className="w-full px-4 py-3 border border-border bg-white focus:outline-none focus:border-foreground transition-colors"
                          />
                        </div>
                        <div>
                          <label className="block text-sm mb-2">Last Name *</label>
                          <input
                            type="text"
                            required
                            value={shippingAddress.last_name}
                            onChange={(e) => setShippingAddress({ ...shippingAddress, last_name: e.target.value })}
                            className="w-full px-4 py-3 border border-border bg-white focus:outline-none focus:border-foreground transition-colors"
                          />
                        </div>
                        <div>
                          <label className="block text-sm mb-2">Email *</label>
                          <input
                            type="email"
                            required
                            value={shippingAddress.email}
                            onChange={(e) => setShippingAddress({ ...shippingAddress, email: e.target.value })}
                            className="w-full px-4 py-3 border border-border bg-white focus:outline-none focus:border-foreground transition-colors"
                          />
                        </div>
                        <div>
                          <label className="block text-sm mb-2">Phone *</label>
                          <input
                            type="tel"
                            required
                            value={shippingAddress.phone}
                            onChange={(e) => setShippingAddress({ ...shippingAddress, phone: e.target.value })}
                            placeholder="+91"
                            className="w-full px-4 py-3 border border-border bg-white focus:outline-none focus:border-foreground transition-colors"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Shipping Address */}
                    <div>
                      <h2 className="text-xl mb-6">Shipping Address</h2>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm mb-2">Address Line 1 *</label>
                          <input
                            type="text"
                            required
                            value={shippingAddress.address_line_1}
                            onChange={(e) => setShippingAddress({ ...shippingAddress, address_line_1: e.target.value })}
                            className="w-full px-4 py-3 border border-border bg-white focus:outline-none focus:border-foreground transition-colors"
                          />
                        </div>
                        <div>
                          <label className="block text-sm mb-2">Address Line 2</label>
                          <input
                            type="text"
                            value={shippingAddress.address_line_2}
                            onChange={(e) => setShippingAddress({ ...shippingAddress, address_line_2: e.target.value })}
                            className="w-full px-4 py-3 border border-border bg-white focus:outline-none focus:border-foreground transition-colors"
                          />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm mb-2">State *</label>
                            <select
                              required
                              value={shippingAddress.state}
                              onChange={(e) => setShippingAddress({ ...shippingAddress, state: e.target.value, city: '' })}
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
                              value={shippingAddress.city}
                              onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                              disabled={!shippingAddress.state}
                              className="w-full px-4 py-3 border border-border bg-white focus:outline-none focus:border-foreground transition-colors disabled:bg-secondary disabled:cursor-not-allowed"
                            >
                              <option value="">
                                {shippingAddress.state ? 'Select City' : 'Select State First'}
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
                              value={shippingAddress.postal_code}
                              onChange={(e) => setShippingAddress({ ...shippingAddress, postal_code: e.target.value })}
                              placeholder="400001"
                              className="w-full px-4 py-3 border border-border bg-white focus:outline-none focus:border-foreground transition-colors"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Shipping Method */}
                    <div>
                      <h2 className="text-xl mb-6">Shipping Method</h2>
                      <div className="space-y-3">
                        {shippingMethods.map((method) => {
                          const isFree = method.id === 'standard' && subtotal >= 5000;
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
                    <div className="space-y-1 text-sm">
                      <p className="font-medium">{shippingAddress.first_name} {shippingAddress.last_name}</p>
                      <p className="text-muted-foreground">{shippingAddress.address_line_1}</p>
                      {shippingAddress.address_line_2 && <p className="text-muted-foreground">{shippingAddress.address_line_2}</p>}
                      <p className="text-muted-foreground">{shippingAddress.city}, {shippingAddress.state} {shippingAddress.postal_code}</p>
                      <p className="text-muted-foreground pt-2">Phone: {shippingAddress.phone}</p>
                      <p className="text-muted-foreground">Email: {shippingAddress.email}</p>
                    </div>
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
                {cartItems.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <div className="w-20 h-24 bg-muted shrink-0 overflow-hidden">
                      <ImageWithFallback
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0 text-sm">
                      <p className="line-clamp-2 mb-1">{item.name}</p>
                      <p className="text-xs text-muted-foreground mb-1">
                        {item.color} • {item.size}
                      </p>
                      <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                      <p className="mt-1">₹{(item.price * item.quantity).toLocaleString('en-IN')}</p>
                    </div>
                  </div>
                ))}
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
