# 💳 Payment & 📦 Shipping API Testing Guide

## Part 1: Payment APIs (Razorpay Integration)

### Prerequisites
- Razorpay test API keys in `.env.local`
- Order already created (from previous tests)

---

### Test 1: Create Razorpay Order

**Endpoint:** `POST /api/payment/create-order`

```
Method: POST
URL: http://localhost:3000/api/payment/create-order
Headers:
  Authorization: Bearer YOUR_TOKEN
  Content-Type: application/json
```

**Body:**
```json
{
  "order_id": "YOUR_ORDER_UUID_HERE",
  "amount": 5898.82
}
```

**Expected Response:**
```json
{
  "razorpay_order_id": "order_NJx7ZhXxYvBxxx",
  "amount": 589882,
  "currency": "INR",
  "key": "rzp_test_xxxxxxxx"
}
```

**Status Codes:**
- ✅ 200: Razorpay order created
- ❌ 400: Invalid order or amount
- ❌ 401: Unauthorized

---

### Test 2: Verify Payment

**Endpoint:** `POST /api/payment/verify`

**After payment on frontend, verify the signature:**

```
Method: POST
URL: http://localhost:3000/api/payment/verify
Headers:
  Authorization: Bearer YOUR_TOKEN
  Content-Type: application/json
```

**Body:**
```json
{
  "razorpay_order_id": "order_NJx7ZhXxYvBxxx",
  "razorpay_payment_id": "pay_NJx8AbCdEfGxxx",
  "razorpay_signature": "generated_signature_from_razorpay",
  "order_id": "YOUR_ORDER_UUID"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Payment verified successfully"
}
```

**What it does:**
- Verifies Razorpay signature
- Updates payment status to `captured`
- Updates order status to `confirmed`

---

## Part 2: Shipping APIs (Shiprocket Integration)

### Prerequisites
- Shiprocket API credentials in `.env.local`
- Order with `confirmed` status
- Order has valid shipping address

---

### Test 3: Create Shipment

**Endpoint:** `POST /api/shipping/create`

```
Method: POST
URL: http://localhost:3000/api/shipping/create
Headers:
  Authorization: Bearer YOUR_TOKEN
  Content-Type: application/json
```

**Body:**
```json
{
  "order_id": "YOUR_ORDER_UUID",
  "length": 20,
  "breadth": 15,
  "height": 10,
  "weight": 0.5
}
```

**Expected Response:**
```json
{
  "success": true,
  "shipment": {
    "id": "shipment-uuid",
    "shiprocket_order_id": "123456",
    "shiprocket_shipment_id": "654321",
    "awb_code": "AWBXXX123",
    "courier_name": "Delhivery",
    "status": "pending"
  }
}
```

**What it does:**
- Creates order in Shiprocket
- Generates AWB code
- Assigns courier partner
- Stores shipment in database

**Status Codes:**
- ✅ 200: Shipment created
- ❌ 400: Invalid order or already shipped
- ❌ 500: Shiprocket API error

---

### Test 4: Track Shipment

**Endpoint:** `GET /api/shipping/track/[shipmentId]`

```
Method: GET
URL: http://localhost:3000/api/shipping/track/SHIPMENT_UUID_HERE
Headers:
  Authorization: Bearer YOUR_TOKEN
```

**Expected Response:**
```json
{
  "tracking_data": {
    "shipment_id": "654321",
    "awb_code": "AWBXXX123",
    "courier_name": "Delhivery",
    "current_status": "In Transit",
    "shipment_track": [
      {
        "status": "Picked Up",
        "location": "Mumbai",
        "timestamp": "2025-11-07T10:00:00Z"
      },
      {
        "status": "In Transit",
        "location": "Delhi Hub",
        "timestamp": "2025-11-07T14:30:00Z"
      }
    ]
  }
}
```

**Status Codes:**
- ✅ 200: Tracking data retrieved
- ❌ 404: Shipment not found
- ❌ 500: Shiprocket API error

---

## Part 3: Complete End-to-End Flow Testing

### 🎯 Full E-Commerce Flow (Backend Only)

This tests the complete user journey through backend APIs:

```
1. Add to Cart
2. View Cart
3. Create Order
4. Create Razorpay Payment Order
5. Verify Payment
6. Create Shipment
7. Track Shipment
8. View Order Details
```

---

### Step-by-Step Testing

#### **Step 1: Add Product to Cart**

```
POST http://localhost:3000/api/cart/add
Body:
{
  "product_variant_id": "GET_FROM_PRODUCT_VARIANTS_TABLE",
  "quantity": 2
}
```

**Get Product Variant ID:**
```sql
SELECT pv.id, p.name, pv.sku, pv.size, pv.color, pv.price 
FROM product_variants pv
JOIN products p ON p.id = pv.product_id
WHERE pv.is_active = true
LIMIT 5;
```

---

#### **Step 2: View Cart**

```
GET http://localhost:3000/api/cart
```

**Note the cart items and total**

---

#### **Step 3: Create Order**

```
POST http://localhost:3000/api/orders/create
Body:
{
  "shipping_address_id": "YOUR_ADDRESS_UUID",
  "billing_address_id": "YOUR_ADDRESS_UUID",
  "payment_method": "razorpay"
}
```

**Save the response:**
- `order.id` → Use in next steps
- `order.order_number` → Track order
- `order.total` → Amount for payment

---

#### **Step 4: Create Razorpay Payment Order**

```
POST http://localhost:3000/api/payment/create-order
Body:
{
  "order_id": "ORDER_UUID_FROM_STEP_3",
  "amount": 5898.82
}
```

**Save the response:**
- `razorpay_order_id` → Use in verification
- `key` → Razorpay key ID

**Note:** In real frontend, this opens Razorpay checkout modal. For testing, we'll simulate payment.

---

#### **Step 5: Simulate Payment & Verify**

**For testing, you need to:**
1. Use Razorpay test cards (see below)
2. Generate payment_id and signature

**Test Card:**
```
Card Number: 4111 1111 1111 1111
Expiry: Any future date
CVV: 123
```

**Or, manually update payment in database:**
```sql
-- Simulate successful payment
UPDATE payments 
SET 
  status = 'captured',
  razorpay_payment_id = 'pay_test_12345',
  payment_metadata = jsonb_build_object('test_payment', true)
WHERE order_id = 'YOUR_ORDER_UUID';

UPDATE orders 
SET status = 'confirmed'
WHERE id = 'YOUR_ORDER_UUID';
```

**Then call verify endpoint:**
```
POST http://localhost:3000/api/payment/verify
Body:
{
  "razorpay_order_id": "order_NJx7ZhXxYvBxxx",
  "razorpay_payment_id": "pay_test_12345",
  "razorpay_signature": "test_signature",
  "order_id": "YOUR_ORDER_UUID"
}
```

---

#### **Step 6: Create Shipment**

```
POST http://localhost:3000/api/shipping/create
Body:
{
  "order_id": "YOUR_ORDER_UUID",
  "length": 25,
  "breadth": 20,
  "height": 10,
  "weight": 0.8
}
```

**This will:**
- Create order in Shiprocket
- Generate AWB code
- Assign courier
- Show on Shiprocket dashboard

**Save the response:**
- `shipment.id` → Use for tracking
- `shipment.awb_code` → Track on courier site

---

#### **Step 7: Track Shipment**

```
GET http://localhost:3000/api/shipping/track/SHIPMENT_UUID
```

**Shows real-time tracking from Shiprocket**

---

#### **Step 8: View Complete Order**

```
GET http://localhost:3000/api/orders/ORDER_UUID
```

**Or by order number:**
```
GET http://localhost:3000/api/orders/MAAY-2025-01002
```

**Should show:**
- Order details
- Order items with products
- Shipping & billing addresses
- Payment details (status: captured)
- Shipment details (AWB, courier, tracking)

---

## Quick Test Script (Postman Collection Variables)

Set these variables in Postman:

```javascript
// Collection Variables
auth_token: YOUR_TOKEN
base_url: http://localhost:3000
product_variant_id: GET_FROM_DB
address_id: YOUR_ADDRESS_UUID

// After each step, save responses:
// Step 3: order_id, order_total
// Step 4: razorpay_order_id
// Step 6: shipment_id
```

---

## Testing Checklist

### Cart Flow ✅
- [ ] Add item to cart
- [ ] View cart (shows items)
- [ ] Update cart quantity
- [ ] Remove from cart

### Order Creation ✅
- [ ] Create order with cart items
- [ ] Cart cleared after order
- [ ] Order number generated (MAAY-2025-XXXXX)
- [ ] Payment record created (status: created)

### Payment Flow ✅
- [ ] Create Razorpay order
- [ ] Get razorpay_order_id
- [ ] Verify payment (manual or test)
- [ ] Payment status → captured
- [ ] Order status → confirmed

### Shipping Flow ✅
- [ ] Create shipment (only for confirmed orders)
- [ ] AWB code generated
- [ ] Shipment visible on Shiprocket dashboard
- [ ] Track shipment (get tracking updates)
- [ ] Order status → shipped

### Order Retrieval ✅
- [ ] View all orders (GET /api/orders)
- [ ] View single order by UUID
- [ ] View single order by order number
- [ ] Order shows complete data (items, payment, shipment)

---

## Common Issues & Solutions

### Payment Testing Issues

**Issue:** "Payment verification failed"
**Solution:** For testing, manually update payment status in database (see Step 5)

**Issue:** "Razorpay order creation failed"
**Solution:** Check Razorpay test keys in `.env.local`

### Shipping Testing Issues

**Issue:** "Shiprocket authentication failed"
**Solution:** 
1. Check credentials in `.env.local`
2. Generate fresh token from Shiprocket dashboard

**Issue:** "Order not eligible for shipping"
**Solution:** Order must have status `confirmed` (payment captured)

**Issue:** "Invalid pickup address"
**Solution:** Configure pickup address in Shiprocket dashboard

### Database Testing Queries

**Check order status:**
```sql
SELECT id, order_number, status, total 
FROM orders 
WHERE user_id = 'YOUR_USER_ID'
ORDER BY created_at DESC;
```

**Check payment status:**
```sql
SELECT p.*, o.order_number 
FROM payments p
JOIN orders o ON o.id = p.order_id
WHERE o.user_id = 'YOUR_USER_ID';
```

**Check shipment:**
```sql
SELECT s.*, o.order_number 
FROM shipments s
JOIN orders o ON o.id = s.order_id
WHERE o.user_id = 'YOUR_USER_ID';
```

---

## Expected Results After Full Flow

After completing all steps, you should have:

1. **Database:**
   - ✅ Order record (status: shipped)
   - ✅ Order items (with products)
   - ✅ Payment record (status: captured)
   - ✅ Shipment record (with AWB code)
   - ✅ Empty cart

2. **Shiprocket Dashboard:**
   - ✅ Order visible with order number
   - ✅ AWB code assigned
   - ✅ Courier partner assigned
   - ✅ Can schedule pickup

3. **API Responses:**
   - ✅ All endpoints return 200
   - ✅ Order shows complete details
   - ✅ Tracking shows shipment status

---

## Next Steps

Once backend testing is complete:

1. ✅ All APIs working → Proceed to frontend integration
2. ❌ Payment failing → Fix Razorpay configuration
3. ❌ Shipping failing → Fix Shiprocket configuration

**Ready to test?** Start with the complete flow from Step 1! 🚀
