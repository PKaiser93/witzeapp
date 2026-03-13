'use client';
import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AppLayout from '@/components/AppLayout';
import { fetchWithAuth } from '@/lib/fetchWithAuth';
import { useAuth } from '@/context/AuthContext';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

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

interface PublicProfile {
  id: number;
  username: string;
  bio: string;
  role: string;
  rang: string;
  memberSince: string;
  witzeCount: number;
  likesReceived: number;
  currentStreak: number;
  longestStreak: number;
  isBlueVerified: boolean;
  witze: {
    id: number;
    text: string;
    likes: number;
    createdAt: string;
    isEdited: boolean;
    kategorie?: { name: string; emoji: string };
  }[];
}

export default function PublicProfilePage() {
  const { username } = useParams<{ username: string }>();
  const router = useRouter();
  const { user, accessToken, refreshToken } = useAuth();

  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [badges, setBadges] = useState<
    { emoji: string; label: string; description: string }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);

  const isLoggedIn = !!user;

  const loadProfile = useCallback(async () => {
    if (!username) return;
    try {
      const [profileRes, badgesRes] = await Promise.all([
        fetch(`${API_URL}/profile/user/${username}`),
        fetch(`${API_URL}/profile/user/${username}/badges`),
      ]);

      if (profileRes.status === 404) {
        setNotFound(true);
        return;
      }

      if (profileRes.ok) {
        const data: PublicProfile = await profileRes.json();
        setProfile(data);

        if (isLoggedIn && accessToken) {
          // eigenes Profil?
          setIsOwnProfile(user?.username === data.username);

          // Follow-Status
          fetchWithAuth(
            `${API_URL}/follow/${data.id}/status`,
            accessToken,
            refreshToken
          )
            .then((r) => (r.ok ? r.json() : null))
            .then((d) => d && setIsFollowing(d.following))
            .catch(() => {});

          // Follow-Counts
          fetchWithAuth(
            `${API_URL}/follow/${data.id}/counts`,
            accessToken,
            refreshToken
          )
            .then((r) => (r.ok ? r.json() : null))
            .then((d) => d && setFollowerCount(d.followers ?? 0))
            .catch(() => {});
        } else {
          setIsOwnProfile(false);
        }
      }

      if (badgesRes.ok) {
        setBadges(await badgesRes.json());
      }
    } catch {
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  }, [username, isLoggedIn, accessToken, refreshToken, user?.username]);

  useEffect(() => {
    setLoading(true);
    setNotFound(false);
    loadProfile();
  }, [loadProfile]);

  const toggleFollow = async () => {
    if (!isLoggedIn || !accessToken) {
      router.push('/login');
      return;
    }
    if (!profile) return;
    setFollowLoading(true);
    try {
      const res = await fetchWithAuth(
        `${API_URL}/follow/${profile.id}`,
        accessToken,
        refreshToken,
        {
          method: 'POST',
        }
      );
      if (res.ok) {
        const data = await res.json();
        setIsFollowing(data.following);
        setFollowerCount((prev) => (data.following ? prev + 1 : prev - 1));
      }
    } finally {
      setFollowLoading(false);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin w-8 h-8 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full" />
        </div>
      </AppLayout>
    );
  }

  if (notFound || !profile) {
    return (
      <AppLayout>
        <div className="text-center py-20">
          <span className="text-5xl block mb-4">👤</span>
          <h1 className="text-2xl font-bold text-white mb-2">
            User nicht gefunden
          </h1>
          <p className="text-gray-400 mb-6">@{username} existiert nicht.</p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-all"
          >
            Zurück zur App
          </button>
        </div>
      </AppLayout>
    );
  }

  const badge = ROLE_CONFIG[profile.role] ?? ROLE_CONFIG.USER;

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-800/50 rounded-3xl overflow-hidden">
          <div className="h-32 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600" />

          <div className="px-6 pb-6">
            <div className="flex items-end justify-between -mt-10 mb-4">
              <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl border-4 border-gray-900 flex items-center justify-center shadow-xl">
                <span className="text-3xl font-black text-white">
                  {profile.username.charAt(0).toUpperCase()}
                </span>
              </div>

              {/* Follow-Button */}
              {isLoggedIn && !isOwnProfile && (
                <button
                  onClick={toggleFollow}
                  disabled={followLoading}
                  className={`mb-1 px-5 py-2 rounded-xl text-sm font-bold transition-all border disabled:opacity-50 ${
                    isFollowing
                      ? 'bg-gray-800/80 hover:bg-red-500/20 border-gray-700/50 hover:border-red-500/30 text-gray-300 hover:text-red-300'
                      : 'bg-indigo-600 hover:bg-indigo-500 border-indigo-500/50 text-white'
                  }`}
                >
                  {followLoading ? (
                    <span className="flex items-center gap-2">
                      <span className="animate-spin w-3 h-3 border-2 border-current/30 border-t-current rounded-full" />
                      ...
                    </span>
                  ) : isFollowing ? (
                    '✓ Gefolgt'
                  ) : (
                    '+ Folgen'
                  )}
                </button>
              )}

              {/* Eigenes Profil */}
              {isOwnProfile && (
                <button
                  onClick={() => router.push('/profil')}
                  className="mb-1 px-5 py-2 rounded-xl text-sm font-bold bg-gray-800/80 hover:bg-gray-700/80 border border-gray-700/50 text-gray-300 hover:text-white transition-all"
                >
                  ✏️ Profil bearbeiten
                </button>
              )}
            </div>

            <div className="flex items-center gap-3 mb-1 flex-wrap">
              <h1 className="text-2xl font-black text-white">
                @{profile.username}
              </h1>
              {profile.isBlueVerified && (
                <svg
                  title="Verifizierter Account"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-6 h-6 text-blue-500"
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
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-300 border border-yellow-500/30">
                {profile.rang}
              </span>
            </div>

            {profile.bio && (
              <p className="text-gray-300 text-sm mt-2">{profile.bio}</p>
            )}

            <p className="text-gray-600 text-xs mt-2">
              Dabei seit{' '}
              {new Date(profile.memberSince).toLocaleDateString('de-DE', {
                month: 'long',
                year: 'numeric',
              })}
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 border-t border-gray-800/50">
            {[
              { label: 'Witze', value: profile.witzeCount },
              { label: 'Likes', value: profile.likesReceived },
              { label: 'Follower', value: followerCount },
              { label: 'Streak', value: `🔥 ${profile.currentStreak}` },
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
        </div>

        {/* Badges */}
        {badges.length > 0 && (
          <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-800/50 rounded-3xl p-6">
            <h2 className="text-lg font-black text-white mb-4">🏅 Badges</h2>
            <div className="flex flex-wrap gap-2">
              {badges.map((b) => (
                <div
                  key={b.label}
                  title={b.description}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-800/80 border border-gray-700/50 rounded-xl text-sm"
                >
                  <span>{b.emoji}</span>
                  <span className="text-gray-300">{b.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Witze */}
        <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-800/50 rounded-3xl p-6">
          <h2 className="text-lg font-black text-white mb-4">
            📝 Witze von @{profile.username}
          </h2>
          {profile.witze.length === 0 ? (
            <div className="text-center py-8">
              <span className="text-4xl block mb-3">😶</span>
              <p className="text-gray-500">Noch keine Witze gepostet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {profile.witze.map((w) => (
                <div
                  key={w.id}
                  onClick={() => router.push(`/witze/${w.id}`)}
                  className="p-4 bg-gray-800/50 hover:bg-gray-800/80 border border-gray-700/50 rounded-2xl transition-all cursor-pointer"
                >
                  <p className="text-gray-100 leading-relaxed mb-2">
                    "{w.text}"
                  </p>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    {w.kategorie && (
                      <span className="text-indigo-400">
                        {w.kategorie.emoji} {w.kategorie.name}
                      </span>
                    )}
                    {w.isEdited && (
                      <span className="text-yellow-400/70">✏️ Bearbeitet</span>
                    )}
                    <span>
                      {new Date(w.createdAt).toLocaleDateString('de-DE', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                    <span className="ml-auto text-indigo-400 font-bold">
                      ❤️ {w.likes}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
