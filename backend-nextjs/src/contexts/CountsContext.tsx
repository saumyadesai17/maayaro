'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface CountsContextType {
  cartCount: number;
  wishlistCount: number;
  wishlistItems: string[];
  isInWishlist: (productId: string | number) => boolean;
  refreshCounts: () => void;
  updateCartCount: (count: number) => void;
  updateWishlistCount: (count: number) => void;
  refreshWishlist: () => Promise<void>;
}

const CountsContext = createContext<CountsContextType | undefined>(undefined);

export function CountsProvider({ children }: { children: ReactNode }) {
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [wishlistItems, setWishlistItems] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch cart count
  const fetchCartCount = async () => {
    try {
      const response = await fetch('/api/cart');
      if (response.ok) {
        const data = await response.json();
        // Count unique products (cart items), not total quantity
        const count = data.cart_items?.length || 0;
        setCartCount(count);
        return count;
      }
    } catch (error) {
      console.error('Error fetching cart count:', error);
    }
    return 0;
  };

  // Fetch wishlist count and items
  const fetchWishlistCount = async () => {
    if (isLoading) return wishlistCount; // Prevent multiple concurrent calls
    
    try {
      setIsLoading(true);
      const response = await fetch('/api/wishlist');
      if (response.ok) {
        const data = await response.json();
        const items = data.wishlist || [];
        const itemIds = items.map((item: any) => item.product_id);
        setWishlistItems(itemIds);
        setWishlistCount(items.length);
        return items.length;
      }
    } catch (error) {
      console.error('Error fetching wishlist count:', error);
    } finally {
      setIsLoading(false);
    }
    return 0;
  };

  const refreshCounts = async () => {
    await Promise.all([fetchCartCount(), fetchWishlistCount()]);
  };

  const updateCartCount = (count: number) => {
    setCartCount(count);
  };

  const updateWishlistCount = (count: number) => {
    setWishlistCount(count);
  };

  const refreshWishlist = async () => {
    await fetchWishlistCount();
  };

  const isInWishlist = (productId: string | number) => {
    const productIdString = typeof productId === 'string' ? productId : productId.toString();
    return wishlistItems.includes(productIdString);
  };

  useEffect(() => {
    refreshCounts();
  }, []);

  return (
    <CountsContext.Provider
      value={{
        cartCount,
        wishlistCount,
        wishlistItems,
        isInWishlist,
        refreshCounts,
        updateCartCount,
        updateWishlistCount,
        refreshWishlist,
      }}
    >
      {children}
    </CountsContext.Provider>
  );
}

export function useCounts() {
  const context = useContext(CountsContext);
  if (context === undefined) {
    throw new Error('useCounts must be used within a CountsProvider');
  }
  return context;
}