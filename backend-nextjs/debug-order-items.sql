-- Check order items for your order
-- Run this in Supabase SQL Editor

-- 1. Check if order_items exist
SELECT * FROM order_items 
WHERE order_id = '88fa7db8-e569-4179-b270-6aef4d78c597';

-- 2. Check the order details
SELECT 
  o.id,
  o.order_number,
  o.status,
  o.total,
  o.user_id
FROM orders o
WHERE o.id = '88fa7db8-e569-4179-b270-6aef4d78c597';

-- 3. Check if there are ANY order_items for this user
SELECT 
  oi.*,
  o.order_number
FROM order_items oi
JOIN orders o ON o.id = oi.order_id
WHERE o.user_id = (SELECT auth.uid())
ORDER BY oi.created_at DESC
LIMIT 10;

-- 4. Check what was in the cart when order was created
SELECT 
  c.user_id,
  COUNT(ci.id) as cart_items_count
FROM carts c
LEFT JOIN cart_items ci ON ci.cart_id = c.id
WHERE c.user_id = (SELECT auth.uid())
GROUP BY c.user_id;