'use client';
import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import { useAppConfig } from '@/context/AppConfigContext';
import AnnouncementBanner from '@/components/AnnouncementBanner';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

function MaintenanceGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { maintenance } = useAppConfig();

  useEffect(() => {
    if (maintenance) {
      router.push('/maintenance');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) return;

    fetch(`${API_URL}/auth/me/ban-status`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.banned) router.push('/banned');
      })
      .catch(() => {});
  }, [router, maintenance]);

  return <>{children}</>;
}

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />
      <AnnouncementBanner />
      <Sidebar />
      <main className="md:ml-64 pt-16 min-h-screen">
        <div className="max-w-3xl mx-auto p-6">
          <MaintenanceGuard>{children}</MaintenanceGuard>
        </div>
      </main>
    </div>
  );
}
