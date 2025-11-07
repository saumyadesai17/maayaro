# Admin Panel Access Guide

## Quick Start

The admin panel has been successfully migrated to the frontend-nextjs project. Follow these steps to access it:

### 1. Start the Development Server

```bash
cd frontend-nextjs
npm run dev
```

### 2. Access the Admin Panel

Open your browser and navigate to:
```
http://localhost:3000/admin
```

## Admin Panel Features

### Navigation
The admin panel includes a sidebar with the following sections:
- 📊 **Dashboard** - Overview of store statistics
- 📦 **Products** - Manage product catalog
- 🏷️ **Categories** - Organize product categories
- 🛒 **Orders** - View and manage orders
- 👥 **Customers** - Customer management
- 🎟️ **Coupons** - Discount code management
- 🖼️ **Banners** - Homepage banner management
- ⭐ **Reviews** - Product review moderation
- 📝 **Blog** - Blog post management
- 📄 **Pages** - Static content pages
- ❓ **FAQs** - FAQ management
- ⚙️ **Settings** - Site configuration

### Exit Admin
Click "Exit Admin" at the bottom of the sidebar to return to the main store.

## Current State

⚠️ **Note:** The admin panel currently operates with **mock data**. All changes are temporary and will reset when the page refreshes.

### Mock Data Includes:
- 5 Categories (Women, Men, Kurtas, Sarees, etc.)
- 3 Products with variants
- 3 Sample Orders
- 2 Customers
- 3 Active Coupons
- 2 Homepage Banners
- 2 Product Reviews
- 2 Blog Posts
- 4 FAQs
- Site Settings

## Testing the Admin Panel

### Test Scenarios

1. **View Dashboard**
   - Check revenue statistics
   - View recent orders
   - Check low stock alerts

2. **Manage Products**
   - Filter by category
   - Search for products
   - View product details

3. **View Orders**
   - Click on an order to see details
   - View order timeline
   - Check shipping status

4. **Manage Categories**
   - View category hierarchy
   - Check parent-child relationships

5. **Review Management**
   - View product reviews
   - Check verified purchase badges

## Production Readiness Checklist

Before deploying to production:

- [ ] Add authentication middleware
- [ ] Implement role-based access control (admin only)
- [ ] Connect to Supabase backend
- [ ] Replace mock data with API calls
- [ ] Add form validation
- [ ] Implement error handling
- [ ] Add loading states
- [ ] Set up image upload functionality
- [ ] Add audit logging
- [ ] Implement data export features

## Troubleshooting

### Issue: Admin page shows 404
**Solution:** Make sure you're running the dev server from the `frontend-nextjs` directory.

### Issue: Sidebar not showing on mobile
**Solution:** Click the hamburger menu icon in the top-left corner.

### Issue: Changes not persisting
**Expected Behavior:** Currently using mock data. Changes are temporary and will reset on page refresh.

## Next Steps

For detailed information about:
- Migration details: See `ADMIN_MIGRATION.md`
- Admin features: See `src/guidelines/Admin-CMS-Documentation.md`
- Complete guide: See `src/guidelines/Complete-Admin-CMS-Guide.md`

## Support

For issues or questions about the admin panel, refer to the documentation files or check the component source code in `src/components/admin/`.
