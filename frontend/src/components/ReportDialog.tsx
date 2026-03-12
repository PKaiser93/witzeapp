'use client';
import { useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

const REASONS = [
  { label: 'Unangemessener Inhalt', emoji: '🔞' },
  { label: 'Beleidigung / Hassrede', emoji: '💢' },
  { label: 'Spam', emoji: '📩' },
  { label: 'Urheberrechtsverletzung', emoji: '©️' },
  { label: 'Sonstiges', emoji: '🏳️' },
];

interface ReportProps {
  witzId: number;
  onClose: () => void;
}

export default function ReportDialog({ witzId, onClose }: ReportProps) {
  const [reason, setReason] = useState(REASONS[0].label);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const submit = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/login';
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch(`${API_URL}/witze/${witzId}/report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reason }),
      });

      if (res.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/login';
        return;
      }

      if (res.status === 404) {
        setMessage('Dieser Witz existiert nicht mehr.');
      } else if (res.status === 403) {
        const data = await res.json().catch(() => null);
        setMessage(
          data?.message ??
            'Du hast diesen Witz bereits gemeldet. Die Meldung wird noch geprüft.'
        );
      } else if (res.ok) {
        setSuccess(true);
        setMessage('Danke – wir prüfen den Inhalt.');
        setTimeout(onClose, 1800);
      } else {
        setMessage(
          'Meldung konnte nicht gesendet werden. Versuche es später erneut.'
        );
      }
    } catch {
      setMessage(
        'Meldung konnte nicht gesendet werden. Versuche es später erneut.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-gray-900 border border-gray-700/50 rounded-3xl p-6 w-full max-w-sm shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {success ? (
          <div className="text-center py-6">
            <span className="text-5xl mb-4 block">✅</span>
            <p className="text-white font-black text-lg">Gemeldet!</p>
            {message && <p className="text-gray-400 text-sm mt-1">{message}</p>}
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-white font-black text-lg">🚩 Witz melden</h2>
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-white hover:bg-gray-800 rounded-lg transition-all text-lg"
              >
                ✕
              </button>
            </div>

            <p className="text-gray-400 text-sm mb-4">
              Wähle einen Grund für die Meldung:
            </p>

            <div className="space-y-2 mb-5">
              {REASONS.map((r) => (
                <button
                  key={r.label}
                  onClick={() => setReason(r.label)}
                  className={`w-full text-left px-4 py-3 rounded-xl text-sm transition-all border flex items-center gap-3 ${
                    reason === r.label
                      ? 'bg-red-500/15 text-red-300 border-red-500/40 font-semibold'
                      : 'text-gray-400 border-gray-700/50 hover:bg-gray-800/50 hover:text-white border-transparent'
                  }`}
                >
                  <span className="text-base">{r.emoji}</span>
                  {r.label}
                  {reason === r.label && (
                    <span className="ml-auto text-red-400 text-xs">✓</span>
                  )}
                </button>
              ))}
            </div>

            {message && !success && (
              <div className="mb-4 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                <p className="text-red-400 text-xs">{message}</p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl text-sm font-medium transition-all"
              >
                Abbrechen
              </button>
              <button
                onClick={submit}
                disabled={loading}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold rounded-xl text-sm transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <span className="animate-spin w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full" />
                    Senden...
                  </>
                ) : (
                  '🚩 Melden'
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
