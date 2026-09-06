'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/login?tab=register');
  }, [router]);

  return (
    <div style={{ textAlign: 'center', padding: '5rem 1rem' }}>
      <p style={{ color: 'var(--text-muted)' }}>Redirecting to SlideEase Registration...</p>
    </div>
  );
}
