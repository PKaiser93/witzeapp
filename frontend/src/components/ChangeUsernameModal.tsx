'use client';
import { useState, useEffect, useCallback } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

interface Props {
  currentUsername: string;
  onClose: () => void;
  onSuccess: (newUsername: string) => void;
}

export default function ChangeUsernameModal({
  currentUsername,
  onClose,
  onSuccess,
}: Props) {
  const [username, setUsername] = useState('');
  const [available, setAvailable] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const checkAvailability = useCallback(
    async (name: string) => {
      if (!name.trim() || name.trim() === currentUsername) {
        setAvailable(null);
        return;
      }
      const res = await fetch(
        `${API_URL}/auth/check-username/${encodeURIComponent(name)}`
      );
      if (res.ok) {
        const data = await res.json();
        setAvailable(data.available);
      }
    },
    [currentUsername]
  );

  useEffect(() => {
    const timer = setTimeout(() => checkAvailability(username), 300);
    return () => clearTimeout(timer);
  }, [username, checkAvailability]);

  const submit = async () => {
    if (!username.trim() || available === false) return;
    setLoading(true);
    setError(null);
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_URL}/profile/username`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ username: username.trim() }),
    });
    if (res.ok) {
      const data = await res.json();
      localStorage.setItem('username', data.username);
      setSuccess(true);
      setTimeout(() => {
        onSuccess(data.username);
        onClose();
      }, 1500);
    } else {
      const data = await res.json();
      setError(data?.message ?? 'Fehler beim Ändern.');
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-gray-700/50 rounded-3xl p-6 w-full max-w-sm shadow-2xl">
        {success ? (
          <div className="text-center py-4">
            <span className="text-4xl mb-3 block">✅</span>
            <p className="text-white font-bold">Username geändert</p>
          </div>
        ) : (
          <>
            <h2 className="text-white font-black text-lg mb-1">
              ✏️ Username ändern
            </h2>
            <p className="text-gray-500 text-xs mb-4">
              Aktuell: @{currentUsername}
            </p>

            <div className="relative mb-4">
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Neuer Username"
                className="w-full px-4 py-2.5 pr-20 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 placeholder-gray-500"
              />
              {username && (
                <span
                  className={`absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium ${
                    available === true
                      ? 'text-green-400'
                      : available === false
                        ? 'text-red-400'
                        : 'text-gray-500'
                  }`}
                >
                  {available === true
                    ? '✓ Verfügbar'
                    : available === false
                      ? '✗ Vergeben'
                      : '...'}
                </span>
              )}
            </div>

            <p className="text-gray-600 text-xs mb-4">
              Nur Buchstaben, Zahlen und _ · 3–20 Zeichen
            </p>

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
                disabled={!username.trim() || available !== true || loading}
                className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-bold rounded-xl text-sm transition-all"
              >
                {loading ? 'Speichern...' : 'Speichern'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
