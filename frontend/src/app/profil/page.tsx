'use client';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/AppLayout';
import ChangePasswordModal from '@/components/ChangePasswordModal';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

interface WitzItem {
  id: number;
  text: string;
  likes: number;
  createdAt: string;
  updatedAt?: string;
  isEdited: boolean;
}

interface ProfileData {
  witze: WitzItem[];
  likesReceived: number;
  rang: string;
  username: string;
  email: string;
  role: string;
}

interface Warning {
  id: number;
  reason: string;
  createdAt: string;
  admin: { username: string };
}

function getRoleBadge(role: string) {
  switch (role) {
    case 'ADMIN':
      return {
        label: 'Admin',
        emoji: '🛡️',
        color: 'bg-red-500/20 text-red-300 border-red-500/30',
      };
    case 'BETA':
      return {
        label: 'Beta-User',
        emoji: '🧪',
        color: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      };
    case 'MODERATOR':
      return {
        label: 'Moderator',
        emoji: '⚖️',
        color: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      };
    default:
      return {
        label: 'User',
        emoji: '👤',
        color: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
      };
  }
}

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export default function ProfilPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editText, setEditText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [warnings, setWarnings] = useState<Warning[]>([]);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const loadProfile = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/profile`, {
        headers: getAuthHeader(),
      });
      const warningsRes = await fetch(`${API_URL}/profile/warnings`, {
        headers: getAuthHeader(),
      });
      if (warningsRes.ok) setWarnings(await warningsRes.json());

      if (res.status === 401) {
        localStorage.removeItem('token');
        router.push('/login');
        return;
      }

      if (!res.ok) return;
      const data: ProfileData = await res.json();
      setProfile(data);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!localStorage.getItem('token')) {
      router.push('/login');
      return;
    }
    loadProfile();
  }, [loadProfile, router]);

  const saveEdit = async () => {
    if (!editingId || !editText.trim()) return;
    const res = await fetch(`${API_URL}/profile/witz/${editingId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ text: editText.trim() }),
    });
    if (!res.ok) {
      setError('Fehler beim Speichern. Bitte erneut versuchen.');
      return;
    }
    setError(null);
    setEditingId(null);
    setEditText('');
    loadProfile();
  };

  const deleteWitz = async (id: number) => {
    if (!confirm('Witz wirklich löschen?')) return;
    const res = await fetch(`${API_URL}/profile/witz/${id}`, {
      method: 'DELETE',
      headers: getAuthHeader(),
    });
    if (!res.ok) {
      setError('Fehler beim Löschen. Bitte erneut versuchen.');
      setTimeout(() => setError(null), 4000);
      return;
    }
    setError(null);
    loadProfile();
  };

  const username = profile?.username ?? '';
  const email = profile?.email ?? '';

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Profil Header */}
        <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-800/50 rounded-3xl p-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-2xl font-bold text-white">
                  {username.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h1 className="text-2xl font-black text-white mb-1">
                  @{username}
                </h1>
                <p className="text-gray-400 text-sm mb-2">{email}</p>
                {profile?.role &&
                  (() => {
                    const badge = getRoleBadge(profile.role);
                    return (
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${badge.color}`}
                      >
                        {badge.emoji} {badge.label}
                      </span>
                    );
                  })()}
              </div>
            </div>
            <button
              onClick={() => router.push('/')}
              className="px-6 py-2.5 bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700/50 text-gray-300 hover:text-white rounded-xl transition-all text-sm font-medium"
            >
              ← Zurück zur Home
            </button>
            <button
              onClick={() => setShowPasswordModal(true)}
              className="px-6 py-2.5 bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700/50 text-gray-300 hover:text-white rounded-xl transition-all text-sm font-medium"
            >
              🔒 Passwort ändern
            </button>
          </div>
        </div>

        {/* Statistik Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-6 text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <span className="text-2xl">📝</span>
            </div>
            <p className="text-3xl font-black text-white">
              {profile?.witze.length ?? 0}
            </p>
            <p className="text-gray-400 text-sm mt-1 uppercase tracking-wider font-medium">
              Witze gepostet
            </p>
          </div>

          <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-6 text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <span className="text-2xl">👍</span>
            </div>
            <p className="text-3xl font-black text-white">
              {profile?.likesReceived ?? 0}
            </p>
            <p className="text-gray-400 text-sm mt-1 uppercase tracking-wider font-medium">
              Likes erhalten
            </p>
          </div>

          <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-6 text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <span className="text-2xl">⭐</span>
            </div>
            <p className="text-xl font-black text-white">
              {profile?.rang ?? '🥉 Neuling'}
            </p>
            <p className="text-gray-400 text-sm mt-1 uppercase tracking-wider font-medium">
              Rang
            </p>
          </div>
        </div>

        {error && <p className="text-red-400 text-sm mb-4 px-1">{error}</p>}

        {warnings.length > 0 && (
          <div className="bg-red-500/10 backdrop-blur-xl border border-red-500/30 rounded-3xl p-6">
            <h2 className="text-xl font-black text-red-300 mb-4">
              ⚠️ Verwarnungen ({warnings.length})
            </h2>
            <div className="space-y-3">
              {warnings.map((w) => (
                <div
                  key={w.id}
                  className="p-4 bg-red-500/10 rounded-2xl border border-red-500/20"
                >
                  <p className="text-white text-sm font-medium mb-1">
                    {w.reason}
                  </p>
                  <p className="text-gray-500 text-xs">
                    von @{w.admin.username} •{' '}
                    {new Date(w.createdAt).toLocaleString('de-DE', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Meine Witze */}
        <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-800/50 rounded-3xl p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-black text-white">📝 Meine Witze</h2>
            <button
              onClick={() => router.push('/post')}
              className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-xl shadow-lg hover:shadow-indigo-500/25 transition-all text-sm"
            >
              ➕ Neuer Witz
            </button>
          </div>

          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin w-8 h-8 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full" />
            </div>
          )}

          {!loading && (profile?.witze.length ?? 0) === 0 && (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl text-gray-500">📝</span>
              </div>
              <p className="text-gray-400 text-lg mb-2">Noch keine Witze</p>
              <p className="text-gray-500 text-sm mb-6">
                Deine Witze erscheinen hier.
              </p>
              <button
                onClick={() => router.push('/post')}
                className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg hover:shadow-indigo-500/25 transition-all"
              >
                Ersten Witz posten
              </button>
            </div>
          )}

          <div className="space-y-3">
            {profile?.witze.map((w) => (
              <div
                key={w.id}
                className="group p-5 bg-gray-800/50 hover:bg-gray-750/50 border border-gray-700/50 rounded-2xl transition-all"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    {editingId === w.id ? (
                      <div className="space-y-3 p-3 bg-gray-900/50 border border-gray-600 rounded-xl">
                        <textarea
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          className="w-full p-3 bg-gray-800 border border-gray-600 rounded-xl text-white text-lg resize-vertical min-h-[100px] focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                          placeholder="Witz bearbeiten..."
                          autoFocus
                        />
                        <div className="flex gap-3 justify-end pt-2 border-t border-gray-700">
                          <button
                            onClick={() => {
                              setEditingId(null);
                              setEditText('');
                            }}
                            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-xl transition-all font-medium"
                          >
                            Abbrechen
                          </button>
                          <button
                            onClick={saveEdit}
                            disabled={!editText.trim()}
                            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-700 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-lg hover:shadow-indigo-500/25 transition-all"
                          >
                            Speichern
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <p className="text-gray-100 text-lg leading-relaxed mb-2">
                          "{w.text}"
                        </p>
                        {w.isEdited && w.updatedAt && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-yellow-500/20 text-yellow-300 text-xs font-medium rounded-full border border-yellow-500/30">
                            ✏️ Bearbeitet{' '}
                            {new Date(w.updatedAt).toLocaleString('de-DE', {
                              hour: '2-digit',
                              minute: '2-digit',
                              day: 'numeric',
                              month: 'short',
                            })}
                          </span>
                        )}
                      </>
                    )}

                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                      <span className="font-mono text-xs bg-gray-800 px-2 py-1 rounded">
                        #{w.id}
                      </span>
                      <span>•</span>
                      <span>
                        {new Date(w.createdAt).toLocaleDateString('de-DE', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      <div className="ml-auto flex items-center gap-1 text-indigo-400 font-bold">
                        <span>{w.likes ?? 0}</span> 👍
                      </div>
                    </div>
                  </div>

                  {!editingId && (
                    <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all ml-2">
                      <button
                        onClick={() => {
                          setEditingId(w.id);
                          setEditText(w.text);
                        }}
                        className="px-3 py-2 bg-blue-500/20 hover:bg-blue-500/40 border border-blue-500/40 text-blue-300 hover:text-blue-100 font-bold text-sm rounded-xl transition-all"
                        title="Bearbeiten"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => deleteWitz(w.id)}
                        className="px-3 py-2 bg-red-500/20 hover:bg-red-500/40 border border-red-500/40 text-red-300 hover:text-red-100 font-bold text-sm rounded-xl transition-all"
                        title="Löschen"
                      >
                        🗑️
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {showPasswordModal && (
        <ChangePasswordModal onClose={() => setShowPasswordModal(false)} />
      )}
    </AppLayout>
  );
}
