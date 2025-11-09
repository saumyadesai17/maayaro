'use client';

import { useRouter } from 'next/navigation';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { CollectionPage } from '@/components/CollectionPage';

export default function Collection() {
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
      <CollectionPage
        title="FEATURED COLLECTION"
        description="Curated styles for every season"
        heroImage="https://images.unsplash.com/photo-1558769132-cb1aea1c8e95?w=1920&q=90"
        categoryType="collection"
        onNavigate={handleNavigate}
      />
      <Footer onNavigate={handleNavigate} />
    </div>
  );
}
