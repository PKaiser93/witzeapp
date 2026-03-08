'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/AppLayout';
import BanModal from '@/components/BanModal';
import WarnModal from '@/components/WarnModal';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  _count: { witze: number; comments: number };
  ban?: { active: boolean; expiresAt: string | null; reason: string } | null;
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

const ROLE_COLORS: Record<string, string> = {
  ADMIN: 'text-red-300 bg-red-500/20 border-red-500/30',
  BETA: 'text-purple-300 bg-purple-500/20 border-purple-500/30',
  MODERATOR: 'text-blue-300 bg-blue-500/20 border-blue-500/30',
  USER: 'text-gray-300 bg-gray-500/20 border-gray-500/30',
};

export default function AdminUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [warningsMap, setWarningsMap] = useState<Record<number, Warning[]>>({});
  const [banModal, setBanModal] = useState<{
    userId: number;
    username: string;
  } | null>(null);
  const [warnModal, setWarnModal] = useState<{
    userId: number;
    username: string;
  } | null>(null);

  useEffect(() => {
    if (localStorage.getItem('role') !== 'ADMIN') {
      router.push('/');
      return;
    }
    loadUsers();
  }, [router]);

  const loadUsers = async () => {
    const res = await fetch(`${API_URL}/admin/users`, {
      headers: getAuthHeader(),
    });
    if (res.ok) setUsers(await res.json());
    setLoading(false);
  };

  const updateRole = async (userId: number, role: string) => {
    const res = await fetch(`${API_URL}/admin/users/${userId}/role`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ role }),
    });
    if (res.ok)
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role } : u))
      );
  };

  const deleteUser = async (userId: number, username: string) => {
    if (!confirm(`User @${username} wirklich löschen?`)) return;
    const res = await fetch(`${API_URL}/admin/users/${userId}`, {
      method: 'DELETE',
      headers: getAuthHeader(),
    });
    if (res.ok) setUsers((prev) => prev.filter((u) => u.id !== userId));
  };

  const banUser = async (userId: number, reason: string, duration: string) => {
    const res = await fetch(`${API_URL}/admin/users/${userId}/ban`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ reason, duration }),
    });
    if (res.ok) {
      setBanModal(null);
      loadUsers();
    }
  };

  const unbanUser = async (userId: number) => {
    const res = await fetch(`${API_URL}/admin/users/${userId}/unban`, {
      method: 'PATCH',
      headers: getAuthHeader(),
    });
    if (res.ok) loadUsers();
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
    if (res.ok)
      setWarningsMap((prev) => ({
        ...prev,
        [userId]: prev[userId].filter((w) => w.id !== warningId),
      }));
  };

  const filtered = users.filter(
    (u) =>
      u.username.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-800/50 rounded-3xl p-6 md:p-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-black text-white mb-1">
                👤 User-Verwaltung
              </h1>
              <p className="text-gray-400 text-sm">
                {users.length} registrierte User
              </p>
            </div>
            <button
              onClick={() => router.push('/admin')}
              className="px-4 py-2 bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700/50 text-gray-300 hover:text-white rounded-xl transition-all text-sm"
            >
              ← Dashboard
            </button>
          </div>
        </div>

        {/* Suche */}
        <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-800/50 rounded-2xl px-4 py-3 flex items-center gap-3">
          <span className="text-gray-500">🔍</span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="User suchen..."
            className="flex-1 bg-transparent text-white placeholder-gray-500 focus:outline-none text-sm"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="text-gray-500 hover:text-white text-xs"
            >
              ✕
            </button>
          )}
        </div>

        {/* User Liste */}
        <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-800/50 rounded-3xl p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin w-8 h-8 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full" />
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((u) => (
                <div
                  key={u.id}
                  className="flex flex-col gap-3 p-4 bg-gray-800/50 rounded-2xl border border-gray-700/50"
                >
                  <div className="flex items-center gap-3 flex-wrap">
                    {/* Avatar */}
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-sm font-bold">
                        {u.username.charAt(0).toUpperCase()}
                      </span>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-white text-sm font-semibold">
                          @{u.username}
                        </p>
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium border ${ROLE_COLORS[u.role] ?? ROLE_COLORS.USER}`}
                        >
                          {u.role}
                        </span>
                        {u.ban?.active && (
                          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-orange-500/20 text-orange-300 border border-orange-500/30">
                            🔨 Gebannt
                          </span>
                        )}
                      </div>
                      <p className="text-gray-500 text-xs mt-0.5">
                        {u.email} • {u._count.witze} Witze • {u._count.comments}{' '}
                        Kommentare
                      </p>
                      {u.ban?.active && (
                        <p className="text-orange-400 text-xs mt-0.5">
                          bis{' '}
                          {u.ban.expiresAt
                            ? new Date(u.ban.expiresAt).toLocaleDateString(
                                'de-DE'
                              )
                            : 'permanent'}{' '}
                          – {u.ban.reason}
                        </p>
                      )}
                    </div>

                    {/* Aktionen */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <select
                        value={u.role}
                        onChange={(e) => updateRole(u.id, e.target.value)}
                        className="bg-gray-700/50 border border-gray-600/50 text-white text-xs rounded-lg px-2 py-1.5 focus:outline-none"
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
                        className="px-3 py-1.5 bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-500/30 text-yellow-300 text-xs rounded-xl transition-all"
                        title="Verwarnen"
                      >
                        ⚠️
                      </button>

                      <button
                        onClick={() =>
                          warningsMap[u.id] !== undefined
                            ? setWarningsMap((prev) => {
                                const n = { ...prev };
                                delete n[u.id];
                                return n;
                              })
                            : loadWarnings(u.id)
                        }
                        className="px-3 py-1.5 bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/20 text-yellow-400 text-xs rounded-xl transition-all"
                      >
                        📋 {warningsMap[u.id]?.length ?? '?'}
                      </button>

                      {u.ban?.active ? (
                        <button
                          onClick={() => unbanUser(u.id)}
                          className="px-3 py-1.5 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 text-green-300 text-xs rounded-xl transition-all"
                        >
                          🔓
                        </button>
                      ) : (
                        <button
                          onClick={() =>
                            setBanModal({ userId: u.id, username: u.username })
                          }
                          className="px-3 py-1.5 bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/30 text-orange-300 text-xs rounded-xl transition-all"
                        >
                          🔨
                        </button>
                      )}

                      <button
                        onClick={() => deleteUser(u.id, u.username)}
                        className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>

                  {/* Verwarnungen */}
                  {warningsMap[u.id] && warningsMap[u.id].length === 0 && (
                    <p className="text-gray-500 text-xs text-center py-1">
                      Keine Verwarnungen
                    </p>
                  )}
                  {warningsMap[u.id]?.length > 0 && (
                    <div className="space-y-2 pt-2 border-t border-gray-700/50">
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
                            className="text-red-400 hover:text-red-300 p-1 rounded transition-all text-xs"
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
          )}
        </div>
      </div>

      {banModal && (
        <BanModal
          username={banModal.username}
          onBan={(r, d) => banUser(banModal.userId, r, d)}
          onClose={() => setBanModal(null)}
        />
      )}
      {warnModal && (
        <WarnModal
          username={warnModal.username}
          onWarn={(r) => warnUser(warnModal.userId, r)}
          onClose={() => setWarnModal(null)}
        />
      )}
    </AppLayout>
  );
}
