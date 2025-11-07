# Backend API Testing Guide with Postman

## ✅ All Fixes Implemented!

### Fixed Issues:
1. ✅ Added DELETE endpoint for wishlist removal
2. ✅ Enhanced wishlist GET to return complete product data with images
3. ✅ Added payment record creation in order flow
4. ✅ Created single order fetch endpoint
5. ✅ Added stock validation in cart update

---

## Prerequisites

### 1. Start the Backend Server
```bash
cd backend-nextjs
npm run dev
```
Server should be running on: `http://localhost:3000`

### 2. Get Authentication Token

You need a valid Supabase auth token. You can get this by:

**Option A: From Browser DevTools**
1. Login to your app
2. Open DevTools → Application → Local Storage
3. Find `supabase.auth.token`
4. Copy the `access_token` value

**Option B: Create Test User in Supabase**
1. Go to Supabase Dashboard → Authentication → Users
2. Add a test user
3. Use Supabase Auth API to get token

### 3. Set Environment Variables

Make sure `.env.local` has:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

---

## 🧪 Testing with Postman

### Setup Postman Collection

1. Create a new Collection: "Maayaro API Tests"
2. Add Collection Variable:
   - Variable: `auth_token`
   - Value: `YOUR_ACCESS_TOKEN_HERE`
   - Variable: `base_url`
   - Value: `http://localhost:3000`

3. Add Authorization Header to Collection:
   - Key: `Authorization`
   - Value: `Bearer {{auth_token}}`

---

## Test 1: Wishlist APIs 💕

### A. GET Wishlist (View all wishlist items)
```
Method: GET
URL: {{base_url}}/api/wishlist
Headers:
  Authorization: Bearer {{auth_token}}
```

**Expected Response:**
```json
{
  "wishlist": [
    {
      "id": "uuid",
      "product_id": "uuid",
      "name": "Product Name",
      "slug": "product-slug",
      "description": "Product description",
      "price": 4999,
      "sku": "MAAY-WOM-KUR-001",
      "image": "https://...",
      "hoverImage": "https://...",
      "colors": 4,
      "variants": [...],
      "category": "Ethnic Wear",
      "created_at": "2025-01-01T00:00:00Z"
    }
  ]
}
```

**Status Codes:**
- ✅ 200: Success
- ❌ 401: Unauthorized (check token)

---

### B. POST Add to Wishlist
```
Method: POST
URL: {{base_url}}/api/wishlist
Headers:
  Authorization: Bearer {{auth_token}}
  Content-Type: application/json
Body (raw JSON):
{
  "product_id": "PRODUCT_UUID_HERE"
}
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "user_id": "uuid",
    "product_id": "uuid",
    "created_at": "2025-01-01T00:00:00Z"
  }
}
```

**Status Codes:**
- ✅ 200: Success
- ❌ 400: Product already in wishlist
- ❌ 401: Unauthorized

---

### C. DELETE Remove from Wishlist ⭐ NEW
```
Method: DELETE
URL: {{base_url}}/api/wishlist/PRODUCT_UUID_HERE
Headers:
  Authorization: Bearer {{auth_token}}
```

**Expected Response:**
```json
{
  "success": true
}
```

**Status Codes:**
- ✅ 200: Success
- ❌ 401: Unauthorized
- ❌ 404: Product not in wishlist

---

## Test 2: Cart APIs 🛒

### A. GET Cart
```
Method: GET
URL: {{base_url}}/api/cart
Headers:
  Authorization: Bearer {{auth_token}}
```

**Expected Response:**
```json
{
  "id": "cart_uuid",
  "user_id": "user_uuid",
  "cart_items": [
    {
      "id": "item_uuid",
      "product_variant_id": "variant_uuid",
      "quantity": 2,
      "product_variant": {
        "id": "variant_uuid",
        "sku": "MAAY-WOM-KUR-001-IV-M",
        "size": "M",
        "color": "Ivory",
        "price": 4999,
        "stock_quantity": 10,
        "product": {
          "name": "Product Name",
          "images": [...]
        }
      }
    }
  ],
  "created_at": "2025-01-01T00:00:00Z"
}
```

---

### B. POST Add to Cart
```
Method: POST
URL: {{base_url}}/api/cart/add
Headers:
  Authorization: Bearer {{auth_token}}
  Content-Type: application/json
Body (raw JSON):
{
  "product_variant_id": "VARIANT_UUID_HERE",
  "quantity": 1
}
```

**Expected Response:**
```json
{
  "success": true,
  "cartItem": {
    "id": "uuid",
    "cart_id": "uuid",
    "product_variant_id": "uuid",
    "quantity": 1
  }
}
```

**Status Codes:**
- ✅ 200: Success
- ❌ 400: Insufficient stock
- ❌ 401: Unauthorized

---

### C. PUT Update Cart Quantity ⭐ ENHANCED
```
Method: PUT
URL: {{base_url}}/api/cart/update
Headers:
  Authorization: Bearer {{auth_token}}
  Content-Type: application/json
Body (raw JSON):
{
  "cart_item_id": "CART_ITEM_UUID_HERE",
  "quantity": 3
}
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "quantity": 3,
    "updated_at": "2025-01-01T00:00:00Z"
  }
}
```

**Status Codes:**
- ✅ 200: Success
- ❌ 400: Insufficient stock (with message)
- ❌ 404: Cart item not found

**Test Stock Validation:**
- Try to update quantity to more than available stock
- Should return: `{"error": "Insufficient stock for Product Name. Only X available."}`

---

### D. DELETE Remove from Cart
```
Method: DELETE
URL: {{base_url}}/api/cart/remove/CART_ITEM_UUID_HERE
Headers:
  Authorization: Bearer {{auth_token}}
```

**Expected Response:**
```json
{
  "success": true
}
```

---

## Test 3: Order APIs 📦

### A. GET All Orders
```
Method: GET
URL: {{base_url}}/api/orders
Headers:
  Authorization: Bearer {{auth_token}}
```

**Expected Response:**
```json
{
  "orders": [
    {
      "id": "uuid",
      "order_number": "MAAY-ORD-2025-001",
      "status": "pending",
      "subtotal": 4999,
      "discount": 0,
      "shipping_fee": 0,
      "tax": 899.82,
      "total": 5898.82,
      "order_items": [...],
      "payment": {
        "status": "created",
        "payment_method": "cod"
      },
      "shipment": null,
      "created_at": "2025-01-01T00:00:00Z"
    }
  ]
}
```

---

### B. GET Single Order ⭐ NEW
```
Method: GET
URL: {{base_url}}/api/orders/ORDER_UUID_OR_ORDER_NUMBER
Headers:
  Authorization: Bearer {{auth_token}}
```

**Test Both:**
1. By UUID: `/api/orders/123e4567-e89b-12d3-a456-426614174000`
2. By Order Number: `/api/orders/MAAY-ORD-2025-001`

**Expected Response:**
```json
{
  "order": {
    "id": "uuid",
    "order_number": "MAAY-ORD-2025-001",
    "status": "pending",
    "order_items": [...],
    "shipping_address": {
      "full_name": "John Doe",
      "address_line1": "123 Street",
      "city": "Mumbai",
      "state": "Maharashtra",
      "postal_code": "400001"
    },
    "billing_address": {...},
    "payment": {
      "amount": 5898.82,
      "status": "created",
      "payment_method": "cod"
    },
    "shipment": null,
    "created_at": "2025-01-01T00:00:00Z"
  }
}
```

**Status Codes:**
- ✅ 200: Success
- ❌ 404: Order not found
- ❌ 401: Unauthorized

---

### C. POST Create Order ⭐ ENHANCED
```
Method: POST
URL: {{base_url}}/api/orders/create
Headers:
  Authorization: Bearer {{auth_token}}
  Content-Type: application/json
Body (raw JSON):
{
  "shipping_address_id": "ADDRESS_UUID_HERE",
  "billing_address_id": "ADDRESS_UUID_HERE",
  "payment_method": "cod",
  "coupon_code": null,
  "notes": "Please deliver between 10 AM - 2 PM"
}
```

**Expected Response:**
```json
{
  "success": true,
  "order": {
    "id": "uuid",
    "order_number": "MAAY-ORD-2025-001",
    "status": "pending",
    "total": 5898.82,
    "created_at": "2025-01-01T00:00:00Z"
  }
}
```

**What It Does Now:**
1. ✅ Creates order
2. ✅ Creates order items
3. ✅ **Creates payment record** (NEW!)
4. ✅ Updates stock
5. ✅ Clears cart

**Status Codes:**
- ✅ 200: Success
- ❌ 400: Cart is empty / Insufficient stock
- ❌ 401: Unauthorized

---

## 🎯 Complete Test Flow

### Scenario: Full E-commerce Journey

**Step 1: Add Product to Wishlist**
```
POST /api/wishlist
Body: {"product_id": "PRODUCT_UUID"}
✅ Should return success
```

**Step 2: View Wishlist**
```
GET /api/wishlist
✅ Should show product with full details (images, variants, etc.)
```

**Step 3: Add to Cart from Wishlist**
```
POST /api/cart/add
Body: {"product_variant_id": "VARIANT_UUID", "quantity": 2}
✅ Should add to cart
```

**Step 4: View Cart**
```
GET /api/cart
✅ Should show cart with product details
```

**Step 5: Update Cart Quantity**
```
PUT /api/cart/update
Body: {"cart_item_id": "CART_ITEM_UUID", "quantity": 5}
✅ Should update quantity
❌ If quantity > stock, should return error
```

**Step 6: Remove from Wishlist**
```
DELETE /api/wishlist/PRODUCT_UUID
✅ Should remove from wishlist
```

**Step 7: Create Order**
```
POST /api/orders/create
Body: {
  "shipping_address_id": "ADDRESS_UUID",
  "billing_address_id": "ADDRESS_UUID",
  "payment_method": "cod"
}
✅ Should create order
✅ Should create payment record
✅ Cart should be cleared
```

**Step 8: View Orders**
```
GET /api/orders
✅ Should show order with payment details
```

**Step 9: View Single Order**
```
GET /api/orders/ORDER_NUMBER
✅ Should show full order details with addresses
```

---

## 🐛 Common Issues & Solutions

### Issue 1: 401 Unauthorized
**Solution:** 
- Check if token is valid
- Token might be expired
- Make sure Authorization header is set: `Bearer YOUR_TOKEN`

### Issue 2: Empty Cart
**Solution:**
- Add items to cart first using POST /api/cart/add
- Make sure you're using correct product_variant_id (not product_id)

### Issue 3: Insufficient Stock Error
**Solution:**
- This is working correctly!
- Check stock quantity in database
- Reduce quantity in request

### Issue 4: 404 Order Not Found
**Solution:**
- Make sure order belongs to logged-in user
- Check order_id or order_number is correct
- Orders are user-specific (can't access other users' orders)

### Issue 5: Product Already in Wishlist
**Solution:**
- Check if product is already in wishlist
- Remove it first, then add again
- Or use this as expected behavior

---

## 📊 Success Criteria Checklist

- [ ] ✅ Can add product to wishlist
- [ ] ✅ Can view wishlist with full product details (images, variants)
- [ ] ✅ Can remove product from wishlist
- [ ] ✅ Can add product to cart
- [ ] ✅ Can update cart quantity
- [ ] ✅ Cart update validates stock (rejects if quantity > stock)
- [ ] ✅ Can remove from cart
- [ ] ✅ Can create order with payment_method
- [ ] ✅ Order creation creates payment record
- [ ] ✅ Order creation clears cart
- [ ] ✅ Can view all orders with payment info
- [ ] ✅ Can view single order by ID or order_number
- [ ] ✅ Single order includes full details (addresses, items, payment, shipment)

---

## 🎉 What's New After Fixes

### 1. Enhanced Wishlist Response
**Before:**
```json
{"wishlist": [{"id": "...", "product_id": "...", "user_id": "..."}]}
```

**After:**
```json
{
  "wishlist": [{
    "id": "...",
    "name": "Product Name",
    "image": "https://...",
    "hoverImage": "https://...",
    "price": 4999,
    "colors": 4,
    "variants": [...],
    "category": "Ethnic Wear"
  }]
}
```

### 2. Cart Update with Stock Check
**Before:** Updated quantity without checking stock

**After:** 
```json
// If stock insufficient:
{
  "error": "Insufficient stock for Product Name. Only 5 available."
}
```

### 3. Payment Record Creation
**Before:** Order created but no payment record

**After:**
```sql
-- Automatically creates in payments table:
INSERT INTO payments (
  order_id,
  amount,
  status,
  payment_method,
  currency
)
```

### 4. Single Order Endpoint
**New:** Can fetch individual order with full details including addresses

---

## 🚀 Ready for Frontend Integration!

All APIs are now aligned with the database schema and ready for integration. The backend will:
- ✅ Handle authentication
- ✅ Validate stock before adding/updating cart
- ✅ Return complete product data for wishlist
- ✅ Create proper payment records
- ✅ Provide detailed order information

**Next Steps:**
1. Test all endpoints with Postman ✅
2. Verify responses match expected format ✅
3. Check error handling ✅
4. Start frontend integration 🚀
