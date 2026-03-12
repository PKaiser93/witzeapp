'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/AppLayout';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

interface AuditLog {
  id: number;
  action: string;
  entity: string;
  entityId: number | null;
  details: string | null;
  createdAt: string;
  admin: { username: string };
}

const ACTION_CONFIG: Record<
  string,
  { label: string; emoji: string; color: string; bg: string }
> = {
  UPDATE_ROLE: {
    label: 'Rolle geändert',
    emoji: '👤',
    color: 'text-blue-300',
    bg: 'bg-blue-500/65 border-blue-500/20',
  },
  DELETE_USER: {
    label: 'User gelöscht',
    emoji: '🗑️',
    color: 'text-red-300',
    bg: 'bg-red-500/65 border-red-500/20',
  },
  DELETE_WITZ: {
    label: 'Witz gelöscht',
    emoji: '📝',
    color: 'text-red-300',
    bg: 'bg-red-500/65 border-red-500/20',
  },
  RESOLVE_REPORT: {
    label: 'Meldung ignoriert',
    emoji: '✓',
    color: 'text-green-300',
    bg: 'bg-green-500/65 border-green-500/20',
  },
  BAN_USER: {
    label: 'User gebannt',
    emoji: '🔨',
    color: 'text-orange-300',
    bg: 'bg-orange-500/65 border-orange-500/20',
  },
  UNBAN_USER: {
    label: 'User entbannt',
    emoji: '🔓',
    color: 'text-green-300',
    bg: 'bg-green-500/65 border-green-500/20',
  },
  WARN_USER: {
    label: 'User verwarnt',
    emoji: '⚠️',
    color: 'text-yellow-300',
    bg: 'bg-yellow-500/65 border-yellow-500/20',
  },
  DELETE_WARNING: {
    label: 'Verwarnung gelöscht',
    emoji: '🗑️',
    color: 'text-gray-300',
    bg: 'bg-gray-500/65 border-gray-500/20',
  },
};

function getAuthHeader() {
  const token = localStorage.getItem('token');
  return { Authorization: `Bearer ${token}` };
}

function groupByDate(logs: AuditLog[]) {
  const groups: Record<string, AuditLog[]> = {};
  logs.forEach((log) => {
    const date = new Date(log.createdAt).toLocaleDateString('de-DE', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
    if (!groups[date]) groups[date] = [];
    groups[date].push(log);
  });
  return groups;
}

export default function AdminLogsPage() {
  const router = useRouter();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (localStorage.getItem('role') !== 'ADMIN') {
      router.push('/');
      return;
    }
    fetch(`${API_URL}/admin/logs`, { headers: getAuthHeader() })
      .then((res) => res.json())
      .then((data) => setLogs(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, [router]);

  const filtered = logs
    .filter((l) => filter === 'all' || l.action === filter)
    .filter((l) => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        l.details?.toLowerCase().includes(q) ||
        l.admin.username.toLowerCase().includes(q) ||
        l.action.toLowerCase().includes(q)
      );
    });

  const grouped = groupByDate(filtered);

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-800/50 rounded-3xl p-6 md:p-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-black text-white mb-1">
                📋 Audit-Log
              </h1>
              <p className="text-gray-400 text-sm">
                {logs.length} Einträge gesamt
                {filtered.length !== logs.length && (
                  <span className="ml-1 text-indigo-400">
                    · {filtered.length} gefiltert
                  </span>
                )}
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

        {/* Suche + Filter */}
        <div className="space-y-3">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="🔍 Nach Admin, Aktion oder Details suchen..."
            className="w-full px-4 py-3 bg-gray-900/80 border border-gray-800/50 rounded-2xl text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
          />
          <div className="flex flex-wrap gap-2">
            {['all', ...Object.keys(ACTION_CONFIG)].map((key) => {
              const meta = key === 'all' ? null : ACTION_CONFIG[key];
              const count =
                key === 'all'
                  ? logs.length
                  : logs.filter((l) => l.action === key).length;
              return (
                <button
                  key={key}
                  onClick={() => setFilter(key)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all border flex items-center gap-1.5 ${
                    filter === key
                      ? 'bg-indigo-600/80 text-white border-indigo-500/50'
                      : 'text-gray-400 hover:text-white bg-gray-900/80 border-gray-800/50 hover:border-gray-700/50'
                  }`}
                >
                  {key === 'all' ? '🔍 Alle' : `${meta?.emoji} ${meta?.label}`}
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-xs ${
                      filter === key ? 'bg-white/20' : 'bg-gray-800'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Logs */}
        <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-800/50 rounded-3xl overflow-hidden">
          {loading && (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin w-8 h-8 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full" />
            </div>
          )}

          {!loading && filtered.length === 0 && (
            <div className="text-center py-16">
              <span className="text-4xl block mb-3">📋</span>
              <p className="text-gray-500 text-sm">
                {search
                  ? 'Keine Treffer für deine Suche'
                  : 'Keine Einträge gefunden'}
              </p>
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="mt-3 text-indigo-400 hover:text-indigo-300 text-sm transition-colors"
                >
                  Suche zurücksetzen
                </button>
              )}
            </div>
          )}

          {!loading && filtered.length > 0 && (
            <div className="divide-y divide-gray-800/50">
              {Object.entries(grouped).map(([date, dateLogs]) => (
                <div key={date}>
                  {/* Datum */}
                  <div className="flex items-center gap-3 px-6 py-3 bg-gray-800/20">
                    <span className="text-gray-500 text-xs font-semibold uppercase tracking-wider">
                      {date}
                    </span>
                    <span className="text-gray-700 text-xs">
                      {dateLogs.length}{' '}
                      {dateLogs.length === 1 ? 'Eintrag' : 'Einträge'}
                    </span>
                  </div>

                  <div className="divide-y divide-gray-800/30">
                    {dateLogs.map((log) => {
                      const meta = ACTION_CONFIG[log.action] ?? {
                        label: log.action,
                        emoji: '⚙️',
                        color: 'text-gray-300',
                        bg: 'bg-gray-500/65 border-gray-500/20',
                      };
                      return (
                        <div
                          key={log.id}
                          className="flex items-start gap-4 px-6 py-4 hover:bg-gray-800/20 transition-all"
                        >
                          {/* Icon */}
                          <div className="relative w-9 h-9">
                            <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                              <span className="text-white text-sm font-bold">
                                {log.admin.username.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div
                              className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border border-gray-900 flex items-center justify-center ${meta.bg}`}
                            >
                              <span className="text-[11px]">{meta.emoji}</span>
                            </div>
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <span
                                className={`text-sm font-bold ${meta.color}`}
                              >
                                {meta.label}
                              </span>
                              <span className="text-gray-600 text-xs flex-shrink-0">
                                {new Date(log.createdAt).toLocaleTimeString(
                                  'de-DE',
                                  {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  }
                                )}
                              </span>
                            </div>
                            {log.details && (
                              <p className="text-gray-300 text-sm mt-0.5">
                                {log.details}
                              </p>
                            )}
                            <p className="text-gray-600 text-xs mt-1">
                              von{' '}
                              <span
                                onClick={() =>
                                  router.push(`/profil/${log.admin.username}`)
                                }
                                className="text-gray-500 hover:text-indigo-400 cursor-pointer transition-colors"
                              >
                                @{log.admin.username}
                              </span>
                              {log.entityId && (
                                <span className="ml-1">
                                  · {log.entity} #{log.entityId}
                                </span>
                              )}
                            </p>
                          </div>
                        </div>
                      );
                    })}
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
