'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

interface BanStatus {
  banned: boolean;
  reason?: string;
  expiresAt?: string | null;
  permanent?: boolean;
}

export default function BannedPage() {
  const router = useRouter();
  const [ban, setBan] = useState<BanStatus | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    fetch(`${API_URL}/auth/me/ban-status`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (!data.banned) router.push('/');
        else setBan(data);
      });
  }, [router]);

  const logout = () => {
    localStorage.clear();
    router.push('/login');
  };

  if (!ban) return null;

  return (
    <main className="min-h-screen bg-gray-950 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="bg-gray-900/80 backdrop-blur-xl border border-red-500/30 rounded-3xl p-8 shadow-2xl text-center">
          <div className="w-20 h-20 bg-red-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">🔨</span>
          </div>
          <h1 className="text-3xl font-black text-white mb-2">Gesperrt</h1>
          <p className="text-gray-400 text-sm mb-6">
            Dein Account wurde gesperrt.
          </p>

          <div className="bg-gray-800/50 rounded-2xl p-4 text-left space-y-3 mb-6">
            <div>
              <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">
                Grund
              </p>
              <p className="text-white text-sm font-medium">{ban.reason}</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">
                Dauer
              </p>
              {ban.permanent ? (
                <p className="text-red-400 text-sm font-medium">🔒 Permanent</p>
              ) : (
                <p className="text-white text-sm font-medium">
                  Bis{' '}
                  {new Date(ban.expiresAt!).toLocaleString('de-DE', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              )}
            </div>
          </div>

          <button
            onClick={logout}
            className="w-full py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium rounded-xl transition-all text-sm"
          >
            Abmelden
          </button>
        </div>
      </div>
    </main>
  );
}
