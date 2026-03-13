'use client';
import { useEffect, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import AppLayout from '@/components/AppLayout';
import { useAppConfig } from '@/context/AppConfigContext';
import ReportDialog from '@/components/ReportDialog';
import WitzCard from '@/components/feed/WitzCard';
import WitzOfTheDayBanner from '@/components/feed/WitzOfTheDay';
import FeedFilters from '@/components/feed/FeedFilters';
import QuickPost from '@/components/feed/QuickPost';
import { useAuth } from '@/context/AuthContext';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';
const PAGE_SIZE = 20;

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
  author?: { username: string; isBlueVerified?: boolean };
  kategorie?: Kategorie;
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

function buildAuthHeader(accessToken: string | null) {
  return accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
}

export default function HomePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { feature_likes, feature_comments, feature_report } = useAppConfig();
  const { accessToken, user, refreshToken } = useAuth();
  const isLoggedIn = !!user;

  const [witze, setWitze] = useState<Witz[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<number | null>(null);
  const [newWitz, setNewWitz] = useState('');
  const [postError, setPostError] = useState<string | null>(null);
  const [openComments, setOpenComments] = useState<number | null>(null);
  const [commentsMap, setCommentsMap] = useState<Record<number, Comment[]>>({});
  const [commentTextMap, setCommentTextMap] = useState<Record<number, string>>(
    {}
  );
  const [commentPostingMap, setCommentPostingMap] = useState<
    Record<number, boolean>
  >({});
  const [witzOfTheDay, setWitzOfTheDay] = useState<WitzOfTheDay | null>(null);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [sort, setSort] = useState<'new' | 'top' | 'comments'>('new');
  const [reportingWitzId, setReportingWitzId] = useState<number | null>(null);
  const [kategorien, setKategorien] = useState<
    { name: string; emoji: string }[]
  >([]);
  const [selectedKategorie, setSelectedKategorie] = useState<string | null>(
    searchParams.get('kategorie') ?? null
  );

  // Initiales Laden – setzt Witze zurück
  const loadWitze = useCallback(async () => {
    setLoading(true);
    setNextCursor(null);
    try {
      const params = new URLSearchParams();
      if (selectedKategorie) params.set('kategorie', selectedKategorie);
      if (search) params.set('search', search);
      if (sort !== 'new') params.set('sort', sort);
      params.set('limit', String(PAGE_SIZE));

      const url = `${API_URL}/witze?${params.toString()}`;
      const res = await fetch(url, { headers: buildAuthHeader(accessToken) });
      if (!res.ok) return;
      const data = await res.json();
      setWitze(data.witze);
      setNextCursor(data.nextCursor);
    } finally {
      setLoading(false);
    }
  }, [search, sort, selectedKategorie, accessToken]);

  // Mehr laden – hängt an bestehende Witze an
  const loadMore = async () => {
    if (!nextCursor || loadingMore) return;
    setLoadingMore(true);
    try {
      const params = new URLSearchParams();
      if (selectedKategorie) params.set('kategorie', selectedKategorie);
      if (search) params.set('search', search);
      if (sort !== 'new') params.set('sort', sort);
      params.set('limit', String(PAGE_SIZE));
      params.set('cursor', String(nextCursor));

      const url = `${API_URL}/witze?${params.toString()}`;
      const res = await fetch(url, { headers: buildAuthHeader(accessToken) });
      if (!res.ok) return;
      const data = await res.json();
      setWitze((prev) => [...prev, ...data.witze]);
      setNextCursor(data.nextCursor);
    } finally {
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput), 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    loadWitze();
    fetch(`${API_URL}/witze/random`)
      .then((r) => r.json())
      .then(setWitzOfTheDay)
      .catch(() => {});
    fetch(`${API_URL}/witze/kategorien`)
      .then((r) => r.json())
      .then(setKategorien)
      .catch(() => {});
  }, [loadWitze]);

  const postWitz = async (kategorieId?: number | null) => {
    const text = newWitz.trim();
    if (!text) return;
    if (!isLoggedIn) {
      router.push('/login');
      return;
    }
    const res = await fetch(`${API_URL}/witze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...buildAuthHeader(accessToken),
      },
      body: JSON.stringify({ text, kategorieId: kategorieId ?? null }),
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
    if (!isLoggedIn) {
      router.push('/login');
      return;
    }
    let tokenToUse = accessToken;
    const res = await fetch(`${API_URL}/witze/${witz.id}/like`, {
      method: 'PATCH',
      headers: buildAuthHeader(tokenToUse),
    });
    if (res.status === 401 && refreshToken) {
      const newToken = await refreshToken();
      if (!newToken) {
        router.push('/login');
        return;
      }
      const retry = await fetch(`${API_URL}/witze/${witz.id}/like`, {
        method: 'PATCH',
        headers: buildAuthHeader(newToken),
      });
      if (retry.ok) {
        const data = await retry.json();
        setWitze((prev) =>
          prev.map((w) =>
            w.id === witz.id
              ? { ...w, likes: data.likes, userLiked: data.liked }
              : w
          )
        );
      }
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

  const toggleComments = async (e: React.MouseEvent, witzId: number) => {
    e.stopPropagation();
    if (openComments === witzId) {
      setOpenComments(null);
      return;
    }
    const res = await fetch(`${API_URL}/witze/${witzId}/comments`, {
      headers: buildAuthHeader(accessToken),
    });
    if (res.ok) {
      const data = await res.json();
      setCommentsMap((prev) => ({ ...prev, [witzId]: data }));
    }
    setOpenComments(witzId);
  };

  const postComment = async (e: React.MouseEvent, witzId: number) => {
    e.stopPropagation();
    const text = commentTextMap[witzId]?.trim();
    if (!text) return;
    if (!isLoggedIn) {
      router.push('/login');
      return;
    }
    setCommentPostingMap((prev) => ({ ...prev, [witzId]: true }));
    const res = await fetch(`${API_URL}/witze/${witzId}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...buildAuthHeader(accessToken),
      },
      body: JSON.stringify({ text }),
    });
    if (res.ok) {
      setCommentTextMap((prev) => ({ ...prev, [witzId]: '' }));
      const res2 = await fetch(`${API_URL}/witze/${witzId}/comments`, {
        headers: buildAuthHeader(accessToken),
      });
      if (res2.ok) {
        const data = await res2.json();
        setCommentsMap((prev) => ({ ...prev, [witzId]: data }));
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

  return (
    <AppLayout>
      <div className="space-y-4">
        {witzOfTheDay && <WitzOfTheDayBanner witz={witzOfTheDay} />}

        <QuickPost
          isLoggedIn={isLoggedIn}
          value={newWitz}
          error={postError}
          onChange={setNewWitz}
          onPost={postWitz}
        />

        <FeedFilters
          searchInput={searchInput}
          sort={sort}
          kategorien={kategorien}
          selectedKategorie={selectedKategorie}
          onSearchChange={setSearchInput}
          onSearchClear={() => {
            setSearchInput('');
            setSearch('');
          }}
          onSortChange={setSort}
          onKategorieChange={setSelectedKategorie}
        />

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full" />
          </div>
        ) : witze.length === 0 ? (
          <div className="text-center py-20 bg-gray-900/80 backdrop-blur-xl border border-gray-800/50 rounded-3xl">
            <span className="text-5xl block mb-4">📝</span>
            <h3 className="text-xl font-bold text-gray-400 mb-2">
              Noch keine Witze
            </h3>
            <p className="text-gray-500 text-sm">
              Sei der Erste und poste einen Witz!
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {witze.map((w) => (
                <WitzCard
                  key={w.id}
                  witz={w}
                  isLoggedIn={isLoggedIn}
                  openComments={openComments === w.id}
                  comments={commentsMap[w.id] ?? []}
                  commentText={commentTextMap[w.id] ?? ''}
                  commentPosting={commentPostingMap[w.id] ?? false}
                  featureLikes={feature_likes}
                  featureComments={feature_comments}
                  featureReport={feature_report}
                  onToggleLike={(e) => toggleLike(e, w)}
                  onToggleComments={(e) => toggleComments(e, w.id)}
                  onCommentTextChange={(text) =>
                    setCommentTextMap((prev) => ({ ...prev, [w.id]: text }))
                  }
                  onPostComment={(e) => postComment(e, w.id)}
                  onReport={() => setReportingWitzId(w.id)}
                />
              ))}
            </div>

            {nextCursor && (
              <div className="flex justify-center pt-2 pb-6">
                <button
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="px-8 py-3 bg-gray-900/80 hover:bg-gray-800/80 border border-gray-700/50 hover:border-indigo-500/50 text-gray-300 hover:text-white font-medium rounded-2xl transition-all disabled:opacity-50"
                >
                  {loadingMore ? (
                    <span className="flex items-center gap-2">
                      <span className="animate-spin w-4 h-4 border-2 border-gray-500/30 border-t-gray-300 rounded-full" />
                      Lade...
                    </span>
                  ) : (
                    '↓ Mehr Witze laden'
                  )}
                </button>
              </div>
            )}

            {!nextCursor && witze.length >= PAGE_SIZE && (
              <p className="text-center text-gray-600 text-sm py-4">
                Alle Witze geladen 🎉
              </p>
            )}
          </>
        )}
      </div>

      {reportingWitzId && (
        <ReportDialog
          witzId={reportingWitzId}
          onClose={() => setReportingWitzId(null)}
        />
      )}
    </AppLayout>
  );
}
