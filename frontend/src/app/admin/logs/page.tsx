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
    bg: 'bg-blue-500/10 border-blue-500/20',
  },
  DELETE_USER: {
    label: 'User gelöscht',
    emoji: '🗑️',
    color: 'text-red-300',
    bg: 'bg-red-500/10 border-red-500/20',
  },
  DELETE_WITZ: {
    label: 'Witz gelöscht',
    emoji: '📝',
    color: 'text-red-300',
    bg: 'bg-red-500/10 border-red-500/20',
  },
  RESOLVE_REPORT: {
    label: 'Meldung ignoriert',
    emoji: '✓',
    color: 'text-green-300',
    bg: 'bg-green-500/10 border-green-500/20',
  },
  BAN_USER: {
    label: 'User gebannt',
    emoji: '🔨',
    color: 'text-orange-300',
    bg: 'bg-orange-500/10 border-orange-500/20',
  },
  UNBAN_USER: {
    label: 'User entbannt',
    emoji: '🔓',
    color: 'text-green-300',
    bg: 'bg-green-500/10 border-green-500/20',
  },
  WARN_USER: {
    label: 'User verwarnt',
    emoji: '⚠️',
    color: 'text-yellow-300',
    bg: 'bg-yellow-500/10 border-yellow-500/20',
  },
  DELETE_WARNING: {
    label: 'Verwarnung gelöscht',
    emoji: '🗑️',
    color: 'text-gray-300',
    bg: 'bg-gray-500/10 border-gray-500/20',
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
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    if (localStorage.getItem('role') !== 'ADMIN') {
      router.push('/');
      return;
    }
    fetch(`${API_URL}/admin/logs`, { headers: getAuthHeader() })
      .then((res) => res.json())
      .then(setLogs)
      .finally(() => setLoading(false));
  }, [router]);

  const filtered =
    filter === 'all' ? logs : logs.filter((l) => l.action === filter);
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
                {logs.length} Einträge · letzte 30 Tage
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

        {/* Filter */}
        <div className="flex flex-wrap gap-2">
          {['all', ...Object.keys(ACTION_CONFIG)].map((key) => {
            const meta = key === 'all' ? null : ACTION_CONFIG[key];
            return (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all border ${
                  filter === key
                    ? 'bg-indigo-600/80 text-white border-indigo-500/50'
                    : 'text-gray-400 hover:text-white bg-gray-900/80 border-gray-800/50 hover:border-gray-700/50'
                }`}
              >
                {key === 'all' ? '🔍 Alle' : `${meta?.emoji} ${meta?.label}`}
              </button>
            );
          })}
        </div>

        {/* Logs */}
        <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-800/50 rounded-3xl p-6">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin w-8 h-8 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full" />
            </div>
          )}

          {!loading && filtered.length === 0 && (
            <div className="text-center py-12">
              <span className="text-4xl block mb-3">📋</span>
              <p className="text-gray-500 text-sm">Keine Einträge gefunden</p>
            </div>
          )}

          {!loading && filtered.length > 0 && (
            <div className="space-y-6">
              {Object.entries(grouped).map(([date, dateLogs]) => (
                <div key={date}>
                  {/* Datum Trenner */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-px flex-1 bg-gray-800" />
                    <span className="text-gray-600 text-xs font-medium">
                      {date}
                    </span>
                    <div className="h-px flex-1 bg-gray-800" />
                  </div>

                  <div className="space-y-2">
                    {dateLogs.map((log) => {
                      const meta = ACTION_CONFIG[log.action] ?? {
                        label: log.action,
                        emoji: '⚙️',
                        color: 'text-gray-300',
                        bg: 'bg-gray-500/10 border-gray-500/20',
                      };
                      return (
                        <div
                          key={log.id}
                          className={`flex items-start gap-3 p-4 rounded-2xl border ${meta.bg}`}
                        >
                          <span className="text-lg flex-shrink-0">
                            {meta.emoji}
                          </span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2 mb-0.5">
                              <span
                                className={`text-xs font-bold ${meta.color}`}
                              >
                                {meta.label}
                              </span>
                              <span className="text-gray-600 text-xs flex-shrink-0">
                                {new Date(log.createdAt).toLocaleTimeString(
                                  'de-DE',
                                  { hour: '2-digit', minute: '2-digit' }
                                )}
                              </span>
                            </div>
                            {log.details && (
                              <p className="text-gray-300 text-sm">
                                {log.details}
                              </p>
                            )}
                            <p className="text-gray-600 text-xs mt-1">
                              von @{log.admin.username}
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
