'use client';

import { useRouter } from 'next/navigation';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { CheckoutPage } from '@/components/CheckoutPage';

export default function Checkout() {
  const router = useRouter();

  const handleNavigate = (page: string, orderData?: any) => {
    if (orderData) {
      // Store order data in sessionStorage
      sessionStorage.setItem('orderData', JSON.stringify(orderData));
    }
    router.push(`/${page}`);
  };

  return (
    <div className="min-h-screen">
      <Header onNavigate={(page) => router.push(`/${page}`)} />
      <CheckoutPage onNavigate={handleNavigate} />
      <Footer onNavigate={(page) => router.push(`/${page}`)} />
    </div>
  );
}
