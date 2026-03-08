'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/AppLayout';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

export default function FollowingPage() {
  const router = useRouter();
  const [witze, setWitze] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    fetch(`${API_URL}/follow/feed/following`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setWitze(data))
      .finally(() => setLoading(false));
  }, [router]);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-800/50 rounded-3xl p-6 md:p-8">
          <h1 className="text-3xl font-black text-white mb-1">👥 Following</h1>
          <p className="text-gray-400 text-sm">
            Witze von Usern denen du folgst
          </p>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full" />
          </div>
        )}

        {!loading && witze.length === 0 && (
          <div className="text-center py-20 bg-gray-900/80 backdrop-blur-xl border border-gray-800/50 rounded-3xl">
            <span className="text-5xl block mb-4">👥</span>
            <h3 className="text-xl font-bold text-gray-400 mb-2">
              Noch niemanden gefolgt
            </h3>
            <p className="text-gray-500 text-sm mb-6">
              Besuche Profile und folge anderen Usern.
            </p>
            <button
              onClick={() => router.push('/')}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-sm transition-all"
            >
              Forum entdecken
            </button>
          </div>
        )}

        <div className="space-y-3">
          {witze.map((w) => (
            <div
              key={w.id}
              onClick={() => router.push(`/witze/${w.id}`)}
              className="bg-gray-900/80 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-5 cursor-pointer hover:border-gray-700/80 transition-all"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs font-bold">
                    {w.author?.username?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/profil/${w.author?.username}`);
                    }}
                    className="text-white text-sm font-semibold cursor-pointer hover:text-indigo-400 transition-colors"
                  >
                    @{w.author?.username}
                  </p>
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
              <p className="text-gray-100 text-base leading-relaxed mb-3 line-clamp-3">
                "{w.text}"
              </p>
              <div className="border-t border-gray-800 pt-3 flex items-center gap-3 text-xs text-gray-500">
                <span className="text-red-400">
                  ♥ {w._count?.likeLikes ?? 0}
                </span>
                <span>💬 {w._count?.comments ?? 0}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
