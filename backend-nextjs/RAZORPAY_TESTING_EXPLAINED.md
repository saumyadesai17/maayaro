# 🧪 Razorpay Testing - Step by Step Guide

## What You've Done So Far ✅

From your screenshots, I can see:

1. ✅ Created Order: `88fa7db8-e569-4179-b270-6aef4d78c597`
2. ✅ Created Razorpay Order: `order_RcrjWF2aCyZMUT`
3. ✅ Added items to cart
4. ✅ Got Razorpay key: `rzp_test_QSQhEJ9fpOMdfD`

---

## Problem: Payment Record Not Found

Your SQL update returned "No rows" because the payment record doesn't exist or has a different structure.

### Step 1: Check if Payment Record Exists

Run this in Supabase SQL Editor:

```sql
-- Check payment record
SELECT * FROM payments 
WHERE order_id = '88fa7db8-e569-4179-b270-6aef4d78c597';
```

**If you get no results:** The payment wasn't created. Let's fix it.

---

## Fix: Create Payment Record Manually

Run this in Supabase SQL Editor:

```sql
-- First, check if payment exists
SELECT id, order_id, status, razorpay_order_id 
FROM payments 
WHERE order_id = '88fa7db8-e569-4179-b270-6aef4d78c597';

-- If no result, insert payment record
INSERT INTO payments (
  order_id,
  razorpay_order_id,
  amount,
  currency,
  status,
  payment_method
) VALUES (
  '88fa7db8-e569-4179-b270-6aef4d78c597',
  'order_RcrjWF2aCyZMUT',
  2129.46,
  'INR',
  'created',
  'razorpay'
)
ON CONFLICT (order_id) DO NOTHING;

-- Verify it was created
SELECT * FROM payments 
WHERE order_id = '88fa7db8-e569-4179-b270-6aef4d78c597';
```

---

## Now Simulate Payment Success

After the payment record exists, run this:

```sql
-- Update payment to captured
UPDATE payments 
SET 
  status = 'captured',
  razorpay_payment_id = 'pay_test_12345',
  razorpay_signature = 'test_signature_for_testing',
  payment_metadata = jsonb_build_object(
    'test_payment', true,
    'simulated', true,
    'test_date', NOW()::text
  )
WHERE order_id = '88fa7db8-e569-4179-b270-6aef4d78c597';

-- Update order status to confirmed
UPDATE orders 
SET status = 'confirmed'
WHERE id = '88fa7db8-e569-4179-b270-6aef4d78c597';

-- Verify both updates
SELECT 
  o.order_number,
  o.status as order_status,
  p.status as payment_status,
  p.razorpay_payment_id
FROM orders o
JOIN payments p ON p.order_id = o.id
WHERE o.id = '88fa7db8-e569-4179-b270-6aef4d78c597';
```

**Expected Result:**
```
order_number: MAAY-2025-01XXX
order_status: confirmed
payment_status: captured
razorpay_payment_id: pay_test_12345
```

---

## Testing Verify Endpoint in Postman

### Option 1: Test with Simulated Data (Recommended for Backend Testing)

Since you've already updated the database, the verify endpoint is not needed. The payment is already verified!

But if you want to test the endpoint anyway:

```
POST http://localhost:3000/api/payment/verify
Headers:
  Authorization: Bearer YOUR_TOKEN
  Content-Type: application/json
Body:
{
  "razorpay_order_id": "order_RcrjWF2aCyZMUT",
  "razorpay_payment_id": "pay_test_12345",
  "razorpay_signature": "test_signature",
  "order_id": "88fa7db8-e569-4179-b270-6aef4d78c597"
}
```

**Note:** This might fail signature verification since we're using test data. That's OK for backend testing - we've already manually marked payment as captured.

---

### Option 2: Skip Verify Endpoint (Use Manual Database Update)

**For backend API testing, this is the recommended approach:**

1. ✅ Create order → Gets `order_id`
2. ✅ Create Razorpay order → Gets `razorpay_order_id`
3. ✅ **Manually update payment in database** (what we just did)
4. ✅ Proceed to create shipment

**Why?** 
- The verify endpoint needs a real Razorpay signature
- Razorpay signatures are generated during actual payment
- For backend testing, manual database update simulates successful payment

---

## Next Steps: Create Shipment

Now that your order is `confirmed` and payment is `captured`, you can create a shipment:

```
POST http://localhost:3000/api/shipping/create
Headers:
  Authorization: Bearer YOUR_TOKEN
  Content-Type: application/json
Body:
{
  "order_id": "88fa7db8-e569-4179-b270-6aef4d78c597",
  "length": 25,
  "breadth": 20,
  "height": 10,
  "weight": 0.8
}
```

This will:
- ✅ Create shipment in Shiprocket
- ✅ Generate AWB code
- ✅ Show on Shiprocket dashboard
- ✅ Update order status to `shipped`

---

## Understanding the Flow

### In Production (Real Frontend):
```
1. User adds to cart
2. User creates order
3. Frontend calls create-order API → Gets razorpay_order_id
4. Frontend opens Razorpay checkout modal
5. User pays with card/UPI/etc
6. Razorpay sends payment_id + signature
7. Frontend calls verify API with all 3 values
8. Backend verifies signature
9. Payment marked as captured
10. Order confirmed
```

### In Backend Testing (What You're Doing):
```
1. Add to cart via Postman ✅
2. Create order via Postman ✅
3. Create Razorpay order via Postman ✅
4. Skip actual payment (no Razorpay modal)
5. Manually update payment in database ✅
6. Create shipment via Postman ⏭️
7. Track shipment via Postman ⏭️
```

---

## Quick Verification Checklist

Run these queries to verify everything is working:

```sql
-- 1. Check order
SELECT id, order_number, status, total 
FROM orders 
WHERE id = '88fa7db8-e569-4179-b270-6aef4d78c597';

-- 2. Check payment
SELECT 
  razorpay_order_id,
  razorpay_payment_id,
  status,
  amount
FROM payments 
WHERE order_id = '88fa7db8-e569-4179-b270-6aef4d78c597';

-- 3. Check order items
SELECT 
  product_name,
  quantity,
  unit_price
FROM order_items
WHERE order_id = '88fa7db8-e569-4179-b270-6aef4d78c597';

-- 4. Check cart (should be empty)
SELECT COUNT(*) as cart_items
FROM cart_items ci
JOIN carts c ON c.id = ci.cart_id
WHERE c.user_id = (SELECT auth.uid());
```

**Expected Results:**
- ✅ Order status: `confirmed`
- ✅ Payment status: `captured`
- ✅ Order items exist
- ✅ Cart is empty (0 items)

---

## If Payment Record Still Not Found

If the payment record doesn't exist at all, there might be an RLS policy issue. Run this:

```sql
-- Check RLS policies on payments table
SELECT * FROM pg_policies WHERE tablename = 'payments';

-- If needed, temporarily disable RLS for testing
ALTER TABLE payments DISABLE ROW LEVEL SECURITY;

-- Then try the INSERT again
INSERT INTO payments (
  order_id,
  razorpay_order_id,
  amount,
  currency,
  status,
  payment_method
) VALUES (
  '88fa7db8-e569-4179-b270-6aef4d78c597',
  'order_RcrjWF2aCyZMUT',
  2129.46,
  'INR',
  'captured',
  'razorpay'
);

-- Re-enable RLS
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
```

---

## Summary

**What to do now:**

1. ✅ Run the SQL queries above to create/update payment record
2. ✅ Verify order status is `confirmed`
3. ✅ Verify payment status is `captured`
4. ⏭️ Move to shipment creation (next step)
5. ⏭️ Skip the verify endpoint for backend testing

**The verify endpoint is only needed when integrating with real frontend!**

For backend testing, manual database updates simulate successful payment perfectly. 🎉

---

Ready to create shipment? 📦
