'use client';

import { useState } from 'react';
import { AdminLayout } from './AdminLayout';
import { AdminDashboard } from './AdminDashboard';
import { ProductsPage } from './ProductsPage';
import { OrdersPage } from './OrdersPage';
import { CategoriesPage } from './CategoriesPage';
import { CustomersPage } from './CustomersPage';
import { CouponsPage } from './CouponsPage';
import { BannersPage } from './BannersPage';
import { ReviewsPage } from './ReviewsPage';
import { BlogPage } from './BlogPage';
import { ContentPagesPage } from './ContentPagesPage';
import { FAQsPage } from './FAQsPage';
import { SettingsPage } from './SettingsPage';

interface AdminAppProps {
  onNavigate: (page: string) => void;
}

type AdminPage = 'dashboard' | 'products' | 'categories' | 'orders' | 'customers' | 'coupons' | 'banners' | 'reviews' | 'blog' | 'pages' | 'faqs' | 'settings';

export function AdminApp({ onNavigate }: AdminAppProps) {
  const [currentPage, setCurrentPage] = useState<AdminPage>('dashboard');
  const [selectedItemId, setSelectedItemId] = useState<string | undefined>();

  const handleNavigate = (page: string, id?: string) => {
    if (page === 'home') {
      onNavigate('home');
      return;
    }
    setCurrentPage(page as AdminPage);
    setSelectedItemId(id);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <AdminDashboard onNavigate={handleNavigate} />;
      case 'products':
        return <ProductsPage onNavigate={handleNavigate} />;
      case 'orders':
        return <OrdersPage orderId={selectedItemId} onNavigate={handleNavigate} />;
      case 'categories':
        return <CategoriesPage />;
      case 'customers':
        return <CustomersPage />;
      case 'coupons':
        return <CouponsPage />;
      case 'banners':
        return <BannersPage />;
      case 'reviews':
        return <ReviewsPage />;
      case 'blog':
        return <BlogPage />;
      case 'pages':
        return <ContentPagesPage />;
      case 'faqs':
        return <FAQsPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <AdminDashboard onNavigate={handleNavigate} />;
    }
  };

  return (
    <AdminLayout currentPage={currentPage} onNavigate={handleNavigate}>
      {renderPage()}
    </AdminLayout>
  );
}
