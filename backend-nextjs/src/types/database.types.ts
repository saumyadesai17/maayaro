// types/database.types.ts
// TypeScript types for Maayaro E-Commerce Database

export type AddressType = 'shipping' | 'billing' | 'both'

export type OrderStatus = 
  | 'pending' 
  | 'confirmed' 
  | 'processing' 
  | 'shipped' 
  | 'delivered' 
  | 'cancelled' 
  | 'refunded'

export type PaymentStatus = 
  | 'created' 
  | 'authorized' 
  | 'captured' 
  | 'refunded' 
  | 'failed'

export type ShipmentStatus = 
  | 'pending' 
  | 'pickup_scheduled' 
  | 'picked_up' 
  | 'in_transit' 
  | 'out_for_delivery' 
  | 'delivered' 
  | 'cancelled' 
  | 'rto'

export type DiscountType = 'percentage' | 'fixed'

export interface Profile {
  id: string
  email: string
  full_name: string | null
  phone: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  image_url: string | null
  parent_id: string | null
  sort_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Product {
  id: string
  name: string
  slug: string
  description: string | null
  category_id: string
  base_price: number
  is_active: boolean
  is_featured: boolean
  material: string | null
  care_instructions: string | null
  created_at: string
  updated_at: string
}

export interface ProductImage {
  id: string
  product_id: string
  image_url: string
  alt_text: string | null
  sort_order: number
  is_primary: boolean
  created_at: string
}

export interface ProductVariant {
  id: string
  product_id: string
  sku: string
  size: string
  color: string
  color_hex: string | null
  price: number | null
  stock_quantity: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Address {
  id: string
  user_id: string
  type: AddressType
  full_name: string
  phone: string
  address_line1: string
  address_line2: string | null
  city: string
  state: string
  postal_code: string
  country: string
  is_default: boolean
  created_at: string
  updated_at: string
}

export interface Cart {
  id: string
  user_id: string
  created_at: string
  updated_at: string
}

export interface CartItem {
  id: string
  cart_id: string
  product_variant_id: string
  quantity: number
  created_at: string
  updated_at: string
}

export interface Order {
  id: string
  order_number: string
  user_id: string
  status: OrderStatus
  subtotal: number
  discount: number
  shipping_fee: number
  tax: number
  total: number
  shipping_address_id: string
  billing_address_id: string
  notes: string | null
  created_at: string
  updated_at: string
}

export interface OrderItem {
  id: string
  order_id: string
  product_variant_id: string
  product_name: string
  variant_details: {
    size: string
    color: string
    sku: string
  }
  quantity: number
  unit_price: number
  total_price: number
  created_at: string
}

export interface Payment {
  id: string
  order_id: string
  razorpay_order_id: string | null
  razorpay_payment_id: string | null
  razorpay_signature: string | null
  amount: number
  currency: string
  status: PaymentStatus
  payment_method: string | null
  payment_metadata: Record<string, any> | null
  created_at: string
  updated_at: string
}

export interface Shipment {
  id: string
  order_id: string
  shiprocket_order_id: string | null
  shiprocket_shipment_id: string | null
  awb_code: string | null
  courier_name: string | null
  status: ShipmentStatus
  tracking_url: string | null
  estimated_delivery_date: string | null
  actual_delivery_date: string | null
  tracking_updates: TrackingUpdate[]
  created_at: string
  updated_at: string
}

export interface TrackingUpdate {
  date: string
  status: string
  location: string
  description: string
}

export interface Review {
  id: string
  product_id: string
  user_id: string
  order_item_id: string | null
  rating: number
  title: string | null
  comment: string | null
  is_verified_purchase: boolean
  is_approved: boolean
  created_at: string
  updated_at: string
}

export interface Wishlist {
  id: string
  user_id: string
  product_id: string
  created_at: string
}

export interface Coupon {
  id: string
  code: string
  description: string | null
  discount_type: DiscountType
  discount_value: number
  min_order_value: number
  max_discount: number | null
  valid_from: string
  valid_until: string
  usage_limit: number | null
  used_count: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface CouponUsage {
  id: string
  coupon_id: string
  user_id: string
  order_id: string
  discount_applied: number
  used_at: string
}

// ============================================
// Extended Types with Relations
// ============================================

export interface ProductWithDetails extends Product {
  category: Category
  images: ProductImage[]
  variants: ProductVariant[]
  average_rating: number | null
  review_count: number
}

export interface CartItemWithDetails extends CartItem {
  product_variant: ProductVariant & {
    product: Product & {
      images: ProductImage[]
    }
  }
}

export interface OrderWithDetails extends Order {
  order_items: (OrderItem & {
    product_variant: ProductVariant
  })[]
  shipping_address: Address
  billing_address: Address
  payment: Payment | null
  shipment: Shipment | null
}

export interface ReviewWithUser extends Review {
  user: Pick<Profile, 'full_name' | 'avatar_url'>
}

// ============================================
// API Request/Response Types
// ============================================

export interface CreateOrderRequest {
  cart_items: {
    product_variant_id: string
    quantity: number
  }[]
  shipping_address_id: string
  billing_address_id: string
  coupon_code?: string
  notes?: string
}

export interface CreateOrderResponse {
  order: Order
  payment_order_id: string
}

export interface PaymentVerificationRequest {
  razorpay_order_id: string
  razorpay_payment_id: string
  razorpay_signature: string
}

export interface ApplyCouponRequest {
  coupon_code: string
  cart_total: number
}

export interface ApplyCouponResponse {
  valid: boolean
  discount_amount: number
  final_amount: number
  coupon?: Coupon
}

export interface ProductFilters {
  category_id?: string
  min_price?: number
  max_price?: number
  sizes?: string[]
  colors?: string[]
  is_featured?: boolean
  search?: string
  sort_by?: 'price_asc' | 'price_desc' | 'newest' | 'popular'
  page?: number
  limit?: number
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    total_pages: number
  }
}

// ============================================
// Database Helper Types
// ============================================

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile
        Insert: Omit<Profile, 'created_at' | 'updated_at'>
        Update: Partial<Omit<Profile, 'id' | 'created_at' | 'updated_at'>>
      }
      categories: {
        Row: Category
        Insert: Omit<Category, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Category, 'id' | 'created_at' | 'updated_at'>>
      }
      products: {
        Row: Product
        Insert: Omit<Product, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Product, 'id' | 'created_at' | 'updated_at'>>
      }
      product_images: {
        Row: ProductImage
        Insert: Omit<ProductImage, 'id' | 'created_at'>
        Update: Partial<Omit<ProductImage, 'id' | 'created_at'>>
      }
      product_variants: {
        Row: ProductVariant
        Insert: Omit<ProductVariant, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<ProductVariant, 'id' | 'created_at' | 'updated_at'>>
      }
      addresses: {
        Row: Address
        Insert: Omit<Address, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Address, 'id' | 'created_at' | 'updated_at'>>
      }
      carts: {
        Row: Cart
        Insert: Omit<Cart, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Cart, 'id' | 'created_at' | 'updated_at'>>
      }
      cart_items: {
        Row: CartItem
        Insert: Omit<CartItem, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<CartItem, 'id' | 'created_at' | 'updated_at'>>
      }
      orders: {
        Row: Order
        Insert: Omit<Order, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Order, 'id' | 'created_at' | 'updated_at'>>
      }
      order_items: {
        Row: OrderItem
        Insert: Omit<OrderItem, 'id' | 'created_at'>
        Update: Partial<Omit<OrderItem, 'id' | 'created_at'>>
      }
      payments: {
        Row: Payment
        Insert: Omit<Payment, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Payment, 'id' | 'created_at' | 'updated_at'>>
      }
      shipments: {
        Row: Shipment
        Insert: Omit<Shipment, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Shipment, 'id' | 'created_at' | 'updated_at'>>
      }
      reviews: {
        Row: Review
        Insert: Omit<Review, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Review, 'id' | 'created_at' | 'updated_at'>>
      }
      wishlists: {
        Row: Wishlist
        Insert: Omit<Wishlist, 'id' | 'created_at'>
        Update: Partial<Omit<Wishlist, 'id' | 'created_at'>>
      }
      coupons: {
        Row: Coupon
        Insert: Omit<Coupon, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Coupon, 'id' | 'created_at' | 'updated_at'>>
      }
      coupon_usage: {
        Row: CouponUsage
        Insert: Omit<CouponUsage, 'id' | 'used_at'>
        Update: Partial<Omit<CouponUsage, 'id' | 'used_at'>>
      }
    }
    Enums: {
      address_type: AddressType
      order_status: OrderStatus
      payment_status: PaymentStatus
      shipment_status: ShipmentStatus
      discount_type: DiscountType
    }
  }
}