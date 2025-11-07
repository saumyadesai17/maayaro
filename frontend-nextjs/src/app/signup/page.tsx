'use client';

import { useRouter } from 'next/navigation';
import { SignupPage } from '@/components/SignupPage';

export default function Signup() {
  const router = useRouter();

  const handleNavigate = (page: string) => {
    router.push(`/${page}`);
  };

  return <SignupPage onNavigate={handleNavigate} />;
}
