'use client';

import { CollectionPage } from './CollectionPage';

interface MensPageProps {
  onNavigate: (page: string, productId?: number) => void;
}

export function MensPage({ onNavigate }: MensPageProps) {
  return (
    <CollectionPage
      title="MEN'S COLLECTION"
      description="Refined essentials for the modern gentleman"
      heroImage="https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?w=1920&q=90"
      categoryType="men"
      onNavigate={onNavigate}
    />
  );
}
