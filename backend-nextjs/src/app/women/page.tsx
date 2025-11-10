'use client';

import { useRouter } from 'next/navigation';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { WomensPage } from '@/components/WomensPage';

export default function Women() {
  const router = useRouter();

  const handleNavigate = (page: string, productSlug?: string) => {
    if (page === 'product' && productSlug) {
      router.push(`/product/${productSlug}`);
    } else {
      router.push(`/${page}`);
    }
  };

  return (
    <div className="min-h-screen">
      <Header onNavigate={handleNavigate} />
      <WomensPage onNavigate={handleNavigate} />
      <Footer onNavigate={handleNavigate} />
    </div>
  );
}
