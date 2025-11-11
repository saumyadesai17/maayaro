'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { LoginPage } from '@/components/LoginPage';
import { Suspense } from 'react';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect');

  const handleNavigate = (page: string) => {
    // If there's a redirect parameter and navigating to home/account, use it
    if (redirect && (page === '' || page === 'account')) {
      router.push(redirect);
    } else {
      router.push(`/${page}`);
    }
  };

  return <LoginPage onNavigate={handleNavigate} />;
}

export default function Login() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginContent />
    </Suspense>
  );
}