'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { OrderConfirmationPage } from '@/components/OrderConfirmationPage';

export default function OrderConfirmation() {
  const router = useRouter();
  const [orderData, setOrderData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Retrieve order data from sessionStorage
    const storedData = sessionStorage.getItem('orderData');
    if (storedData) {
      setOrderData(JSON.parse(storedData));
      // Clear the data after reading
      sessionStorage.removeItem('orderData');
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    // Only redirect if loading is complete and there's no data
    if (!isLoading && !orderData) {
      router.push('/');
    }
  }, [isLoading, orderData, router]);

  const handleNavigate = (page: string) => {
    router.push(`/${page}`);
  };

  if (isLoading || !orderData) {
    return null; // or a loading spinner
  }

  return (
    <div className="min-h-screen">
      <Header onNavigate={handleNavigate} />
      <OrderConfirmationPage onNavigate={handleNavigate} orderData={orderData} />
      <Footer onNavigate={handleNavigate} />
    </div>
  );
}
