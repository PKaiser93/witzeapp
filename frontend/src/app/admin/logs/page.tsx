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

const ACTION_LABELS: Record<
  string,
  { label: string; emoji: string; color: string }
> = {
  UPDATE_ROLE: {
    label: 'Rolle geändert',
    emoji: '👤',
    color: 'text-blue-300 bg-blue-500/10 border-blue-500/30',
  },
  DELETE_USER: {
    label: 'User gelöscht',
    emoji: '🗑️',
    color: 'text-red-300 bg-red-500/10 border-red-500/30',
  },
  DELETE_WITZ: {
    label: 'Witz gelöscht',
    emoji: '🗑️',
    color: 'text-red-300 bg-red-500/10 border-red-500/30',
  },
  RESOLVE_REPORT: {
    label: 'Meldung ignoriert',
    emoji: '✓',
    color: 'text-green-300 bg-green-500/10 border-green-500/30',
  },
};

function getAuthHeader() {
  const token = localStorage.getItem('token');
  return { Authorization: `Bearer ${token}` };
}

export default function AdminLogsPage() {
  const router = useRouter();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const role = localStorage.getItem('role');
    if (role !== 'ADMIN') {
      router.push('/');
      return;
    }
    fetch(`${API_URL}/admin/logs`, { headers: getAuthHeader() })
      .then((res) => res.json())
      .then((data) => setLogs(data))
      .finally(() => setLoading(false));
  }, [router]);

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
                Alle Admin-Aktionen der letzten 30 Tage
              </p>
            </div>
            <button
              onClick={() => router.push('/admin')}
              className="px-4 py-2 bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700/50 text-gray-300 hover:text-white rounded-xl transition-all text-sm"
            >
              ← Admin Panel
            </button>
          </div>
        </div>

        {/* Logs */}
        <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-800/50 rounded-3xl p-6">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin w-8 h-8 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full" />
            </div>
          )}

          {!loading && logs.length === 0 && (
            <p className="text-gray-500 text-sm text-center py-8">
              Noch keine Einträge
            </p>
          )}

          {!loading && logs.length > 0 && (
            <div className="space-y-2">
              {logs.map((log) => {
                const meta = ACTION_LABELS[log.action] ?? {
                  label: log.action,
                  emoji: '⚙️',
                  color: 'text-gray-300 bg-gray-500/10 border-gray-500/30',
                };
                return (
                  <div
                    key={log.id}
                    className="flex items-start gap-4 p-4 bg-gray-800/50 rounded-2xl border border-gray-700/50"
                  >
                    <span className="text-xl flex-shrink-0 mt-0.5">
                      {meta.emoji}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`px-2 py-0.5 rounded-lg text-xs font-medium border ${meta.color}`}
                        >
                          {meta.label}
                        </span>
                        <span className="text-gray-500 text-xs">
                          {log.entity} #{log.entityId}
                        </span>
                      </div>
                      {log.details && (
                        <p className="text-gray-400 text-sm">{log.details}</p>
                      )}
                      <p className="text-gray-600 text-xs mt-1">
                        von @{log.admin.username} •{' '}
                        {new Date(log.createdAt).toLocaleString('de-DE', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
