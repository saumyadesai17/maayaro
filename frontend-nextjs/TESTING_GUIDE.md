# Quick Testing Guide

## Prerequisites
Make sure your development server is running:
```bash
cd frontend-nextjs
npm run dev
```

## Test 1: Complete Purchase Journey (5 minutes)

### Step-by-Step:
1. **Browse Products**
   - Open http://localhost:3000
   - Scroll down to "Featured Products"
   - Click on any product card

2. **Add to Cart**
   - Select a color (click on color circle)
   - Select a size (click on size button)
   - Click "ADD TO BAG" button
   - You should be redirected to cart page

3. **Review Cart**
   - Verify product appears with correct size/color
   - Try changing quantity using +/- buttons
   - Try applying promo code: `MAAYARO10` (10% off)
   - Click "PROCEED TO CHECKOUT"

4. **Checkout**
   - Fill in shipping address form:
     - First Name: Test
     - Last Name: User
     - Email: test@example.com
     - Phone: 9876543210
     - Address Line 1: 123 Test Street
     - City: Mumbai
     - State: Maharashtra (select from dropdown)
     - Postal Code: 400001
   - Click "CONTINUE TO PAYMENT"
   - Select "Cash on Delivery"
   - Click "REVIEW ORDER"
   - Click "PLACE ORDER"

5. **Verify Order**
   - You should see order confirmation
   - Click on user icon in header → Account
   - Click "Orders" tab
   - **✅ PASS**: Your order should appear with all details

## Test 2: Wishlist Functionality (2 minutes)

1. **Add to Wishlist**
   - Go to homepage or collection page
   - Hover over any product card
   - Click the heart icon (top right of product image)
   - **Check**: Heart should fill with red color
   - **Check**: Header wishlist count should increase

2. **View Wishlist**
   - Click heart icon in header
   - **✅ PASS**: Should show all wishlisted products

3. **Remove from Wishlist**
   - Click "Remove" on any product
   - **Check**: Product should disappear
   - **Check**: Header count should decrease

## Test 3: Cart Management (2 minutes)

1. **Add Multiple Items**
   - Add 3 different products to cart
   - Go to cart page

2. **Update Cart**
   - Change quantity of one item
   - Change size of another item
   - Remove one item
   - **✅ PASS**: All changes should work smoothly
   - **Check**: Totals update correctly

3. **Promo Codes**
   - Try code: `MAAYARO10` (10% discount)
   - Try code: `FIRST500` (₹500 off if cart > ₹3000)
   - **✅ PASS**: Discount should apply

## Test 4: Product Detail Page (1 minute)

1. **Navigate to Product**
   - Click on any product

2. **Wishlist from Detail Page**
   - Click heart icon on product image
   - **Check**: Should add to wishlist
   - **Check**: Heart fills with red color

3. **Add to Cart Validation**
   - Click "ADD TO BAG" without selecting size
   - **✅ PASS**: Should show "Please select a size" alert

## Test 5: Persistence Check (1 minute)

1. **Add Items**
   - Add 2 items to cart
   - Add 2 items to wishlist

2. **Refresh Page**
   - Press F5 or refresh browser
   - **✅ PASS**: Cart and wishlist counts should remain

3. **Close and Reopen**
   - Close browser tab
   - Open new tab → http://localhost:3000
   - **✅ PASS**: All items should still be there

## Test 6: Empty States (1 minute)

1. **Empty Cart**
   - Remove all items from cart
   - Go to cart page
   - **✅ PASS**: Should show "Your Bag is Empty" message

2. **Empty Checkout**
   - With empty cart, try to go to checkout
   - **✅ PASS**: Should redirect/show empty message

## Test 7: Header Badges (30 seconds)

1. **Real-time Updates**
   - Add item to cart → Check badge count
   - Add to wishlist → Check badge count
   - Remove items → Check badges decrease
   - **✅ PASS**: Badges should update instantly

## Common Issues & Solutions

### Issue: Cart items disappear after refresh
**Solution**: Check browser console for localStorage errors. Clear browser cache and try again.

### Issue: "Please select a size" keeps appearing
**Solution**: Make sure you actually clicked on a size button (it should have black background when selected).

### Issue: Orders not showing in account page
**Solution**: 
1. Open browser DevTools (F12)
2. Go to Application → Local Storage
3. Check if `maayaro_orders` exists and has data

### Issue: Promo code not working
**Solution**: 
- `MAAYARO10` - Works on any order
- `FIRST500` - Requires cart total > ₹3000

## Developer Testing (Check localStorage)

Open browser console (F12) and run:

```javascript
// View cart
console.log(JSON.parse(localStorage.getItem('maayaro_cart')));

// View wishlist
console.log(JSON.parse(localStorage.getItem('maayaro_wishlist')));

// View orders
console.log(JSON.parse(localStorage.getItem('maayaro_orders')));

// Clear all data (if needed)
localStorage.clear();
```

## Expected Results Summary

✅ All tests should pass without errors
✅ Data persists across page refreshes
✅ Cart and wishlist counts update in real-time
✅ Orders appear in account page after checkout
✅ UI remains unchanged from original design
✅ No console errors

## Performance Check

- Page should load quickly
- No lag when adding to cart/wishlist
- Smooth animations
- Instant badge updates

## Report Issues

If any test fails:
1. Check browser console for errors
2. Verify localStorage has data
3. Clear cache and try again
4. Check if all files are saved

## Success! 🎉

If all tests pass, the e-commerce flow is working perfectly!
