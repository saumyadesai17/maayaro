'use client';

import { useRouter } from 'next/navigation';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { CollectionPage } from '@/components/CollectionPage';

export default function Traditional() {
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
        title="TRADITIONAL COLLECTION"
        description="Heritage inspired contemporary fashion"
        heroImage="https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=1920&q=90"
        categoryType="traditional"
        onNavigate={handleNavigate}
      />
      <Footer onNavigate={handleNavigate} />
    </div>
  );
}
