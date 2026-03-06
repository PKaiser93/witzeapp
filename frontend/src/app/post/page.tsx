'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/AppLayout';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

interface Kategorie {
  id: number;
  name: string;
  emoji: string;
}

export default function PostPage() {
  const [kategorien, setKategorien] = useState<Kategorie[]>([]);
  const [text, setText] = useState('');
  const [kategorieId, setKategorieId] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    axios
      .get(`${API_URL}/witze/kategorien`)
      .then((res) => setKategorien(res.data));
  }, []);

  const posten = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    try {
      await axios.post(
        `${API_URL}/witze`,
        { text, kategorieId: kategorieId || null },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      router.push('/');
    } catch (error) {
      setError('Fehler beim Posten. Bitte erneut versuchen.');
      setTimeout(() => setError(null), 4000);
    }
    setLoading(false);
  };

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto p-8">
        <h1 className="text-4xl font-black bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent mb-12">
          Neuer Witz 🚀
        </h1>

        <div className="space-y-6">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Deinen besten Witz hier eingeben..."
            className="w-full p-6 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl text-xl text-white placeholder-gray-400 resize-vertical min-h-[200px] focus:outline-none focus:border-indigo-400/50 focus:ring-2 focus:ring-indigo-500/30 transition-all"
            maxLength={500}
          />

          <div>
            <label className="block text-lg font-semibold text-white mb-3">
              Kategorie (optional)
            </label>
            <select
              value={kategorieId}
              onChange={(e) => setKategorieId(e.target.value)}
              className="w-full p-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl text-xl text-white focus:outline-none focus:border-indigo-400/50 focus:ring-2 focus:ring-indigo-500/30 transition-all"
            >
              <option value="">🆓 Ohne Kategorie</option>
              {kategorien.map((k) => (
                <option key={k.id} value={k.id}>
                  {k.emoji} {k.name}
                </option>
              ))}
            </select>
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button
            onClick={posten}
            disabled={!text.trim() || loading}
            className="w-full px-8 py-6 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-xl font-black text-white rounded-2xl shadow-2xl hover:shadow-indigo-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '📤 Posten...' : '🚀 Witz posten!'}
          </button>
        </div>

        <div className="mt-8 p-4 bg-white/5 rounded-xl border border-white/10">
          <p className="text-indigo-300 font-semibold">
            {text.length}/500 Zeichen
          </p>
        </div>
      </div>
    </AppLayout>
  );
}
