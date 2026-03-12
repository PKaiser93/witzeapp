'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type JwtPayload = {
  sub: number;
  email: string;
  username: string;
  role: string;
  isVerified?: boolean;
  exp?: number;
};

export function useRequireAdmin() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const [, payloadBase64] = token.split('.');
      const payloadJson = atob(payloadBase64);
      const payload = JSON.parse(payloadJson) as JwtPayload;

      if (payload.exp && payload.exp * 1000 < Date.now()) {
        router.push('/login');
        return;
      }

      if (payload.role !== 'ADMIN') {
        router.push('/');
        return;
      }
    } catch {
      router.push('/login');
      return;
    }

    setChecking(false);
  }, [router]);

  return checking;
}
