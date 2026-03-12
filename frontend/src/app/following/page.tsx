'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/AppLayout';
import BlueCheckmark from '@/components/BlueCheckmark';
import { fetchWithAuth } from '@/lib/fetchWithAuth';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

interface Witz {
  id: number;
  text: string;
  createdAt: string;
  author?: { username: string; isBlueVerified?: boolean };
  kategorie?: { name: string; emoji: string };
  _count?: { likeLikes: number; comments: number };
}

export default function FollowingPage() {
  const router = useRouter();
  const [witze, setWitze] = useState<Witz[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { router.push('/login'); return; }
    fetchWithAuth(`${API_URL}/follow/feed/following`)
        .then((res) => res.json())
        .then((data) => setWitze(data))
        .finally(() => setLoading(false));
  }, [router]);

  const handleShare = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    navigator.clipboard.writeText(`${window.location.origin}/witze/${id}`).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  return (
      <AppLayout>
        <div className="max-w-2xl mx-auto space-y-4 px-4 py-6">

          {/* Header */}
          <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-800/50 rounded-3xl p-6">
            <div className="flex items-center gap-3 mb-1">
              <span className="text-3xl">👥</span>
              <h1 className="text-3xl font-black text-white">Following</h1>
            </div>
            <p className="text-gray-400 text-sm ml-1">
              Witze von Usern denen du folgst
            </p>
          </div>

          {/* Loading */}
          {loading && (
              <div className="flex items-center justify-center py-20">
                <div className="animate-spin w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full" />
              </div>
          )}

          {/* Empty State */}
          {!loading && witze.length === 0 && (
              <div className="text-center py-16 bg-gray-900/80 backdrop-blur-xl border border-gray-800/50 rounded-3xl">
                <span className="text-6xl block mb-4">👥</span>
                <h3 className="text-xl font-black text-white mb-2">
                  Noch niemanden gefolgt
                </h3>
                <p className="text-gray-500 text-sm mb-6">
                  Besuche Profile und folge anderen Usern um ihren Feed zu sehen.
                </p>
                <button
                    onClick={() => router.push('/')}
                    className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-sm transition-all"
                >
                  🔍 Forum entdecken
                </button>
              </div>
          )}

          {/* Witze */}
          {!loading && witze.length > 0 && (
              <div className="space-y-3">
                {witze.map((w) => (
                    <div
                        key={w.id}
                        onClick={() => router.push(`/witze/${w.id}`)}
                        className="bg-gray-900/80 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-5 cursor-pointer hover:border-gray-700/80 transition-all group"
                    >
                      {/* Autor */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-sm font-black">
                        {w.author?.username?.charAt(0).toUpperCase()}
                      </span>
                          </div>
                          <div>
                            <div
                                onClick={(e) => {
                                  e.stopPropagation();
                                  router.push(`/profil/${w.author?.username}`);
                                }}
                                className="flex items-center gap-1 cursor-pointer hover:text-indigo-400 transition-colors w-fit"
                            >
                        <span className="text-white text-sm font-semibold">
                          @{w.author?.username}
                        </span>
                              {w.author?.isBlueVerified && <BlueCheckmark size={4} />}
                            </div>
                            <p className="text-gray-500 text-xs">
                              {new Date(w.createdAt).toLocaleDateString('de-DE', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              })}
                              {w.kategorie && (
                                  <span className="ml-2 text-indigo-400">
                            {w.kategorie.emoji} {w.kategorie.name}
                          </span>
                              )}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Text */}
                      <p className="text-gray-100 text-base leading-relaxed mb-4 line-clamp-3">
                        "{w.text}"
                      </p>

                      <div className="border-t border-gray-800 mb-3" />

                      {/* Aktionen */}
                      <div
                          className="flex items-center gap-2"
                          onClick={(e) => e.stopPropagation()}
                      >
                  <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium text-gray-500 border border-transparent">
                    ♥ <span className="text-red-400">{w._count?.likeLikes ?? 0}</span>
                  </span>
                        <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium text-gray-500 border border-transparent">
                    💬 {w._count?.comments ?? 0}
                  </span>
                        <button
                            onClick={(e) => handleShare(e, w.id)}
                            className={`ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium border transition-all ${
                                copiedId === w.id
                                    ? 'text-green-400 bg-green-500/10 border-green-500/30'
                                    : 'text-gray-500 hover:text-indigo-400 hover:bg-indigo-500/10 border-transparent hover:border-indigo-500/20 opacity-0 group-hover:opacity-100'
                            }`}
                        >
                          {copiedId === w.id ? '✓ Kopiert' : '🔗'}
                        </button>
                      </div>
                    </div>
                ))}
              </div>
          )}
        </div>
      </AppLayout>
  );
}
