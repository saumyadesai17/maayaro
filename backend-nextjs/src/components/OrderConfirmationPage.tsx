'use client';

import { motion } from 'motion/react';
import { CheckCircle, XCircle, Package, Truck, CreditCard, Home, FileText } from 'lucide-react';
import { useEffect } from 'react';
import { useCounts } from '@/contexts/CountsContext';

interface OrderConfirmationPageProps {
  onNavigate: (page: string) => void;
  orderData?: {
    success: boolean;
    orderId?: string;
    orderNumber?: string;
    total?: number;
    paymentMethod?: string;
    message?: string;
  };
}

export function OrderConfirmationPage({ onNavigate, orderData }: OrderConfirmationPageProps) {
  const isSuccess = orderData?.success ?? false;
  const { refreshCounts } = useCounts();

  useEffect(() => {
    // Scroll to top when page loads
    window.scrollTo(0, 0);
    
    // Refresh cart and wishlist counts when order confirmation is shown
    refreshCounts();
  }, []);

  if (isSuccess) {
    return (
      <div className="pt-16 min-h-screen bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            {/* Success Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="inline-flex items-center justify-center w-24 h-24 bg-green-100 rounded-full mb-6"
            >
              <CheckCircle className="w-16 h-16 text-green-600" />
            </motion.div>

            {/* Success Message */}
            <h1 className="text-3xl sm:text-4xl font-bold mb-4">Order Confirmed!</h1>
            <p className="text-lg text-muted-foreground mb-8">
              Thank you for your order. We've received your order and will process it soon.
            </p>

            {/* Order Details Card */}
            <div className="bg-secondary p-6 sm:p-8 text-left mb-8">
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-4 border-b border-border">
                  <span className="text-muted-foreground">Order Number</span>
                  <span className="font-bold text-lg">{orderData?.orderNumber || orderData?.orderId}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Total Amount</span>
                  <span className="font-bold text-lg">₹{orderData?.total?.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Payment Method</span>
                  <span className="font-medium">
                    {orderData?.paymentMethod === 'razorpay' ? 'Online Payment' : 'Cash on Delivery'}
                  </span>
                </div>
                {orderData?.paymentMethod === 'razorpay' && (
                  <div className="pt-4 border-t border-border">
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle className="w-5 h-5" />
                      <span className="font-medium">Payment Successful</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* What's Next Section */}
            <div className="text-left mb-8">
              <h2 className="text-xl font-semibold mb-4">What happens next?</h2>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-primary/10 flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">Order Confirmation Email</h3>
                    <p className="text-sm text-muted-foreground">
                      You'll receive an email confirmation with your order details shortly.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-primary/10 flex items-center justify-center shrink-0">
                    <Package className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">Order Processing</h3>
                    <p className="text-sm text-muted-foreground">
                      We'll start preparing your order for shipment.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-primary/10 flex items-center justify-center shrink-0">
                    <Truck className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">Shipping Updates</h3>
                    <p className="text-sm text-muted-foreground">
                      Track your order status in the "My Orders" section.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => onNavigate('account')}
                className="flex-1 py-4 bg-primary text-primary-foreground hover:bg-foreground transition-colors font-medium flex items-center justify-center gap-2"
              >
                <Package className="w-5 h-5" />
                View My Orders
              </button>
              <button
                onClick={() => onNavigate('')}
                className="flex-1 py-4 border-2 border-border hover:bg-secondary transition-colors font-medium flex items-center justify-center gap-2"
              >
                <Home className="w-5 h-5" />
                Continue Shopping
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // Failed Order
  return (
    <div className="pt-16 min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          {/* Error Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="inline-flex items-center justify-center w-24 h-24 bg-red-100 rounded-full mb-6"
          >
            <XCircle className="w-16 h-16 text-red-600" />
          </motion.div>

          {/* Error Message */}
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">Order Failed</h1>
          <p className="text-lg text-muted-foreground mb-8">
            {orderData?.message || 'Unfortunately, we couldn\'t process your order. Please try again.'}
          </p>

          {/* Error Details */}
          <div className="bg-red-50 border-2 border-red-200 p-6 sm:p-8 text-left mb-8">
            <h3 className="font-semibold mb-2 text-red-900">What went wrong?</h3>
            <ul className="text-sm text-red-800 space-y-2">
              {orderData?.paymentMethod === 'razorpay' ? (
                <>
                  <li>• Payment was not completed or was declined</li>
                  <li>• Please check your payment details and try again</li>
                  <li>• If the amount was deducted, it will be refunded within 5-7 business days</li>
                </>
              ) : (
                <>
                  <li>• There was an error processing your order</li>
                  <li>• Your cart items are still saved</li>
                  <li>• Please try placing the order again</li>
                </>
              )}
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => onNavigate('checkout')}
              className="flex-1 py-4 bg-primary text-primary-foreground hover:bg-foreground transition-colors font-medium flex items-center justify-center gap-2"
            >
              <CreditCard className="w-5 h-5" />
              Try Again
            </button>
            <button
              onClick={() => onNavigate('cart')}
              className="flex-1 py-4 border-2 border-border hover:bg-secondary transition-colors font-medium"
            >
              View Cart
            </button>
          </div>

          <button
            onClick={() => onNavigate('')}
            className="mt-4 text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2"
          >
            Continue Shopping
          </button>
        </motion.div>
      </div>
    </div>
  );
}
