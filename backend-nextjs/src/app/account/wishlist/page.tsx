'use client';

import { motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { Loader2, X, Heart } from 'lucide-react';
import { ImageWithFallback } from '@/components/figma/ImageWithFallback';
import Link from 'next/link';
import { useCounts } from '@/contexts/CountsContext';

interface WishlistItem {
  id: string;
  product_id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  original_price: number | null;
  sku: string;
  image: string;
  hoverImage: string;
  colors: number;
  category: string;
  material: string;
  is_featured: boolean;
  created_at: string;
}

export default function WishlistPage() {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const { refreshWishlist } = useCounts();

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    try {
      const response = await fetch('/api/wishlist');
      const data = await response.json();
      
      if (response.ok && data.wishlist) {
        setWishlist(data.wishlist);
      }
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveItem = async (productId: string) => {
    setRemovingId(productId);
    try {
      const response = await fetch(`/api/wishlist/${productId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setWishlist(wishlist.filter(item => item.product_id !== productId));
        // Refresh the wishlist count in the header
        await refreshWishlist();
      }
    } catch (error) {
      console.error('Error removing item:', error);
    } finally {
      setRemovingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-light">My Wishlist</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {wishlist.length} {wishlist.length === 1 ? 'item' : 'items'} saved
          </p>
        </div>
      </div>
      
      {wishlist.length === 0 ? (
        <div className="border border-dashed border-border bg-background p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center bg-muted rounded-full">
            <Heart className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-light mb-2">Your wishlist is empty</h3>
          <p className="text-muted-foreground mb-6">
            Save your favorite items and they will appear here
          </p>
          <a 
            href="/collection"
            className="inline-block px-8 py-3 bg-foreground text-background hover:bg-foreground/90 transition-colors"
          >
            Browse Collection
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {wishlist.map((item) => (
            <div key={item.id} className="group relative border border-border bg-background hover:shadow-md transition-shadow">
              <button
                onClick={() => handleRemoveItem(item.product_id)}
                disabled={removingId === item.product_id}
                className="absolute top-2 right-2 z-10 p-2 bg-background/90 backdrop-blur-sm border border-border hover:bg-destructive hover:text-background hover:border-destructive transition-colors disabled:opacity-50 shadow-sm"
                aria-label="Remove from wishlist"
              >
                {removingId === item.product_id ? (
                  <Loader2 className="w-3.5 h-3.5 md:w-4 md:h-4 animate-spin" />
                ) : (
                  <X className="w-3.5 h-3.5 md:w-4 md:h-4" />
                )}
              </button>

              <Link href={`/product/${item.slug}`}>
                <div className="aspect-3/4 relative overflow-hidden bg-muted">
                  <ImageWithFallback
                    src={item.image}
                    alt={item.name}
                    className="object-cover w-full h-full transition-opacity duration-300 group-hover:opacity-0 absolute inset-0"
                  />
                  {item.hoverImage && item.hoverImage !== item.image && (
                    <ImageWithFallback
                      src={item.hoverImage}
                      alt={item.name}
                      className="object-cover w-full h-full opacity-0 transition-opacity duration-300 group-hover:opacity-100 absolute inset-0"
                    />
                  )}
                </div>

                <div className="p-3 md:p-4 space-y-2">
                  <div className="text-xs text-muted-foreground uppercase tracking-wider">
                    {item.category}
                  </div>
                  <h3 className="font-medium line-clamp-2 text-sm md:text-base leading-snug">{item.name}</h3>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm md:text-base">₹{item.price.toLocaleString()}</span>
                    {item.original_price && item.original_price > item.price && (
                      <span className="text-xs md:text-sm text-muted-foreground line-through">
                        ₹{item.original_price.toLocaleString()}
                      </span>
                    )}
                  </div>
                  {item.colors > 1 && (
                    <div className="text-xs text-muted-foreground">
                      {item.colors} colors
                    </div>
                  )}
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
