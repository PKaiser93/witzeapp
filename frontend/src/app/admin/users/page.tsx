'use client';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/AppLayout';
import BanModal from '@/components/BanModal';
import WarnModal from '@/components/WarnModal';
import { fetchWithAuth } from '@/lib/fetchWithAuth';
import { useRequireAdmin } from '@/hooks/useRequireAdmin';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  jokesCount: number;
  commentsCount?: number;
  ban?: { active: boolean; expiresAt: string | null; reason: string } | null;
}

interface Warning {
  id: number;
  reason: string;
  createdAt: string;
}

const ROLE_COLORS: Record<string, string> = {
  ADMIN: 'text-red-300 bg-red-500/20 border-red-500/30',
  BETA: 'text-purple-300 bg-purple-500/20 border-purple-500/30',
  MODERATOR: 'text-blue-300 bg-blue-500/20 border-blue-500/30',
  USER: 'text-gray-300 bg-gray-500/20 border-gray-500/30',
};

const ROLE_EMOJI: Record<string, string> = {
  ADMIN: '🛡️',
  BETA: '🧪',
  MODERATOR: '⚖️',
  USER: '👤',
};

export default function AdminUsersPage() {
  const checking = useRequireAdmin();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [expandedUser, setExpandedUser] = useState<number | null>(null);
  const [warningsMap, setWarningsMap] = useState<Record<number, Warning[]>>({});
  const [openActionsMenu, setOpenActionsMenu] = useState<number | null>(null);
  const [dropdownPos, setDropdownPos] = useState<{
    top: number;
    right: number;
  } | null>(null);
  const [banModal, setBanModal] = useState<{
    userId: number;
    username: string;
  } | null>(null);
  const [warnModal, setWarnModal] = useState<{
    userId: number;
    username: string;
  } | null>(null);

  useEffect(() => {
    if (checking) return;
    const load = async () => {
      const res = await fetchWithAuth(`${API_URL}/admin/users`);
      if (res.ok) setUsers(await res.json());
      setLoading(false);
    };
    load();
  }, [checking]);

  // Dropdown schließen bei Klick außerhalb
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if ((e.target as HTMLElement).closest('.actions-menu')) return;
      setOpenActionsMenu(null);
    };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, []);

  const loadUsers = async () => {
    const res = await fetchWithAuth(`${API_URL}/admin/users`);
    if (res.ok) setUsers(await res.json());
    setLoading(false);
  };

  const updateRole = async (userId: number, role: string) => {
    const res = await fetchWithAuth(`${API_URL}/admin/users/${userId}/role`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role }),
    });
    if (res.ok)
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role } : u))
      );
  };

  const deleteUser = async (userId: number, username: string) => {
    if (!confirm(`User @${username} wirklich löschen?`)) return;
    const res = await fetchWithAuth(`${API_URL}/admin/users/${userId}`, {
      method: 'DELETE',
    });
    if (res.ok) setUsers((prev) => prev.filter((u) => u.id !== userId));
  };

  const banUser = async (userId: number, reason: string, duration: string) => {
    const res = await fetchWithAuth(`${API_URL}/admin/users/${userId}/ban`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason, duration }),
    });
    if (res.ok) {
      setBanModal(null);
      loadUsers();
    }
  };

  const unbanUser = async (userId: number) => {
    const res = await fetchWithAuth(`${API_URL}/admin/users/${userId}/unban`, {
      method: 'PATCH',
    });
    if (res.ok) loadUsers();
  };

  const warnUser = async (userId: number, reason: string) => {
    const res = await fetchWithAuth(`${API_URL}/admin/users/${userId}/warn`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason }),
    });
    if (res.ok) setWarnModal(null);
  };

  const toggleExpand = async (userId: number) => {
    if (expandedUser === userId) {
      setExpandedUser(null);
      return;
    }
    setExpandedUser(userId);
    if (!warningsMap[userId]) {
      const res = await fetchWithAuth(
        `${API_URL}/admin/users/${userId}/warnings`
      );
      if (res.ok) {
        const data = await res.json();
        setWarningsMap((prev) => ({ ...prev, [userId]: data }));
      }
    }
  };

  const deleteWarning = async (userId: number, warningId: number) => {
    const res = await fetchWithAuth(`${API_URL}/admin/warnings/${warningId}`, {
      method: 'DELETE',
    });
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

  const bannedCount = users.filter((u) => u.ban?.active).length;
  const adminCount = users.filter((u) => u.role === 'ADMIN').length;

  if (checking) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin w-8 h-8 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-800/50 rounded-3xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-black text-white">
                👤 User-Verwaltung
              </h1>
              <p className="text-gray-500 text-sm mt-0.5">
                Alle registrierten Accounts verwalten
              </p>
            </div>
            <button
              onClick={() => router.push('/admin')}
              className="px-4 py-2 bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700/50 text-gray-300 hover:text-white rounded-xl transition-all text-sm"
            >
              ← Dashboard
            </button>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              {
                label: 'Gesamt',
                value: users.length,
                color: 'text-white',
                bg: 'bg-gray-800/50',
              },
              {
                label: 'Gesperrt',
                value: bannedCount,
                color: 'text-orange-300',
                bg: 'bg-orange-500/10 border-orange-500/20',
              },
              {
                label: 'Admins',
                value: adminCount,
                color: 'text-red-300',
                bg: 'bg-red-500/10 border-red-500/20',
              },
            ].map((s) => (
              <div
                key={s.label}
                className={`${s.bg} border border-gray-700/30 rounded-2xl px-4 py-3 text-center`}
              >
                <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
                <p className="text-gray-500 text-xs mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Suche */}
        <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-800/50 rounded-2xl px-4 py-3 flex items-center gap-3">
          <span className="text-gray-500">🔍</span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Username oder E-Mail suchen..."
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

        {/* Tabelle */}
        <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-800/50 rounded-3xl">
          <div className="grid grid-cols-12 gap-3 px-5 py-3 border-b border-gray-800/50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            <div className="col-span-4">User</div>
            <div className="col-span-2 text-center">Rolle</div>
            <div className="col-span-2 text-center">Aktivität</div>
            <div className="col-span-2 text-center">Status</div>
            <div className="col-span-2 text-right">Aktionen</div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="animate-spin w-8 h-8 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-gray-500 text-sm">
              Keine User gefunden
            </div>
          ) : (
            <div className="divide-y divide-gray-800/50">
              {filtered.map((u) => (
                <div key={u.id}>
                  <div
                    className="grid grid-cols-12 gap-3 px-5 py-4 hover:bg-gray-800/30 transition-all items-center cursor-pointer"
                    onClick={(e) => {
                      if ((e.target as HTMLElement).closest('.actions-menu'))
                        return;
                      toggleExpand(u.id);
                    }}
                  >
                    {/* User */}
                    <div className="col-span-4 flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0 text-white text-sm font-bold">
                        {u.username.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-white text-sm font-semibold truncate">
                          @{u.username}
                        </p>
                        <p className="text-gray-500 text-xs truncate">
                          {u.email}
                        </p>
                      </div>
                    </div>

                    {/* Rolle */}
                    <div className="col-span-2 flex justify-center">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-medium border ${ROLE_COLORS[u.role] ?? ROLE_COLORS.USER}`}
                      >
                        {ROLE_EMOJI[u.role]} {u.role}
                      </span>
                    </div>

                    {/* Aktivität im Header-Row */}
                    <div className="col-span-2 text-center">
                      <p className="text-white text-sm font-semibold">
                        {u.jokesCount}
                      </p>
                      <p className="text-gray-500 text-xs">Witze</p>
                      <p className="text-white text-sm font-semibold mt-1">
                        {u.commentsCount ?? 0}
                      </p>
                      <p className="text-gray-500 text-xs">Kommentare</p>
                    </div>

                    {/* Status */}
                    <div className="col-span-2 flex justify-center">
                      {u.ban?.active ? (
                        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-orange-500/20 text-orange-300 border border-orange-500/30">
                          🔨 Gebannt
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-300 border border-green-500/30">
                          ✓ Aktiv
                        </span>
                      )}
                    </div>

                    {/* Aktionen Button */}
                    <div
                      className="col-span-2 flex justify-end actions-menu"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (openActionsMenu === u.id) {
                            setOpenActionsMenu(null);
                            setDropdownPos(null);
                          } else {
                            const rect = (
                              e.currentTarget as HTMLElement
                            ).getBoundingClientRect();
                            setDropdownPos({
                              top: rect.bottom + 4,
                              right: window.innerWidth - rect.right,
                            });
                            setOpenActionsMenu(u.id);
                          }
                        }}
                        className="px-3 py-1.5 bg-gray-800/80 hover:bg-gray-700/80 border border-gray-700/50 text-gray-300 hover:text-white rounded-xl text-xs font-medium transition-all"
                      >
                        ⚙️ Aktionen ▾
                      </button>
                    </div>
                  </div>

                  {/* Expandierter Bereich */}
                  {expandedUser === u.id && (
                    <div className="px-5 pb-4 bg-gray-800/20 border-t border-gray-800/50">
                      <div className="pt-4 space-y-3">
                        <div className="grid grid-cols-3 gap-3">
                          <div className="bg-gray-800/50 rounded-xl px-4 py-3 text-center">
                            <p className="text-white font-bold">
                              {u.jokesCount}
                            </p>
                            <p className="text-gray-500 text-xs">Witze</p>
                          </div>
                          <div className="bg-gray-800/50 rounded-xl px-4 py-3 text-center">
                            <p className="text-white font-bold">
                              {u.commentsCount ?? 0}
                            </p>
                            <p className="text-gray-500 text-xs">Kommentare</p>
                          </div>
                          <div className="bg-gray-800/50 rounded-xl px-4 py-3 text-center">
                            <p className="text-white font-bold">
                              {warningsMap[u.id]?.length ?? '...'}
                            </p>
                            <p className="text-gray-500 text-xs">
                              Verwarnungen
                            </p>
                          </div>
                        </div>

                        {u.ban?.active && (
                          <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl px-4 py-3">
                            <p className="text-orange-300 text-sm font-semibold mb-0.5">
                              🔨 Aktiver Ban
                            </p>
                            <p className="text-orange-400/70 text-xs">
                              Grund: {u.ban.reason} • bis{' '}
                              {u.ban.expiresAt
                                ? new Date(u.ban.expiresAt).toLocaleDateString(
                                    'de-DE'
                                  )
                                : 'permanent'}
                            </p>
                          </div>
                        )}

                        <div>
                          <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">
                            Verwarnungen
                          </p>
                          {!warningsMap[u.id] ? (
                            <p className="text-gray-600 text-xs">Lädt...</p>
                          ) : warningsMap[u.id].length === 0 ? (
                            <p className="text-gray-600 text-xs">
                              Keine Verwarnungen
                            </p>
                          ) : (
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
                                      {new Date(w.createdAt).toLocaleString(
                                        'de-DE',
                                        {
                                          day: 'numeric',
                                          month: 'short',
                                          hour: '2-digit',
                                          minute: '2-digit',
                                        }
                                      )}
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
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Dropdown Portal */}
      {openActionsMenu !== null &&
        dropdownPos &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            className="actions-menu fixed bg-gray-900 border border-gray-700/50 rounded-2xl shadow-2xl w-48 py-1 z-[9999]"
            style={{ top: dropdownPos.top, right: dropdownPos.right }}
          >
            {(() => {
              const u = users.find((u) => u.id === openActionsMenu);
              if (!u) return null;
              return (
                <>
                  <div className="px-3 py-2 border-b border-gray-800/50">
                    <p className="text-gray-500 text-xs mb-1.5">Rolle ändern</p>
                    <select
                      value={u.role}
                      onChange={(e) => {
                        updateRole(u.id, e.target.value);
                        setOpenActionsMenu(null);
                      }}
                      className="w-full bg-gray-800 border border-gray-700/50 text-white text-xs rounded-lg px-2 py-1.5 focus:outline-none"
                    >
                      <option value="USER">👤 USER</option>
                      <option value="BETA">🧪 BETA</option>
                      <option value="MODERATOR">⚖️ MODERATOR</option>
                      <option value="ADMIN">🛡️ ADMIN</option>
                    </select>
                  </div>
                  <button
                    onClick={() => {
                      setWarnModal({ userId: u.id, username: u.username });
                      setOpenActionsMenu(null);
                    }}
                    className="w-full text-left px-4 py-2.5 text-yellow-300 hover:bg-gray-800/50 text-sm transition-all"
                  >
                    ⚠️ Verwarnen
                  </button>
                  {u.ban?.active ? (
                    <button
                      onClick={() => {
                        unbanUser(u.id);
                        setOpenActionsMenu(null);
                      }}
                      className="w-full text-left px-4 py-2.5 text-green-300 hover:bg-gray-800/50 text-sm transition-all"
                    >
                      🔓 Entbannen
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setBanModal({ userId: u.id, username: u.username });
                        setOpenActionsMenu(null);
                      }}
                      className="w-full text-left px-4 py-2.5 text-orange-300 hover:bg-gray-800/50 text-sm transition-all"
                    >
                      🔨 Bannen
                    </button>
                  )}
                  <button
                    onClick={() => {
                      router.push(`/profil/${u.username}`);
                      setOpenActionsMenu(null);
                    }}
                    className="w-full text-left px-4 py-2.5 text-indigo-300 hover:bg-gray-800/50 text-sm transition-all"
                  >
                    👤 Profil ansehen
                  </button>
                  <hr className="border-gray-800/50 my-1" />
                  <button
                    onClick={() => {
                      deleteUser(u.id, u.username);
                      setOpenActionsMenu(null);
                    }}
                    className="w-full text-left px-4 py-2.5 text-red-400 hover:bg-gray-800/50 text-sm transition-all"
                  >
                    🗑️ Löschen
                  </button>
                </>
              );
            })()}
          </div>,
          document.body
        )}

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
