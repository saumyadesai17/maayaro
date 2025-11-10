'use client';

import { useRouter, useParams } from 'next/navigation';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ProductDetailPage } from '@/components/ProductDetailPage';

export default function Product() {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;

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
      <ProductDetailPage productSlug={slug} onNavigate={handleNavigate} />
      <Footer onNavigate={handleNavigate} />
    </div>
  );
}