'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/AppLayout';
import BlueCheckmark from '@/components/BlueCheckmark';
import { fetchWithAuth } from '@/lib/fetchWithAuth';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

interface LeaderboardEntry {
  id: number;
  username: string;
  witzeCount: number;
  likesReceived: number;
  isBlueVerified?: boolean;
}

function calculateRang(likes: number): string {
  if (likes >= 500) return '👑 König der Witze';
  if (likes >= 250) return '🌟 Legende';
  if (likes >= 100) return '🏆 Meister';
  if (likes >= 50) return '💎 Experte';
  if (likes >= 25) return '🥇 Fortgeschrittener';
  if (likes >= 10) return '🥈 Aufsteiger';
  return '🥉 Neuling';
}

const PODIUM_CONFIG = [
  { medal: '🥇', gradient: 'from-yellow-500/20 to-yellow-600/5', border: 'border-yellow-500/30', text: 'text-yellow-400', height: 'h-24' },
  { medal: '🥈', gradient: 'from-gray-400/20 to-gray-500/5', border: 'border-gray-400/30', text: 'text-gray-300', height: 'h-16' },
  { medal: '🥉', gradient: 'from-orange-600/20 to-orange-700/5', border: 'border-orange-600/30', text: 'text-orange-400', height: 'h-12' },
];

export default function LeaderboardPage() {
  const router = useRouter();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  useEffect(() => {
    const load = async () => {
      const token = localStorage.getItem('token');

      // Leaderboard ist auch ohne Login sichtbar
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      // Eigene User-ID laden für Highlighting
      if (token) {
        try {
          const meRes = await fetchWithAuth(`${API_URL}/profile`);
          if (meRes.ok) {
            const me = await meRes.json();
            setCurrentUserId(me.id);
          }
        } catch {}
      }

      const res = await fetchWithAuth(`${API_URL}/witze/leaderboard`);
      if (res.ok) {
        const data: LeaderboardEntry[] = await res.json();
        setEntries(data);
      }
      setLoading(false);
    };
    load();
  }, []);

  const top3 = entries.slice(0, 3);
  const rest = entries.slice(3);

  // Podium: Platz 2, 1, 3 von links nach rechts
  const podiumOrder = [top3[1], top3[0], top3[2]];
  const podiumPositions = [1, 0, 2]; // Index in PODIUM_CONFIG

  return (
      <AppLayout>
        <div className="max-w-2xl mx-auto px-4 py-10">

          {/* Header */}
          <div className="text-center mb-10">
            <span className="text-5xl block mb-3">🏆</span>
            <h1 className="text-4xl font-black text-white mb-2">Leaderboard</h1>
            <p className="text-gray-400 text-sm">
              Die aktivsten Witzeschreiber der Community
            </p>
          </div>

          {loading && (
              <div className="flex items-center justify-center py-20">
                <div className="animate-spin w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full" />
              </div>
          )}

          {!loading && entries.length === 0 && (
              <div className="text-center py-20 text-gray-500">
                <span className="text-5xl block mb-4">😶</span>
                Noch keine Einträge
              </div>
          )}

          {!loading && entries.length > 0 && (
              <>
                {/* Podium Top 3 */}
                {top3.length >= 1 && (
                    <div className="flex items-end justify-center gap-3 mb-8">
                      {podiumOrder.map((entry, i) => {
                        if (!entry) return <div key={i} className="flex-1" />;
                        const pos = podiumPositions[i];
                        const cfg = PODIUM_CONFIG[pos];
                        const isMe = entry.id === currentUserId;

                        return (
                            <div
                                key={entry.id}
                                onClick={() => router.push(`/profil/${entry.username}`)}
                                className={`flex-1 cursor-pointer bg-gradient-to-b ${cfg.gradient} border ${cfg.border} rounded-2xl p-4 text-center transition-all hover:scale-105 ${isMe ? 'ring-2 ring-indigo-500/50' : ''}`}
                            >
                              <div className="text-3xl mb-2">{cfg.medal}</div>
                              <div className={`w-12 h-12 mx-auto rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-lg mb-2 ${pos === 0 ? 'w-14 h-14 text-xl' : ''}`}>
                                {entry.username.charAt(0).toUpperCase()}
                              </div>
                              <div className="flex items-center justify-center gap-1">
                                <p className={`font-black text-sm truncate ${cfg.text}`}>
                                  @{entry.username}
                                </p>
                                {entry.isBlueVerified && <BlueCheckmark size={4} />}
                              </div>
                              <p className="text-gray-400 text-xs mb-2">
                                {calculateRang(entry.likesReceived)}
                              </p>
                              <div className={`${cfg.height} flex flex-col items-center justify-end`}>
                                <p className={`text-2xl font-black ${cfg.text}`}>
                                  {entry.likesReceived}
                                </p>
                                <p className="text-gray-500 text-xs">Likes</p>
                              </div>
                            </div>
                        );
                      })}
                    </div>
                )}

                {/* Plätze 4–10 */}
                {rest.length > 0 && (
                    <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-800/50 rounded-3xl overflow-hidden">
                      <div className="px-6 py-4 border-b border-gray-800/50">
                        <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider">
                          Weitere Platzierungen
                        </h2>
                      </div>
                      <div className="divide-y divide-gray-800/50">
                        {rest.map((entry, i) => {
                          const isMe = entry.id === currentUserId;
                          return (
                              <div
                                  key={entry.id}
                                  onClick={() => router.push(`/profil/${entry.username}`)}
                                  className={`flex items-center gap-4 px-6 py-4 cursor-pointer hover:bg-gray-800/30 transition-all ${isMe ? 'bg-indigo-500/5 border-l-2 border-indigo-500' : ''}`}
                              >
                                {/* Platz */}
                                <div className="w-8 text-center">
                          <span className="text-gray-500 font-black text-sm">
                            #{i + 4}
                          </span>
                                </div>

                                {/* Avatar */}
                                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-sm flex-shrink-0">
                                  {entry.username.charAt(0).toUpperCase()}
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-1">
                                    <p className="text-white text-sm font-semibold truncate">
                                      @{entry.username}
                                    </p>
                                    {entry.isBlueVerified && <BlueCheckmark size={4} />}
                                    {isMe && (
                                        <span className="text-xs text-indigo-400 font-bold ml-1">
                                (Du)
                              </span>
                                    )}
                                  </div>
                                  <p className="text-gray-500 text-xs">
                                    {calculateRang(entry.likesReceived)} · {entry.witzeCount} {entry.witzeCount === 1 ? 'Witz' : 'Witze'}
                                  </p>
                                </div>

                                {/* Likes */}
                                <div className="text-right flex-shrink-0">
                                  <p className="text-white font-black text-sm">
                                    {entry.likesReceived}
                                  </p>
                                  <p className="text-gray-500 text-xs">Likes</p>
                                </div>
                              </div>
                          );
                        })}
                      </div>
                    </div>
                )}

                {/* Eigene Position wenn nicht in Top 10 */}
                {currentUserId && !entries.find((e) => e.id === currentUserId) && (
                    <div className="mt-4 p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl text-center">
                      <p className="text-indigo-400 text-sm">
                        Du bist noch nicht in den Top 10 – poste mehr Witze und sammle Likes! 🚀
                      </p>
                    </div>
                )}
              </>
          )}
        </div>
      </AppLayout>
  );
}
