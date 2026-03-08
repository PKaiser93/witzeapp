'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/AppLayout';
import BanModal from '@/components/BanModal';
import WarnModal from '@/components/WarnModal';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

interface Stats {
  userCount: number;
  witzCount: number;
  commentCount: number;
  likeCount: number;
}

interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  _count: { witze: number; comments: number };
  ban?: { active: boolean; expiresAt: string | null; reason: string } | null;
}

interface AppConfig {
  id: number;
  key: string;
  value: string;
  description: string | null;
}

interface Report {
  id: number;
  reason: string;
  createdAt: string;
  witz: { id: number; text: string; authorId: number };
  user: { username: string };
}

interface Warning {
  id: number;
  reason: string;
  createdAt: string;
}

function getAuthHeader() {
  const token = localStorage.getItem('token');
  return { Authorization: `Bearer ${token}` };
}

export default function AdminPage() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [config, setConfig] = useState<AppConfig[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [warningsMap, setWarningsMap] = useState<Record<number, Warning[]>>({});
  const [banModal, setBanModal] = useState<{
    userId: number;
    username: string;
  } | null>(null);
  const [warnModal, setWarnModal] = useState<{
    userId: number;
    username: string;
  } | null>(null);

  const banUser = async (userId: number, reason: string, duration: string) => {
    const res = await fetch(`${API_URL}/admin/users/${userId}/ban`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ reason, duration }),
    });
    if (res.ok) {
      setBanModal(null);
      const usersRes = await fetch(`${API_URL}/admin/users`, {
        headers: getAuthHeader(),
      });
      if (usersRes.ok) setUsers(await usersRes.json());
    }
  };

  const unbanUser = async (userId: number) => {
    const res = await fetch(`${API_URL}/admin/users/${userId}/unban`, {
      method: 'PATCH',
      headers: getAuthHeader(),
    });
    if (res.ok) {
      const usersRes = await fetch(`${API_URL}/admin/users`, {
        headers: getAuthHeader(),
      });
      if (usersRes.ok) setUsers(await usersRes.json());
    }
  };

  const warnUser = async (userId: number, reason: string) => {
    const res = await fetch(`${API_URL}/admin/users/${userId}/warn`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ reason }),
    });
    if (res.ok) setWarnModal(null);
  };

  const loadWarnings = async (userId: number) => {
    const res = await fetch(`${API_URL}/admin/users/${userId}/warnings`, {
      headers: getAuthHeader(),
    });
    if (res.ok) {
      const data = await res.json();
      setWarningsMap((prev) => ({ ...prev, [userId]: data }));
    }
  };

  const deleteWarning = async (userId: number, warningId: number) => {
    const res = await fetch(
      `${API_URL}/admin/users/${userId}/warnings/${warningId}`,
      {
        method: 'DELETE',
        headers: getAuthHeader(),
      }
    );
    if (res.ok) {
      setWarningsMap((prev) => ({
        ...prev,
        [userId]: prev[userId].filter((w) => w.id !== warningId),
      }));
    }
  };

  useEffect(() => {
    const role = localStorage.getItem('role');
    if (role !== 'ADMIN') {
      router.push('/');
      return;
    }

    const load = async () => {
      const [statsRes, usersRes] = await Promise.all([
        fetch(`${API_URL}/admin/stats`, { headers: getAuthHeader() }),
        fetch(`${API_URL}/admin/users`, { headers: getAuthHeader() }),
      ]);

      const configRes = await fetch(`${API_URL}/admin/config`, {
        headers: getAuthHeader(),
      });

      const reportsRes = await fetch(`${API_URL}/admin/reports`, {
        headers: getAuthHeader(),
      });
      if (reportsRes.ok) setReports(await reportsRes.json());

      if (configRes.ok) setConfig(await configRes.json());
      if (statsRes.ok) setStats(await statsRes.json());
      if (usersRes.ok) setUsers(await usersRes.json());
      setLoading(false);
    };
    load();
  }, [router]);

  const resolveReport = async (reportId: number) => {
    const res = await fetch(`${API_URL}/admin/reports/${reportId}/resolve`, {
      method: 'PATCH',
      headers: getAuthHeader(),
    });
    if (res.ok) setReports((prev) => prev.filter((r) => r.id !== reportId));
  };

  const deleteReportedWitz = async (witzId: number) => {
    if (!confirm('Witz wirklich löschen?')) return;
    const res = await fetch(`${API_URL}/admin/reports/${witzId}/witz`, {
      method: 'DELETE',
      headers: getAuthHeader(),
    });
    if (res.ok) setReports((prev) => prev.filter((r) => r.witz.id !== witzId));
  };

  const updateRole = async (userId: number, role: string) => {
    const res = await fetch(`${API_URL}/admin/users/${userId}/role`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ role }),
    });
    if (res.ok) {
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role } : u))
      );
    }
  };

  const deleteUser = async (userId: number, username: string) => {
    if (!confirm(`User @${username} wirklich löschen?`)) return;
    const res = await fetch(`${API_URL}/admin/users/${userId}`, {
      method: 'DELETE',
      headers: getAuthHeader(),
    });
    if (res.ok) {
      setUsers((prev) => prev.filter((u) => u.id !== userId));
    }
  };

  const toggleConfig = async (key: string, currentValue: string) => {
    const newValue = currentValue === 'true' ? 'false' : 'true';
    const res = await fetch(`${API_URL}/admin/config/${key}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ value: newValue }),
    });
    if (res.ok) {
      setConfig((prev) =>
        prev.map((c) => (c.key === key ? { ...c, value: newValue } : c))
      );
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

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-800/50 rounded-3xl p-6 md:p-8">
          <h1 className="text-3xl font-black text-white mb-1">
            ⚙️ Admin Panel
          </h1>
          <p className="text-gray-400 text-sm">Verwaltung der WitzeApp</p>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'User', value: stats.userCount, emoji: '👤' },
              { label: 'Witze', value: stats.witzCount, emoji: '📝' },
              { label: 'Kommentare', value: stats.commentCount, emoji: '💬' },
              { label: 'Likes', value: stats.likeCount, emoji: '❤️' },
            ].map((s) => (
              <div
                key={s.label}
                className="bg-gray-900/80 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-5 text-center"
              >
                <span className="text-2xl">{s.emoji}</span>
                <p className="text-3xl font-black text-white mt-2">{s.value}</p>
                <p className="text-gray-500 text-xs mt-1 uppercase tracking-wider">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Announcement */}
        <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-800/50 rounded-3xl p-6">
          <h2 className="text-xl font-black text-white mb-4">
            📢 Systembenachrichtigung
          </h2>
          <div className="space-y-3">
            <textarea
              value={config.find((c) => c.key === 'announcement')?.value ?? ''}
              onChange={(e) => {
                const val = e.target.value;
                setConfig((prev) =>
                  prev.map((c) =>
                    c.key === 'announcement' ? { ...c, value: val } : c
                  )
                );
              }}
              placeholder="Nachricht eingeben..."
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white text-sm resize-none h-24 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 placeholder-gray-500"
            />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-gray-400 text-sm">Aktiv</span>
                <button
                  onClick={() =>
                    toggleConfig(
                      'announcement_active',
                      config.find((c) => c.key === 'announcement_active')
                        ?.value ?? 'false'
                    )
                  }
                  className={`relative w-12 h-6 rounded-full transition-all ${
                    config.find((c) => c.key === 'announcement_active')
                      ?.value === 'true'
                      ? 'bg-indigo-600'
                      : 'bg-gray-700'
                  }`}
                >
                  <span
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${
                      config.find((c) => c.key === 'announcement_active')
                        ?.value === 'true'
                        ? 'left-7'
                        : 'left-1'
                    }`}
                  />
                </button>
              </div>
              <button
                onClick={() => {
                  const val =
                    config.find((c) => c.key === 'announcement')?.value ?? '';
                  fetch(`${API_URL}/admin/config/announcement`, {
                    method: 'PATCH',
                    headers: {
                      'Content-Type': 'application/json',
                      ...getAuthHeader(),
                    },
                    body: JSON.stringify({ value: val }),
                  });
                }}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold rounded-xl transition-all"
              >
                Speichern
              </button>
            </div>
          </div>
        </div>

        {/* User Verwaltung */}
        <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-800/50 rounded-3xl p-6">
          <h2 className="text-xl font-black text-white mb-4">
            👤 User-Verwaltung
          </h2>
          <div className="space-y-3">
            {users.map((u) => (
              <div
                key={u.id}
                className="flex flex-col gap-3 p-4 bg-gray-800/50 rounded-2xl border border-gray-700/50"
              >
                {/* Obere Zeile – Avatar, Info, Buttons */}
                <div className="flex items-center gap-4">
                  <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-sm font-bold">
                      {u.username.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-semibold">
                      @{u.username}
                    </p>
                    <p className="text-gray-500 text-xs">
                      {u.email} • {u._count.witze} Witze • {u._count.comments}{' '}
                      Kommentare
                    </p>
                    {u.ban?.active && (
                      <p className="text-orange-400 text-xs mt-0.5">
                        🔨 Gesperrt{' '}
                        {u.ban.expiresAt
                          ? `bis ${new Date(u.ban.expiresAt).toLocaleDateString('de-DE')}`
                          : '(permanent)'}
                      </p>
                    )}
                  </div>
                  <select
                    value={u.role}
                    onChange={(e) => updateRole(u.id, e.target.value)}
                    className="bg-gray-700/50 border border-gray-600/50 text-white text-xs rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  >
                    <option value="USER">USER</option>
                    <option value="BETA">BETA</option>
                    <option value="MODERATOR">MODERATOR</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>

                  <button
                    onClick={() =>
                      setWarnModal({ userId: u.id, username: u.username })
                    }
                    className="px-3 py-1.5 bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-500/30 text-yellow-300 text-xs font-medium rounded-xl transition-all"
                    title="Verwarnen"
                  >
                    ⚠️
                  </button>

                  <button
                    onClick={() =>
                      warningsMap[u.id] !== undefined
                        ? setWarningsMap((prev) => {
                            const next = { ...prev };
                            delete next[u.id];
                            return next;
                          })
                        : loadWarnings(u.id)
                    }
                    className="px-3 py-1.5 bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/20 text-yellow-400 text-xs font-medium rounded-xl transition-all"
                    title="Verwarnungen anzeigen"
                  >
                    📋 {warningsMap[u.id]?.length ?? '?'}
                  </button>

                  {u.ban?.active ? (
                    <button
                      onClick={() => unbanUser(u.id)}
                      className="px-3 py-1.5 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 text-green-300 text-xs font-medium rounded-xl transition-all"
                      title="Entbannen"
                    >
                      🔓
                    </button>
                  ) : (
                    <button
                      onClick={() =>
                        setBanModal({ userId: u.id, username: u.username })
                      }
                      className="px-3 py-1.5 bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/30 text-orange-300 text-xs font-medium rounded-xl transition-all"
                      title="Bannen"
                    >
                      🔨
                    </button>
                  )}

                  <button
                    onClick={() => deleteUser(u.id, u.username)}
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10 p-2 rounded-lg transition-all text-sm"
                    title="User löschen"
                  >
                    🗑️
                  </button>
                </div>

                {/* Verwarnungen Liste */}
                {warningsMap[u.id] && warningsMap[u.id].length === 0 && (
                  <p className="text-gray-500 text-xs text-center py-1">
                    Keine Verwarnungen
                  </p>
                )}
                {warningsMap[u.id]?.length > 0 && (
                  <div className="space-y-2">
                    {warningsMap[u.id].map((w) => (
                      <div
                        key={w.id}
                        className="flex items-center justify-between px-3 py-2 bg-yellow-500/10 rounded-xl border border-yellow-500/20"
                      >
                        <div>
                          <p className="text-yellow-200 text-xs font-medium">
                            {w.reason}
                          </p>
                          <p className="text-gray-500 text-xs">
                            {new Date(w.createdAt).toLocaleString('de-DE', {
                              day: 'numeric',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                        <button
                          onClick={() => deleteWarning(u.id, w.id)}
                          className="text-red-400 hover:text-red-300 text-xs p-1 rounded transition-all"
                        >
                          🗑️
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Meldungen */}
        <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-800/50 rounded-3xl p-6">
          <h2 className="text-xl font-black text-white mb-4">
            🚩 Meldungen
            {reports.length > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-red-500/20 text-red-300 text-sm rounded-full border border-red-500/30">
                {reports.length}
              </span>
            )}
          </h2>

          {reports.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-6">
              Keine offenen Meldungen
            </p>
          ) : (
            <div className="space-y-3">
              {reports.map((r) => (
                <div
                  key={r.id}
                  className="p-4 bg-gray-800/50 rounded-2xl border border-red-500/20"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-semibold mb-1">
                        @{r.user.username} hat gemeldet
                      </p>
                      <p className="text-gray-400 text-xs mb-2">
                        Grund: <span className="text-red-300">{r.reason}</span>
                      </p>
                      <p className="text-gray-500 text-xs line-clamp-2">
                        "{r.witz.text}"
                      </p>
                    </div>
                    <div className="flex flex-col gap-2 flex-shrink-0">
                      <button
                        onClick={() => resolveReport(r.id)}
                        className="px-3 py-1.5 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 text-green-300 text-xs font-medium rounded-xl transition-all"
                      >
                        ✓ Ignorieren
                      </button>
                      <button
                        onClick={() => deleteReportedWitz(r.witz.id)}
                        className="px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-300 text-xs font-medium rounded-xl transition-all"
                      >
                        🗑️ Löschen
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* App Config */}
        <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-800/50 rounded-3xl p-6">
          <h2 className="text-xl font-black text-white mb-4">
            ⚙️ App-Einstellungen
          </h2>
          <div className="space-y-3">
            {config.map((c) => (
              <div
                key={c.key}
                className="flex items-center justify-between p-4 bg-gray-800/50 rounded-2xl border border-gray-700/50"
              >
                <div>
                  <p className="text-white text-sm font-semibold">
                    {c.description ?? c.key}
                  </p>
                  <p className="text-gray-500 text-xs font-mono mt-0.5">
                    {c.key}
                  </p>
                </div>
                <button
                  onClick={() => toggleConfig(c.key, c.value)}
                  className={`relative w-12 h-6 rounded-full transition-all ${
                    c.value === 'true' ? 'bg-indigo-600' : 'bg-gray-700'
                  }`}
                >
                  <span
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${
                      c.value === 'true' ? 'left-7' : 'left-1'
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
      {banModal && (
        <BanModal
          username={banModal.username}
          onBan={(reason, duration) =>
            banUser(banModal.userId, reason, duration)
          }
          onClose={() => setBanModal(null)}
        />
      )}
      {warnModal && (
        <WarnModal
          username={warnModal.username}
          onWarn={(reason) => warnUser(warnModal.userId, reason)}
          onClose={() => setWarnModal(null)}
        />
      )}
    </AppLayout>
  );
}
