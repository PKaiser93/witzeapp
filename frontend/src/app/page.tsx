'use client';
import { useEffect, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import AppLayout from '@/components/AppLayout';
import { useAppConfig } from '@/context/AppConfigContext';
import ReportModal from '@/components/ReportModal';
import WitzCard from '@/components/feed/WitzCard';
import WitzOfTheDayBanner from '@/components/feed/WitzOfTheDay';
import FeedFilters from '@/components/feed/FeedFilters';
import QuickPost from '@/components/feed/QuickPost';

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
  const { feature_likes, feature_comments, feature_report } = useAppConfig();

  const [witze, setWitze] = useState<Witz[]>([]);
  const [loading, setLoading] = useState(true);
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
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [reportingWitzId, setReportingWitzId] = useState<number | null>(null);

  const loadWitze = useCallback(async () => {
    setLoading(true);
    try {
      const kategorie = searchParams.get('kategorie');
      const params = new URLSearchParams();
      if (kategorie) params.set('kategorie', kategorie);
      if (search) params.set('search', search);
      if (sort !== 'new') params.set('sort', sort);
      const url = `${API_URL}/witze${params.toString() ? `?${params}` : ''}`;
      const res = await fetch(url, { headers: getAuthHeader() });
      if (!res.ok) return;
      setWitze(await res.json());
    } finally {
      setLoading(false);
    }
  }, [searchParams, search, sort]);

  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput), 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    setIsLoggedIn(!!localStorage.getItem('token'));
    loadWitze();
    fetch(`${API_URL}/witze/random`)
      .then((r) => r.json())
      .then(setWitzOfTheDay)
      .catch(() => {});
  }, [loadWitze]);

  const postWitz = async (kategorieId?: number | null) => {
    const text = newWitz.trim();
    if (!text) return;
    const res = await fetch(`${API_URL}/witze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
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

  const toggleComments = async (e: React.MouseEvent, witzId: number) => {
    e.stopPropagation();
    if (openComments === witzId) {
      setOpenComments(null);
      return;
    }
    const token = localStorage.getItem('token');
    const headers: Record<string, string> = {};
    if (token) headers.Authorization = `Bearer ${token}`;
    const res = await fetch(`${API_URL}/witze/${witzId}/comments`, { headers });
    if (res.ok) {
      const data = await res.json(); // ← erst awaiten
      setCommentsMap((prev) => ({ ...prev, [witzId]: data })); // ← dann setzen
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
      const res2 = await fetch(`${API_URL}/witze/${witzId}/comments`, {
        headers: { Authorization: `Bearer ${token}` },
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
        {/* Witz des Tages */}
        {witzOfTheDay && <WitzOfTheDayBanner witz={witzOfTheDay} />}

        {/* Quick Post */}
        <QuickPost
          isLoggedIn={isLoggedIn}
          value={newWitz}
          error={postError}
          onChange={setNewWitz}
          onPost={postWitz}
        />

        {/* Filter */}
        <FeedFilters
          searchInput={searchInput}
          sort={sort}
          onSearchChange={setSearchInput}
          onSearchClear={() => {
            setSearchInput('');
            setSearch('');
          }}
          onSortChange={setSort}
        />

        {/* Witze */}
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
        )}
      </div>

      {reportingWitzId && (
        <ReportModal
          witzId={reportingWitzId}
          onClose={() => setReportingWitzId(null)}
        />
      )}
    </AppLayout>
  );
}
