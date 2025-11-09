'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface CartItem {
  id: number;
  product_id: number;
  name: string;
  sku: string;
  price: number;
  image: string;
  color: string;
  size: string;
  quantity: number;
  max_quantity?: number;
  available_sizes?: string[];
}

interface WishlistItem {
  id: number;
  product_id: number;
  name: string;
  sku: string;
  price: number;
  original_price?: number;
  image: string;
  hoverImage?: string;
  colors?: number;
}

interface OrderItem {
  product_name: string;
  sku: string;
  color: string;
  size: string;
  quantity: number;
  unit_price: number;
  image_url: string;
}

interface ShippingAddress {
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  address_line_1: string;
  address_line_2: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
}

interface Order {
  id: string;
  order_number: string;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  payment_method: string;
  subtotal: number;
  discount: number;
  shipping_fee: number;
  tax: number;
  total_amount: number;
  items: OrderItem[];
  shipping_address: ShippingAddress;
  tracking_number?: string;
  created_at: string;
  updated_at: string;
}

interface StoreContextType {
  // Cart
  cartItems: CartItem[];
  addToCart: (item: Omit<CartItem, 'id' | 'quantity'>, size: string) => void;
  removeFromCart: (id: number) => void;
  updateCartItemSize: (id: number, size: string) => void;
  updateCartItemQuantity: (id: number, quantity: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartTotal: number;
  
  // Wishlist
  wishlistItems: WishlistItem[];
  addToWishlist: (item: Omit<WishlistItem, 'id'>) => void;
  removeFromWishlist: (productId: number) => void;
  isInWishlist: (productId: number) => boolean;
  clearWishlist: () => void;
  wishlistCount: number;
  
  // Orders
  orders: Order[];
  createOrder: (orderData: Omit<Order, 'id' | 'created_at' | 'updated_at'>) => Order;
  getOrders: () => Order[];
  getOrderById: (orderId: string) => Order | undefined;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('maayaro_cart');
    const savedWishlist = localStorage.getItem('maayaro_wishlist');
    const savedOrders = localStorage.getItem('maayaro_orders');
    
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (error) {
        console.error('Error loading cart:', error);
      }
    }
    
    if (savedWishlist) {
      try {
        setWishlistItems(JSON.parse(savedWishlist));
      } catch (error) {
        console.error('Error loading wishlist:', error);
      }
    }
    
    if (savedOrders) {
      try {
        setOrders(JSON.parse(savedOrders));
      } catch (error) {
        console.error('Error loading orders:', error);
      }
    }
  }, []);

  // Save to localStorage whenever cart changes
  useEffect(() => {
    localStorage.setItem('maayaro_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  // Save to localStorage whenever wishlist changes
  useEffect(() => {
    localStorage.setItem('maayaro_wishlist', JSON.stringify(wishlistItems));
  }, [wishlistItems]);

  // Save to localStorage whenever orders change
  useEffect(() => {
    localStorage.setItem('maayaro_orders', JSON.stringify(orders));
  }, [orders]);

  // Cart functions
  const addToCart = (item: Omit<CartItem, 'id' | 'quantity'>, size: string) => {
    setCartItems((prev) => {
      // Check if item with same product_id and size already exists
      const existingIndex = prev.findIndex(
        (i) => i.product_id === item.product_id && i.size === size
      );

      if (existingIndex > -1) {
        // Update quantity if item exists
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + 1,
        };
        return updated;
      }

      // Add new item
      return [
        ...prev,
        {
          ...item,
          id: Date.now() + Math.random(),
          size,
          quantity: 1,
        },
      ];
    });
  };

  const removeFromCart = (id: number) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  const updateCartItemSize = (id: number, size: string) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, size } : item
      )
    );
  };

  const updateCartItemQuantity = (id: number, quantity: number) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity: Math.max(1, quantity) } : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Wishlist functions
  const addToWishlist = (item: Omit<WishlistItem, 'id'>) => {
    setWishlistItems((prev) => {
      // Check if already in wishlist
      if (prev.some((i) => i.product_id === item.product_id)) {
        return prev;
      }
      return [
        ...prev,
        {
          ...item,
          id: Date.now() + Math.random(),
        },
      ];
    });
  };

  const removeFromWishlist = (productId: number) => {
    setWishlistItems((prev) => prev.filter((item) => item.product_id !== productId));
  };

  const isInWishlist = (productId: number) => {
    return wishlistItems.some((item) => item.product_id === productId);
  };

  const clearWishlist = () => {
    setWishlistItems([]);
  };

  const wishlistCount = wishlistItems.length;

  // Order functions
  const createOrder = (orderData: Omit<Order, 'id' | 'created_at' | 'updated_at'>): Order => {
    const now = new Date().toISOString();
    const newOrder: Order = {
      ...orderData,
      id: `order-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      created_at: now,
      updated_at: now,
    };
    
    setOrders((prev) => [newOrder, ...prev]);
    return newOrder;
  };

  const getOrders = (): Order[] => {
    return orders.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  };

  const getOrderById = (orderId: string): Order | undefined => {
    return orders.find((order) => order.id === orderId || order.order_number === orderId);
  };

  const value: StoreContextType = {
    cartItems,
    addToCart,
    removeFromCart,
    updateCartItemSize,
    updateCartItemQuantity,
    clearCart,
    cartCount,
    cartTotal,
    wishlistItems,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    clearWishlist,
    wishlistCount,
    orders,
    createOrder,
    getOrders,
    getOrderById,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
}
