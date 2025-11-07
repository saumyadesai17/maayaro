export const mockData = {
  categories: [
    {
      id: "cat-1",
      name: "Women",
      slug: "women",
      description: "Women's ethnic and contemporary fashion",
      image_url: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400&q=85",
      parent_id: null,
      sort_order: 1,
      is_active: true,
      created_at: "2025-01-01T00:00:00Z",
      updated_at: "2025-01-01T00:00:00Z"
    },
    {
      id: "cat-2",
      name: "Kurta Sets",
      slug: "kurta-sets",
      description: "Elegant kurta sets for every occasion",
      image_url: "https://images.unsplash.com/photo-1610030469956-f0c75c6eabd8?w=400&q=85",
      parent_id: "cat-1",
      sort_order: 1,
      is_active: true,
      created_at: "2025-01-01T00:00:00Z",
      updated_at: "2025-01-01T00:00:00Z"
    },
    {
      id: "cat-3",
      name: "Sarees",
      slug: "sarees",
      description: "Traditional sarees in silk, cotton, and more",
      image_url: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=400&q=85",
      parent_id: "cat-1",
      sort_order: 2,
      is_active: true,
      created_at: "2025-01-01T00:00:00Z",
      updated_at: "2025-01-01T00:00:00Z"
    },
    {
      id: "cat-4",
      name: "Men",
      slug: "men",
      description: "Men's ethnic and formal wear",
      image_url: "https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?w=400&q=85",
      parent_id: null,
      sort_order: 2,
      is_active: true,
      created_at: "2025-01-01T00:00:00Z",
      updated_at: "2025-01-01T00:00:00Z"
    },
    {
      id: "cat-5",
      name: "Kurtas",
      slug: "mens-kurtas",
      description: "Traditional and contemporary kurtas",
      image_url: "https://images.unsplash.com/photo-1622445275463-afa2ab738c34?w=400&q=85",
      parent_id: "cat-4",
      sort_order: 1,
      is_active: true,
      created_at: "2025-01-01T00:00:00Z",
      updated_at: "2025-01-01T00:00:00Z"
    }
  ],
  products: [
    {
      id: "prod-1",
      name: "Silk Blend Embroidered Kurta Set",
      slug: "silk-blend-embroidered-kurta-set",
      description: "Exquisite silk blend kurta set with intricate embroidery work. Perfect for festive occasions and celebrations. Features comfortable fit and premium quality fabric.",
      category_id: "cat-2",
      base_price: 4999,
      is_active: true,
      is_featured: true,
      material: "Silk Blend",
      care_instructions: "Dry clean only. Do not bleach. Iron on low heat.",
      created_at: "2025-01-15T10:00:00Z",
      updated_at: "2025-01-28T14:30:00Z"
    },
    {
      id: "prod-2",
      name: "Handwoven Banarasi Silk Saree",
      slug: "handwoven-banarasi-silk-saree",
      description: "Authentic handwoven Banarasi silk saree with traditional motifs and zari work. A timeless piece for weddings and special occasions.",
      category_id: "cat-3",
      base_price: 15999,
      is_active: true,
      is_featured: true,
      material: "Pure Banarasi Silk",
      care_instructions: "Dry clean only. Store in muslin cloth. Avoid direct sunlight.",
      created_at: "2025-01-10T09:00:00Z",
      updated_at: "2025-01-25T11:20:00Z"
    },
    {
      id: "prod-3",
      name: "Premium Cotton Linen Kurta",
      slug: "premium-cotton-linen-kurta",
      description: "Comfortable cotton linen kurta for everyday wear. Breathable fabric with contemporary design.",
      category_id: "cat-5",
      base_price: 2499,
      is_active: true,
      is_featured: false,
      material: "Cotton Linen",
      care_instructions: "Machine wash cold. Tumble dry low. Iron if needed.",
      created_at: "2025-01-12T15:30:00Z",
      updated_at: "2025-01-26T09:45:00Z"
    }
  ],
  product_variants: [
    {
      id: "var-1",
      product_id: "prod-1",
      sku: "MAAY-WOM-KUR-001-IV-M",
      size: "M",
      color: "Ivory",
      color_hex: "#FFFFF0",
      price: 4999,
      stock_quantity: 15,
      is_active: true,
      created_at: "2025-01-15T10:00:00Z",
      updated_at: "2025-01-28T14:30:00Z"
    },
    {
      id: "var-2",
      product_id: "prod-1",
      sku: "MAAY-WOM-KUR-001-IV-L",
      size: "L",
      color: "Ivory",
      color_hex: "#FFFFF0",
      price: 4999,
      stock_quantity: 12,
      is_active: true,
      created_at: "2025-01-15T10:00:00Z",
      updated_at: "2025-01-28T14:30:00Z"
    },
    {
      id: "var-3",
      product_id: "prod-1",
      sku: "MAAY-WOM-KUR-001-PK-M",
      size: "M",
      color: "Blush Pink",
      color_hex: "#FFB6C1",
      price: 4999,
      stock_quantity: 8,
      is_active: true,
      created_at: "2025-01-15T10:00:00Z",
      updated_at: "2025-01-28T14:30:00Z"
    },
    {
      id: "var-4",
      product_id: "prod-2",
      sku: "MAAY-WOM-SAR-001-RB-FS",
      size: "Free Size",
      color: "Royal Blue",
      color_hex: "#4169E1",
      price: 15999,
      stock_quantity: 5,
      is_active: true,
      created_at: "2025-01-10T09:00:00Z",
      updated_at: "2025-01-25T11:20:00Z"
    },
    {
      id: "var-5",
      product_id: "prod-2",
      sku: "MAAY-WOM-SAR-001-MG-FS",
      size: "Free Size",
      color: "Magenta",
      color_hex: "#FF00FF",
      price: 15999,
      stock_quantity: 3,
      is_active: true,
      created_at: "2025-01-10T09:00:00Z",
      updated_at: "2025-01-25T11:20:00Z"
    },
    {
      id: "var-6",
      product_id: "prod-3",
      sku: "MAAY-MEN-KUR-001-WH-L",
      size: "L",
      color: "White",
      color_hex: "#FFFFFF",
      price: 2499,
      stock_quantity: 20,
      is_active: true,
      created_at: "2025-01-12T15:30:00Z",
      updated_at: "2025-01-26T09:45:00Z"
    }
  ],
  product_images: [
    {
      id: "img-1",
      product_id: "prod-1",
      image_url: "https://images.unsplash.com/photo-1610030469956-f0c75c6eabd8?w=1000&q=90",
      alt_text: "Silk Blend Embroidered Kurta Set - Front View",
      sort_order: 1,
      is_primary: true,
      created_at: "2025-01-15T10:00:00Z"
    },
    {
      id: "img-2",
      product_id: "prod-1",
      image_url: "https://images.unsplash.com/photo-1583391733981-30b9d59e6f8a?w=1000&q=90",
      alt_text: "Silk Blend Embroidered Kurta Set - Detail View",
      sort_order: 2,
      is_primary: false,
      created_at: "2025-01-15T10:00:00Z"
    },
    {
      id: "img-3",
      product_id: "prod-2",
      image_url: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=1000&q=90",
      alt_text: "Handwoven Banarasi Silk Saree - Drape View",
      sort_order: 1,
      is_primary: true,
      created_at: "2025-01-10T09:00:00Z"
    },
    {
      id: "img-4",
      product_id: "prod-3",
      image_url: "https://images.unsplash.com/photo-1622445275463-afa2ab738c34?w=1000&q=90",
      alt_text: "Premium Cotton Linen Kurta - Front View",
      sort_order: 1,
      is_primary: true,
      created_at: "2025-01-12T15:30:00Z"
    }
  ],
  profiles: [
    {
      id: "user-1",
      email: "admin@maayaro.com",
      full_name: "Admin User",
      phone: "+91 98765 43210",
      avatar_url: null,
      role: "super_admin",
      created_at: "2025-01-01T00:00:00Z",
      updated_at: "2025-01-01T00:00:00Z"
    },
    {
      id: "user-2",
      email: "priya.sharma@example.com",
      full_name: "Priya Sharma",
      phone: "+91 98765 43211",
      avatar_url: null,
      role: "customer",
      created_at: "2025-01-05T10:30:00Z",
      updated_at: "2025-01-28T14:20:00Z"
    },
    {
      id: "user-3",
      email: "rahul.verma@example.com",
      full_name: "Rahul Verma",
      phone: "+91 98765 43212",
      avatar_url: null,
      role: "customer",
      created_at: "2025-01-08T09:15:00Z",
      updated_at: "2025-01-25T16:45:00Z"
    }
  ],
  addresses: [
    {
      id: "addr-1",
      user_id: "user-2",
      type: "both",
      full_name: "Priya Sharma",
      phone: "+91 98765 43211",
      address_line1: "A-204, Sai Residency",
      address_line2: "Link Road, Andheri West",
      city: "Mumbai",
      state: "Maharashtra",
      postal_code: "400053",
      country: "India",
      is_default: true,
      created_at: "2025-01-05T11:00:00Z",
      updated_at: "2025-01-05T11:00:00Z"
    },
    {
      id: "addr-2",
      user_id: "user-3",
      type: "shipping",
      full_name: "Rahul Verma",
      phone: "+91 98765 43212",
      address_line1: "12, MG Road",
      address_line2: null,
      city: "Bangalore",
      state: "Karnataka",
      postal_code: "560001",
      country: "India",
      is_default: true,
      created_at: "2025-01-08T10:00:00Z",
      updated_at: "2025-01-08T10:00:00Z"
    }
  ],
  orders: [
    {
      id: "order-1",
      order_number: "MAAY-ORD-2025-001",
      user_id: "user-2",
      status: "delivered",
      subtotal: 4999,
      discount: 0,
      shipping_fee: 0,
      tax: 899.82,
      total: 5898.82,
      shipping_address_id: "addr-1",
      billing_address_id: "addr-1",
      notes: null,
      created_at: "2025-01-15T10:30:00Z",
      updated_at: "2025-01-20T14:45:00Z"
    },
    {
      id: "order-2",
      order_number: "MAAY-ORD-2025-002",
      user_id: "user-3",
      status: "shipped",
      subtotal: 15999,
      discount: 1000,
      shipping_fee: 0,
      tax: 2699.82,
      total: 17698.82,
      shipping_address_id: "addr-2",
      billing_address_id: "addr-2",
      notes: "Please handle with care",
      created_at: "2025-01-25T14:15:00Z",
      updated_at: "2025-01-27T09:30:00Z"
    },
    {
      id: "order-3",
      order_number: "MAAY-ORD-2025-003",
      user_id: "user-2",
      status: "processing",
      subtotal: 2499,
      discount: 0,
      shipping_fee: 150,
      tax: 476.82,
      total: 3125.82,
      shipping_address_id: "addr-1",
      billing_address_id: "addr-1",
      notes: null,
      created_at: "2025-01-28T09:45:00Z",
      updated_at: "2025-01-28T09:45:00Z"
    }
  ],
  order_items: [
    {
      id: "oi-1",
      order_id: "order-1",
      product_variant_id: "var-1",
      product_name: "Silk Blend Embroidered Kurta Set",
      variant_details: {
        size: "M",
        color: "Ivory",
        sku: "MAAY-WOM-KUR-001-IV-M"
      },
      quantity: 1,
      unit_price: 4999,
      total_price: 4999,
      created_at: "2025-01-15T10:30:00Z"
    },
    {
      id: "oi-2",
      order_id: "order-2",
      product_variant_id: "var-4",
      product_name: "Handwoven Banarasi Silk Saree",
      variant_details: {
        size: "Free Size",
        color: "Royal Blue",
        sku: "MAAY-WOM-SAR-001-RB-FS"
      },
      quantity: 1,
      unit_price: 15999,
      total_price: 15999,
      created_at: "2025-01-25T14:15:00Z"
    },
    {
      id: "oi-3",
      order_id: "order-3",
      product_variant_id: "var-6",
      product_name: "Premium Cotton Linen Kurta",
      variant_details: {
        size: "L",
        color: "White",
        sku: "MAAY-MEN-KUR-001-WH-L"
      },
      quantity: 1,
      unit_price: 2499,
      total_price: 2499,
      created_at: "2025-01-28T09:45:00Z"
    }
  ],
  payments: [
    {
      id: "pay-1",
      order_id: "order-1",
      razorpay_order_id: "order_MxK9PqL7z8vN2D",
      razorpay_payment_id: "pay_MxK9QrS8t9wO3E",
      razorpay_signature: "abc123def456",
      amount: 5898.82,
      currency: "INR",
      status: "success",
      payment_method: "UPI",
      payment_metadata: {
        upi_id: "priya@paytm"
      },
      created_at: "2025-01-15T10:30:00Z",
      updated_at: "2025-01-15T10:31:00Z"
    },
    {
      id: "pay-2",
      order_id: "order-2",
      razorpay_order_id: "order_NyL0QrM8a9wP3E",
      razorpay_payment_id: "pay_NyL0RsT9u0xQ4F",
      razorpay_signature: "def456ghi789",
      amount: 17698.82,
      currency: "INR",
      status: "success",
      payment_method: "Card",
      payment_metadata: {
        card_type: "Credit Card",
        last4: "4567"
      },
      created_at: "2025-01-25T14:15:00Z",
      updated_at: "2025-01-25T14:16:00Z"
    }
  ],
  shipments: [
    {
      id: "ship-1",
      order_id: "order-1",
      shiprocket_order_id: "SR001234",
      shiprocket_shipment_id: "SS001234",
      awb_code: "DTDC1234567890",
      courier_name: "DTDC",
      status: "delivered",
      tracking_url: "https://tracking.dtdc.com/DTDC1234567890",
      estimated_delivery_date: "2025-01-20",
      actual_delivery_date: "2025-01-20T14:45:00Z",
      tracking_updates: [
        {
          status: "Order Placed",
          timestamp: "2025-01-15T10:30:00Z",
          location: "Mumbai"
        },
        {
          status: "Shipped",
          timestamp: "2025-01-16T09:00:00Z",
          location: "Mumbai Hub"
        },
        {
          status: "In Transit",
          timestamp: "2025-01-18T12:30:00Z",
          location: "Andheri Facility"
        },
        {
          status: "Out for Delivery",
          timestamp: "2025-01-20T08:00:00Z",
          location: "Andheri West"
        },
        {
          status: "Delivered",
          timestamp: "2025-01-20T14:45:00Z",
          location: "Mumbai"
        }
      ],
      created_at: "2025-01-16T09:00:00Z",
      updated_at: "2025-01-20T14:45:00Z"
    },
    {
      id: "ship-2",
      order_id: "order-2",
      shiprocket_order_id: "SR001235",
      shiprocket_shipment_id: "SS001235",
      awb_code: "BLUD9876543210",
      courier_name: "Bluedart",
      status: "in_transit",
      tracking_url: "https://tracking.bluedart.com/BLUD9876543210",
      estimated_delivery_date: "2025-01-30",
      actual_delivery_date: null,
      tracking_updates: [
        {
          status: "Order Placed",
          timestamp: "2025-01-25T14:15:00Z",
          location: "Mumbai"
        },
        {
          status: "Shipped",
          timestamp: "2025-01-26T10:00:00Z",
          location: "Mumbai Hub"
        },
        {
          status: "In Transit",
          timestamp: "2025-01-27T09:30:00Z",
          location: "Bangalore Facility"
        }
      ],
      created_at: "2025-01-26T10:00:00Z",
      updated_at: "2025-01-27T09:30:00Z"
    }
  ],
  banners: [
    {
      id: "banner-1",
      title: "Summer Collection 2025",
      image_url: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1920&q=90",
      mobile_image_url: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&q=90",
      link_url: "/women",
      link_text: "Shop Now",
      type: "hero",
      position: "home_hero",
      sort_order: 1,
      is_active: true,
      start_date: "2025-01-01T00:00:00Z",
      end_date: "2025-03-31T23:59:59Z",
      created_at: "2025-01-01T00:00:00Z",
      updated_at: "2025-01-01T00:00:00Z"
    },
    {
      id: "banner-2",
      title: "New Arrivals - Men's Collection",
      image_url: "https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?w=1920&q=90",
      mobile_image_url: "https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?w=800&q=90",
      link_url: "/men",
      link_text: "Explore",
      type: "promotional",
      position: "home_middle",
      sort_order: 2,
      is_active: true,
      start_date: "2025-01-15T00:00:00Z",
      end_date: "2025-02-28T23:59:59Z",
      created_at: "2025-01-15T00:00:00Z",
      updated_at: "2025-01-15T00:00:00Z"
    }
  ],
  coupons: [
    {
      id: "coupon-1",
      code: "MAAYARO10",
      description: "Get 10% off on all orders",
      discount_type: "percentage",
      discount_value: 10,
      min_order_value: 2000,
      max_discount: 1000,
      valid_from: "2025-01-01T00:00:00Z",
      valid_until: "2025-03-31T23:59:59Z",
      usage_limit: 1000,
      used_count: 45,
      is_active: true,
      created_at: "2025-01-01T00:00:00Z",
      updated_at: "2025-01-28T10:00:00Z"
    },
    {
      id: "coupon-2",
      code: "FIRST500",
      description: "Flat ₹500 off on first order",
      discount_type: "fixed",
      discount_value: 500,
      min_order_value: 3000,
      max_discount: 500,
      valid_from: "2025-01-01T00:00:00Z",
      valid_until: "2025-12-31T23:59:59Z",
      usage_limit: null,
      used_count: 127,
      is_active: true,
      created_at: "2025-01-01T00:00:00Z",
      updated_at: "2025-01-28T10:00:00Z"
    },
    {
      id: "coupon-3",
      code: "WELCOME15",
      description: "15% off for new customers",
      discount_type: "percentage",
      discount_value: 15,
      min_order_value: 5000,
      max_discount: 2000,
      valid_from: "2025-01-01T00:00:00Z",
      valid_until: "2025-06-30T23:59:59Z",
      usage_limit: 500,
      used_count: 89,
      is_active: true,
      created_at: "2025-01-01T00:00:00Z",
      updated_at: "2025-01-28T10:00:00Z"
    }
  ],
  reviews: [
    {
      id: "review-1",
      product_id: "prod-1",
      user_id: "user-2",
      order_item_id: "oi-1",
      rating: 5,
      title: "Absolutely Beautiful!",
      comment: "The embroidery work is stunning and the fabric quality is excellent. Fits perfectly and looks very elegant. Highly recommend!",
      is_verified_purchase: true,
      is_approved: true,
      created_at: "2025-01-22T16:30:00Z",
      updated_at: "2025-01-22T17:00:00Z"
    },
    {
      id: "review-2",
      product_id: "prod-2",
      user_id: "user-3",
      order_item_id: null,
      rating: 4,
      title: "Great quality saree",
      comment: "Beautiful Banarasi silk with authentic weave. Color is vibrant. Only concern is it's a bit heavy but that's expected with pure silk.",
      is_verified_purchase: false,
      is_approved: true,
      created_at: "2025-01-20T11:15:00Z",
      updated_at: "2025-01-20T12:00:00Z"
    }
  ],
  blog_posts: [
    {
      id: "blog-1",
      title: "5 Ways to Style Your Kurta Set",
      slug: "5-ways-to-style-kurta-set",
      excerpt: "Discover versatile styling tips for your favorite kurta sets, from casual to festive looks.",
      content: "Kurta sets are incredibly versatile pieces that can be styled in numerous ways...",
      featured_image: "https://images.unsplash.com/photo-1610030469956-f0c75c6eabd8?w=800&q=85",
      author_id: "user-1",
      category: "Fashion Tips",
      tags: ["styling", "kurta", "ethnic wear", "fashion"],
      meta_title: "5 Ways to Style Your Kurta Set - MAAYARO",
      meta_description: "Learn how to style your kurta sets for different occasions with our expert fashion tips.",
      is_published: true,
      published_at: "2025-01-20T10:00:00Z",
      view_count: 245,
      created_at: "2025-01-18T14:00:00Z",
      updated_at: "2025-01-28T09:30:00Z"
    },
    {
      id: "blog-2",
      title: "The Art of Banarasi Silk Weaving",
      slug: "art-of-banarasi-silk-weaving",
      excerpt: "Explore the rich heritage and intricate craftsmanship behind Banarasi silk sarees.",
      content: "Banarasi silk has been a symbol of Indian craftsmanship for centuries...",
      featured_image: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=800&q=85",
      author_id: "user-1",
      category: "Heritage",
      tags: ["banarasi silk", "handloom", "tradition", "saree"],
      meta_title: "The Art of Banarasi Silk Weaving - MAAYARO",
      meta_description: "Discover the ancient art of Banarasi silk weaving and its cultural significance.",
      is_published: true,
      published_at: "2025-01-15T09:00:00Z",
      view_count: 189,
      created_at: "2025-01-12T11:00:00Z",
      updated_at: "2025-01-25T16:20:00Z"
    }
  ],
  faqs: [
    {
      id: "faq-1",
      question: "What is your return policy?",
      answer: "We offer a 7-day return policy for all products. Items must be unused, unwashed, and in original packaging with tags attached. Please contact our customer service to initiate a return.",
      category: "Returns & Refunds",
      sort_order: 1,
      is_active: true,
      created_at: "2025-01-01T00:00:00Z",
      updated_at: "2025-01-01T00:00:00Z"
    },
    {
      id: "faq-2",
      question: "How long does shipping take?",
      answer: "Standard shipping takes 5-7 business days. Express shipping (2-3 business days) is available for select locations. You will receive tracking information once your order is shipped.",
      category: "Shipping",
      sort_order: 2,
      is_active: true,
      created_at: "2025-01-01T00:00:00Z",
      updated_at: "2025-01-01T00:00:00Z"
    },
    {
      id: "faq-3",
      question: "Do you offer international shipping?",
      answer: "Currently, we only ship within India. We are working on expanding our shipping to international destinations soon.",
      category: "Shipping",
      sort_order: 3,
      is_active: true,
      created_at: "2025-01-01T00:00:00Z",
      updated_at: "2025-01-01T00:00:00Z"
    },
    {
      id: "faq-4",
      question: "What payment methods do you accept?",
      answer: "We accept all major payment methods including UPI, Credit/Debit Cards, Net Banking, and Wallets through Razorpay. Cash on Delivery is also available for select locations.",
      category: "Payment",
      sort_order: 4,
      is_active: true,
      created_at: "2025-01-01T00:00:00Z",
      updated_at: "2025-01-01T00:00:00Z"
    }
  ],
  site_settings: [
    {
      id: "setting-1",
      key: "site_name",
      value: "MAAYARO",
      type: "string",
      group_name: "general",
      description: "Website name",
      is_public: true,
      updated_by: "user-1",
      created_at: "2025-01-01T00:00:00Z",
      updated_at: "2025-01-01T00:00:00Z"
    },
    {
      id: "setting-2",
      key: "site_email",
      value: "support@maayaro.com",
      type: "string",
      group_name: "general",
      description: "Contact email address",
      is_public: true,
      updated_by: "user-1",
      created_at: "2025-01-01T00:00:00Z",
      updated_at: "2025-01-01T00:00:00Z"
    },
    {
      id: "setting-3",
      key: "site_phone",
      value: "+91 98765 00000",
      type: "string",
      group_name: "general",
      description: "Contact phone number",
      is_public: true,
      updated_by: "user-1",
      created_at: "2025-01-01T00:00:00Z",
      updated_at: "2025-01-01T00:00:00Z"
    },
    {
      id: "setting-4",
      key: "free_shipping_threshold",
      value: "5000",
      type: "number",
      group_name: "shipping",
      description: "Minimum order value for free shipping (INR)",
      is_public: true,
      updated_by: "user-1",
      created_at: "2025-01-01T00:00:00Z",
      updated_at: "2025-01-15T10:00:00Z"
    },
    {
      id: "setting-5",
      key: "tax_rate",
      value: "18",
      type: "number",
      group_name: "pricing",
      description: "GST tax rate percentage",
      is_public: false,
      updated_by: "user-1",
      created_at: "2025-01-01T00:00:00Z",
      updated_at: "2025-01-01T00:00:00Z"
    }
  ],
  wishlists: [
    {
      id: "wish-1",
      user_id: "user-2",
      product_id: "prod-2",
      created_at: "2025-01-20T10:00:00Z"
    },
    {
      id: "wish-2",
      user_id: "user-2",
      product_id: "prod-3",
      created_at: "2025-01-22T14:30:00Z"
    },
    {
      id: "wish-3",
      user_id: "user-3",
      product_id: "prod-1",
      created_at: "2025-01-25T09:15:00Z"
    }
  ],
  coupon_usage: [
    {
      id: "cu-1",
      coupon_id: "coupon-2",
      user_id: "user-2",
      order_id: "order-1",
      discount_applied: 0,
      used_at: "2025-01-15T10:30:00Z"
    },
    {
      id: "cu-2",
      coupon_id: "coupon-1",
      user_id: "user-3",
      order_id: "order-2",
      discount_applied: 1000,
      used_at: "2025-01-25T14:15:00Z"
    }
  ],
  carts: [
    {
      id: "cart-1",
      user_id: "user-2",
      created_at: "2025-01-05T10:30:00Z",
      updated_at: "2025-01-28T16:45:00Z"
    },
    {
      id: "cart-2",
      user_id: "user-3",
      created_at: "2025-01-08T09:15:00Z",
      updated_at: "2025-01-28T11:20:00Z"
    }
  ],
  cart_items: [
    {
      id: "ci-1",
      cart_id: "cart-1",
      product_variant_id: "var-3",
      quantity: 1,
      created_at: "2025-01-28T16:45:00Z",
      updated_at: "2025-01-28T16:45:00Z"
    },
    {
      id: "ci-2",
      cart_id: "cart-2",
      product_variant_id: "var-5",
      quantity: 1,
      created_at: "2025-01-28T11:20:00Z",
      updated_at: "2025-01-28T11:20:00Z"
    }
  ],
  admin_activity_logs: [
    {
      id: "log-1",
      admin_id: "user-1",
      action: "update",
      entity_type: "product",
      entity_id: "prod-1",
      changes: {
        before: { is_featured: false },
        after: { is_featured: true }
      },
      ip_address: "192.168.1.100",
      user_agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      created_at: "2025-01-28T14:30:00Z"
    },
    {
      id: "log-2",
      admin_id: "user-1",
      action: "create",
      entity_type: "coupon",
      entity_id: "coupon-3",
      changes: {
        after: {
          code: "WELCOME15",
          discount_type: "percentage",
          discount_value: 15
        }
      },
      ip_address: "192.168.1.100",
      user_agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      created_at: "2025-01-27T10:00:00Z"
    },
    {
      id: "log-3",
      admin_id: "user-1",
      action: "update",
      entity_type: "order",
      entity_id: "order-2",
      changes: {
        before: { status: "processing" },
        after: { status: "shipped" }
      },
      ip_address: "192.168.1.100",
      user_agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      created_at: "2025-01-26T10:00:00Z"
    }
  ],
  content_pages: [
    {
      id: "page-1",
      title: "About Us",
      slug: "about-us",
      content: "<h1>About MAAYARO</h1><p>MAAYARO is a premium Indian ethnic wear brand that celebrates the rich heritage and craftsmanship of Indian textiles. Founded with a vision to bring authentic, handcrafted ethnic wear to modern consumers, we work directly with skilled artisans across India.</p><h2>Our Story</h2><p>We started our journey in 2024 with a simple mission: to preserve traditional Indian craftsmanship while making it accessible to the contemporary world. Each piece in our collection tells a story of heritage, skill, and dedication.</p><h2>Our Values</h2><ul><li>Authenticity: Every product is genuinely handcrafted</li><li>Quality: We never compromise on fabric and craftsmanship</li><li>Sustainability: Supporting local artisans and eco-friendly practices</li><li>Customer First: Your satisfaction is our priority</li></ul>",
      meta_title: "About MAAYARO - Premium Indian Ethnic Wear",
      meta_description: "Learn about MAAYARO's journey in bringing authentic, handcrafted Indian ethnic wear to modern consumers. Discover our commitment to quality and tradition.",
      is_published: true,
      published_at: "2025-01-01T00:00:00Z",
      created_by: "user-1",
      created_at: "2025-01-01T00:00:00Z",
      updated_at: "2025-01-15T10:00:00Z"
    },
    {
      id: "page-2",
      title: "Privacy Policy",
      slug: "privacy-policy",
      content: "<h1>Privacy Policy</h1><p>Last updated: January 1, 2025</p><h2>Information We Collect</h2><p>We collect information that you provide directly to us, including:</p><ul><li>Name, email address, and phone number</li><li>Shipping and billing addresses</li><li>Payment information (processed securely through Razorpay)</li><li>Order history and preferences</li></ul><h2>How We Use Your Information</h2><p>We use the information we collect to:</p><ul><li>Process and fulfill your orders</li><li>Send order confirmations and shipping updates</li><li>Respond to your questions and requests</li><li>Send promotional communications (with your consent)</li></ul><h2>Data Security</h2><p>We implement appropriate security measures to protect your personal information. All payment transactions are encrypted using SSL technology.</p><h2>Contact Us</h2><p>If you have questions about our privacy policy, please contact us at privacy@maayaro.com</p>",
      meta_title: "Privacy Policy - MAAYARO",
      meta_description: "Read MAAYARO's privacy policy to understand how we collect, use, and protect your personal information.",
      is_published: true,
      published_at: "2025-01-01T00:00:00Z",
      created_by: "user-1",
      created_at: "2025-01-01T00:00:00Z",
      updated_at: "2025-01-01T00:00:00Z"
    },
    {
      id: "page-3",
      title: "Terms & Conditions",
      slug: "terms-conditions",
      content: "<h1>Terms & Conditions</h1><p>Last updated: January 1, 2025</p><h2>1. Acceptance of Terms</h2><p>By accessing and using MAAYARO's website, you accept and agree to be bound by these Terms & Conditions.</p><h2>2. Products and Pricing</h2><p>All products are subject to availability. Prices are in Indian Rupees (INR) and include applicable taxes. We reserve the right to modify prices without prior notice.</p><h2>3. Orders and Payment</h2><p>By placing an order, you are making an offer to purchase the products. All orders are subject to acceptance and availability. Payment must be made at the time of ordering through our secure payment gateway.</p><h2>4. Shipping and Delivery</h2><p>We ship within India only. Delivery times are estimates and not guaranteed. Standard shipping takes 5-7 business days.</p><h2>5. Returns and Refunds</h2><p>We offer a 7-day return policy for unused items in original packaging. Refunds will be processed within 7-10 business days after receiving the returned item.</p><h2>6. Intellectual Property</h2><p>All content on this website is the property of MAAYARO and protected by copyright laws.</p><h2>7. Contact Information</h2><p>For any questions, contact us at support@maayaro.com</p>",
      meta_title: "Terms & Conditions - MAAYARO",
      meta_description: "Read MAAYARO's terms and conditions for using our website and purchasing our products.",
      is_published: true,
      published_at: "2025-01-01T00:00:00Z",
      created_by: "user-1",
      created_at: "2025-01-01T00:00:00Z",
      updated_at: "2025-01-01T00:00:00Z"
    },
    {
      id: "page-4",
      title: "Shipping & Delivery",
      slug: "shipping-delivery",
      content: "<h1>Shipping & Delivery</h1><h2>Shipping Within India</h2><p>We currently ship only within India through our trusted courier partners including DTDC, Bluedart, and Delhivery.</p><h2>Shipping Charges</h2><ul><li>Free shipping on orders above ₹5,000</li><li>Standard shipping: ₹150 for orders below ₹5,000</li><li>Express shipping: ₹300 (2-3 business days)</li></ul><h2>Delivery Time</h2><ul><li>Metro cities: 3-5 business days</li><li>Other cities: 5-7 business days</li><li>Remote areas: 7-10 business days</li></ul><h2>Order Tracking</h2><p>Once your order is shipped, you'll receive a tracking number via email and SMS. You can track your order status in your account dashboard.</p><h2>Delivery Issues</h2><p>If you face any issues with delivery, please contact our customer support at support@maayaro.com or call +91 98765 00000</p>",
      meta_title: "Shipping & Delivery - MAAYARO",
      meta_description: "Learn about MAAYARO's shipping policies, delivery times, and charges for orders across India.",
      is_published: true,
      published_at: "2025-01-10T00:00:00Z",
      created_by: "user-1",
      created_at: "2025-01-10T00:00:00Z",
      updated_at: "2025-01-10T00:00:00Z"
    },
    {
      id: "page-5",
      title: "Return & Refund Policy",
      slug: "return-refund-policy",
      content: "<h1>Return & Refund Policy</h1><h2>7-Day Return Policy</h2><p>We want you to be completely satisfied with your purchase. If you're not happy with your order, you can return it within 7 days of delivery.</p><h2>Return Conditions</h2><p>To be eligible for a return, items must be:</p><ul><li>Unused and unwashed</li><li>In original packaging with all tags attached</li><li>Free from any damage or alterations</li><li>Accompanied by original invoice</li></ul><h2>Non-Returnable Items</h2><ul><li>Items marked as final sale</li><li>Customized or personalized products</li><li>Innerwear and intimate apparel</li></ul><h2>How to Return</h2><ol><li>Contact our customer support within 7 days of delivery</li><li>Receive return authorization and shipping label</li><li>Pack the item securely in original packaging</li><li>Ship the item using our provided label</li></ol><h2>Refund Process</h2><p>Once we receive and inspect your return:</p><ul><li>Refunds are processed within 7-10 business days</li><li>Amount will be credited to your original payment method</li><li>You'll receive an email confirmation once refund is processed</li></ul><h2>Exchange Policy</h2><p>We don't offer direct exchanges. Please return the item for a refund and place a new order for the item you want.</p><h2>Contact Us</h2><p>For return-related queries: returns@maayaro.com</p>",
      meta_title: "Return & Refund Policy - MAAYARO",
      meta_description: "Understand MAAYARO's 7-day return policy, refund process, and conditions for returning products.",
      is_published: true,
      published_at: "2025-01-10T00:00:00Z",
      created_by: "user-1",
      created_at: "2025-01-10T00:00:00Z",
      updated_at: "2025-01-10T00:00:00Z"
    }
  ],
  seo_metadata: [
    {
      id: "seo-1",
      page_type: "home",
      page_identifier: "homepage",
      meta_title: "MAAYARO - Premium Indian Ethnic Wear | Handcrafted Sarees, Kurtas & More",
      meta_description: "Shop authentic handcrafted Indian ethnic wear at MAAYARO. Explore our collection of premium sarees, kurta sets, and traditional clothing. Free shipping on orders above ₹5000.",
      meta_keywords: "indian ethnic wear, handcrafted sarees, kurta sets, traditional clothing, ethnic fashion, premium sarees, designer kurtas",
      og_title: "MAAYARO - Premium Indian Ethnic Wear",
      og_description: "Discover authentic handcrafted Indian ethnic wear. Premium quality sarees, kurtas, and traditional clothing.",
      og_image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1200&q=90",
      canonical_url: "https://maayaro.com",
      robots: "index,follow",
      structured_data: {
        "@context": "https://schema.org",
        "@type": "Store",
        "name": "MAAYARO",
        "description": "Premium Indian Ethnic Wear Store",
        "url": "https://maayaro.com",
        "logo": "https://maayaro.com/logo.png",
        "address": {
          "@type": "PostalAddress",
          "addressCountry": "IN"
        }
      },
      created_at: "2025-01-01T00:00:00Z",
      updated_at: "2025-01-15T10:00:00Z"
    },
    {
      id: "seo-2",
      page_type: "category",
      page_identifier: "women",
      meta_title: "Women's Ethnic Wear - Sarees, Kurtas & More | MAAYARO",
      meta_description: "Browse MAAYARO's collection of women's ethnic wear. Shop premium sarees, kurta sets, lehengas, and traditional clothing.",
      meta_keywords: "women ethnic wear, sarees, kurta sets, lehengas, traditional dresses",
      og_title: "Women's Ethnic Wear Collection - MAAYARO",
      og_description: "Explore premium women's ethnic wear collection at MAAYARO",
      og_image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1200&q=90",
      canonical_url: "https://maayaro.com/women",
      robots: "index,follow",
      structured_data: {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "name": "Women's Ethnic Wear",
        "description": "Premium women's ethnic wear collection"
      },
      created_at: "2025-01-01T00:00:00Z",
      updated_at: "2025-01-01T00:00:00Z"
    },
    {
      id: "seo-3",
      page_type: "product",
      page_identifier: "silk-blend-embroidered-kurta-set",
      meta_title: "Silk Blend Embroidered Kurta Set - Premium Ethnic Wear | MAAYARO",
      meta_description: "Buy Silk Blend Embroidered Kurta Set at MAAYARO. Exquisite silk blend with intricate embroidery. Perfect for festive occasions. ₹4,999. Free shipping.",
      meta_keywords: "silk kurta set, embroidered kurta, festive wear, premium kurta",
      og_title: "Silk Blend Embroidered Kurta Set - MAAYARO",
      og_description: "Exquisite silk blend kurta set with intricate embroidery work",
      og_image: "https://images.unsplash.com/photo-1610030469956-f0c75c6eabd8?w=1200&q=90",
      canonical_url: "https://maayaro.com/product/silk-blend-embroidered-kurta-set",
      robots: "index,follow",
      structured_data: {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": "Silk Blend Embroidered Kurta Set",
        "description": "Exquisite silk blend kurta set with intricate embroidery work",
        "image": "https://images.unsplash.com/photo-1610030469956-f0c75c6eabd8?w=1000&q=90",
        "offers": {
          "@type": "Offer",
          "price": "4999",
          "priceCurrency": "INR",
          "availability": "https://schema.org/InStock"
        }
      },
      created_at: "2025-01-15T10:00:00Z",
      updated_at: "2025-01-15T10:00:00Z"
    }
  ],
  email_templates: [
    {
      id: "email-1",
      name: "order_confirmation",
      subject: "Order Confirmed - {{order_number}}",
      body: "<!DOCTYPE html><html><head><style>body{font-family:Arial,sans-serif;line-height:1.6;color:#333;} .container{max-width:600px;margin:0 auto;padding:20px;} .header{background:#8B4513;color:white;padding:20px;text-align:center;} .content{padding:20px;background:#f9f9f9;} .footer{text-align:center;padding:20px;font-size:12px;color:#666;}</style></head><body><div class='container'><div class='header'><h1>Thank You for Your Order!</h1></div><div class='content'><p>Dear {{customer_name}},</p><p>Your order <strong>{{order_number}}</strong> has been confirmed and is being processed.</p><h3>Order Summary</h3><p>Order Total: <strong>₹{{total}}</strong></p><p>You will receive a shipping confirmation email with tracking details once your order is dispatched.</p><p>If you have any questions, feel free to contact us at support@maayaro.com</p></div><div class='footer'><p>© 2025 MAAYARO. All rights reserved.</p></div></div></body></html>",
      variables: {
        order_number: "string",
        customer_name: "string",
        total: "number",
        items: "array"
      },
      is_active: true,
      created_at: "2025-01-01T00:00:00Z",
      updated_at: "2025-01-01T00:00:00Z"
    },
    {
      id: "email-2",
      name: "order_shipped",
      subject: "Order Shipped - {{order_number}}",
      body: "<!DOCTYPE html><html><head><style>body{font-family:Arial,sans-serif;line-height:1.6;color:#333;} .container{max-width:600px;margin:0 auto;padding:20px;} .header{background:#8B4513;color:white;padding:20px;text-align:center;} .content{padding:20px;background:#f9f9f9;} .button{display:inline-block;padding:12px 24px;background:#8B4513;color:white;text-decoration:none;border-radius:4px;margin:10px 0;} .footer{text-align:center;padding:20px;font-size:12px;color:#666;}</style></head><body><div class='container'><div class='header'><h1>Your Order is On the Way! 🎉</h1></div><div class='content'><p>Dear {{customer_name}},</p><p>Great news! Your order <strong>{{order_number}}</strong> has been shipped.</p><h3>Shipping Details</h3><p>Courier: <strong>{{courier_name}}</strong></p><p>Tracking Number: <strong>{{awb_code}}</strong></p><p>Estimated Delivery: <strong>{{estimated_delivery}}</strong></p><a href='{{tracking_url}}' class='button'>Track Your Order</a><p>Your package will be delivered to:</p><p>{{shipping_address}}</p></div><div class='footer'><p>© 2025 MAAYARO. All rights reserved.</p></div></div></body></html>",
      variables: {
        order_number: "string",
        customer_name: "string",
        courier_name: "string",
        awb_code: "string",
        tracking_url: "string",
        estimated_delivery: "string",
        shipping_address: "string"
      },
      is_active: true,
      created_at: "2025-01-01T00:00:00Z",
      updated_at: "2025-01-01T00:00:00Z"
    },
    {
      id: "email-3",
      name: "order_delivered",
      subject: "Order Delivered - {{order_number}}",
      body: "<!DOCTYPE html><html><head><style>body{font-family:Arial,sans-serif;line-height:1.6;color:#333;} .container{max-width:600px;margin:0 auto;padding:20px;} .header{background:#8B4513;color:white;padding:20px;text-align:center;} .content{padding:20px;background:#f9f9f9;} .button{display:inline-block;padding:12px 24px;background:#8B4513;color:white;text-decoration:none;border-radius:4px;margin:10px 0;} .footer{text-align:center;padding:20px;font-size:12px;color:#666;}</style></head><body><div class='container'><div class='header'><h1>Order Delivered Successfully! ✨</h1></div><div class='content'><p>Dear {{customer_name}},</p><p>Your order <strong>{{order_number}}</strong> has been delivered successfully!</p><p>We hope you love your purchase. Thank you for shopping with MAAYARO!</p><h3>Share Your Experience</h3><p>We'd love to hear your feedback. Please take a moment to review your purchase.</p><a href='{{review_url}}' class='button'>Write a Review</a><p>If you have any issues with your order, please don't hesitate to contact us at support@maayaro.com</p></div><div class='footer'><p>© 2025 MAAYARO. All rights reserved.</p></div></div></body></html>",
      variables: {
        order_number: "string",
        customer_name: "string",
        review_url: "string"
      },
      is_active: true,
      created_at: "2025-01-01T00:00:00Z",
      updated_at: "2025-01-01T00:00:00Z"
    },
    {
      id: "email-4",
      name: "welcome_email",
      subject: "Welcome to MAAYARO! ✨",
      body: "<!DOCTYPE html><html><head><style>body{font-family:Arial,sans-serif;line-height:1.6;color:#333;} .container{max-width:600px;margin:0 auto;padding:20px;} .header{background:#8B4513;color:white;padding:20px;text-align:center;} .content{padding:20px;background:#f9f9f9;} .button{display:inline-block;padding:12px 24px;background:#8B4513;color:white;text-decoration:none;border-radius:4px;margin:10px 0;} .footer{text-align:center;padding:20px;font-size:12px;color:#666;}</style></head><body><div class='container'><div class='header'><h1>Welcome to MAAYARO!</h1></div><div class='content'><p>Dear {{customer_name}},</p><p>Thank you for joining MAAYARO! We're thrilled to have you as part of our family.</p><p>Discover our collection of premium, handcrafted Indian ethnic wear. Each piece tells a story of heritage, skill, and dedication.</p><h3>Get Started</h3><ul><li>Browse our latest collection</li><li>Enjoy free shipping on orders above ₹5,000</li><li>Get exclusive offers and early access to new arrivals</li></ul><a href='{{shop_url}}' class='button'>Start Shopping</a><p>If you have any questions, our customer support team is here to help at support@maayaro.com</p></div><div class='footer'><p>© 2025 MAAYARO. All rights reserved.</p></div></div></body></html>",
      variables: {
        customer_name: "string",
        shop_url: "string"
      },
      is_active: true,
      created_at: "2025-01-01T00:00:00Z",
      updated_at: "2025-01-01T00:00:00Z"
    }
  ]
};
