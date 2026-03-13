'use client';
import { useEffect, useState, useCallback } from 'react';
import AppLayout from '@/components/AppLayout';
import { fetchWithAuth } from '@/lib/fetchWithAuth';
import { useRequireAdmin } from '@/hooks/useRequireAdmin';
import { useAuth } from '@/context/AuthContext';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

type SupportStatus = 'OPEN' | 'IN_PROGRESS' | 'CLOSED';

type SupportMessage = {
  id: number;
  ticketId: string;
  subject: string;
  message: string;
  email: string | null;
  status: SupportStatus;
  createdAt: string;
};

export default function AdminSupportPage() {
  const checking = useRequireAdmin();
  const { accessToken, refreshToken } = useAuth();

  const [items, setItems] = useState<SupportMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<SupportMessage | null>(null);
  const [statusFilter, setStatusFilter] = useState<SupportStatus>('OPEN');
  const [searchTicketId, setSearchTicketId] = useState('');
  const [searchError, setSearchError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!accessToken) return;
    setLoading(true);
    const res = await fetchWithAuth(
      `${API_URL}/support?status=${statusFilter}`,
      accessToken,
      refreshToken
    );
    if (res.ok) {
      setItems(await res.json());
    }
    setLoading(false);
  }, [accessToken, refreshToken, statusFilter]);

  useEffect(() => {
    if (checking) return;
    if (!accessToken) return;
    load();
  }, [checking, accessToken, load]);

  if (checking) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin w-8 h-8 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full" />
        </div>
      </AppLayout>
    );
  }

  const statusBadge = (status: SupportStatus) => {
    if (status === 'OPEN') {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-red-500/10 border border-red-500/40 text-[10px] font-semibold text-red-300">
          ● Offen
        </span>
      );
    }
    if (status === 'IN_PROGRESS') {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-yellow-500/10 border border-yellow-500/40 text-[10px] font-semibold text-yellow-300">
          ● In Bearbeitung
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/40 text-[10px] font-semibold text-emerald-300">
        ● Geschlossen
      </span>
    );
  };

  const handleSearch = async () => {
    if (!accessToken) return;
    setSearchError(null);
    const trimmed = searchTicketId.trim();
    if (!trimmed) return;
    const res = await fetchWithAuth(
      `${API_URL}/support/ticket/${encodeURIComponent(trimmed.toUpperCase())}`,
      accessToken,
      refreshToken
    );
    if (!res.ok) {
      setSearchError('Kein Ticket mit dieser ID gefunden.');
      return;
    }
    const data = (await res.json()) as SupportMessage | null;
    if (!data) {
      setSearchError('Kein Ticket mit dieser ID gefunden.');
      return;
    }
    setSelected(data);
  };

  const updateStatus = async (status: SupportStatus) => {
    if (!selected || !accessToken) return;
    const res = await fetchWithAuth(
      `${API_URL}/support/${selected.id}/status`,
      accessToken,
      refreshToken,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      }
    );
    if (!res.ok) return;
    const updated = { ...selected, status };
    setSelected(updated);
    setItems((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-black text-white mb-1">
            💬 Support-Nachrichten
          </h1>
          <p className="text-gray-500 text-sm">
            Feedback, Bugreports und Kontaktanfragen der Community.
          </p>
        </div>

        {/* Status-Tabs + Ticket-Suche */}
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex gap-2">
            {[
              { key: 'OPEN', label: 'Offen' },
              { key: 'IN_PROGRESS', label: 'In Bearbeitung' },
              { key: 'CLOSED', label: 'Geschlossen' },
            ].map((t) => (
              <button
                key={t.key}
                onClick={() => setStatusFilter(t.key as SupportStatus)}
                className={`px-4 py-1.5 rounded-xl text-xs font-medium border ${
                  statusFilter === t.key
                    ? 'bg-indigo-600 text-white border-indigo-500/60'
                    : 'bg-gray-900 text-gray-400 border-gray-800 hover:text-white'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="flex gap-2 w-full md:w-auto">
            <input
              type="text"
              value={searchTicketId}
              onChange={(e) => setSearchTicketId(e.target.value)}
              placeholder="Ticket-ID suchen"
              className="flex-1 md:w-64 bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
            />
            <button
              onClick={handleSearch}
              className="px-4 py-2 text-xs bg-gray-900 border border-gray-700 rounded-xl text-gray-200 hover:border-indigo-500/60 transition-all"
            >
              Suchen
            </button>
          </div>
        </div>

        {searchError && <p className="text-xs text-red-400">{searchError}</p>}

        {/* Liste */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin w-8 h-8 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full" />
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-16 bg-gray-900/80 border border-gray-800/50 rounded-3xl">
            <p className="text-4xl mb-2">📭</p>
            <p className="text-gray-500">
              Keine Support-Nachrichten in diesem Bereich.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((msg) => (
              <button
                key={msg.id}
                onClick={() => setSelected(msg)}
                className="w-full text-left bg-gray-900/80 border border-gray-800/50 rounded-2xl px-4 py-3 hover:border-indigo-500/60 transition-all"
              >
                <div className="flex items-center justify-between gap-3 mb-1">
                  <div className="flex flex-col gap-0.5">
                    <p className="text-[11px] text-gray-500">{msg.ticketId}</p>
                    <p className="text-sm font-semibold text-white">
                      {msg.subject}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    {statusBadge(msg.status)}
                    <span className="text-[10px] text-gray-500">
                      {new Date(msg.createdAt).toLocaleString('de-DE')}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-gray-500">
                  {msg.email || 'ohne E-Mail'}
                </p>
              </button>
            ))}
          </div>
        )}

        {/* Detail-Modal */}
        {selected && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
            <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-[11px] text-gray-500 mb-1">
                    Ticket-ID: {selected.ticketId}
                  </p>
                  <h2 className="text-lg font-black text-white">
                    {selected.subject}
                  </h2>
                </div>
                <button
                  onClick={() => setSelected(null)}
                  className="text-gray-500 hover:text-gray-300 text-sm"
                >
                  ✕
                </button>
              </div>
              <p className="text-xs text-gray-500 mb-3">
                {selected.email || 'ohne E-Mail'} ·{' '}
                {new Date(selected.createdAt).toLocaleString('de-DE')}
              </p>

              <div className="mb-4">{statusBadge(selected.status)}</div>

              <p className="text-sm text-gray-300 whitespace-pre-line mb-4">
                {selected.message}
              </p>

              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => updateStatus('OPEN')}
                  className="px-3 py-1.5 text-[11px] rounded-lg bg-gray-900 border border-gray-700 text-gray-200 hover:border-red-500/60"
                >
                  Offen
                </button>
                <button
                  onClick={() => updateStatus('IN_PROGRESS')}
                  className="px-3 py-1.5 text-[11px] rounded-lg bg-gray-900 border border-gray-700 text-gray-200 hover:border-yellow-500/60"
                >
                  In Bearbeitung
                </button>
                <button
                  onClick={() => updateStatus('CLOSED')}
                  className="px-3 py-1.5 text-[11px] rounded-lg bg-gray-900 border border-gray-700 text-gray-200 hover:border-emerald-500/60"
                >
                  Geschlossen
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
