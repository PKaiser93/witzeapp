'use client';
import { useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

interface Props {
  onClose: () => void;
}

export default function ChangePasswordModal({ onClose }: Props) {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const submit = async () => {
    if (newPassword !== confirm) {
      setError('Passwörter stimmen nicht überein.');
      return;
    }
    if (newPassword.length < 6) {
      setError('Neues Passwort muss mindestens 6 Zeichen lang sein.');
      return;
    }

    setLoading(true);
    setError(null);

    const token = localStorage.getItem('token');
    const res = await fetch(`${API_URL}/profile/password`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ oldPassword, newPassword }),
    });

    if (res.ok) {
      setSuccess(true);
      setTimeout(onClose, 1500);
    } else {
      const data = await res.json();
      setError(data?.message ?? 'Fehler beim Ändern des Passworts.');
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-gray-700/50 rounded-3xl p-6 w-full max-w-sm shadow-2xl">
        {success ? (
          <div className="text-center py-4">
            <span className="text-4xl mb-3 block">✅</span>
            <p className="text-white font-bold">Passwort geändert</p>
          </div>
        ) : (
          <>
            <h2 className="text-white font-black text-lg mb-4">
              🔒 Passwort ändern
            </h2>
            <div className="space-y-3">
              <div>
                <label className="block text-gray-400 text-xs font-medium mb-1.5">
                  Altes Passwort
                </label>
                <input
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="w-full px-3 py-2.5 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 placeholder-gray-500"
                  placeholder="••••••••"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-xs font-medium mb-1.5">
                  Neues Passwort
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2.5 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 placeholder-gray-500"
                  placeholder="Mindestens 6 Zeichen"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-xs font-medium mb-1.5">
                  Passwort bestätigen
                </label>
                <input
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className="w-full px-3 py-2.5 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 placeholder-gray-500"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && <p className="text-red-400 text-xs mt-3">{error}</p>}

            <div className="flex gap-3 mt-4">
              <button
                onClick={onClose}
                className="flex-1 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl text-sm font-medium transition-all"
              >
                Abbrechen
              </button>
              <button
                onClick={submit}
                disabled={!oldPassword || !newPassword || !confirm || loading}
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
