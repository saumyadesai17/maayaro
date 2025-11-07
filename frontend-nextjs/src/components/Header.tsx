'use client';

import { Search, Heart, ShoppingBag, User, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useStore } from '@/contexts/StoreContext';

interface HeaderProps {
  onNavigate: (page: string) => void;
}

export function Header({ onNavigate }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { cartCount, wishlistCount } = useStore();

  const navigation = [
    { name: 'Women', page: 'women' },
    { name: 'Men', page: 'men' },
    { name: 'Traditional', page: 'traditional' },
    { name: 'Collection', page: 'collection' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-md z-50 border-b border-border">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="flex items-center justify-between h-16">
          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          {/* Logo */}
          <button
            onClick={() => onNavigate('')}
            className="text-xl md:text-2xl tracking-[0.15em] hover:opacity-70 transition-opacity"
          >
            MAAYARO
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            {navigation.map((item) => (
              <button
                key={item.page}
                onClick={() => onNavigate(item.page)}
                className="text-sm tracking-wide hover:text-muted-foreground transition-colors"
              >
                {item.name}
              </button>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="hover:opacity-60 transition-opacity"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>
            <button
              onClick={() => onNavigate('account')}
              className="hover:opacity-60 transition-opacity hidden sm:block"
              aria-label="Account"
            >
              <User className="w-5 h-5" />
            </button>
            <button
              onClick={() => onNavigate('wishlist')}
              className="relative hover:opacity-60 transition-opacity hidden sm:block"
              aria-label="Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute -top-2 -right-2 w-5 h-5 bg-primary text-primary-foreground text-xs flex items-center justify-center rounded-full">
                  {wishlistCount}
                </span>
              )}
            </button>
            <button
              onClick={() => onNavigate('cart')}
              className="relative hover:opacity-60 transition-opacity"
              aria-label="Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 w-5 h-5 bg-primary text-primary-foreground text-xs flex items-center justify-center rounded-full">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <AnimatePresence>
          {isSearchOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden border-t border-border"
            >
              <div className="py-4">
                <div className="relative">
                  <Search className="absolute left-0 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search for products..."
                    className="w-full pl-8 pr-4 py-2 bg-transparent border-b border-border focus:outline-none focus:border-foreground transition-colors"
                    autoFocus
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden overflow-hidden border-t border-border bg-white"
          >
            <nav className="px-6 py-6 space-y-4">
              {navigation.map((item) => (
                <button
                  key={item.page}
                  onClick={() => {
                    onNavigate(item.page);
                    setIsMenuOpen(false);
                  }}
                  className="block w-full text-left py-2 hover:text-muted-foreground transition-colors"
                >
                  {item.name}
                </button>
              ))}
              <div className="pt-4 border-t border-border space-y-4">
                <button
                  onClick={() => {
                    onNavigate('account');
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center gap-3 w-full py-2 hover:text-muted-foreground transition-colors"
                >
                  <User className="w-5 h-5" />
                  <span>Account</span>
                </button>
                <button
                  onClick={() => {
                    onNavigate('wishlist');
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center gap-3 w-full py-2 hover:text-muted-foreground transition-colors"
                >
                  <Heart className="w-5 h-5" />
                  <span>Wishlist</span>
                </button>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
