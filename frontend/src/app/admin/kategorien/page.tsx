'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/AppLayout';
import { fetchWithAuth } from '@/lib/fetchWithAuth';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

interface Kategorie {
  id: number;
  name: string;
  emoji: string;
}

export default function AdminKategorienPage() {
  const router = useRouter();
  const [kategorien, setKategorien] = useState<Kategorie[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [editEmoji, setEditEmoji] = useState('');
  const [newName, setNewName] = useState('');
  const [newEmoji, setNewEmoji] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (localStorage.getItem('role') !== 'ADMIN') {
      router.push('/');
      return;
    }
    loadKategorien();
  }, [router]);

  const loadKategorien = async () => {
    try {
      const res = await fetchWithAuth(`${API_URL}/kategorien`);
      if (!res.ok) return;
      setKategorien(await res.json());
    } finally {
      setLoading(false);
    }
  };

  const create = async () => {
    if (!newName.trim() || !newEmoji.trim()) return;
    const res = await fetchWithAuth(`${API_URL}/kategorien`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName.trim(), emoji: newEmoji.trim() }),
    });
    if (res.ok) {
      setNewName('');
      setNewEmoji('');
      loadKategorien();
    } else {
      setError('Fehler – Kategorie existiert möglicherweise bereits.');
      setTimeout(() => setError(null), 3000);
    }
  };

  const update = async (id: number) => {
    if (!editName.trim() || !editEmoji.trim()) return;
    const res = await fetchWithAuth(`${API_URL}/kategorien/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: editName.trim(), emoji: editEmoji.trim() }),
    });
    if (res.ok) {
      setEditingId(null);
      loadKategorien();
    }
  };

  const deleteKategorie = async (id: number, name: string) => {
    if (!confirm(`Kategorie "${name}" wirklich löschen?`)) return;
    const res = await fetchWithAuth(`${API_URL}/kategorien/${id}`, {
      method: 'DELETE',
    });
    if (res.ok) loadKategorien();
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-800/50 rounded-3xl p-6 md:p-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-black text-white mb-1">
                🏷️ Kategorien
              </h1>
              <p className="text-gray-400 text-sm">
                {kategorien.length} Kategorien
              </p>
            </div>
            <button
              onClick={() => router.push('/admin')}
              className="px-4 py-2 bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700/50 text-gray-300 hover:text-white rounded-xl transition-all text-sm"
            >
              ← Dashboard
            </button>
          </div>
        </div>

        {/* Neue Kategorie */}
        <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-800/50 rounded-3xl p-6">
          <h2 className="text-lg font-black text-white mb-4">
            ➕ Neue Kategorie
          </h2>
          <div className="flex gap-3">
            <input
              value={newEmoji}
              onChange={(e) => setNewEmoji(e.target.value)}
              placeholder="😄"
              maxLength={2}
              className="w-16 px-3 py-2.5 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white text-center text-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && create()}
              placeholder="Kategoriename"
              className="flex-1 px-4 py-2.5 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm"
            />
            <button
              onClick={create}
              disabled={!newName.trim() || !newEmoji.trim()}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-bold rounded-xl text-sm transition-all"
            >
              Erstellen
            </button>
          </div>
          {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
        </div>

        {/* Kategorien Liste */}
        <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-800/50 rounded-3xl p-6">
          <h2 className="text-lg font-black text-white mb-4">
            Alle Kategorien
          </h2>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin w-8 h-8 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full" />
            </div>
          ) : (
            <div className="space-y-2">
              {kategorien.map((k) => (
                <div
                  key={k.id}
                  className="flex items-center gap-3 p-4 bg-gray-800/50 rounded-2xl border border-gray-700/50"
                >
                  {editingId === k.id ? (
                    <>
                      <input
                        value={editEmoji}
                        onChange={(e) => setEditEmoji(e.target.value)}
                        maxLength={2}
                        className="w-14 px-2 py-1.5 bg-gray-900 border border-gray-600 rounded-lg text-white text-center focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                      />
                      <input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="flex-1 px-3 py-1.5 bg-gray-900 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                      />
                      <button
                        onClick={() => update(k.id)}
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg transition-all"
                      >
                        ✓
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-gray-300 text-xs rounded-lg transition-all"
                      >
                        ✕
                      </button>
                    </>
                  ) : (
                    <>
                      <span className="text-2xl">{k.emoji}</span>
                      <span className="flex-1 text-white text-sm font-medium">
                        {k.name}
                      </span>
                      <button
                        onClick={() => {
                          setEditingId(k.id);
                          setEditName(k.name);
                          setEditEmoji(k.emoji);
                        }}
                        className="p-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-300 rounded-lg text-sm transition-all"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => deleteKategorie(k.id, k.name)}
                        className="p-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-300 rounded-lg text-sm transition-all"
                      >
                        🗑️
                      </button>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
