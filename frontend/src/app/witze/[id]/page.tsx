'use client';
import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AppLayout from '@/components/AppLayout';
import BlueCheckmark from '@/components/BlueCheckmark';
import ReportDialog from '@/components/ReportDialog';
import { useAuth } from '@/context/AuthContext';

interface Comment {
  id: number;
  text: string;
  createdAt: string;
  author: { username: string; isBlueVerified?: boolean };
}

interface WitzDetail {
  id: number;
  text: string;
  likes: number;
  userLiked: boolean;
  createdAt: string;
  isEdited: boolean;
  author: { username: string; isBlueVerified?: boolean };
  kategorie?: { name: string; emoji: string };
  likerNames?: string[];
}

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

export default function WitzDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { accessToken, user, refreshToken } = useAuth();

  const [witz, setWitz] = useState<WitzDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [likeError, setLikeError] = useState<string | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);

  const id = params?.id ? parseInt(params.id as string, 10) : 0;
  const isLoggedIn = !!user;
  const currentUsername = user?.username ?? null;

  const buildAuthHeader = (token: string | null) =>
    token ? { Authorization: `Bearer ${token}` } : {};

  const loadComments = useCallback(async () => {
    const res = await fetch(`${API_URL}/witze/${id}/comments`, {
      headers: buildAuthHeader(accessToken),
    });
    if (res.ok) setComments(await res.json());
  }, [id, accessToken]);

  const loadWitz = useCallback(async () => {
    if (!id || id <= 0) {
      setError('Ungültige Witz-ID');
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError('');
      const res = await fetch(`${API_URL}/witze/${id}`, {
        headers: buildAuthHeader(accessToken),
      });
      if (res.status === 404) {
        setError('Witz nicht gefunden');
        return;
      }
      if (!res.ok) {
        setError('Fehler beim Laden. Versuche es erneut.');
        return;
      }
      setWitz(await res.json());
    } catch {
      setError('Fehler beim Laden. Versuche es erneut.');
    } finally {
      setLoading(false);
    }
  }, [id, accessToken]);

  const toggleLike = useCallback(async () => {
    if (!witz) return;
    if (!isLoggedIn) {
      router.push('/login');
      return;
    }
    try {
      let tokenToUse = accessToken;
      let res = await fetch(`${API_URL}/witze/${id}/like`, {
        method: 'PATCH',
        headers: buildAuthHeader(tokenToUse),
      });
      if (res.status === 401 && refreshToken) {
        const newToken = await refreshToken();
        if (!newToken) {
          router.push('/login');
          return;
        }
        res = await fetch(`${API_URL}/witze/${id}/like`, {
          method: 'PATCH',
          headers: buildAuthHeader(newToken),
        });
      }
      if (res.ok) await loadWitz();
    } catch {
      setLikeError('Like konnte nicht gespeichert werden.');
      setTimeout(() => setLikeError(null), 4000);
    }
  }, [id, witz, router, accessToken, refreshToken, loadWitz, isLoggedIn]);

  const postComment = async () => {
    if (!commentText.trim()) return;
    if (!isLoggedIn) {
      router.push('/login');
      return;
    }
    setCommentLoading(true);
    const res = await fetch(`${API_URL}/witze/${id}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...buildAuthHeader(accessToken),
      },
      body: JSON.stringify({ text: commentText.trim() }),
    });
    if (res.ok) {
      setCommentText('');
      await loadComments();
    }
    setCommentLoading(false);
  };

  const deleteComment = async (commentId: number) => {
    if (!isLoggedIn) {
      router.push('/login');
      return;
    }
    const res = await fetch(`${API_URL}/witze/${id}/comments/${commentId}`, {
      method: 'DELETE',
      headers: buildAuthHeader(accessToken),
    });
    if (res.ok) await loadComments();
  };

  const handleShare = () => {
    const url = `${window.location.origin}/witze/${id}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  useEffect(() => {
    loadWitz();
    loadComments();
  }, [loadWitz, loadComments]);

  if (loading) {
    return (
      <AppLayout>
        <div className="max-w-2xl mx-auto py-20 flex flex-col items-center gap-4">
          <div className="animate-spin w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full" />
          <p className="text-gray-400">Witz wird geladen...</p>
        </div>
      </AppLayout>
    );
  }

  if (error || !witz) {
    return (
      <AppLayout>
        <div className="max-w-2xl mx-auto py-20 text-center">
          <span className="text-6xl block mb-6">😢</span>
          <h1 className="text-2xl font-black text-white mb-4">
            {error || 'Witz nicht verfügbar'}
          </h1>
          <button
            onClick={() => router.push('/')}
            className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all"
          >
            ← Zurück zum Forum
          </button>
        </div>
      </AppLayout>
    );
  }

  const isDeletedAuthor = witz.author.username === 'Gelöschter Benutzer';

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto space-y-4 py-8 px-4">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm"
        >
          ← Zurück
        </button>

        <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-800/50 rounded-3xl p-6 shadow-2xl">
          <div className="flex items-center gap-3 mb-5">
            <div
              onClick={() =>
                !isDeletedAuthor &&
                router.push(`/profil/${witz.author.username}`)
              }
              className={`w-11 h-11 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0 ${
                isDeletedAuthor
                  ? 'cursor-default'
                  : 'cursor-pointer hover:scale-105'
              } transition-transform`}
            >
              <span className="text-white font-black">
                {witz.author.username.charAt(0).toUpperCase()}
              </span>
            </div>

            <div className="flex-1">
              <div
                onClick={() =>
                  !isDeletedAuthor &&
                  router.push(`/profil/${witz.author.username}`)
                }
                className={
                  isDeletedAuthor
                    ? 'flex items-center gap-1 text-gray-400'
                    : 'flex items-center gap-1 cursor-pointer hover:text-indigo-400 transition-colors w-fit'
                }
              >
                <span className="text-white text-sm font-black">
                  @{witz.author.username}
                </span>
                {witz.author.isBlueVerified && <BlueCheckmark />}
              </div>

              <p className="text-gray-500 text-xs mt-0.5">
                {new Date(witz.createdAt).toLocaleString('de-DE', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
                {witz.isEdited && (
                  <span className="ml-2 text-yellow-400/70">✏️ Bearbeitet</span>
                )}
              </p>
            </div>
            {witz.kategorie && (
              <span className="px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 rounded-full text-xs font-medium flex-shrink-0">
                {witz.kategorie.emoji} {witz.kategorie.name}
              </span>
            )}
          </div>

          <div className="bg-gray-800/30 rounded-2xl p-5 mb-5 border border-gray-700/30">
            <p className="text-white text-xl leading-relaxed font-medium">
              "{witz.text}"
            </p>
          </div>

          {witz.likes > 0 && witz.likerNames && witz.likerNames.length > 0 && (
            <p className="text-gray-500 text-xs mb-4">
              <span className="text-gray-400">
                {witz.likerNames.slice(0, 2).map((name, i) => (
                  <span key={name}>
                    {i > 0 && ', '}
                    <span
                      onClick={() => router.push(`/profil/${name}`)}
                      className="hover:text-indigo-400 cursor-pointer transition-colors"
                    >
                      @{name}
                    </span>
                  </span>
                ))}
                {witz.likes > 2 && ` und ${witz.likes - 2} weitere`}
              </span>{' '}
              {witz.likes > 1 ? 'haben' : 'hat'} ein ❤️ gegeben
            </p>
          )}

          <div className="border-t border-gray-800 mb-4" />

          <div className="flex items-center gap-2">
            <button
              onClick={toggleLike}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all text-sm font-medium ${
                witz.userLiked
                  ? 'text-red-400 bg-red-500/10 border border-red-500/30'
                  : 'text-gray-500 hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/20 border border-transparent'
              }`}
            >
              ♥ <span>{witz.likes}</span>
            </button>

            <button
              onClick={() =>
                document
                  .getElementById('kommentare')
                  ?.scrollIntoView({ behavior: 'smooth' })
              }
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium text-gray-500 hover:text-white hover:bg-gray-800/50 border border-transparent hover:border-gray-700/50 transition-all"
            >
              💬 <span>{comments.length}</span>
            </button>

            <button
              onClick={() => setShowReportDialog(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium border transition-all text-gray-500 hover:text-red-300 hover:bg-red-500/10 hover:border-red-500/20 border-transparent"
            >
              🚩 Melden
            </button>

            <button
              onClick={handleShare}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium border transition-all ${
                copied
                  ? 'text-green-400 bg-green-500/10 border-green-500/30'
                  : 'text-gray-500 hover:text-indigo-400 hover:bg-indigo-500/10 border-transparent hover:border-indigo-500/20'
              }`}
            >
              {copied ? '✓ Kopiert' : '🔗 Teilen'}
            </button>

            {likeError && (
              <p className="text-red-400 text-xs ml-2">{likeError}</p>
            )}
          </div>
        </div>

        <div
          id="kommentare"
          className="bg-gray-900/80 backdrop-blur-xl border border-gray-800/50 rounded-3xl p-6"
        >
          <h2 className="text-white font-black text-lg mb-5">
            💬 Kommentare
            <span className="ml-2 px-2 py-0.5 bg-gray-800 rounded-lg text-sm text-gray-400 font-normal">
              {comments.length}
            </span>
          </h2>

          {isLoggedIn ? (
            <div className="flex gap-3 mb-6">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-white text-xs font-bold">
                  {(currentUsername ?? 'U').charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 flex gap-2">
                <input
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === 'Enter' && !e.shiftKey && postComment()
                  }
                  placeholder="Schreibe einen Kommentar..."
                  className="flex-1 px-4 py-2.5 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-sm"
                />
                <button
                  onClick={postComment}
                  disabled={!commentText.trim() || commentLoading}
                  className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all text-sm flex-shrink-0"
                >
                  {commentLoading ? '...' : '➤'}
                </button>
              </div>
            </div>
          ) : (
            <div className="mb-6 p-4 bg-gray-800/30 rounded-2xl border border-gray-700/30 text-center">
              <p className="text-gray-400 text-sm">
                <span
                  onClick={() => router.push('/login')}
                  className="text-indigo-400 hover:text-indigo-300 cursor-pointer font-medium"
                >
                  Einloggen
                </span>{' '}
                um zu kommentieren
              </p>
            </div>
          )}

          <div className="space-y-3">
            {comments.length === 0 && (
              <div className="text-center py-8">
                <span className="text-4xl block mb-2">💬</span>
                <p className="text-gray-500 text-sm">
                  Noch keine Kommentare – sei der Erste!
                </p>
              </div>
            )}
            {comments.map((c) => (
              <div
                key={c.id}
                className="group flex items-start gap-3 p-4 bg-gray-800/50 rounded-2xl border border-gray-700/50"
              >
                <div
                  onClick={() => router.push(`/profil/${c.author.username}`)}
                  className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0 cursor-pointer hover:scale-105 transition-transform"
                >
                  <span className="text-white text-xs font-bold">
                    {c.author.username.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <div
                      onClick={() =>
                        router.push(`/profil/${c.author.username}`)
                      }
                      className="flex items-center gap-1 cursor-pointer hover:text-indigo-400 transition-colors"
                    >
                      <span className="text-white text-sm font-semibold">
                        @{c.author.username}
                      </span>
                      {c.author.isBlueVerified && <BlueCheckmark size={3} />}
                    </div>
                    <span className="text-gray-500 text-xs flex-shrink-0">
                      {new Date(c.createdAt).toLocaleString('de-DE', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    {c.text}
                  </p>
                </div>
                {isLoggedIn && currentUsername === c.author.username && (
                  <button
                    onClick={() => deleteComment(c.id)}
                    className="text-gray-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0"
                    title="Löschen"
                  >
                    🗑️
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {showReportDialog && (
        <ReportDialog
          witzId={witz.id}
          onClose={() => setShowReportDialog(false)}
        />
      )}
    </AppLayout>
  );
}
