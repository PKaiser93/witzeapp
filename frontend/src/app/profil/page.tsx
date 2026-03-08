'use client';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/AppLayout';
import ChangePasswordModal from '@/components/ChangePasswordModal';
import DeleteAccountModal from '@/components/DeleteAccountModal';
import ChangeUsernameModal from '@/components/ChangeUsernameModal';
import { useAppConfig } from '@/context/AppConfigContext';
import BadgeList from '@/components/BadgeList';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

interface Badge {
  id: number;
  key: string;
  emoji: string;
  label: string;
  description: string;
  awardedAt: string;
}

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
  bio: string;
  currentStreak: number;
  longestStreak: number;
}

interface Warning {
  id: number;
  reason: string;
  createdAt: string;
  admin: { username: string };
}

const ROLE_CONFIG: Record<
  string,
  { label: string; emoji: string; color: string }
> = {
  ADMIN: {
    label: 'Admin',
    emoji: '🛡️',
    color: 'bg-red-500/20 text-red-300 border-red-500/30',
  },
  BETA: {
    label: 'Beta-User',
    emoji: '🧪',
    color: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  },
  MODERATOR: {
    label: 'Moderator',
    emoji: '⚖️',
    color: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  },
  USER: {
    label: 'User',
    emoji: '👤',
    color: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
  },
};

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export default function ProfilPage() {
  const router = useRouter();
  const { feature_delete_account } = useAppConfig();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editText, setEditText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [warnings, setWarnings] = useState<Warning[]>([]);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'witze' | 'verwarnungen'>('witze');
  const [showUsernameModal, setShowUsernameModal] = useState(false);
  const [editingBio, setEditingBio] = useState(false);
  const [bioText, setBioText] = useState('');
  const [badges, setBadges] = useState<Badge[]>([]);
  const [followCounts, setFollowCounts] = useState({
    followers: 0,
    following: 0,
  });

  const saveBio = async () => {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_URL}/profile/bio`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ bio: bioText }),
    });
    if (res.ok) {
      setEditingBio(false);
      setProfile((prev) => (prev ? { ...prev, bio: bioText } : prev));
    }
  };

  const loadProfile = useCallback(async () => {
    try {
      const [res, warningsRes] = await Promise.all([
        fetch(`${API_URL}/profile`, { headers: getAuthHeader() }),
        fetch(`${API_URL}/profile/warnings`, { headers: getAuthHeader() }),
      ]);
      if (res.status === 401) {
        localStorage.removeItem('token');
        router.push('/login');
        return;
      }
      if (res.ok) {
        const profileData = await res.json();
        setProfile(profileData);
        const token = localStorage.getItem('token');
        fetch(`${API_URL}/follow/${profileData.id}/counts`, {
          headers: { Authorization: `Bearer ${token}` },
        })
          .then((r) => r.json())
          .then(setFollowCounts)
          .catch(() => {});
      }
      if (warningsRes.ok) setWarnings(await warningsRes.json());
      fetch(`${API_URL}/profile/badges`, { headers: getAuthHeader() })
        .then((r) => r.json())
        .then(setBadges)
        .catch(() => {});
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
      setError('Fehler beim Speichern.');
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
      setError('Fehler beim Löschen.');
      setTimeout(() => setError(null), 4000);
      return;
    }
    setError(null);
    loadProfile();
  };

  const username = profile?.username ?? '';
  const badge = ROLE_CONFIG[profile?.role ?? 'USER'] ?? ROLE_CONFIG.USER;

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Cover + Avatar */}
        <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-800/50 rounded-3xl overflow-hidden">
          {/* Cover */}
          <div className="h-32 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600" />

          {/* Avatar + Info */}
          <div className="px-6 pb-6">
            <div className="flex items-end justify-between -mt-10 mb-4">
              <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl border-4 border-gray-900 flex items-center justify-center shadow-xl">
                <span className="text-3xl font-black text-white">
                  {username.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex gap-2 mb-1">
                <button
                  onClick={() => setShowPasswordModal(true)}
                  className="px-4 py-2 bg-gray-800/80 hover:bg-gray-700/80 border border-gray-700/50 text-gray-300 hover:text-white rounded-xl transition-all text-xs font-medium"
                >
                  🔒 Passwort
                </button>
                {feature_delete_account && (
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-300 rounded-xl transition-all text-xs font-medium"
                  >
                    🗑️ Account löschen
                  </button>
                )}
                <button
                  onClick={() => setShowUsernameModal(true)}
                  className="px-4 py-2 bg-gray-800/80 hover:bg-gray-700/80 border border-gray-700/50 text-gray-300 hover:text-white rounded-xl transition-all text-xs font-medium"
                >
                  ✏️ Username
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-black text-white">@{username}</h1>
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${badge.color}`}
              >
                {badge.emoji} {badge.label}
              </span>
              {warnings.length > 0 && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-300 border border-yellow-500/30">
                  ⚠️ {warnings.length} Verwarnungen
                </span>
              )}
            </div>
            <p className="text-gray-500 text-sm">{profile?.email}</p>
            {/* Bio */}
            <div className="mt-3">
              {editingBio ? (
                <div className="flex gap-2 items-start">
                  <textarea
                    value={bioText}
                    onChange={(e) => setBioText(e.target.value)}
                    maxLength={160}
                    rows={2}
                    className="flex-1 px-3 py-2 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/50 placeholder-gray-500"
                    placeholder="Beschreibe dich in max. 160 Zeichen..."
                    autoFocus
                  />
                  <div className="flex flex-col gap-1">
                    <button
                      onClick={saveBio}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg transition-all"
                    >
                      ✓
                    </button>
                    <button
                      onClick={() => {
                        setEditingBio(false);
                        setBioText(profile?.bio ?? '');
                      }}
                      className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-gray-300 text-xs rounded-lg transition-all"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => {
                    setEditingBio(true);
                    setBioText(profile?.bio ?? '');
                  }}
                  className="group flex items-start gap-2 cursor-pointer"
                >
                  <p
                    className={`text-sm ${profile?.bio ? 'text-gray-300' : 'text-gray-600 italic'}`}
                  >
                    {profile?.bio || 'Klicke um eine Bio hinzuzufügen...'}
                  </p>
                  <span className="text-gray-600 opacity-0 group-hover:opacity-100 transition-all text-xs">
                    ✏️
                  </span>
                </div>
              )}
              {editingBio && (
                <p className="text-gray-600 text-xs mt-1 text-right">
                  {bioText.length}/160
                </p>
              )}
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-4 border-t border-gray-800/50">
            {[
              { label: 'Witze', value: profile?.witze.length ?? 0 },
              { label: 'Likes', value: profile?.likesReceived ?? 0 },
              { label: 'Follower', value: followCounts.followers },
              { label: 'Rang', value: profile?.rang ?? '🥉 Neuling' },
            ].map((s, i) => (
              <div
                key={i}
                className={`py-4 text-center ${i < 3 ? 'border-r border-gray-800/50' : ''}`}
              >
                <p className="text-xl font-black text-white">{s.value}</p>
                <p className="text-gray-500 text-xs mt-0.5">{s.label}</p>
              </div>
            ))}{' '}
          </div>

          {/* Streak Banner */}
          {(profile?.currentStreak ?? 0) > 0 && (
            <div className="flex items-center justify-between px-6 py-3 bg-orange-500/10 border-t border-orange-500/20">
              <div className="flex items-center gap-2">
                <span className="text-xl">🔥</span>
                <div>
                  <p className="text-orange-300 text-sm font-bold">
                    {profile?.currentStreak}{' '}
                    {profile?.currentStreak === 1 ? 'Tag' : 'Tage'} in Folge
                  </p>
                  <p className="text-orange-400/60 text-xs">
                    Längster Streak: {profile?.longestStreak}{' '}
                    {profile?.longestStreak === 1 ? 'Tag' : 'Tage'}
                  </p>
                </div>
              </div>
              <div className="flex gap-1">
                {Array.from({
                  length: Math.min(profile?.currentStreak ?? 0, 7),
                }).map((_, i) => (
                  <div
                    key={i}
                    className="w-3 h-3 bg-orange-500 rounded-full opacity-80"
                  />
                ))}
              </div>
            </div>
          )}
        </div>{' '}
        {/* ← Ende der Profil-Card hier */}
        {/* Tabs */}
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('witze')}
            className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all border ${
              activeTab === 'witze'
                ? 'bg-indigo-600/80 text-white border-indigo-500/50'
                : 'text-gray-400 hover:text-white bg-gray-900/80 border-gray-800/50'
            }`}
          >
            📝 Meine Witze ({profile?.witze.length ?? 0})
          </button>
          {warnings.length > 0 && (
            <button
              onClick={() => setActiveTab('verwarnungen')}
              className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all border ${
                activeTab === 'verwarnungen'
                  ? 'bg-yellow-600/80 text-white border-yellow-500/50'
                  : 'text-gray-400 hover:text-white bg-gray-900/80 border-gray-800/50'
              }`}
            >
              ⚠️ Verwarnungen ({warnings.length})
            </button>
          )}
        </div>
        {error && <p className="text-red-400 text-sm px-1">{error}</p>}
        {/* Badges */}
        <BadgeList badges={badges} />
        {/* Tab: Witze */}
        {activeTab === 'witze' && (
          <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-800/50 rounded-3xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-black text-white">Meine Witze</h2>
              <button
                onClick={() => router.push('/post')}
                className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-xl text-sm transition-all"
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
                <span className="text-5xl block mb-4">📝</span>
                <p className="text-gray-400 mb-2">Noch keine Witze</p>
                <button
                  onClick={() => router.push('/post')}
                  className="mt-4 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-sm transition-all"
                >
                  Ersten Witz posten
                </button>
              </div>
            )}

            <div className="space-y-3">
              {profile?.witze.map((w) => (
                <div
                  key={w.id}
                  className="group p-4 bg-gray-800/50 hover:bg-gray-800/80 border border-gray-700/50 rounded-2xl transition-all"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      {editingId === w.id ? (
                        <div className="space-y-3">
                          <textarea
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            className="w-full p-3 bg-gray-900 border border-gray-600 rounded-xl text-white resize-vertical min-h-[100px] focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                            autoFocus
                          />
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={() => {
                                setEditingId(null);
                                setEditText('');
                              }}
                              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-xl text-sm transition-all"
                            >
                              Abbrechen
                            </button>
                            <button
                              onClick={saveEdit}
                              disabled={!editText.trim()}
                              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-bold rounded-xl text-sm transition-all"
                            >
                              Speichern
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <p className="text-gray-100 leading-relaxed mb-2">
                            "{w.text}"
                          </p>
                          <div className="flex items-center gap-3 text-xs text-gray-500">
                            {w.isEdited && w.updatedAt && (
                              <span className="text-yellow-400/70">
                                ✏️ Bearbeitet
                              </span>
                            )}
                            <span>
                              {new Date(w.createdAt).toLocaleDateString(
                                'de-DE',
                                {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric',
                                }
                              )}
                            </span>
                            <span className="ml-auto text-indigo-400 font-bold">
                              ❤️ {w.likes ?? 0}
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                    {!editingId && (
                      <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-all">
                        <button
                          onClick={() => {
                            setEditingId(w.id);
                            setEditText(w.text);
                          }}
                          className="p-2 bg-blue-500/20 hover:bg-blue-500/40 border border-blue-500/30 text-blue-300 rounded-lg text-sm transition-all"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => deleteWitz(w.id)}
                          className="p-2 bg-red-500/20 hover:bg-red-500/40 border border-red-500/30 text-red-300 rounded-lg text-sm transition-all"
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
        )}
        {/* Tab: Verwarnungen */}
        {activeTab === 'verwarnungen' && (
          <div className="bg-yellow-500/5 backdrop-blur-xl border border-yellow-500/20 rounded-3xl p-6">
            <h2 className="text-lg font-black text-yellow-300 mb-4">
              ⚠️ Verwarnungen
            </h2>
            <div className="space-y-3">
              {warnings.map((w) => (
                <div
                  key={w.id}
                  className="p-4 bg-yellow-500/10 rounded-2xl border border-yellow-500/20"
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
      </div>

      {showUsernameModal && (
        <ChangeUsernameModal
          currentUsername={username}
          onClose={() => setShowUsernameModal(false)}
          onSuccess={(newUsername) =>
            setProfile((prev) =>
              prev ? { ...prev, username: newUsername } : prev
            )
          }
        />
      )}
      {showPasswordModal && (
        <ChangePasswordModal onClose={() => setShowPasswordModal(false)} />
      )}
      {showDeleteModal && (
        <DeleteAccountModal onClose={() => setShowDeleteModal(false)} />
      )}
    </AppLayout>
  );
}
