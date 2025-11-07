# MAAYARO Admin CMS Documentation

## Overview
The Admin CMS follows the same design principles as the main MAAYARO website - clean, minimalist, and professional. All dummy data is structured according to the provided database schema.

## Access
- **URL**: Click "Admin" link in the footer or navigate to admin page
- **Location**: `/components/admin/`

## File Structure

```
/components/admin/
├── AdminApp.tsx          # Main admin container
├── AdminLayout.tsx       # Sidebar layout & navigation
├── AdminDashboard.tsx    # Dashboard with stats & overview
├── ProductsPage.tsx      # Product management
└── OrdersPage.tsx        # Order management & tracking
```

```
/data/
└── mockData.json         # All structured dummy data
```

## Mock Data Structure

The `mockData.json` file contains schema-aligned data for:

### Core Data
- **Categories** (5 entries)
  - Women, Men with subcategories
  - Kurta Sets, Sarees, Kurtas, etc.

- **Products** (3 entries)
  - Silk Blend Embroidered Kurta Set
  - Handwoven Banarasi Silk Saree
  - Premium Cotton Linen Kurta

- **Product Variants** (6 entries)
  - Different sizes and colors
  - SKU format: MAAY-{CATEGORY}-{TYPE}-{ID}-{COLOR}-{SIZE}
  - Stock quantities

- **Product Images** (4 entries)
  - Primary and secondary images
  - Sort order support

### User & Order Data
- **Profiles** (3 users)
  - 1 Admin
  - 2 Customers
  - Role-based access

- **Addresses** (2 entries)
  - Indian address format
  - Shipping/billing types
  - Default address support

- **Orders** (3 entries)
  - Different statuses: delivered, shipped, processing
  - Complete pricing breakdown
  - INR currency

- **Order Items**
  - Product details with variants
  - Quantity and pricing

- **Payments** (2 entries)
  - Razorpay integration data
  - Payment methods: UPI, Card
  - Success/pending statuses

- **Shipments** (2 entries)
  - Tracking numbers (AWB codes)
  - Courier details (DTDC, Bluedart)
  - Tracking timeline updates

### Marketing & Content
- **Banners** (2 entries)
  - Hero and promotional types
  - Desktop and mobile images
  - Active/scheduling support

- **Coupons** (3 entries)
  - Codes: MAAYARO10, FIRST500, WELCOME15
  - Percentage and fixed discounts
  - Usage tracking

- **Reviews** (2 entries)
  - 5-star rating system
  - Verified purchase flag
  - Approval workflow

- **Blog Posts** (2 entries)
  - SEO metadata
  - Categories and tags
  - View count tracking

- **FAQs** (4 entries)
  - Categorized
  - Sort order
  - Active/inactive status

- **Site Settings** (5 entries)
  - Free shipping threshold: ₹5000
  - Tax rate: 18%
  - Contact information

## Admin Features

### 1. Dashboard
**Location**: Default landing page

**Features**:
- Revenue, orders, products, customers stats
- Order status breakdown (pending/shipped/delivered)
- Inventory status (active/low stock/out of stock)
- Active coupons summary
- Recent orders list (5 most recent)
- Low stock alerts (5 items)

**Design**:
- 4 main stat cards with icons and trend indicators
- 3 quick stat panels
- 2-column layout for lists
- Color-coded status badges

### 2. Products Management
**Location**: Products menu item

**Features**:
- Search by product name or slug
- Filter by category
- Filter by status (active/inactive)
- Desktop: Table view with images
- Mobile: Card view
- Product details:
  - Image thumbnail
  - Name and slug
  - Category
  - Base price
  - Total stock (across variants)
  - Variant count
  - Status (active/inactive)
- Actions: Edit, Delete

**Design**:
- Responsive table/grid layout
- Color-coded stock indicators:
  - Red: Out of stock
  - Orange: Low stock (<20)
  - Green: In stock
- Empty state with call-to-action

### 3. Orders Management
**Location**: Orders menu item

**Features**:
- **List View**:
  - Search by order number or customer
  - Filter by status
  - Desktop table / Mobile cards
  - Order details: number, customer, date, items, total, status
  - Actions: View details, Download invoice

- **Detail View**:
  - Full order information
  - Order items with product details
  - Shipment tracking timeline
  - Tracking updates visualization
  - Order summary with pricing breakdown
  - Customer information
  - Shipping address
  - Payment information (Razorpay IDs)
  - Update order status dropdown

**Design**:
- 2-column layout (items + sidebar)
- Timeline visualization for tracking
- Color-coded status badges
- Responsive grid layout

### 4. Coming Soon Pages
The following pages show "Coming Soon" placeholders:
- Categories
- Customers
- Coupons
- Banners
- Reviews
- Blog
- Pages (Content)
- FAQs
- Settings

## Design System

### Colors
- Primary: Foreground/Background
- Status Colors:
  - Green: Success, delivered, in stock
  - Blue: Shipped, processing
  - Yellow: Pending, low stock
  - Red: Cancelled, out of stock
  - Gray: Inactive, default

### Layout
- **Sidebar**: 256px (w-64) fixed width
- **Mobile**: Full-width with hamburger menu
- **Padding**: Consistent 1.5rem-2rem spacing
- **Border**: 1px solid border color
- **Border Radius**: 0.5rem (8px) rounded-lg

### Typography
- Headings: Default system font
- Body: Default system font
- Code/SKU: Monospace font
- Sizes follow globals.css typography

### Components
- Cards: White background, border, rounded
- Tables: Hover states, striped optional
- Buttons: Primary (foreground bg), Secondary (border)
- Status Badges: Colored background with border
- Form Inputs: Border focus states

### Responsive Breakpoints
- Mobile: < 1024px (lg)
- Desktop: ≥ 1024px

## Navigation

### Sidebar Menu (Desktop)
- Dashboard
- Products
- Categories
- Orders
- Customers
- Coupons
- Banners
- Reviews
- Blog
- Pages
- FAQs
- Settings
- Exit Admin (returns to home)

### Mobile Menu
- Hamburger icon in header
- Overlay drawer
- Same menu items
- User info at bottom

## Data Schema Alignment

All mock data strictly follows the provided PostgreSQL schema:

### Key Schema Features
- UUID primary keys
- Timestamps (created_at, updated_at)
- Foreign key relationships
- JSONB for metadata
- User-defined enums for statuses
- Check constraints for prices/quantities
- Indian context (INR, Indian states, PIN codes)

### Relationships
- Products → Categories (category_id)
- Product Variants → Products (product_id)
- Product Images → Products (product_id)
- Orders → Users (user_id)
- Orders → Addresses (shipping/billing_address_id)
- Order Items → Orders (order_id)
- Order Items → Product Variants (product_variant_id)
- Payments → Orders (order_id)
- Shipments → Orders (order_id)
- Reviews → Products + Users
- Wishlists → Users + Products

## Future Enhancements

To complete the CMS, implement:

1. **Create/Edit Forms**:
   - Product creation with image upload
   - Category management
   - Coupon creation
   - Banner upload and scheduling
   - Blog post editor

2. **Bulk Actions**:
   - Bulk product status update
   - Bulk order export
   - Bulk delete

3. **Analytics**:
   - Sales charts (revenue over time)
   - Product performance
   - Customer insights
   - Coupon effectiveness

4. **Media Management**:
   - Image upload interface
   - Media library
   - Image optimization

5. **User Management**:
   - Customer list with filters
   - Order history per customer
   - Role management

6. **Settings**:
   - Site configuration
   - Email templates
   - Payment gateway setup
   - Shipping methods

## Access Control

Currently, the admin is accessible via footer link. In production:
- Add authentication check
- Role-based permissions (admin vs customer)
- Protected routes
- Session management
- Activity logging (admin_activity_logs table)

## Mobile Optimization

The admin CMS is fully responsive:
- Collapsible sidebar on mobile
- Hamburger menu
- Table → Card transformation
- Touch-friendly buttons
- Optimized spacing

## Performance Considerations

- Mock data loaded from JSON file
- Can be replaced with API calls
- Implements search/filter client-side
- Ready for pagination
- Optimized images with ImageWithFallback

---

Built with React, TypeScript, Tailwind CSS v4, and Motion (Framer Motion).
