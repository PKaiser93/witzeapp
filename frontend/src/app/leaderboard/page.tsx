'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/AppLayout';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

interface LeaderboardEntry {
  id: number;
  username: string;
  witzeCount: number;
  likesReceived: number;
}

const RANG_MEDALS = ['🥇', '🥈', '🥉'];

export default function LeaderboardPage() {
  const router = useRouter();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }
      const res = await fetch(`${API_URL}/witze/leaderboard`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data: LeaderboardEntry[] = await res.json();
        setEntries(data);
      }
      setLoading(false);
    };
    load();
  }, [router]);

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto space-y-6 py-4">
        <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-800/50 rounded-3xl p-6 md:p-8">
          <h1 className="text-3xl font-black text-white mb-1">
            🏆 Leaderboard
          </h1>
          <p className="text-gray-400 text-sm">
            Top 10 User nach erhaltenen Likes
          </p>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full" />
          </div>
        )}

        {!loading && (
          <div className="space-y-3">
            {entries.map((entry, index) => (
              <div
                key={entry.id}
                className="bg-gray-900/80 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-5 flex items-center gap-4"
              >
                {/* Rang */}
                <div className="w-10 text-center flex-shrink-0">
                  {index < 3 ? (
                    <span className="text-2xl">{RANG_MEDALS[index]}</span>
                  ) : (
                    <span className="text-gray-500 font-black text-lg">
                      #{index + 1}
                    </span>
                  )}
                </div>

                {/* Avatar */}
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-sm font-black">
                    {entry.username.charAt(0).toUpperCase()}
                  </span>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-white font-bold">@{entry.username}</p>
                  <p className="text-gray-500 text-xs">
                    {entry.witzeCount}{' '}
                    {entry.witzeCount === 1 ? 'Witz' : 'Witze'}
                  </p>
                </div>

                {/* Likes */}
                <div className="text-right flex-shrink-0">
                  <p className="text-white font-black text-lg">
                    {entry.likesReceived}
                  </p>
                  <p className="text-gray-500 text-xs">Likes</p>
                </div>
              </div>
            ))}

            {entries.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                Noch keine Einträge
              </div>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
