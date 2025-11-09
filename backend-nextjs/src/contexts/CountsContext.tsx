'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface CountsContextType {
  cartCount: number;
  wishlistCount: number;
  refreshCounts: () => void;
  updateCartCount: (count: number) => void;
  updateWishlistCount: (count: number) => void;
}

const CountsContext = createContext<CountsContextType | undefined>(undefined);

export function CountsProvider({ children }: { children: ReactNode }) {
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);

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

  // Fetch wishlist count
  const fetchWishlistCount = async () => {
    try {
      const response = await fetch('/api/wishlist');
      if (response.ok) {
        const data = await response.json();
        const count = data.wishlist?.length || 0;
        setWishlistCount(count);
        return count;
      }
    } catch (error) {
      console.error('Error fetching wishlist count:', error);
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

  useEffect(() => {
    refreshCounts();
  }, []);

  return (
    <CountsContext.Provider
      value={{
        cartCount,
        wishlistCount,
        refreshCounts,
        updateCartCount,
        updateWishlistCount,
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