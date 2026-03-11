'use client';
import { ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import { useAppConfig } from '@/context/AppConfigContext';
import AnnouncementBanner from '@/components/AnnouncementBanner';
import EmailVerificationBanner from '@/components/EmailVerificationBanner';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

function decodeToken(token: string) {
    try {
        return JSON.parse(atob(token.split('.')[1]));
    } catch {
        return null;
    }
}

function MaintenanceGuard({ children }: { children: ReactNode }) {
    const router = useRouter();
    const { maintenance } = useAppConfig();

    useEffect(() => {
        if (maintenance) {
            router.push('/maintenance');
            return;
        }

        const token = localStorage.getItem('token');
        const refreshToken = localStorage.getItem('refresh_token');

        if (!token && refreshToken) {
            fetch(`${API_URL}/auth/refresh`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refresh_token: refreshToken }),
            })
                .then((res) => res.json())
                .then((data) => {
                    if (data.access_token) {
                        localStorage.setItem('token', data.access_token);
                    } else {
                        localStorage.clear();
                    }
                })
                .catch(() => {});
            return;
        }

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
    const router = useRouter();
    const { announcement_active, announcement } = useAppConfig();
    const hasBanner = announcement_active && !!announcement;
    const [showVerifyBanner, setShowVerifyBanner] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) return;
        const payload = decodeToken(token);
        if (payload && payload.isVerified === false) {
            setShowVerifyBanner(true);
            router.push('/verify-pending'); // <--- aktivieren
        }
    }, []);

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
