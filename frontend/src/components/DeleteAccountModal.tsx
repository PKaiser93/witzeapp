'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

interface Props {
  onClose: () => void;
}

export default function DeleteAccountModal({ onClose }: Props) {
  const router = useRouter();
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteAccount = async () => {
    if (confirm !== 'LÖSCHEN') return;
    setLoading(true);
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_URL}/profile/account`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      localStorage.clear();
      router.push('/');
    } else {
      setError('Fehler beim Löschen. Bitte erneut versuchen.');
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-red-500/30 rounded-3xl p-6 w-full max-w-sm shadow-2xl">
        <h2 className="text-white font-black text-lg mb-2">
          ⚠️ Account löschen
        </h2>
        <p className="text-gray-400 text-sm mb-4">
          Diese Aktion ist{' '}
          <span className="text-red-400 font-semibold">unwiderruflich</span>.
          Alle deine Witze, Kommentare und Likes werden gelöscht.
        </p>
        <p className="text-gray-400 text-sm mb-2">
          Tippe{' '}
          <span className="text-red-400 font-mono font-bold">LÖSCHEN</span> zur
          Bestätigung:
        </p>
        <input
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder="LÖSCHEN"
          className="w-full px-3 py-2.5 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-red-500/50 placeholder-gray-500 mb-4"
        />
        {error && <p className="text-red-400 text-xs mb-3">{error}</p>}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl text-sm font-medium transition-all"
          >
            Abbrechen
          </button>
          <button
            onClick={deleteAccount}
            disabled={confirm !== 'LÖSCHEN' || loading}
            className="flex-1 py-2.5 bg-red-600 hover:bg-red-500 disabled:opacity-40 text-white font-bold rounded-xl text-sm transition-all"
          >
            {loading ? 'Löschen...' : 'Löschen'}
          </button>
        </div>
      </div>
    </div>
  );
}
