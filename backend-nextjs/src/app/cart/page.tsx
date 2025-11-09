'use client';

import { useRouter } from 'next/navigation';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { CartPage } from '@/components/CartPage';

export default function Cart() {
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
      <CartPage onNavigate={handleNavigate} />
      <Footer onNavigate={handleNavigate} />
    </div>
  );
}
