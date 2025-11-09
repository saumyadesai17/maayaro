'use client';

import { useRouter } from 'next/navigation';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { WishlistPage } from '@/components/WishlistPage';

export default function Wishlist() {
  const router = useRouter();

  const handleNavigate = (page: string, productId?: number) => {
    if (productId) {
      router.push(`/product/${productId}`);
    } else {
      router.push(`/${page}`);
    }
  };

  return (
    <div className="min-h-screen">
      <Header onNavigate={handleNavigate} />
      <WishlistPage onNavigate={handleNavigate} />
      <Footer onNavigate={handleNavigate} />
    </div>
  );
}
