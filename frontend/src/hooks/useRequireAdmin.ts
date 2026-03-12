'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export function useRequireAdmin() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const role = localStorage.getItem('role');
    if (role !== 'ADMIN') {
      router.push('/');
      return;
    }
    setChecking(false);
  }, [router]);

  return checking; // true, solange wir noch prüfen/redirecten
}
