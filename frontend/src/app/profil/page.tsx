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
  id: number;
  witze: WitzItem[];
  likesReceived: number;
  rang: string;
  username: string;
  email: string;
  role: string;
  bio: string;
  currentStreak: number;
  longestStreak: number;
  isBlueVerified: boolean; // ← NEU
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
  const [application, setApplication] = useState<any>(null);
  const [applying, setApplying] = useState(false);
  const [applyMessage, setApplyMessage] = useState('');
  const [followCounts, setFollowCounts] = useState({
    followers: 0,
    following: 0,
  });
  const [settingsOpen, setSettingsOpen] = useState(false);

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
        const errData = await res.json();
        if (
          errData?.message === 'Bitte bestätige zuerst deine E-Mail-Adresse'
        ) {
          router.push('/verify-pending');
          return;
        }
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

      // Verified-Bewerbung laden
      fetch(`${API_URL}/verified-application/me`, { headers: getAuthHeader() })
        .then((r) => (r.ok ? r.json() : null))
        .then(setApplication)
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

  // REST der Funktionen unverändert...
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

  const exportData = async () => {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_URL}/profile/export`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'witzeapp-export.json';
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const username = profile?.username ?? '';
  const badge = ROLE_CONFIG[profile?.role ?? 'USER'] ?? ROLE_CONFIG.USER;

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Profil-Card */}
        <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-800/50 rounded-3xl overflow-hidden">
          <div className="h-32 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600" />
          <div className="px-6 pb-6">
            <div className="flex items-end justify-between -mt-10 mb-4">
              <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl border-4 border-gray-900 flex items-center justify-center shadow-xl">
                <span className="text-3xl font-black text-white">
                  {username.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="relative mb-1">
                <button
                  onClick={() => setSettingsOpen((p) => !p)}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-800/80 hover:bg-gray-700/80 border border-gray-700/50 text-gray-300 hover:text-white rounded-xl transition-all text-sm font-medium"
                >
                  ⚙️ Einstellungen
                  <span className="text-xs text-gray-500">▾</span>
                </button>
                {settingsOpen && (
                  <div className="absolute right-0 top-11 bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl w-52 py-1 z-50">
                    <button
                      onClick={() => {
                        setShowUsernameModal(true);
                        setSettingsOpen(false);
                      }}
                      className="w-full text-left px-4 py-3 text-gray-300 hover:text-white hover:bg-gray-800/50 text-sm transition-all"
                    >
                      ✏️ Username ändern
                    </button>
                    <button
                      onClick={() => {
                        setShowPasswordModal(true);
                        setSettingsOpen(false);
                      }}
                      className="w-full text-left px-4 py-3 text-gray-300 hover:text-white hover:bg-gray-800/50 text-sm transition-all"
                    >
                      🔒 Passwort ändern
                    </button>
                    <button
                      onClick={() => {
                        exportData();
                        setSettingsOpen(false);
                      }}
                      className="w-full text-left px-4 py-3 text-gray-300 hover:text-white hover:bg-gray-800/50 text-sm transition-all"
                    >
                      📦 Daten exportieren
                    </button>
                    {feature_delete_account && (
                      <>
                        <hr className="border-gray-800/50 my-1" />
                        <button
                          onClick={() => {
                            setShowDeleteModal(true);
                            setSettingsOpen(false);
                          }}
                          className="w-full text-left px-4 py-3 text-red-400 hover:text-red-300 hover:bg-gray-800/50 text-sm transition-all"
                        >
                          🗑️ Account löschen
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Name + Rolle */}
            <div className="flex items-center gap-3 mb-1 flex-wrap">
              <h1 className="text-2xl font-black text-white">@{username}</h1>
              {/* Blauer Haken neben Username */}
              {profile?.isBlueVerified && (
                <svg
                  title="Verifizierter Account"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-6 h-6 text-blue-500 inline-block"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.603 3.799A4.49 4.49 0 0112 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 013.498 1.307 4.491 4.491 0 011.307 3.497A4.49 4.49 0 0121.75 12a4.49 4.49 0 01-1.549 3.397 4.491 4.491 0 01-1.307 3.497 4.491 4.491 0 01-3.497 1.307A4.49 4.49 0 0112 21.75a4.49 4.49 0 01-3.397-1.549 4.491 4.491 0 01-3.497-1.307 4.491 4.491 0 01-1.307-3.497A4.49 4.49 0 012.25 12a4.49 4.49 0 011.549-3.397 4.491 4.491 0 011.307-3.497 4.491 4.491 0 013.497-1.307zm7.007 6.387a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
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

          {/* Stats */}
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
            ))}
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
        </div>

        {/* Verified Badge Bewerbung */}
        {profile?.isBlueVerified ? (
          <div className="flex items-center gap-3 p-4 bg-blue-500/10 border border-blue-500/30 rounded-2xl">
            <span className="text-2xl">✅</span>
            <div>
              <p className="font-bold text-blue-300">Verifizierter Account</p>
              <p className="text-sm text-blue-400/70">
                Du hast den blauen Haken erhalten
              </p>
            </div>
          </div>
        ) : badges.some((b) => b.key === 'meister') ? (
          <div className="p-4 bg-gray-900/80 border border-gray-800/50 rounded-2xl">
            <h3 className="font-bold text-white mb-2">🔵 Verified werden</h3>
            {!application && (
              <>
                <p className="text-sm text-gray-400 mb-3">
                  Als Meister kannst du dich für den blauen Haken bewerben.
                </p>
                <textarea
                  value={applyMessage}
                  onChange={(e) => setApplyMessage(e.target.value)}
                  placeholder="Warum möchtest du verifiziert werden? (optional)"
                  className="w-full bg-gray-800/50 border border-gray-700/50 rounded-xl p-3 text-sm text-white resize-none placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 mb-2"
                  rows={3}
                />
                <button
                  onClick={async () => {
                    setApplying(true);
                    const token = localStorage.getItem('token');
                    const res = await fetch(`${API_URL}/verified-application`, {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                      },
                      body: JSON.stringify({ message: applyMessage }),
                    });
                    if (res.ok) setApplication(await res.json());
                    setApplying(false);
                  }}
                  disabled={applying}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-bold rounded-xl transition-all"
                >
                  {applying ? 'Wird eingereicht...' : 'Jetzt bewerben'}
                </button>
              </>
            )}
            {application?.status === 'PENDING' && (
              <div className="flex items-center gap-3">
                <span className="text-xl">⏳</span>
                <div className="flex-1">
                  <p className="font-medium text-yellow-300">
                    Bewerbung ausstehend
                  </p>
                  <p className="text-xs text-gray-500">
                    Eingereicht am{' '}
                    {new Date(application.createdAt).toLocaleDateString(
                      'de-DE'
                    )}
                  </p>
                </div>
                <button
                  onClick={async () => {
                    const token = localStorage.getItem('token');
                    await fetch(`${API_URL}/verified-application/me`, {
                      method: 'DELETE',
                      headers: { Authorization: `Bearer ${token}` },
                    });
                    setApplication(null);
                  }}
                  className="text-red-400 text-sm hover:underline"
                >
                  Zurückziehen
                </button>
              </div>
            )}
            {application?.status === 'REJECTED' && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3">
                <p className="font-medium text-red-300">
                  ❌ Bewerbung abgelehnt
                </p>
                {application.adminNote && (
                  <p className="text-sm text-red-400/80 mt-1">
                    Grund: {application.adminNote}
                  </p>
                )}
                <button
                  onClick={() => setApplication(null)}
                  className="mt-2 text-sm text-blue-400 hover:underline"
                >
                  Erneut bewerben
                </button>
              </div>
            )}
          </div>
        ) : null}

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
