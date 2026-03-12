'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/AppLayout';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

interface Kategorie {
  id: number;
  name: string;
  emoji: string;
}

const MAX_LENGTH = 500;

export default function PostPage() {
  const router = useRouter();
  const [kategorien, setKategorien] = useState<Kategorie[]>([]);
  const [text, setText] = useState('');
  const [kategorieId, setKategorieId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${API_URL}/witze/kategorien`)
        .then((res) => res.json())
        .then(setKategorien)
        .catch(() => {});
  }, []);

  const posten = async () => {
    if (!text.trim() || loading) return;
    setLoading(true);
    setError(null);
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_URL}/witze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ text: text.trim(), kategorieId: kategorieId || null }),
      });
      if (!res.ok) throw new Error();
      router.push('/');
    } catch {
      setError('Fehler beim Posten. Bitte erneut versuchen.');
      setTimeout(() => setError(null), 4000);
    } finally {
      setLoading(false);
    }
  };

  const remaining = MAX_LENGTH - text.length;
  const isNearLimit = remaining <= 50;
  const isOverLimit = remaining < 0;

  return (
      <AppLayout>
        <div className="max-w-2xl mx-auto px-4 py-8">

          {/* Header */}
          <div className="mb-8">
            <button
                onClick={() => router.back()}
                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm mb-6"
            >
              ← Zurück
            </button>
            <h1 className="text-3xl font-black text-white mb-1">
              Neuer Witz 🚀
            </h1>
            <p className="text-gray-400 text-sm">
              Teile deinen besten Witz mit der Community
            </p>
          </div>

          <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-800/50 rounded-3xl p-6 space-y-5">

            {/* Textarea */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
              Dein Witz
            </label>
            <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Deinen besten Witz hier eingeben..."
                autoFocus
                className="w-full p-4 bg-gray-800/50 border border-gray-700/50 rounded-2xl text-white placeholder-gray-500 resize-none min-h-[160px] focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent transition-all text-base leading-relaxed"
                maxLength={MAX_LENGTH + 10}
            />
            {/* Zeichenzähler */}
            <div className="flex justify-end mt-1.5">
              <span className={`text-xs font-medium transition-colors ${
                  isOverLimit
                      ? 'text-red-400'
                      : isNearLimit
                          ? 'text-yellow-400'
                          : 'text-gray-500'
              }`}>
                {remaining} Zeichen übrig
              </span>
            </div>
          </div>

          {/* Kategorie */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
            Kategorie{' '}
            <span className="text-gray-500 font-normal">(optional)</span>
          </label>
          {kategorien.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {/* Keine Kategorie */}
                <button
                    onClick={() => setKategorieId('')}
                    className={`px-3 py-2.5 rounded-xl text-sm font-medium border transition-all text-left ${
                        kategorieId === ''
                            ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-300'
                            : 'bg-gray-800/50 border-gray-700/50 text-gray-400 hover:border-gray-600/50 hover:text-gray-300'
                    }`}
                >
                  🆓 Ohne Kategorie
                </button>
                {kategorien.map((k) => (
                    <button
                        key={k.id}
                        onClick={() => setKategorieId(String(k.id))}
                        className={`px-3 py-2.5 rounded-xl text-sm font-medium border transition-all text-left ${
                            kategorieId === String(k.id)
                                ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-300'
                                : 'bg-gray-800/50 border-gray-700/50 text-gray-400 hover:border-gray-600/50 hover:text-gray-300'
                        }`}
                    >
                      {k.emoji} {k.name}
                    </button>
                ))}
              </div>
          ) : (
              <div className="h-10 bg-gray-800/30 rounded-xl animate-pulse" />
          )}
        </div>

        {/* Error */}
        {error && (
            <div className="px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
        )}

        {/* Vorschau */}
        {text.trim() && (
            <div className="p-4 bg-gray-800/30 border border-gray-700/30 rounded-2xl">
              <p className="text-xs text-gray-500 mb-2 uppercase tracking-wider font-medium">
                Vorschau
              </p>
              <p className="text-gray-200 text-sm leading-relaxed">
                "{text.trim()}"
              </p>
              {kategorieId && (
                  <span className="mt-2 inline-block text-xs text-indigo-400">
                  {kategorien.find((k) => String(k.id) === kategorieId)?.emoji}{' '}
                    {kategorien.find((k) => String(k.id) === kategorieId)?.name}
                </span>
              )}
            </div>
        )}

        {/* Submit */}
        <button
            onClick={posten}
            disabled={!text.trim() || loading || isOverLimit}
            className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-black rounded-2xl transition-all text-base shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30"
        >
          {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-spin w-4 h-4 border-2 border-white/20 border-t-white rounded-full" />
                Wird gepostet...
              </span>
          ) : (
              '🚀 Witz posten'
          )}
        </button>
      </div>
</div>
</AppLayout>
);
}
