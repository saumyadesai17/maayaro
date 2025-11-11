'use client';

import { useRouter, usePathname } from 'next/navigation';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { User, MapPin, Package, Heart, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useEffect, useState } from 'react';

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [userProfile, setUserProfile] = useState<{ full_name: string | null } | null>(null);
  const [loading, setLoading] = useState(true);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    let isMounted = true;
    
    const fetchProfile = async () => {
      try {
        const response = await fetch('/api/user/profile', {
          credentials: 'include',
          cache: 'no-store',
        });
        const data = await response.json();
        
        if (!isMounted) return;
        
        if (response.ok && data.success) {
          setUserProfile(data.profile);
        } else {
          // Middleware should have already redirected if not authenticated
          // This is just for updating profile data
          console.error('Profile fetch failed:', data.error);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchProfile();
    
    return () => {
      isMounted = false;
    };
  }, []);

  const handleNavigate = (page: string, productSlug?: string) => {
    if (productSlug) {
      router.push(`/product/${productSlug}`);
    } else {
      router.push(`/${page}`);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const navItems = [
    { id: 'profile', label: 'Profile', icon: User, path: '/account', shortLabel: 'Profile' },
    { id: 'orders', label: 'My Orders', icon: Package, path: '/account/orders', shortLabel: 'Orders' },
    { id: 'addresses', label: 'Addresses', icon: MapPin, path: '/account/addresses', shortLabel: 'Address' },
    { id: 'wishlist', label: 'Wishlist', icon: Heart, path: '/account/wishlist', shortLabel: 'Wishlist' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen">
        <Header onNavigate={handleNavigate} />
        <div className="pt-16 min-h-screen bg-white">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-12">
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          </div>
        </div>
        <Footer onNavigate={handleNavigate} />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header onNavigate={handleNavigate} />
      
      <div className="flex-1 pt-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Page Header - Desktop & Tablet */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="py-6 md:py-8 border-b border-border"
          >
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-light tracking-wide">My Account</h1>
            <p className="text-sm md:text-base text-muted-foreground mt-1">
              {userProfile?.full_name || 'Manage your account'}
            </p>
          </motion.div>

          {/* Desktop & Tablet Layout */}
          <div className="hidden md:block">
            {/* Tablet: Horizontal Tabs */}
            <div className="md:block lg:hidden border-b border-border sticky top-16 bg-background z-10">
              <nav className="flex gap-1 overflow-x-auto scrollbar-hide py-4">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.path;
                  return (
                    <button
                      key={item.id}
                      onClick={() => router.push(item.path)}
                      className={`flex items-center gap-2 px-6 py-3 whitespace-nowrap transition-all ${
                        isActive
                          ? 'bg-foreground text-background'
                          : 'hover:bg-secondary border border-border'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-sm">{item.label}</span>
                    </button>
                  );
                })}
                <button
                  onClick={() => setShowLogoutConfirm(true)}
                  className="flex items-center gap-2 px-6 py-3 whitespace-nowrap border border-border hover:bg-secondary transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="text-sm">Logout</span>
                </button>
              </nav>
            </div>

            {/* Desktop: Sidebar + Content */}
            <div className="hidden lg:grid lg:grid-cols-5 gap-8 py-8">
              {/* Sidebar */}
              <aside className="lg:col-span-1 space-y-1">
                <nav className="sticky top-24 space-y-1">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.path;
                    return (
                      <button
                        key={item.id}
                        onClick={() => router.push(item.path)}
                        className={`group w-full flex items-center gap-3 px-4 py-3.5 text-sm transition-all ${
                          isActive
                            ? 'bg-foreground text-background'
                            : 'hover:bg-secondary border-l-2 border-transparent hover:border-foreground'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="font-light">{item.label}</span>
                      </button>
                    );
                  })}
                  <div className="pt-4 mt-4 border-t border-border">
                    <button
                      onClick={() => setShowLogoutConfirm(true)}
                      className="w-full flex items-center gap-3 px-4 py-3.5 text-sm text-destructive hover:bg-destructive/5 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span className="font-light">Logout</span>
                    </button>
                  </div>
                </nav>
              </aside>

              {/* Main Content */}
              <motion.div 
                key={pathname}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="lg:col-span-4"
              >
                {children}
              </motion.div>
            </div>

            {/* Tablet Content (when using horizontal tabs) */}
            <motion.div 
              key={pathname}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="md:block lg:hidden py-6"
            >
              {children}
            </motion.div>
          </div>

          {/* Mobile Layout - Full width content with bottom navigation */}
          <motion.div 
            key={pathname}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden py-6 pb-24"
          >
            {children}
          </motion.div>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50 safe-area-inset-bottom">
        <div className="grid grid-cols-5 h-16">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path;
            return (
              <button
                key={item.id}
                onClick={() => router.push(item.path)}
                className={`flex flex-col items-center justify-center gap-1 transition-colors ${
                  isActive
                    ? 'text-foreground'
                    : 'text-muted-foreground'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'fill-current' : ''}`} />
                <span className="text-xs font-light">{item.shortLabel}</span>
              </button>
            );
          })}
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="flex flex-col items-center justify-center gap-1 text-muted-foreground transition-colors active:text-destructive"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-xs font-light">Logout</span>
          </button>
        </div>
      </nav>

      {/* Logout Confirmation Modal */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50"
              onClick={() => setShowLogoutConfirm(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-background border border-border p-6 max-w-sm w-full mx-4 z-50"
            >
              <h3 className="text-lg font-medium mb-2">Confirm Logout</h3>
              <p className="text-sm text-muted-foreground mb-6">
                Are you sure you want to logout from your account?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="flex-1 px-4 py-2.5 border border-border hover:bg-secondary transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowLogoutConfirm(false);
                    handleLogout();
                  }}
                  className="flex-1 px-4 py-2.5 bg-foreground text-background hover:bg-foreground/90 transition-colors"
                >
                  Logout
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <Footer onNavigate={handleNavigate} />
    </div>
  );
}
