-- Simulate successful Razorpay payment verification
-- Run this in Supabase SQL Editor

-- Update the payment record to simulate successful payment
UPDATE payments 
SET 
  razorpay_order_id = 'order_RcutYYr8OCnRgZ',
  razorpay_payment_id = 'pay_test_simulation_12345',
  razorpay_signature = 'test_signature_for_backend_testing',
  status = 'captured',
  payment_metadata = payment_metadata || jsonb_build_object(
    'simulated_payment', true,
    'test_mode', true,
    'simulated_at', NOW()::text,
    'original_razorpay_order_id', 'order_RcutYYr8OCnRgZ'
  )
WHERE order_id = '7cbf7fb3-3e1d-4a27-acec-c5e968f66b63';

-- Update order status to confirmed (payment successful)
UPDATE orders 
SET status = 'confirmed'
WHERE id = '7cbf7fb3-3e1d-4a27-acec-c5e968f66b63';

-- Verify the updates
SELECT 
  o.order_number,
  o.status as order_status,
  p.status as payment_status,
  p.razorpay_order_id,
  p.razorpay_payment_id,
  p.amount
FROM orders o
JOIN payments p ON p.order_id = o.id
WHERE o.id = '7cbf7fb3-3e1d-4a27-acec-c5e968f66b63';