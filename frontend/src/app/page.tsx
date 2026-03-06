'use client';
import { useEffect, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import AppLayout from '@/components/AppLayout';
import { useAppConfig } from '@/context/AppConfigContext';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

interface Kategorie {
  name: string;
  emoji: string;
}

interface Witz {
  id: number;
  text: string;
  likes: number;
  userLiked: boolean;
  createdAt: string;
  author?: { username: string };
  kategorie?: Kategorie;
  likerNames?: string[];
  commentCount?: number;
}

interface Comment {
  id: number;
  text: string;
  createdAt: string;
  author: { username: string };
}

interface WitzOfTheDay {
  id: number;
  text: string;
  author?: { username: string };
  kategorie?: { name: string; emoji: string };
  _count: { likeLikes: number };
}

function getAuthHeader() {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export default function HomePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [witze, setWitze] = useState<Witz[]>([]);
  const [loading, setLoading] = useState(true);
  const [newWitz, setNewWitz] = useState('');
  const [postError, setPostError] = useState<string | null>(null);
  const [openComments, setOpenComments] = useState<number | null>(null);
  const [commentsMap, setCommentsMap] = useState<Record<number, Comment[]>>({});
  const [witzOfTheDay, setWitzOfTheDay] = useState<WitzOfTheDay | null>(null);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [sort, setSort] = useState<'new' | 'top' | 'comments'>('new');
  const { feature_likes, feature_comments } = useAppConfig();
  const [commentTextMap, setCommentTextMap] = useState<Record<number, string>>(
    {}
  );
  const [commentPostingMap, setCommentPostingMap] = useState<
    Record<number, boolean>
  >({});

  const toggleComments = async (e: React.MouseEvent, witzId: number) => {
    e.stopPropagation();
    if (openComments === witzId) {
      setOpenComments(null);
      return;
    }
    // Immer neu laden
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_URL}/witze/${witzId}/comments`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const data: Comment[] = await res.json();
      setCommentsMap((prev) => ({ ...prev, [witzId]: data }));
    }
    setOpenComments(witzId);
  };

  const postComment = async (e: React.MouseEvent, witzId: number) => {
    e.stopPropagation();
    const text = commentTextMap[witzId]?.trim();
    if (!text) return;

    setCommentPostingMap((prev) => ({ ...prev, [witzId]: true }));
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_URL}/witze/${witzId}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ text }),
    });

    if (res.ok) {
      setCommentTextMap((prev) => ({ ...prev, [witzId]: '' }));
      // Kommentare neu laden
      const res2 = await fetch(`${API_URL}/witze/${witzId}/comments`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res2.ok) {
        const data: Comment[] = await res2.json();
        setCommentsMap((prev) => ({ ...prev, [witzId]: data }));
        // commentCount aktualisieren
        setWitze((prev) =>
          prev.map((w) =>
            w.id === witzId
              ? { ...w, commentCount: (w.commentCount ?? 0) + 1 }
              : w
          )
        );
      }
    }
    setCommentPostingMap((prev) => ({ ...prev, [witzId]: false }));
  };

  const loadWitze = useCallback(async () => {
    setLoading(true);
    try {
      const kategorie = searchParams.get('kategorie');
      const params = new URLSearchParams();
      if (kategorie) params.set('kategorie', kategorie);
      if (search) params.set('search', search);
      if (sort !== 'new') params.set('sort', sort);
      const url = `${API_URL}/witze${params.toString() ? `?${params}` : ''}`;

      const res = await fetch(url, { headers: getAuthHeader() }); // ← fehlt

      if (res.status === 401) {
        localStorage.removeItem('token');
        router.push('/login');
        return;
      }
      if (!res.ok) return;
      const data: Witz[] = await res.json();
      setWitze(data);
    } finally {
      setLoading(false);
    }
  }, [searchParams, router, search, sort]);

  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput), 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    loadWitze();

    fetch(`${API_URL}/witze/random`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setWitzOfTheDay(data))
      .catch(() => {});
  }, [loadWitze, router]);

  const postWitz = async () => {
    const text = newWitz.trim();
    if (!text) return;

    const res = await fetch(`${API_URL}/witze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ text }),
    });

    if (!res.ok) {
      setPostError('Witz konnte nicht gepostet werden.');
      setTimeout(() => setPostError(null), 4000);
      return;
    }
    setNewWitz('');
    loadWitze();
  };

  const toggleLike = async (e: React.MouseEvent, witz: Witz) => {
    e.stopPropagation();

    const res = await fetch(`${API_URL}/witze/${witz.id}/like`, {
      method: 'PATCH',
      headers: getAuthHeader(),
    });

    if (res.status === 401) {
      localStorage.removeItem('token');
      router.push('/login');
      return;
    }

    if (res.ok) {
      const data = await res.json();
      setWitze((prev) =>
        prev.map((w) =>
          w.id === witz.id
            ? { ...w, likes: data.likes, userLiked: data.liked }
            : w
        )
      );
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Forum Header */}
        <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-800/50 rounded-3xl p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-black text-white mb-1">
                Forum
              </h1>
              <p className="text-gray-400 text-lg">{witze.length} Witze</p>
            </div>
            <button
              onClick={() => router.push('/post')}
              className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-xl shadow-lg hover:shadow-indigo-500/25 transition-all w-full md:w-auto"
            >
              ➕ Neuer Witz
            </button>
          </div>
        </div>

        {/* Suche */}
        <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-800/50 rounded-2xl px-4 py-3 flex items-center gap-3">
          <span className="text-gray-500">🔍</span>
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Witze durchsuchen..."
            className="flex-1 bg-transparent text-white placeholder-gray-500 focus:outline-none text-sm"
          />
          {searchInput && (
            <button
              onClick={() => {
                setSearchInput('');
                setSearch('');
              }}
              className="text-gray-500 hover:text-white transition-colors text-xs"
            >
              ✕
            </button>
          )}
        </div>

        {/* Sortierung */}
        <div className="flex items-center gap-2">
          {(['new', 'top', 'comments'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setSort(s)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all border ${
                sort === s
                  ? 'bg-indigo-600/80 text-white border-indigo-500/50'
                  : 'text-gray-400 hover:text-white bg-gray-900/80 border-gray-800/50 hover:border-gray-700/50'
              }`}
            >
              {s === 'new' && '🕐 Neu'}
              {s === 'top' && '🔥 Top'}
              {s === 'comments' && '💬 Meistkommentiert'}
            </button>
          ))}
        </div>

        {/* Witz des Tages */}
        {witzOfTheDay && (
          <div
            className="bg-gradient-to-br from-indigo-900/40 to-purple-900/40 backdrop-blur-xl border border-indigo-500/30 rounded-3xl p-6 cursor-pointer hover:border-indigo-500/50 transition-all"
            onClick={() => router.push(`/witze/${witzOfTheDay.id}`)}
          >
            <div className="flex items-center gap-2 mb-3">
              <span className="text-yellow-400 text-lg">⭐</span>
              <span className="text-indigo-300 text-xs font-bold uppercase tracking-wider">
                Witz des Tages
              </span>
            </div>
            <p className="text-white text-lg leading-relaxed mb-4">
              "{witzOfTheDay.text}"
            </p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white text-xs font-bold">
                    {(witzOfTheDay.author?.username ?? 'G')
                      .charAt(0)
                      .toUpperCase()}
                  </span>
                </div>
                <span className="text-gray-400 text-sm">
                  @{witzOfTheDay.author?.username ?? 'Gast'}
                </span>
                {witzOfTheDay.kategorie && (
                  <span className="text-indigo-400 text-xs">
                    {witzOfTheDay.kategorie.emoji} {witzOfTheDay.kategorie.name}
                  </span>
                )}
              </div>
              <span className="text-gray-500 text-xs">
                ❤️ {witzOfTheDay._count.likeLikes}
              </span>
            </div>
          </div>
        )}

        {/* Quick Post */}
        <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-800/50 rounded-3xl p-6">
          <div className="flex gap-3">
            <input
              value={newWitz}
              onChange={(e) => setNewWitz(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && postWitz()}
              placeholder="Schnell einen Witz posten..."
              className="flex-1 px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent transition-all"
            />
            <button
              onClick={postWitz}
              disabled={!newWitz.trim()}
              className="px-6 py-3 bg-indigo-600/50 hover:bg-indigo-500/70 text-white font-bold rounded-2xl border border-indigo-500/30 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              Posten
            </button>
          </div>
        </div>

        {postError && <p className="text-red-400 text-sm mb-3">{postError}</p>}

        {/* Witze Liste */}
        <div className="space-y-3">
          {witze.map((w) => (
            <div
              key={w.id}
              className="bg-gray-900/80 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-5 cursor-pointer hover:border-gray-700/80 transition-all"
              onClick={() => router.push(`/witze/${w.id}`)}
            >
              {/* Autor & Meta */}
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs font-bold">
                    {(w.author?.username ?? 'G').charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="text-white text-sm font-semibold">
                    @{w.author?.username ?? 'Gast'}
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

              {/* Text */}
              <p className="text-gray-100 text-base leading-relaxed mb-4 line-clamp-3">
                {w.text}
              </p>

              {/* Divider */}
              <div className="border-t border-gray-800 mb-3" />

              {/* Liker Anzeige */}
              {w.likes > 0 && (
                <p className="text-gray-500 text-xs mb-3">
                  <span className="text-gray-400">
                    {w.likes === 1 ? '1 Person' : `${w.likes} Personen`}
                  </span>{' '}
                  {w.likes > 1 ? 'haben' : 'hat'} ein ❤️ gegeben
                </p>
              )}

              {/* Aktionen */}
              <div
                className="flex items-center gap-2"
                onClick={(e) => e.stopPropagation()}
              >
                {feature_likes && (
                  <button
                    onClick={(e) => toggleLike(e, w)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all text-sm font-medium ${
                      w.userLiked
                        ? 'text-red-400 bg-red-500/10 border border-red-500/30'
                        : 'text-gray-500 hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/20 border border-transparent'
                    }`}
                  >
                    ♥ <span>{w.likes ?? 0}</span>
                  </button>
                )}

                {feature_comments && (
                  <button
                    onClick={(e) => toggleComments(e, w.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium border transition-all ${
                      openComments === w.id
                        ? 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30'
                        : 'text-gray-500 hover:text-white hover:bg-gray-800/50 border-transparent hover:border-gray-700/50'
                    }`}
                  >
                    💬 <span>{w.commentCount ?? 0}</span>
                  </button>
                )}
              </div>
              {openComments === w.id && (
                <div
                  className="mt-4 pt-4 border-t border-gray-800 space-y-3"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Kommentar Eingabe */}
                  <div className="flex gap-2">
                    <input
                      value={commentTextMap[w.id] ?? ''}
                      onChange={(e) =>
                        setCommentTextMap((prev) => ({
                          ...prev,
                          [w.id]: e.target.value,
                        }))
                      }
                      onKeyDown={(e) =>
                        e.key === 'Enter' &&
                        !e.shiftKey &&
                        postComment(e as any, w.id)
                      }
                      placeholder="Kommentar schreiben..."
                      className="flex-1 px-3 py-2 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm transition-all"
                    />
                    <button
                      onClick={(e) => postComment(e, w.id)}
                      disabled={
                        !commentTextMap[w.id]?.trim() || commentPostingMap[w.id]
                      }
                      className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all text-sm"
                    >
                      ➤
                    </button>
                  </div>

                  {/* Kommentare */}
                  {(commentsMap[w.id] ?? []).length === 0 && (
                    <p className="text-gray-500 text-xs text-center py-2">
                      Noch keine Kommentare
                    </p>
                  )}
                  {(commentsMap[w.id] ?? []).map((c) => (
                    <div key={c.id} className="flex items-start gap-2">
                      <div className="w-7 h-7 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-xs font-bold">
                          {c.author.username.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 bg-gray-800/50 rounded-xl px-3 py-2">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-white text-xs font-semibold">
                            @{c.author.username}
                          </span>
                          <span className="text-gray-600 text-xs">
                            {new Date(c.createdAt).toLocaleString('de-DE', {
                              day: 'numeric',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                        <p className="text-gray-300 text-sm">{c.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
