# 📦 Orders API - Simple Testing Guide

## Step 1: Understanding the Order Flow

```
Add to Cart → Create Order → View Orders → View Single Order
```

---

## Step 2: Prerequisites

**Before testing orders, you need:**
1. ✅ Auth token (from `get-auth-token.js`)
2. ✅ Items in your cart
3. ✅ A shipping address created

---

## Step 3: Create Your First Order

### API Endpoint: POST /api/orders/create

**Postman Setup:**
```
Method: POST
URL: http://localhost:3000/api/orders/create
Headers:
  Authorization: Bearer YOUR_TOKEN_HERE
  Content-Type: application/json
```

**Body (JSON):**
```json
{
  "shipping_address_id": "GET_THIS_FROM_ADDRESSES_TABLE",
  "billing_address_id": "GET_THIS_FROM_ADDRESSES_TABLE",
  "payment_method": "cod"
}
```

### Where to Get Address IDs?

**Option 1: Check Database Directly**
Go to Supabase Dashboard → Table Editor → `addresses` table
- Look for addresses where `user_id` matches your test user
- Copy the `id` (UUID)

**Option 2: Create Address First**
```
POST http://localhost:3000/api/addresses
Body:
{
  "type": "shipping",
  "full_name": "John Doe",
  "phone": "9876543210",
  "address_line1": "123 Main Street",
  "city": "Mumbai",
  "state": "Maharashtra",
  "postal_code": "400001",
  "country": "India",
  "is_default": true
}
```

### Expected Response:
```json
{
  "success": true,
  "order": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "order_number": "MAAY-ORD-2025-001",
    "status": "pending",
    "total": 5898.82,
    "payment": {
      "status": "created",
      "payment_method": "cod"
    }
  }
}
```

**⚠️ Common Errors:**
- `400: No items in cart` → Add items to cart first
- `400: Shipping address required` → Wrong address ID or doesn't belong to you
- `401: Unauthorized` → Token expired or invalid

---

## Step 4: View All Your Orders

### API Endpoint: GET /api/orders

**Postman Setup:**
```
Method: GET
URL: http://localhost:3000/api/orders
Headers:
  Authorization: Bearer YOUR_TOKEN_HERE
```

**Expected Response:**
```json
{
  "orders": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "order_number": "MAAY-ORD-2025-001",
      "status": "pending",
      "subtotal": 4999,
      "total": 5898.82,
      "created_at": "2025-11-05T12:30:00Z",
      "order_items": [
        {
          "product_name": "Floral Kurta Set",
          "quantity": 1,
          "price": 4999
        }
      ],
      "payment": {
        "status": "created",
        "payment_method": "cod"
      }
    }
  ]
}
```

---

## Step 5: View Single Order Details

### API Endpoint: GET /api/orders/[orderId]

**You can search by TWO ways:**

### Way 1: By UUID
```
Method: GET
URL: http://localhost:3000/api/orders/550e8400-e29b-41d4-a716-446655440000
Headers:
  Authorization: Bearer YOUR_TOKEN_HERE
```

### Way 2: By Order Number (easier!)
```
Method: GET
URL: http://localhost:3000/api/orders/MAAY-ORD-2025-001
Headers:
  Authorization: Bearer YOUR_TOKEN_HERE
```

**Expected Response:**
```json
{
  "order": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "order_number": "MAAY-ORD-2025-001",
    "status": "pending",
    "subtotal": 4999,
    "total": 5898.82,
    "order_items": [
      {
        "id": "item-uuid",
        "quantity": 1,
        "price": 4999,
        "product_variant": {
          "sku": "MAAY-WOM-KUR-001",
          "size": "M",
          "color": "Blue",
          "product": {
            "name": "Floral Kurta Set",
            "images": [...]
          }
        }
      }
    ],
    "shipping_address": {
      "full_name": "John Doe",
      "phone": "9876543210",
      "address_line1": "123 Main Street",
      "city": "Mumbai",
      "state": "Maharashtra",
      "postal_code": "400001"
    },
    "billing_address": { ... },
    "payment": {
      "id": "payment-uuid",
      "status": "created",
      "payment_method": "cod",
      "amount": 5898.82
    },
    "shipment": null
  }
}
```

**Status Codes:**
- ✅ 200: Order found
- ❌ 404: Order not found or doesn't belong to you
- ❌ 401: Unauthorized

---

## Quick Test Checklist

### Test Flow:
```
1. ✅ Add product to cart (POST /api/cart/add)
2. ✅ View cart (GET /api/cart)
3. ✅ Create order (POST /api/orders/create)
4. ✅ View all orders (GET /api/orders)
5. ✅ View single order by UUID (GET /api/orders/{uuid})
6. ✅ View single order by order number (GET /api/orders/MAAY-ORD-2025-001)
```

---

## Troubleshooting

### Problem: "No items in cart"
**Solution:** Add items first
```
POST http://localhost:3000/api/cart/add
Body:
{
  "product_variant_id": "GET_FROM_PRODUCT_VARIANTS_TABLE",
  "quantity": 1
}
```

### Problem: "Shipping address required"
**Solution:** Create address or get correct address ID
```sql
-- Run in Supabase SQL Editor
SELECT id, full_name, city FROM addresses WHERE user_id = 'YOUR_USER_ID';
```

### Problem: "Order not found" 
**Solution:** Make sure:
- Order belongs to the authenticated user
- UUID or order number is correct
- Order actually exists in database

### Problem: "Unauthorized"
**Solution:** Get fresh token
```bash
node get-auth-token.js
```

---

## Example Full Test Scenario

```javascript
// 1. Add to cart
POST /api/cart/add
{
  "product_variant_id": "variant-uuid",
  "quantity": 2
}

// 2. Create order
POST /api/orders/create
{
  "shipping_address_id": "address-uuid",
  "billing_address_id": "address-uuid",
  "payment_method": "cod"
}
// Response: order_number = "MAAY-ORD-2025-001"

// 3. View all orders
GET /api/orders
// Should show the order you just created

// 4. View specific order
GET /api/orders/MAAY-ORD-2025-001
// Should show full order details with items, addresses, payment
```

---

## Need Data?

### Get Product Variant IDs:
```sql
SELECT pv.id, p.name, pv.sku, pv.size, pv.color 
FROM product_variants pv
JOIN products p ON p.id = pv.product_id
WHERE pv.is_active = true
LIMIT 10;
```

### Get Address IDs:
```sql
SELECT id, full_name, city, type 
FROM addresses 
WHERE user_id = 'YOUR_USER_ID';
```

### Get Your Orders:
```sql
SELECT id, order_number, status, total 
FROM orders 
WHERE user_id = 'YOUR_USER_ID'
ORDER BY created_at DESC;
```

---

## ✅ Success Indicators

When everything works, you should see:

1. **Order Created:**
   - Status: `pending`
   - Payment: `created` with method `cod`
   - Order number: `MAAY-ORD-2025-XXX`

2. **Cart Cleared:**
   - After order creation, cart should be empty

3. **Order Retrievable:**
   - Can fetch by UUID
   - Can fetch by order number
   - Shows full details (items, addresses, payment)

---

**🎯 Ready to test? Start with Step 3!**
