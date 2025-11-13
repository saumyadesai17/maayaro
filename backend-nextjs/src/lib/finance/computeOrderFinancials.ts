/* computeOrderFinancials.ts
   Fixed and hardened version - single source of truth for totals/tax/shipping
*/

import { createClient } from '@/lib/supabase/server';

/* ---------- Types (kept aligned with your file) ---------- */

interface SiteSettings {
  tax_rate: number; // decimal (e.g. 0.18)
  free_shipping_threshold: number;
  standard_shipping_fee: number;
}

interface CartItemInput {
  product_variant_id: string;
  quantity: number;
  // optional override GST per item (percentage or decimal)
  gstRate?: number;
}

interface ShippingAddress {
  customer_name: string;
  last_name?: string;
  address: string;
  address_2?: string;
  city: string;
  pincode: string;
  state: string;
  country: string;
  email: string;
  phone: string;
  alternate_phone?: string;
  isd_code?: string;
}

interface BillingAddress extends ShippingAddress {
  // Same structure as shipping
}

interface OrderInput {
  cartItems: CartItemInput[];
  shippingMethod: 'standard' | 'express' | 'same-day';
  discount?: number;
  userId?: string;
  billingAddress: BillingAddress;
  shippingAddress?: ShippingAddress; // Optional if same as billing
  shippingIsBilling?: boolean;
  paymentMethod?: 'COD' | 'Prepaid';
  pickupLocation?: string;
  orderTag?: string;
  customerGstin?: string;
  // Package dimensions
  dimensions?: {
    length: number; // cm
    breadth: number; // cm
    height: number; // cm
    weight: number; // kg
  };
}

interface ProductVariant {
  id: string;
  sku: string;
  price: number | null; // base price per unit (before tax)
  stock_quantity: number;
  product: {
    id: string;
    name: string;
    base_price?: number | null;
    gst_rate?: number | null; // could be 18 or 0.18 in DB
  };
}

interface ComputedOrderItem {
  product_variant_id: string;
  product_name: string;
  sku: string;
  quantity: number;
  unit_price: number; // base price per unit (before tax)
  base_total: number; // unit_price * quantity (pre-tax)
  tax_amount: number; // tax for this line (total)
  gst_rate: number; // percentage (e.g. 18)
  total_with_tax: number; // base_total + tax_amount
}

interface OrderFinancials {
  subtotal: number;
  discount: number;
  shipping_fee: number;
  shipping_tax: number;
  tax: number; // total tax (items + shipping)
  total: number;
}

interface ShiprocketItem {
  name: string;
  sku: string;
  units: number;
  selling_price: number; // tax-inclusive unit price
  discount: number;
  tax: number; // percentage (e.g., 18)
  hsn?: number;
}

interface ShiprocketPayload {
  order_id: string;
  order_date: string;
  pickup_location: string;
  comment?: string;
  reseller_name?: string;
  company_name?: string;
  
  // Billing address
  billing_customer_name: string;
  billing_last_name?: string;
  billing_address: string;
  billing_address_2?: string;
  billing_isd_code?: string;
  billing_city: string;
  billing_pincode: string;
  billing_state: string;
  billing_country: string;
  billing_email: string;
  billing_phone: string;
  billing_alternate_phone?: string;
  
  // Shipping address
  shipping_is_billing: boolean;
  shipping_customer_name?: string;
  shipping_last_name?: string;
  shipping_address?: string;
  shipping_address_2?: string;
  shipping_city?: string;
  shipping_pincode?: string;
  shipping_country?: string;
  shipping_state?: string;
  shipping_email?: string;
  shipping_phone?: string;
  
  // Order items and financials
  order_items: ShiprocketItem[];
  payment_method: string;
  shipping_charges: number;
  giftwrap_charges?: number;
  transaction_charges?: number;
  total_discount: number;
  sub_total: number;
  
  // Package dimensions
  length: number;
  breadth: number;
  height: number;
  weight: number;
  
  // Optional fields
  ewaybill_no?: string;
  customer_gstin?: string;
  invoice_number?: string;
  order_type?: string;
  order_tag?: string;
}

/* ---------- Utilities ---------- */

function roundToTwo(num: number): number {
  return Number(num.toFixed(2));
}

/* Normalize GST to percentage (18 rather than 0.18) */
function normalizeGstRate(raw?: number | null, defaultDecimal = 0.18): number {
  // raw could be 18 or 0.18 or null
  const fallback = defaultDecimal * 100; // 0.18 -> 18
  if (raw === null || typeof raw === 'undefined') return fallback;
  // If value looks like decimal (<=1), convert to percentage
  if (raw <= 1) return roundToTwo(raw * 100);
  return roundToTwo(raw);
}

/* ---------- Validation function ---------- */

function validateTotals(
  order: OrderFinancials,
  shiprocketPayload: ShiprocketPayload
): { is_valid: boolean; warnings: string[] } {
  const warnings: string[] = [];

  if (order.discount > order.subtotal + order.shipping_fee) {
    warnings.push(
      `Discount (₹${order.discount}) exceeds subtotal + shipping (₹${roundToTwo(order.subtotal + order.shipping_fee)})`
    );
  }

  // Our total: subtotal (base) + item_tax + shipping (tax-inclusive)
  // Shiprocket total: sub_total (tax-inclusive items) + shipping_charges
  // These should match since sub_total now includes item taxes
  const shiprocketExpectedTotal = roundToTwo(
    shiprocketPayload.sub_total +
      shiprocketPayload.shipping_charges -
      shiprocketPayload.total_discount
  );

  const totalMismatch = Math.abs(shiprocketExpectedTotal - order.total);
  if (totalMismatch > 0.01) {
    warnings.push(
      `Shiprocket total mismatch: Expected ₹${shiprocketExpectedTotal}, got ₹${order.total} (diff: ₹${roundToTwo(
        totalMismatch
      )})`
    );
  }

  // Since selling_price is tax-INCLUSIVE and Shiprocket divides by 1.18,
  // sum(selling_price * units) should equal sub_total (tax-inclusive item totals)
  const itemSum = roundToTwo(
    shiprocketPayload.order_items.reduce((s, it) => s + it.selling_price * it.units, 0)
  );

  const itemsMismatch = Math.abs(itemSum - shiprocketPayload.sub_total);
  if (itemsMismatch > 0.01) {
    warnings.push(
      `Shiprocket items-sum mismatch: sum(selling_price*units)=₹${itemSum}, expected sub_total=₹${shiprocketPayload.sub_total} (diff: ₹${roundToTwo(itemsMismatch)})`
    );
  }

  if (order.subtotal < 0 || order.shipping_fee < 0 || order.tax < 0 || order.total < 0) {
    warnings.push('Negative values detected in order totals');
  }

  return {
    is_valid: warnings.length === 0,
    warnings,
  };
}

/* ---------- Main function ---------- */

export default async function computeOrderFinancials(input: OrderInput) {
  const supabase = await createClient();

  const {
    cartItems,
    shippingMethod,
    discount = 0,
    userId,
    billingAddress,
    shippingAddress,
    shippingIsBilling = true,
    paymentMethod = 'Prepaid',
    pickupLocation = 'warehouse',
    orderTag,
    customerGstin,
    dimensions,
  } = input;

  if (!cartItems || cartItems.length === 0) {
    throw new Error('cartItems is required and cannot be empty');
  }
  if (discount < 0) throw new Error('Discount cannot be negative');
  if (!billingAddress) throw new Error('Billing address is required');
  if (!shippingIsBilling && !shippingAddress) {
    throw new Error('Shipping address is required when shipping is not same as billing');
  }

  // STEP 1: load site settings
  const { data: settingsData } = await supabase
    .from('site_settings')
    .select('key, value')
    .in('key', ['tax_rate', 'free_shipping_threshold', 'standard_shipping_fee']);

  const settingsMap: Record<string, string> = {};
  settingsData?.forEach((s: any) => {
    settingsMap[s.key] = s.value;
  });

  const siteSettings: SiteSettings = {
    tax_rate: parseFloat(settingsMap['tax_rate'] ?? '0.18'), // decimal
    free_shipping_threshold: parseFloat(settingsMap['free_shipping_threshold'] ?? '500'),
    standard_shipping_fee: parseFloat(settingsMap['standard_shipping_fee'] ?? '50'),
  };

  // STEP 2: fetch variants used in cart
  const variantIds = cartItems.map((c) => c.product_variant_id);
  const { data: variants, error: variantsError } = await supabase
    .from('product_variants')
    .select(
      `
      id,
      sku,
      price,
      stock_quantity,
      product:products (
        id,
        name,
        base_price
      )
    `
    )
    .in('id', variantIds);

  console.log('Fetched variants:', variants);
  console.log('Variants error:', variantsError);

  if (variantsError || !variants || variants.length === 0) {
    throw new Error(`Failed to load product information: ${variantsError?.message || 'No variants found'}`);
  }

  // map by id - handle both array and object product formats
  const variantMap = new Map<string, ProductVariant>();
  variants.forEach((v: any) => {
    // Normalize product field (could be array or object depending on Supabase version)
    const normalizedVariant = {
      ...v,
      product: Array.isArray(v.product) ? v.product[0] : v.product
    };
    variantMap.set(v.id, normalizedVariant as ProductVariant);
  });

  // STEP 3: compute per-item totals
  const computedItems: ComputedOrderItem[] = [];
  let subtotal = 0;
  let totalItemTax = 0;
  let maxGstRate = 0; // percentage (e.g., 18)

  for (const cartItem of cartItems) {
    const variant = variantMap.get(cartItem.product_variant_id);
    if (!variant) throw new Error(`Product variant ${cartItem.product_variant_id} not found`);

    // stock check
    if (variant.stock_quantity < cartItem.quantity) {
      throw new Error(
        `Insufficient stock for ${variant.product?.name ?? variant.sku}. Available: ${variant.stock_quantity}, Requested: ${cartItem.quantity}`
      );
    }

    // determine unit price: prefer variant.price, fallback to product.base_price
    const rawUnit = variant.price ?? variant.product?.base_price;
    if (typeof rawUnit !== 'number' || Number.isNaN(rawUnit)) {
      throw new Error(`Invalid price for variant ${variant.id}`);
    }
    const unitPrice = roundToTwo(rawUnit);

    // Determine GST rate for this item: prefer input override, then product, else site default
    const rawGst = cartItem.gstRate ?? variant.product?.gst_rate ?? null;
    let gstRate = normalizeGstRate(rawGst, siteSettings.tax_rate); // returns percentage, e.g., 18
    // Track max for shipping tax calculation
    if (gstRate > maxGstRate) maxGstRate = gstRate;

    // base total (pre-tax)
    const baseTotal = roundToTwo(unitPrice * cartItem.quantity);

    // tax for this line
    const taxAmount = roundToTwo(baseTotal * (gstRate / 100));

    // total including tax
    const totalWithTax = roundToTwo(baseTotal + taxAmount);

    computedItems.push({
      product_variant_id: variant.id,
      product_name: variant.product?.name ?? 'Product',
      sku: variant.sku ?? 'SKU',
      quantity: cartItem.quantity,
      unit_price: unitPrice,
      base_total: baseTotal,
      tax_amount: taxAmount,
      gst_rate: gstRate,
      total_with_tax: totalWithTax,
    });

    subtotal += baseTotal;
    totalItemTax += taxAmount;
  }

  subtotal = roundToTwo(subtotal);
  totalItemTax = roundToTwo(totalItemTax);

  // STEP 4: determine shipping fee (pre-tax)
  let shippingFee = 0;
  switch (shippingMethod) {
    case 'standard':
      shippingFee =
        subtotal >= siteSettings.free_shipping_threshold ? 0 : siteSettings.standard_shipping_fee;
      break;
    case 'express':
      shippingFee = 200;
      break;
    case 'same-day':
      shippingFee = 300;
      break;
    default:
      shippingFee =
        subtotal >= siteSettings.free_shipping_threshold ? 0 : siteSettings.standard_shipping_fee;
  }
  shippingFee = roundToTwo(shippingFee);

  // STEP 5: shipping tax - Shiprocket treats shipping_charges as tax-inclusive
  // So we need to extract the tax portion from the shipping fee
  // Formula: tax = (fee / (1 + rate)) * rate
  const shippingTax = shippingFee > 0 
    ? roundToTwo((shippingFee / (1 + maxGstRate / 100)) * (maxGstRate / 100))
    : 0;

  // STEP 6: totals
  // Note: shippingFee is tax-inclusive (₹200), so shipping_tax is just for tracking
  // Total tax includes both item tax and shipping tax (extracted from shippingFee)
  const totalTax = roundToTwo(totalItemTax + shippingTax);
  
  // guard: discount cannot exceed subtotal + shippingFee
  if (discount > subtotal + shippingFee) {
    throw new Error('Discount cannot exceed subtotal + shipping fee');
  }
  
  // Total = base prices + item tax + shipping (already tax-inclusive)
  // Do NOT add shippingTax again since it's already included in shippingFee
  const total = roundToTwo(subtotal - discount + totalItemTax + shippingFee);

  const order: OrderFinancials = {
    subtotal,
    discount: roundToTwo(discount),
    shipping_fee: shippingFee,
    shipping_tax: shippingTax,
    tax: totalTax,
    total,
  };

  // STEP 7: razorpay amount (paise)
  const razorpayAmountPaise = Math.round(total * 100);

  // STEP 8: Build shiprocket items
  // PROVEN BY INVOICE: When passing 'tax' percentage, selling_price must be TAX-INCLUSIVE
  // Shiprocket divides by 1.18 to extract taxable value, then shows tax separately on invoice
  const shiprocketItems: ShiprocketItem[] = computedItems.map((item) => {
    return {
      name: item.product_name,
      sku: item.sku,
      units: item.quantity,
      selling_price: item.total_with_tax, // TAX-INCLUSIVE (what customer pays per unit)
      discount: 0,
      tax: item.gst_rate, // percentage (e.g., 18) - Shiprocket extracts taxable value
    };
  });

  // STEP 9: Calculate package dimensions (if not provided, use defaults)
  const packageDimensions = dimensions || {
    length: 10,
    breadth: 10,
    height: 10,
    weight: 0.5,
  };

  // Validate dimensions meet Shiprocket requirements
  if (packageDimensions.length <= 0.5 || packageDimensions.breadth <= 0.5 || packageDimensions.height <= 0.5) {
    throw new Error('Package dimensions (length, breadth, height) must be greater than 0.5 cm');
  }
  if (packageDimensions.weight <= 0) {
    throw new Error('Package weight must be greater than 0 kg');
  }

  // STEP 10: Determine shipping address (use billing if same)
  const finalShippingAddress = shippingIsBilling ? billingAddress : shippingAddress!;

  // STEP 11: Build complete shiprocket payload
  const shiprocketPayload: ShiprocketPayload = {
    order_id: 'PENDING', // replace with real order number when available
    order_date: new Date().toISOString().split('T')[0] + ' ' + new Date().toTimeString().split(' ')[0].substring(0, 5),
    pickup_location: pickupLocation,
    
    // Billing address
    billing_customer_name: billingAddress.customer_name,
    billing_last_name: billingAddress.last_name,
    billing_address: billingAddress.address,
    billing_address_2: billingAddress.address_2,
    billing_isd_code: billingAddress.isd_code || '+91',
    billing_city: billingAddress.city,
    billing_pincode: billingAddress.pincode,
    billing_state: billingAddress.state,
    billing_country: billingAddress.country,
    billing_email: billingAddress.email,
    billing_phone: billingAddress.phone,
    billing_alternate_phone: billingAddress.alternate_phone,
    
    // Shipping address
    shipping_is_billing: shippingIsBilling,
    shipping_customer_name: shippingIsBilling ? undefined : finalShippingAddress.customer_name,
    shipping_last_name: shippingIsBilling ? undefined : finalShippingAddress.last_name,
    shipping_address: shippingIsBilling ? undefined : finalShippingAddress.address,
    shipping_address_2: shippingIsBilling ? undefined : finalShippingAddress.address_2,
    shipping_city: shippingIsBilling ? undefined : finalShippingAddress.city,
    shipping_pincode: shippingIsBilling ? undefined : finalShippingAddress.pincode,
    shipping_country: shippingIsBilling ? undefined : finalShippingAddress.country,
    shipping_state: shippingIsBilling ? undefined : finalShippingAddress.state,
    shipping_email: shippingIsBilling ? undefined : finalShippingAddress.email,
    shipping_phone: shippingIsBilling ? undefined : finalShippingAddress.phone,
    
    // Order items and financials
    order_items: shiprocketItems,
    payment_method: paymentMethod,
    shipping_charges: shippingFee,
    total_discount: roundToTwo(discount),
    // sub_total must be sum of tax-inclusive item totals (Shiprocket divides by 1.18 internally)
    sub_total: roundToTwo(computedItems.reduce((sum, item) => sum + item.total_with_tax, 0)),
    
    // Package dimensions
    length: packageDimensions.length,
    breadth: packageDimensions.breadth,
    height: packageDimensions.height,
    weight: packageDimensions.weight,
    
    // Optional fields
    customer_gstin: customerGstin,
    order_tag: orderTag,
  };

  // STEP 12: validate totals
  const validation = validateTotals(order, shiprocketPayload);
  if (!validation.is_valid) {
    console.warn('⚠️ Validation Warnings:', validation.warnings);
  }

  // STEP 13: return result
  return {
    order,
    order_items: computedItems,
    razorpay_amount_paise: razorpayAmountPaise,
    shiprocket_payload: shiprocketPayload,
    validation,
  };
}
