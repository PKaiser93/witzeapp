'use client';
import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import AppLayout from '@/components/AppLayout';

interface Comment {
  id: number;
  text: string;
  createdAt: string;
  author: { username: string };
}

interface WitzDetail {
  id: number;
  text: string;
  likes: number;
  userLiked: boolean;
  createdAt: string;
  isEdited: boolean;
  author: { username: string };
  kategorie?: { name: string; emoji: string };
  likerNames?: string[];
  comments?: Comment[];
}

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

export default function WitzDetail() {
  const params = useParams();
  const router = useRouter();
  const [witz, setWitz] = useState<WitzDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [likeError, setLikeError] = useState<string | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);

  const id = params?.id ? parseInt(params.id as string, 10) : 0;

  const loadComments = useCallback(async () => {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_URL}/witze/${id}/comments`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const data: Comment[] = await res.json();
      setComments(data);
    }
  }, [id]);

  const postComment = async () => {
    if (!commentText.trim()) return;
    setCommentLoading(true);
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_URL}/witze/${id}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
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
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_URL}/witze/${id}/comments/${commentId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) await loadComments();
  };

  // 🔒 Sicheres Laden
  const loadWitz = useCallback(async () => {
    if (!id || id <= 0) {
      setError('Ungültige Witz-ID');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token');

      if (!token) {
        router.push('/login');
        return;
      }

      const { data } = await axios.get(`${API_URL}/witze/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 5000, // 5s Timeout
      });

      setWitz(data);
    } catch (err: any) {
      console.error('Witz laden fehlgeschlagen:', err);
      setError(
        err.response?.status === 404
          ? 'Witz nicht gefunden'
          : 'Fehler beim Laden. Versuche es erneut.'
      );
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  // 🔒 Sicheres Toggelen
  const toggleLike = useCallback(async () => {
    if (!id || !witz) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      await axios.patch(
        `${API_URL}/witze/${id}/like`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 3000,
        }
      );
      await loadWitz();
    } catch (err: any) {
      setLikeError('Like konnte nicht gespeichert werden.');
      setTimeout(() => setLikeError(null), 4000);
    }
  }, [id, witz, router, loadWitz]);

  useEffect(() => {
    loadWitz();
    loadComments();
  }, [loadWitz, loadComments]);

  if (loading) {
    return (
      <AppLayout>
        <div className="max-w-2xl mx-auto py-20 text-center">
          <div className="animate-spin w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full mx-auto mb-4"></div>
          <p className="text-gray-400">Witz wird geladen...</p>
        </div>
      </AppLayout>
    );
  }

  if (error || !witz) {
    return (
      <AppLayout>
        <div className="max-w-2xl mx-auto py-20 text-center">
          <div className="w-20 h-20 bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl text-gray-500">😢</span>
          </div>
          <h1 className="text-2xl font-black text-white mb-2">
            {error || 'Witz nicht verfügbar'}
          </h1>
          <button
            onClick={() => router.push('/')}
            className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg transition-all"
          >
            Zurück zum Forum
          </button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto space-y-4 py-8">
        {/* Zurück Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
        >
          ← Zurück zum Forum
        </button>

        {/* Witz Card */}
        <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-800/50 rounded-3xl p-6 shadow-2xl">
          {/* Autor & Meta */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
              <span className="text-white text-sm font-bold">
                {witz.author.username.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <p className="text-white text-sm font-semibold">
                @{witz.author.username}
              </p>
              <p className="text-gray-500 text-xs">
                {new Date(witz.createdAt).toLocaleString('de-DE', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
                {witz.kategorie && (
                  <span className="ml-2 text-indigo-400">
                    {witz.kategorie.emoji} {witz.kategorie.name}
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Witz Text */}
          <p className="text-white text-xl leading-relaxed mb-5">
            "{witz.text}"
          </p>

          {/* Liker Anzeige */}
          {witz.likes > 0 && witz.likerNames && witz.likerNames.length > 0 && (
            <p className="text-gray-500 text-xs mb-3">
              <span className="text-gray-400">
                {witz.likerNames.slice(0, 2).join(', ')}
                {witz.likes > 2 ? ` und ${witz.likes - 2} weitere` : ''}
              </span>{' '}
              {witz.likerNames.length > 1 ? 'haben' : 'hat'} ein ❤️ gegeben
            </p>
          )}

          {/* Divider */}
          <div className="border-t border-gray-800 mb-3" />

          {/* Aktionen */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleLike}
              disabled={loading}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all text-sm font-medium ${
                witz.userLiked
                  ? 'text-red-400 bg-red-500/10 border border-red-500/30'
                  : 'text-gray-500 hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/20 border border-transparent'
              } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
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
          </div>

          {likeError && (
            <p className="text-red-400 text-xs mt-2">{likeError}</p>
          )}
        </div>

        {/* Kommentare */}
        <div
          id="kommentare"
          className="bg-gray-900/80 backdrop-blur-xl border border-gray-800/50 rounded-3xl p-6"
        >
          <h2 className="text-white font-bold text-lg mb-4">
            💬 Kommentare ({comments.length})
          </h2>

          {/* Kommentar schreiben */}
          <div className="flex gap-3 mb-6">
            <input
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={(e) =>
                e.key === 'Enter' && !e.shiftKey && postComment()
              }
              placeholder="Kommentar schreiben..."
              className="flex-1 px-4 py-2.5 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent transition-all text-sm"
            />
            <button
              onClick={postComment}
              disabled={!commentText.trim() || commentLoading}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all text-sm"
            >
              Senden
            </button>
          </div>

          {/* Kommentar Liste */}
          <div className="space-y-3">
            {comments.length === 0 && (
              <p className="text-gray-500 text-sm text-center py-4">
                Noch keine Kommentare
              </p>
            )}
            {comments.map((c) => (
              <div
                key={c.id}
                className="group flex items-start gap-3 p-4 bg-gray-800/50 rounded-2xl border border-gray-700/50"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs font-bold">
                    {c.author.username.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-white text-sm font-semibold">
                      @{c.author.username}
                    </span>
                    <span className="text-gray-500 text-xs">
                      {new Date(c.createdAt).toLocaleString('de-DE', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <p className="text-gray-300 text-sm mt-1">{c.text}</p>
                </div>
                <button
                  onClick={() => deleteComment(c.id)}
                  className="text-gray-600 hover:text-red-400 transition-colors text-xs opacity-0 group-hover:opacity-100 ml-1"
                  title="Löschen"
                >
                  🗑️
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
