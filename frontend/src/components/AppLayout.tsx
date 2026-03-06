'use client';
import { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import { AppConfigProvider } from '@/context/AppConfigContext';
import { useAppConfig } from '@/context/AppConfigContext';

function MaintenanceGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { maintenance } = useAppConfig();

  if (maintenance) {
    router.push('/maintenance');
    return null;
  }

  return <>{children}</>;
}

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <AppConfigProvider>
      <div className="min-h-screen bg-gray-950">
        <Navbar />
        <Sidebar />
        <main className="md:ml-64 pt-16 min-h-screen">
          <div className="max-w-3xl mx-auto p-6">
            <MaintenanceGuard>{children}</MaintenanceGuard>
          </div>
        </main>
      </div>
    </AppConfigProvider>
  );
}
