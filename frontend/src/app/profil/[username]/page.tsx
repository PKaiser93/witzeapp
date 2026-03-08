'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AppLayout from '@/components/AppLayout';
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

interface PublicWitz {
  id: number;
  text: string;
  likes: number;
  createdAt: string;
  isEdited: boolean;
  kategorie?: { name: string; emoji: string } | null;
}

interface PublicProfile {
  username: string;
  bio: string;
  role: string;
  rang: string;
  memberSince: string;
  witzeCount: number;
  likesReceived: number;
  witze: PublicWitz[];
  id: number;
  currentStreak: number;
  longestStreak: number;
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

export default function PublicProfilePage() {
  const params = useParams();
  const router = useRouter();
  const username = params?.username as string;
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [followStatus, setFollowStatus] = useState(false);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [followCounts, setFollowCounts] = useState({
    followers: 0,
    following: 0,
  });
  const [followLoading, setFollowLoading] = useState(false);
  const [myUsername] = useState(() =>
    typeof window !== 'undefined' ? localStorage.getItem('username') : null
  );
  const [isLoggedIn] = useState(() =>
    typeof window !== 'undefined' ? !!localStorage.getItem('token') : false
  );

  const toggleFollow = async () => {
    if (!isLoggedIn) {
      router.push('/login');
      return;
    }
    setFollowLoading(true);
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_URL}/follow/${profile.id}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const data = await res.json();
      setFollowStatus(data.following);
      setFollowCounts((prev) => ({
        ...prev,
        followers: data.following ? prev.followers + 1 : prev.followers - 1,
      }));
    }
    setFollowLoading(false);
  };

  useEffect(() => {
    const myUsername = localStorage.getItem('username');
    if (myUsername && myUsername.toLowerCase() === username?.toLowerCase()) {
      router.push('/profil');
      return;
    }

    fetch(`${API_URL}/profile/user/${username}`)
      .then((res) => {
        if (res.status === 404) {
          setNotFound(true);
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (!data) return;
        setProfile(data);

        fetch(`${API_URL}/profile/user/${data.username}/badges`)
          .then((r) => r.json())
          .then(setBadges)
          .catch(() => {});

        if (
          isLoggedIn &&
          myUsername?.toLowerCase() !== username?.toLowerCase()
        ) {
          const token = localStorage.getItem('token');
          Promise.all([
            fetch(`${API_URL}/follow/${data.id}/status`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
            fetch(`${API_URL}/follow/${data.id}/counts`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
          ]).then(async ([statusRes, countsRes]) => {
            if (statusRes.ok)
              setFollowStatus((await statusRes.json()).following);
            if (countsRes.ok) setFollowCounts(await countsRes.json());
          });
        }
      })
      .finally(() => setLoading(false));
  }, [username, router, isLoggedIn]);

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
          <span className="text-5xl block mb-4">😢</span>
          <h1 className="text-2xl font-black text-white mb-2">
            User nicht gefunden
          </h1>
          <button
            onClick={() => router.push('/')}
            className="mt-4 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-sm transition-all"
          >
            Zurück zum Forum
          </button>
        </div>
      </AppLayout>
    );
  }

  const badge = ROLE_CONFIG[profile.role] ?? ROLE_CONFIG.USER;

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Profil Card */}
        <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-800/50 rounded-3xl overflow-hidden">
          {/* Cover */}
          <div className="h-32 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600" />

          {/* Avatar + Info */}
          <div className="px-6 pb-6">
            <div className="flex items-end justify-between -mt-10 mb-4">
              <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl border-4 border-gray-900 flex items-center justify-center shadow-xl">
                <span className="text-3xl font-black text-white">
                  {profile.username.charAt(0).toUpperCase()}
                </span>
              </div>

              {/* Buttons rechts */}
              <div className="flex items-center gap-2 mb-1">
                {isLoggedIn &&
                  myUsername?.toLowerCase() !==
                    profile.username.toLowerCase() && (
                    <button
                      onClick={toggleFollow}
                      disabled={followLoading}
                      className={`px-4 py-2 rounded-xl transition-all text-xs font-bold border ${
                        followStatus
                          ? 'bg-indigo-600/80 text-white border-indigo-500/50'
                          : 'bg-gray-800/80 hover:bg-gray-700/80 border-gray-700/50 text-gray-300 hover:text-white'
                      } disabled:opacity-40`}
                    >
                      {followStatus ? '✓ Gefolgt' : '+ Folgen'}
                    </button>
                  )}
                <button
                  onClick={() => router.back()}
                  className="px-4 py-2 bg-gray-800/80 hover:bg-gray-700/80 border border-gray-700/50 text-gray-300 hover:text-white rounded-xl transition-all text-xs font-medium"
                >
                  ← Zurück
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-black text-white">
                @{profile.username}
              </h1>
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${badge.color}`}
              >
                {badge.emoji} {badge.label}
              </span>
            </div>

            {profile.bio && (
              <p className="text-gray-300 text-sm mt-1">{profile.bio}</p>
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
              { label: 'Follower', value: followCounts.followers },
              { label: 'Rang', value: profile.rang },
            ].map((s, i) => (
              <div
                key={i}
                className={`py-4 text-center ${i < 3 ? 'border-r border-gray-800/50' : ''}`}
              >
                <p className="text-xl font-black text-white">{s.value}</p>
                <p className="text-gray-500 text-xs mt-0.5">{s.label}</p>
              </div>
            ))}{' '}
            {/* ← diese Zeile fehlt wahrscheinlich */}
          </div>

          {/* Streak Banner */}
          {(profile.currentStreak ?? 0) > 0 && (
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

        {/* Badges */}
        <BadgeList badges={badges} />

        {/* Witze */}
        <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-800/50 rounded-3xl p-6">
          <h2 className="text-lg font-black text-white mb-4">
            📝 Witze von @{profile.username}
          </h2>

          {profile.witze.length === 0 ? (
            <div className="text-center py-8">
              <span className="text-4xl block mb-3">📝</span>
              <p className="text-gray-500 text-sm">Noch keine Witze gepostet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {profile.witze.map((w) => (
                <div
                  key={w.id}
                  onClick={() => router.push(`/witze/${w.id}`)}
                  className="p-4 bg-gray-800/50 hover:bg-gray-800/80 border border-gray-700/50 rounded-2xl cursor-pointer transition-all"
                >
                  <p className="text-gray-100 text-sm leading-relaxed mb-2">
                    "{w.text}"
                  </p>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    {w.kategorie && (
                      <span className="text-indigo-400">
                        {w.kategorie.emoji} {w.kategorie.name}
                      </span>
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
