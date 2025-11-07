# 🚀 Quick Test Reference Card

## Test Sequence (Copy-Paste Ready)

### 1️⃣ Add to Cart
```
POST http://localhost:3000/api/cart/add
{
  "product_variant_id": "PASTE_VARIANT_UUID",
  "quantity": 1
}
```

### 2️⃣ View Cart
```
GET http://localhost:3000/api/cart
```

### 3️⃣ Create Order
```
POST http://localhost:3000/api/orders/create
{
  "shipping_address_id": "PASTE_ADDRESS_UUID",
  "billing_address_id": "PASTE_ADDRESS_UUID",
  "payment_method": "razorpay"
}
```
**→ Save: `order.id` and `order.total`**

### 4️⃣ Create Payment Order
```
POST http://localhost:3000/api/payment/create-order
{
  "order_id": "PASTE_ORDER_UUID",
  "amount": PASTE_ORDER_TOTAL
}
```
**→ Save: `razorpay_order_id`**

### 5️⃣ Simulate Payment (Run in Supabase SQL Editor)
```sql
-- Replace YOUR_ORDER_UUID with actual order ID
UPDATE payments 
SET 
  status = 'captured',
  razorpay_payment_id = 'pay_test_12345'
WHERE order_id = 'YOUR_ORDER_UUID';

UPDATE orders 
SET status = 'confirmed'
WHERE id = 'YOUR_ORDER_UUID';
```

### 6️⃣ Create Shipment
```
POST http://localhost:3000/api/shipping/create
{
  "order_id": "PASTE_ORDER_UUID",
  "length": 25,
  "breadth": 20,
  "height": 10,
  "weight": 0.8
}
```
**→ Save: `shipment.id`**

### 7️⃣ Track Shipment
```
GET http://localhost:3000/api/shipping/track/PASTE_SHIPMENT_UUID
```

### 8️⃣ View Final Order
```
GET http://localhost:3000/api/orders/PASTE_ORDER_UUID
```

---

## Get Required IDs

### Get Product Variant ID
```sql
SELECT pv.id, p.name, pv.sku, pv.price 
FROM product_variants pv
JOIN products p ON p.id = pv.product_id
WHERE pv.is_active = true
LIMIT 5;
```

### Get Address ID
```sql
SELECT id, full_name, city 
FROM addresses 
WHERE user_id = (SELECT auth.uid())
LIMIT 1;
```

### Get Your User ID
```sql
SELECT auth.uid();
```

---

## Postman Setup

1. **Create Collection:** "Maayaro Full Flow Test"
2. **Set Variables:**
   - `base_url`: `http://localhost:3000`
   - `auth_token`: Run `node get-auth-token.js`

3. **Add Header to Collection:**
   - Key: `Authorization`
   - Value: `Bearer {{auth_token}}`

---

## Status Checks

### Check Order Status
```sql
SELECT 
  order_number,
  status,
  total,
  created_at
FROM orders 
WHERE user_id = 'YOUR_USER_ID'
ORDER BY created_at DESC
LIMIT 5;
```

### Check Payment Status
```sql
SELECT 
  o.order_number,
  p.status,
  p.payment_method,
  p.amount
FROM payments p
JOIN orders o ON o.id = p.order_id
WHERE o.user_id = 'YOUR_USER_ID'
ORDER BY p.created_at DESC;
```

### Check Shipment Status
```sql
SELECT 
  o.order_number,
  s.awb_code,
  s.courier_name,
  s.status
FROM shipments s
JOIN orders o ON o.id = s.order_id
WHERE o.user_id = 'YOUR_USER_ID'
ORDER BY s.created_at DESC;
```

---

## Expected Status Flow

```
Order Status:    pending → confirmed → processing → shipped → delivered
Payment Status:  created → captured
Shipment Status: pending → picked_up → in_transit → delivered
```

---

## Success Indicators ✅

After completing all 8 steps:

- ✅ Cart is empty
- ✅ Order exists with order_number `MAAY-2025-XXXXX`
- ✅ Payment status is `captured`
- ✅ Order status is `confirmed` or `shipped`
- ✅ Shipment has AWB code
- ✅ Shipment visible on Shiprocket dashboard
- ✅ Can track shipment
- ✅ Order API returns complete data

---

## Troubleshooting

| Error | Solution |
|-------|----------|
| 401 Unauthorized | Get fresh token: `node get-auth-token.js` |
| Cart is empty | Run Step 1 first |
| Order not found | Use correct order UUID |
| Payment RLS error | Run `fix-payments-rls.sql` |
| Shipment creation fails | Order must be `confirmed` status |
| Shiprocket auth error | Check Shiprocket credentials in `.env.local` |

---

## Environment Variables Checklist

In `.env.local`:

```env
✅ NEXT_PUBLIC_SUPABASE_URL
✅ NEXT_PUBLIC_SUPABASE_ANON_KEY
✅ RAZORPAY_KEY_ID (test mode)
✅ RAZORPAY_KEY_SECRET (test mode)
✅ SHIPROCKET_EMAIL
✅ SHIPROCKET_PASSWORD
```

---

**🎯 Start testing from Step 1!**
