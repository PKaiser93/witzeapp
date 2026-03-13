'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export function useRequireAdmin() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // Solange der AuthContext noch lädt (Silent Refresh), nichts machen
    if (loading) return;

    // Kein User → Login
    if (!user) {
      router.push('/login');
      return;
    }

    // Kein Admin → Startseite
    if (user.role !== 'ADMIN') {
      router.push('/');
      return;
    }

    setChecking(false);
  }, [user, loading, router]);

  return checking;
}
