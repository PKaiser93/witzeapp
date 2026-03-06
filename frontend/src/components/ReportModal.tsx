'use client';
import { useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

const REASONS = [
  'Unangemessener Inhalt',
  'Beleidigung / Hassrede',
  'Spam',
  'Urheberrechtsverletzung',
  'Sonstiges',
];

interface ReportModalProps {
  witzId: number;
  onClose: () => void;
}

export default function ReportModal({ witzId, onClose }: ReportModalProps) {
  const [reason, setReason] = useState(REASONS[0]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_URL}/witze/${witzId}/report`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ reason }),
    });
    if (res.ok) {
      setSuccess(true);
      setTimeout(onClose, 1500);
    } else {
      setError(
        'Fehler beim Melden. Möglicherweise hast du diesen Witz bereits gemeldet.'
      );
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-gray-700/50 rounded-3xl p-6 w-full max-w-sm shadow-2xl">
        {success ? (
          <div className="text-center py-4">
            <span className="text-4xl mb-3 block">✅</span>
            <p className="text-white font-bold">Gemeldet</p>
            <p className="text-gray-400 text-sm mt-1">
              Danke für dein Feedback.
            </p>
          </div>
        ) : (
          <>
            <h2 className="text-white font-black text-lg mb-4">
              🚩 Witz melden
            </h2>
            <div className="space-y-2 mb-4">
              {REASONS.map((r) => (
                <button
                  key={r}
                  onClick={() => setReason(r)}
                  className={`w-full text-left px-4 py-2.5 rounded-xl text-sm transition-all border ${
                    reason === r
                      ? 'bg-red-500/20 text-red-300 border-red-500/40'
                      : 'text-gray-400 border-gray-700/50 hover:bg-gray-800/50 hover:text-white'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
            {error && <p className="text-red-400 text-xs mb-3">{error}</p>}
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
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-500 disabled:opacity-40 text-white font-bold rounded-xl text-sm transition-all"
              >
                {loading ? 'Senden...' : 'Melden'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
