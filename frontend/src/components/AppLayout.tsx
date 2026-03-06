'use client';
import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const router = useRouter();

  useEffect(() => {
    fetch(`${API_URL}/config`)
      .then((res) => res.json())
      .then((data) => {
        if (data.maintenance === 'true') {
          router.push('/maintenance');
        }
      })
      .catch(() => {});
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />
      <Sidebar />
      <main className="md:ml-64 pt-16 min-h-screen">
        <div className="max-w-3xl mx-auto p-6">{children}</div>
      </main>
    </div>
  );
}
