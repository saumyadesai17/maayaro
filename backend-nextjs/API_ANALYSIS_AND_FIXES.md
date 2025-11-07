# Backend API Analysis & Integration Readiness

## 📊 **Overall Status: ⚠️ NEEDS FIXES BEFORE INTEGRATION**

---

## ✅ **What's Working Well**

### 1. **Database Schema** ✅
- Well-structured with proper relationships
- Correct foreign keys and constraints
- UUID primary keys for security
- Proper indexes for performance
- Triggers for updated_at timestamps
- UNIQUE constraints to prevent duplicates

### 2. **Authentication** ✅
- Uses Supabase auth properly
- Protected routes with user verification
- User ID properly linked to all user-specific tables

---

## ❌ **Critical Issues Found**

### **1. Wishlist API - Missing DELETE Endpoint** 🔴

**Current State:**
```typescript
// ❌ Only has POST (add) - Missing DELETE (remove)
POST /api/wishlist - Add to wishlist
```

**What's Needed:**
```typescript
// ✅ Should also have DELETE
DELETE /api/wishlist/[productId] - Remove from wishlist
```

**Issue:** Frontend needs to remove items from wishlist, but there's no API endpoint for it.

---

### **2. Wishlist API - Data Structure Mismatch** 🔴

**Database Schema:**
```sql
-- Wishlist stores product_id only
CREATE TABLE wishlists (
    user_id UUID,
    product_id UUID,  -- ⚠️ Just the product, no variant
    ...
)
```

**Frontend Expects:**
- Product details (name, price, images)
- Multiple variants (colors, sizes)
- SKU information

**Issue:** Frontend needs product details for display, but API might return minimal data.

---

### **3. Cart API - Missing "Move to Cart from Wishlist"** 🔴

**Current Flow:**
```
Frontend Wishlist → Click "Add to Bag" → Should add to cart with variant selection
```

**Problem:** 
- Wishlist has `product_id` only
- Cart needs `product_variant_id` (specific size/color)
- No API endpoint to handle this conversion

**What's Needed:**
```typescript
POST /api/cart/add-from-wishlist
Body: { product_id, product_variant_id }
```

---

### **4. Orders API - Missing Individual Order Fetch** 🟡

**Current:**
```typescript
GET /api/orders - Returns ALL orders
```

**What's Also Needed:**
```typescript
GET /api/orders/[orderId] - Returns single order with full details
```

**Use Case:** When user clicks "View Details" on an order in account page.

---

### **5. Cart API - Potential Stock Check Issue** 🟡

**In `/api/cart/add`:**
```typescript
// ✅ Checks stock before adding
const { data: variant } = await supabase
  .from('product_variants')
  .select('stock_quantity')
  .eq('id', product_variant_id)
  .single()

if (!variant || variant.stock_quantity < quantity) {
  return NextResponse.json({ error: 'Insufficient stock' }, { status: 400 })
}
```

**Issue:** When updating quantity, need similar check. Verify update endpoint has this.

---

### **6. Order Creation - Missing Payment Integration** 🟡

**Current Flow:**
```typescript
// Creates order but doesn't create payment record
const { data: order } = await supabase.from('orders').insert(...)
// ❌ Missing: Create payment record in payments table
```

**Problem:** 
- Orders table has `status`
- Payments table should have payment details
- Frontend expects payment status

**What's Needed:**
```typescript
// After creating order, also:
await supabase.from('payments').insert({
  order_id: order.id,
  amount: total,
  status: 'pending',
  payment_method: payment_method, // from request
})
```

---

## 🔧 **Required Fixes**

### **Priority 1: Critical for Basic Functionality** 🔴

#### **Fix 1: Add DELETE Wishlist Endpoint**

Create: `backend-nextjs/src/app/api/wishlist/[productId]/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { productId: string } }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { error } = await supabase
      .from('wishlists')
      .delete()
      .eq('user_id', user.id)
      .eq('product_id', params.productId)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error removing from wishlist:', error)
    return NextResponse.json(
      { error: 'Failed to remove from wishlist' },
      { status: 500 }
    )
  }
}
```

#### **Fix 2: Enhance Wishlist GET to Return Full Product Data**

Update: `backend-nextjs/src/app/api/wishlist/route.ts`

```typescript
// In GET endpoint, modify the select to include images
const { data: wishlist, error } = await supabase
  .from('wishlists')
  .select(`
    *,
    product:products(
      *,
      images:product_images(*),
      variants:product_variants(
        id,
        sku,
        size,
        color,
        color_hex,
        price,
        stock_quantity,
        is_active
      ),
      category:categories(name, slug)
    )
  `)
  .eq('user_id', user.id)
  .order('created_at', { ascending: false })

// Transform data for frontend
const transformedWishlist = wishlist?.map(item => ({
  id: item.id,
  product_id: item.product_id,
  name: item.product.name,
  slug: item.product.slug,
  price: item.product.base_price,
  sku: item.product.variants?.[0]?.sku || `MAAY-${item.product_id}`,
  image: item.product.images?.find(img => img.is_primary)?.image_url || item.product.images?.[0]?.image_url,
  hoverImage: item.product.images?.[1]?.image_url,
  colors: item.product.variants?.length || 0,
  category: item.product.category?.name,
  created_at: item.created_at,
}))

return NextResponse.json({ wishlist: transformedWishlist })
```

#### **Fix 3: Add Payment Record in Order Creation**

Update: `backend-nextjs/src/app/api/orders/create/route.ts`

```typescript
// Add payment_method to request body
const {
  shipping_address_id,
  billing_address_id,
  payment_method, // ✅ Add this
  coupon_code,
  notes,
} = await request.json()

// After creating order, add:
// Create payment record
const { error: paymentError } = await supabase
  .from('payments')
  .insert({
    order_id: order.id,
    amount: total,
    currency: 'INR',
    status: payment_method === 'cod' ? 'pending' : 'created',
    payment_method: payment_method,
  })

if (paymentError) {
  console.error('Payment record creation failed:', paymentError)
  // Continue anyway - can be created later
}
```

---

### **Priority 2: Enhanced Functionality** 🟡

#### **Fix 4: Add Single Order Fetch Endpoint**

Create: `backend-nextjs/src/app/api/orders/[orderId]/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: order, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items(
          *,
          product_variant:product_variants(
            *,
            product:products(
              *,
              images:product_images(*)
            )
          )
        ),
        shipping_address:addresses!orders_shipping_address_id_fkey(*),
        billing_address:addresses!orders_billing_address_id_fkey(*),
        payment:payments(*),
        shipment:shipments(*)
      `)
      .eq('user_id', user.id)
      .or(`id.eq.${params.orderId},order_number.eq.${params.orderId}`)
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ order })
  } catch (error) {
    console.error('Error fetching order:', error)
    return NextResponse.json(
      { error: 'Failed to fetch order' },
      { status: 500 }
    )
  }
}
```

#### **Fix 5: Add Cart Update Endpoint with Stock Check**

Verify/Update: `backend-nextjs/src/app/api/cart/update/route.ts`

```typescript
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { cart_item_id, quantity } = await request.json()

    // ✅ Check stock before updating
    const { data: cartItem } = await supabase
      .from('cart_items')
      .select('product_variant:product_variants(stock_quantity)')
      .eq('id', cart_item_id)
      .single()

    if (cartItem?.product_variant.stock_quantity < quantity) {
      return NextResponse.json(
        { error: 'Insufficient stock' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('cart_items')
      .update({ quantity, updated_at: new Date().toISOString() })
      .eq('id', cart_item_id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Error updating cart:', error)
    return NextResponse.json(
      { error: 'Failed to update cart' },
      { status: 500 }
    )
  }
}
```

---

## 📋 **API Endpoints Summary**

### **Cart APIs** 🛒
- ✅ `GET /api/cart` - Get cart with items
- ✅ `POST /api/cart/add` - Add item to cart
- ⚠️ `PATCH /api/cart/update` - Update quantity (verify stock check)
- ✅ `DELETE /api/cart/remove/[itemId]` - Remove item

### **Wishlist APIs** ❤️
- ✅ `GET /api/wishlist` - Get all wishlist items
- ✅ `POST /api/wishlist` - Add to wishlist
- ❌ `DELETE /api/wishlist/[productId]` - **MISSING** (Need to create)

### **Order APIs** 📦
- ✅ `GET /api/orders` - Get all orders
- ❌ `GET /api/orders/[orderId]` - **MISSING** (Nice to have)
- ⚠️ `POST /api/orders/create` - Create order (needs payment record)

---

## 🎯 **Integration Checklist**

### **Before Frontend Integration:**

- [ ] **Fix 1**: Create DELETE wishlist endpoint
- [ ] **Fix 2**: Enhance wishlist GET with full product data
- [ ] **Fix 3**: Add payment record creation in order API
- [ ] **Fix 4**: Create single order fetch endpoint (optional but recommended)
- [ ] **Fix 5**: Verify cart update has stock check

### **After Fixes:**

- [ ] Test all endpoints with Postman/Thunder Client
- [ ] Verify authentication works
- [ ] Test with real data in Supabase
- [ ] Check error handling
- [ ] Test stock validation

---

## 🚀 **Frontend Integration Strategy**

### **Phase 1: Keep localStorage (Current)**
- Continue using localStorage for development
- Test UI/UX flows
- No backend dependency

### **Phase 2: Hybrid Approach**
- Add authentication (Supabase Auth)
- Keep cart/wishlist in localStorage for guests
- Sync to backend for logged-in users

### **Phase 3: Full Backend Integration**
- Replace localStorage with API calls
- Real-time stock updates
- Multi-device cart sync
- Order history from database

---

## 💡 **Recommendation**

### **DO NOT INTEGRATE YET** ⚠️

**Reasons:**
1. Missing critical DELETE wishlist endpoint
2. Wishlist data structure needs enhancement
3. Payment record creation missing
4. Should test all endpoints first

### **Timeline:**
1. **Day 1**: Fix critical issues (Fixes 1-3)
2. **Day 2**: Add nice-to-have features (Fixes 4-5)
3. **Day 3**: Test all endpoints thoroughly
4. **Day 4**: Start frontend integration

---

## 🔍 **Testing Recommendations**

### **Test Each Endpoint:**

```bash
# Test Wishlist
curl -X POST http://localhost:3000/api/wishlist \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"product_id": "uuid-here"}'

curl -X GET http://localhost:3000/api/wishlist \
  -H "Authorization: Bearer YOUR_TOKEN"

# Test Cart
curl -X POST http://localhost:3000/api/cart/add \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"product_variant_id": "uuid-here", "quantity": 1}'

# Test Orders
curl -X POST http://localhost:3000/api/orders/create \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"shipping_address_id": "uuid", "payment_method": "cod"}'
```

---

## 📄 **Summary**

| Component | Status | Action Needed |
|-----------|--------|---------------|
| Database Schema | ✅ Ready | None |
| Cart APIs | ⚠️ Mostly Ready | Verify stock check in update |
| Wishlist APIs | ❌ Incomplete | Add DELETE endpoint |
| Order APIs | ⚠️ Needs Work | Add payment record creation |
| Authentication | ✅ Working | None |

**Final Verdict:** Fix the 3 critical issues first, then you can safely start integration! 🚀
