-- Fix: Create order items manually for testing
-- Run this in Supabase SQL Editor

-- First, get a product variant to use
SELECT pv.id, p.name, pv.sku, pv.price, pv.size, pv.color
FROM product_variants pv
JOIN products p ON p.id = pv.product_id
WHERE pv.is_active = true
LIMIT 5;

-- Copy one of the variant IDs from above, then run this:
-- Replace VARIANT_ID_HERE with actual variant ID from query above

INSERT INTO order_items (
  order_id,
  product_variant_id,
  product_name,
  variant_details,
  quantity,
  unit_price,
  total_price
) VALUES (
  '88fa7db8-e569-4179-b270-6aef4d78c597',
  'VARIANT_ID_HERE',  -- Replace with actual variant ID
  'Test Product',
  jsonb_build_object(
    'sku', 'TEST-SKU-001',
    'size', 'M',
    'color', 'Blue'
  ),
  2,
  999.99,
  1999.98
);

-- Verify order items were created
SELECT * FROM order_items 
WHERE order_id = '88fa7db8-e569-4179-b270-6aef4d78c597';