'use client';

import { AdminApp } from '@/components/admin/AdminApp';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
  const router = useRouter();

  const handleNavigate = (page: string) => {
    if (page === 'home') {
      router.push('/');
    }
  };

  return <AdminApp onNavigate={handleNavigate} />;
}
