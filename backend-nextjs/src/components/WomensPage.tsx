'use client';

import { CollectionPage } from './CollectionPage';

interface WomensPageProps {
  onNavigate: (page: string, productSlug?: string) => void;
}

export function WomensPage({ onNavigate }: WomensPageProps) {
  return (
    <CollectionPage
      title="WOMEN'S COLLECTION"
      description="Elegant designs for the modern woman"
      heroImage="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1920&q=90"
      categoryType="women"
      onNavigate={onNavigate}
    />
  );
}
