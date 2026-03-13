'use client';
import { ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppConfig } from '@/context/AppConfigContext';
import { fetchWithAuth } from '@/lib/fetchWithAuth';
import { useAuthUser } from '@/hooks/useAuthUser';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import AnnouncementBanner from '@/components/AnnouncementBanner';
import EmailVerificationBanner from '@/components/EmailVerificationBanner';
import Sidebar from '@/components/Sidebar';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

function MaintenanceGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { maintenance } = useAppConfig();
  const { accessToken, refreshToken } = useAuth();

  useEffect(() => {
    if (maintenance) {
      router.push('/maintenance');
      return;
    }

    if (!accessToken) return;

    fetchWithAuth(`${API_URL}/auth/me/ban-status`, accessToken, refreshToken)
      .then((res) => res.json())
      .then((data) => {
        if (data.banned) router.push('/banned');
      })
      .catch(() => {});
  }, [router, maintenance, accessToken, refreshToken]);

  return <>{children}</>;
}

export default function AppLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { announcement_active, announcement } = useAppConfig();
  const hasBanner = announcement_active && !!announcement;
  const [showVerifyBanner, setShowVerifyBanner] = useState(false);
  const user = useAuthUser();

  useEffect(() => {
    if (!user) return;
    if (user.isVerified === false) {
      setShowVerifyBanner(true);
      router.push('/verify-pending');
    }
  }, [user, router]);

  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />
      <AnnouncementBanner />
      {showVerifyBanner && <EmailVerificationBanner />}
      <Sidebar />
      <main
        className={`md:ml-64 min-h-screen ${hasBanner ? 'pt-28' : 'pt-16'}`}
      >
        <div className="max-w-3xl mx-auto p-6">
          <MaintenanceGuard>{children}</MaintenanceGuard>
        </div>
      </main>
      <footer className="md:ml-64 border-t border-gray-800/50 py-4 px-6">
        <div className="max-w-3xl mx-auto flex items-center justify-between text-xs text-gray-600">
          <span>© 2026 WitzeApp</span>
          <div className="flex gap-4">
            <button
              onClick={() => router.push('/changelog')}
              className="hover:text-gray-400 transition-colors"
            >
              Changelog
            </button>
            <button
              onClick={() => router.push('/impressum')}
              className="hover:text-gray-400 transition-colors"
            >
              Impressum
            </button>
            <button
              onClick={() => router.push('/datenschutz')}
              className="hover:text-gray-400 transition-colors"
            >
              Datenschutz
            </button>
            <button
              onClick={() => router.push('/hilfe')}
              className="hover:text-gray-400 transition-colors"
            >
              Hilfe
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
