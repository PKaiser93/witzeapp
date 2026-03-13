'use client';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/AppLayout';
import { fetchWithAuth } from '@/lib/fetchWithAuth';
import { useRequireAdmin } from '@/hooks/useRequireAdmin';
import { useAuth } from '@/context/AuthContext';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

interface Report {
  id: number;
  reason: string;
  createdAt: string;
  witz?: { id: number; text: string; authorId: number | null } | null;
  user?: { username: string } | null;
}

export default function AdminReportsPage() {
  const checking = useRequireAdmin();
  const router = useRouter();
  const { accessToken, refreshToken } = useAuth();

  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!accessToken) return;
    setLoading(true);
    const res = await fetchWithAuth(
      `${API_URL}/admin/reports`,
      accessToken,
      refreshToken
    );
    if (res.ok) {
      const data = await res.json();
      setReports(data);
    }
    setLoading(false);
  }, [accessToken, refreshToken]);

  useEffect(() => {
    if (checking) return;
    if (!accessToken) return;
    load();
  }, [checking, accessToken, load]);

  const resolveReport = async (reportId: number) => {
    if (!accessToken) return;
    const res = await fetchWithAuth(
      `${API_URL}/admin/reports/${reportId}/resolve`,
      accessToken,
      refreshToken,
      { method: 'PATCH' }
    );
    if (res.ok) {
      setReports((prev) => prev.filter((r) => r.id !== reportId));
    }
  };

  const deleteReportedWitz = async (witzId: number) => {
    if (!confirm('Witz wirklich löschen?')) return;
    if (!accessToken) return;
    const res = await fetchWithAuth(
      `${API_URL}/admin/reports/${witzId}/witz`,
      accessToken,
      refreshToken,
      { method: 'DELETE' }
    );
    if (res.ok) {
      setReports((prev) => prev.filter((r) => r.witz?.id !== witzId));
    }
  };

  if (checking) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center py-12">
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-black text-white mb-1">
                🚩 Meldungen
              </h1>
              <p className="text-gray-400 text-sm">
                {reports.length > 0
                  ? `${reports.length} offene Meldungen`
                  : 'Keine offenen Meldungen'}
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

        {/* Liste */}
        <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-800/50 rounded-3xl p-6">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin w-8 h-8 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full" />
            </div>
          )}

          {!loading && reports.length === 0 && (
            <div className="text-center py-12">
              <span className="text-5xl block mb-4">✅</span>
              <p className="text-gray-400">Keine offenen Meldungen</p>
            </div>
          )}

          <div className="space-y-4">
            {reports.map((r) => (
              <div
                key={r.id}
                className="p-5 bg-gray-800/50 rounded-2xl border border-red-500/20"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    {/* Melder */}
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-7 h-7 bg-gradient-to-br from-red-500 to-orange-500 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-xs font-bold">
                          {(r.user?.username ?? '?').charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <span className="text-white text-sm font-semibold">
                        @{r.user?.username ?? 'Unbekannt'}
                      </span>
                      <span className="text-gray-500 text-xs">
                        hat gemeldet
                      </span>
                      <span className="text-gray-600 text-xs ml-auto">
                        {new Date(r.createdAt).toLocaleString('de-DE', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>

                    {/* Grund */}
                    <div className="mb-3">
                      <span className="px-2.5 py-1 bg-red-500/20 text-red-300 text-xs font-medium rounded-lg border border-red-500/30">
                        {r.reason}
                      </span>
                    </div>

                    {/* Witz */}
                    <div
                      className={`p-3 bg-gray-900/50 rounded-xl border border-gray-700/50 ${
                        r.witz ? 'cursor-pointer hover:border-gray-600/50' : ''
                      } transition-all`}
                      onClick={() => {
                        if (!r.witz) return;
                        router.push(`/witze/${r.witz.id}`);
                      }}
                    >
                      <p className="text-gray-300 text-sm line-clamp-2">
                        {r.witz?.text
                          ? `"${r.witz.text}"`
                          : 'Dieser Witz existiert nicht mehr.'}
                      </p>
                    </div>
                  </div>

                  {/* Aktionen */}
                  <div className="flex flex-col gap-2 flex-shrink-0">
                    <button
                      onClick={() => resolveReport(r.id)}
                      className="px-4 py-2 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 text-green-300 text-xs font-medium rounded-xl transition-all"
                    >
                      ✓ Ignorieren
                    </button>
                    <button
                      onClick={() => {
                        if (!r.witz) return;
                        deleteReportedWitz(r.witz.id);
                      }}
                      disabled={!r.witz}
                      className={`px-4 py-2 border text-xs font-medium rounded-xl transition-all ${
                        r.witz
                          ? 'bg-red-500/20 hover:bg-red-500/30 border-red-500/30 text-red-300'
                          : 'bg-gray-800/50 border-gray-700/50 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      🗑️ Witz löschen
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
