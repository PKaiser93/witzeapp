'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/AppLayout';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

export default function KategorieNeuPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const erstellen = async () => {
    if (!name.trim() || !emoji.trim()) return;
    setLoading(true);
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_URL}/kategorien`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name: name.trim(), emoji: emoji.trim() }),
    });

    if (!res.ok) {
      setError(
        'Fehler beim Erstellen. Möglicherweise existiert die Kategorie bereits.'
      );
      setTimeout(() => setError(null), 4000);
      setLoading(false);
      return;
    }

    router.push('/');
  };

  return (
    <AppLayout>
      <div className="max-w-md mx-auto py-8 space-y-6">
        <h1 className="text-3xl font-black text-white">➕ Neue Kategorie</h1>

        <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-800/50 rounded-3xl p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Name
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="z.B. Flachwitze"
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Emoji
            </label>
            <input
              value={emoji}
              onChange={(e) => setEmoji(e.target.value)}
              placeholder="z.B. 😄"
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
              maxLength={2}
            />
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button
            onClick={erstellen}
            disabled={!name.trim() || !emoji.trim() || loading}
            className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-xl disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            {loading ? 'Erstelle...' : 'Kategorie erstellen'}
          </button>
        </div>
      </div>
    </AppLayout>
  );
}
