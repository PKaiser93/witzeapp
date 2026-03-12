'use client';
import { useEffect, useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { fetchWithAuth } from '@/lib/fetchWithAuth';
import { useRequireAdmin } from '@/hooks/useRequireAdmin';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

type Application = {
  id: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  message: string | null;
  adminNote: string | null;
  createdAt: string;
  reviewedAt: string | null;
  user: {
    id: number;
    username: string;
    createdAt: string;
    badges: { key: string }[];
    _count: { witze?: number };
  };
  admin: { username: string } | null;
};

export default function AdminVerifiedPage() {
  const checking = useRequireAdmin();
  const [applications, setApplications] = useState<Application[]>([]);
  const [filter, setFilter] = useState<string>('PENDING');
  const [loading, setLoading] = useState(true);
  const [rejectNote, setRejectNote] = useState<Record<number, string>>({});

  const load = async () => {
    setLoading(true);
    const res = await fetchWithAuth(
      `${API_URL}/verified-application/admin?status=${filter}`
    );
    if (res.ok) {
      setApplications(await res.json());
    }
    setLoading(false);
  };

  useEffect(() => {
    if (checking) return;
    load();
  }, [filter, checking]);

  const approve = async (id: number) => {
    const res = await fetchWithAuth(
      `${API_URL}/verified-application/admin/${id}/approve`,
      { method: 'PATCH' }
    );
    if (res.ok) load();
  };

  const reject = async (id: number) => {
    const res = await fetchWithAuth(
      `${API_URL}/verified-application/admin/${id}/reject`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminNote: rejectNote[id] || '' }),
      }
    );
    if (res.ok) load();
  };

  const statusBadge = (status: string) => {
    if (status === 'PENDING')
      return (
        <span className="bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 text-xs px-2 py-0.5 rounded-full font-medium">
          ⏳ Ausstehend
        </span>
      );
    if (status === 'APPROVED')
      return (
        <span className="bg-green-500/20 text-green-300 border border-green-500/30 text-xs px-2 py-0.5 rounded-full font-medium">
          ✅ Genehmigt
        </span>
      );
    return (
      <span className="bg-red-500/20 text-red-300 border border-red-500/30 text-xs px-2 py-0.5 rounded-full font-medium">
        ❌ Abgelehnt
      </span>
    );
  };

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
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-black text-white mb-1">
            🔵 Verified-Bewerbungen
          </h1>
          <p className="text-gray-500 text-sm">
            Bewerbungen für den blauen Haken verwalten
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2">
          {['PENDING', 'APPROVED', 'REJECTED'].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-4 py-1.5 rounded-xl text-sm font-medium transition-all border ${
                filter === s
                  ? 'bg-blue-600 text-white border-blue-500/50'
                  : 'bg-gray-900/80 text-gray-400 hover:text-white border-gray-800/50'
              }`}
            >
              {s === 'PENDING'
                ? '⏳ Ausstehend'
                : s === 'APPROVED'
                  ? '✅ Genehmigt'
                  : '❌ Abgelehnt'}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin w-8 h-8 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full" />
          </div>
        ) : applications.length === 0 ? (
          <div className="text-center py-16 bg-gray-900/80 border border-gray-800/50 rounded-3xl">
            <p className="text-4xl mb-2">📭</p>
            <p className="text-gray-500">
              Keine Bewerbungen in dieser Kategorie
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map((app) => (
              <div
                key={app.id}
                className="bg-gray-900/80 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-5"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center font-bold text-blue-300 text-lg">
                      {app.user.username[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-white">
                        {app.user.username}
                      </p>
                      <p className="text-xs text-gray-500">
                        Mitglied seit{' '}
                        {new Date(app.user.createdAt).toLocaleDateString(
                          'de-DE'
                        )}
                      </p>
                    </div>
                  </div>
                  {statusBadge(app.status)}
                </div>

                {/* Stats */}
                <div className="flex flex-wrap gap-4 text-sm text-gray-400 mb-3">
                  <span>📝 {app.user._count.witze ?? 0} Witze</span>
                  <span>
                    🎖️{' '}
                    {app.user.badges.length > 0
                      ? app.user.badges.map((b) => b.key).join(', ')
                      : '–'}
                  </span>
                  <span>
                    📅 {new Date(app.createdAt).toLocaleDateString('de-DE')}
                  </span>
                </div>

                {/* Bewerbungstext */}
                {app.message && (
                  <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-3 text-sm text-gray-300 mb-3 italic">
                    "{app.message}"
                  </div>
                )}

                {/* Admin-Notiz */}
                {app.adminNote && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-sm text-red-300 mb-3">
                    <span className="font-medium">Ablehnungsgrund:</span>{' '}
                    {app.adminNote}
                  </div>
                )}

                {/* Bearbeitet von */}
                {app.admin && (
                  <p className="text-xs text-gray-500 mb-3">
                    Bearbeitet von @{app.admin.username}
                    {app.reviewedAt &&
                      ` am ${new Date(app.reviewedAt).toLocaleDateString(
                        'de-DE'
                      )}`}
                  </p>
                )}

                {/* Aktionen – nur bei PENDING */}
                {app.status === 'PENDING' && (
                  <div className="flex gap-3 mt-2 pt-3 border-t border-gray-800/50">
                    <button
                      onClick={() => approve(app.id)}
                      className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all"
                    >
                      ✅ Genehmigen
                    </button>
                    <div className="flex gap-2 flex-1">
                      <input
                        type="text"
                        placeholder="Ablehnungsgrund (optional)"
                        value={rejectNote[app.id] || ''}
                        onChange={(e) =>
                          setRejectNote((prev) => ({
                            ...prev,
                            [app.id]: e.target.value,
                          }))
                        }
                        className="flex-1 bg-gray-800/50 border border-gray-700/50 rounded-xl px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500/30"
                      />
                      <button
                        onClick={() => reject(app.id)}
                        className="bg-red-500/80 hover:bg-red-500 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all"
                      >
                        ❌ Ablehnen
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
