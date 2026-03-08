'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

interface Kategorie {
  id: number;
  name: string;
  emoji: string;
}

interface Props {
  isLoggedIn: boolean;
  value: string;
  error: string | null;
  onChange: (value: string) => void;
  onPost: (kategorieId?: number | null) => void;
}

export default function QuickPost({
  isLoggedIn,
  value,
  error,
  onChange,
  onPost,
}: Props) {
  const router = useRouter();
  const [kategorien, setKategorien] = useState<Kategorie[]>([]);
  const [selectedKategorie, setSelectedKategorie] = useState<number | null>(
    null
  );
  const [showKategorie, setShowKategorie] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/witze/kategorien`)
      .then((res) => res.json())
      .then(setKategorien)
      .catch(() => {});
  }, []);

  if (!isLoggedIn) {
    return (
      <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-800/50 rounded-3xl p-6 text-center">
        <p className="text-gray-400 text-sm mb-4">
          Melde dich an um Witze zu posten und die Community zu bereichern
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => router.push('/login')}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all text-sm"
          >
            Einloggen
          </button>
          <button
            onClick={() => router.push('/register')}
            className="px-6 py-2.5 bg-gray-800 hover:bg-gray-700 border border-gray-700/50 text-gray-300 font-bold rounded-xl transition-all text-sm"
          >
            Registrieren
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-800/50 rounded-3xl p-5">
      <div className="flex gap-3">
        <div className="flex-1 space-y-2">
          <input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={(e) =>
              e.key === 'Enter' && !e.shiftKey && onPost(selectedKategorie)
            }
            placeholder="Schnell einen Witz posten..."
            className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent transition-all text-sm"
          />

          {/* Kategorie Toggle */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowKategorie((prev) => !prev)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700/50 rounded-xl text-xs text-gray-400 hover:text-white transition-all"
            >
              🏷️{' '}
              {selectedKategorie
                ? (kategorien.find((k) => k.id === selectedKategorie)?.name ??
                  'Kategorie')
                : 'Kategorie'}
              <span className="text-gray-600">{showKategorie ? '▴' : '▾'}</span>
            </button>
            {selectedKategorie && (
              <button
                onClick={() => setSelectedKategorie(null)}
                className="text-gray-600 hover:text-gray-400 text-xs transition-colors"
              >
                ✕
              </button>
            )}
          </div>

          {/* Kategorie Dropdown */}
          {showKategorie && (
            <div className="flex flex-wrap gap-2 pt-1">
              {kategorien.map((k) => (
                <button
                  key={k.id}
                  onClick={() => {
                    setSelectedKategorie(k.id);
                    setShowKategorie(false);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all border ${
                    selectedKategorie === k.id
                      ? 'bg-indigo-600/80 text-white border-indigo-500/50'
                      : 'bg-gray-800/50 text-gray-400 border-gray-700/50 hover:text-white hover:border-gray-600/50'
                  }`}
                >
                  {k.emoji} {k.name}
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={() => onPost(selectedKategorie)}
          disabled={!value.trim()}
          className="px-5 py-3 bg-indigo-600/50 hover:bg-indigo-500/70 text-white font-bold rounded-2xl border border-indigo-500/30 disabled:opacity-40 disabled:cursor-not-allowed transition-all self-start"
        >
          ➤
        </button>
      </div>

      {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
    </div>
  );
}
