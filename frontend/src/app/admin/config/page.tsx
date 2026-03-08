'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/AppLayout';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

interface AppConfig {
  id: number;
  key: string;
  value: string;
  description: string | null;
}

function getAuthHeader() {
  const token = localStorage.getItem('token');
  return { Authorization: `Bearer ${token}` };
}

const CONFIG_ICONS: Record<string, string> = {
  maintenance: '🔧',
  feature_comments: '💬',
  feature_likes: '❤️',
  feature_register: '📝',
  feature_report: '🚩',
  feature_delete_account: '🗑️',
  announcement: '📢',
  announcement_active: '📢',
};

export default function AdminConfigPage() {
  const router = useRouter();
  const [config, setConfig] = useState<AppConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (localStorage.getItem('role') !== 'ADMIN') {
      router.push('/');
      return;
    }
    fetch(`${API_URL}/admin/config`, { headers: getAuthHeader() })
      .then((res) => res.json())
      .then((data) => setConfig(data))
      .finally(() => setLoading(false));
  }, [router]);

  const toggleConfig = async (key: string, currentValue: string) => {
    const newValue = currentValue === 'true' ? 'false' : 'true';
    const res = await fetch(`${API_URL}/admin/config/${key}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ value: newValue }),
    });
    if (res.ok)
      setConfig((prev) =>
        prev.map((c) => (c.key === key ? { ...c, value: newValue } : c))
      );
  };

  const saveText = async (key: string, value: string) => {
    const res = await fetch(`${API_URL}/admin/config/${key}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ value }),
    });
    if (res.ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  // Trennung: Text-Felder vs Toggle-Felder
  const textFields = config.filter((c) => c.key === 'announcement');
  const toggleFields = config.filter((c) => c.key !== 'announcement');

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-800/50 rounded-3xl p-6 md:p-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-black text-white mb-1">
                🔧 App-Einstellungen
              </h1>
              <p className="text-gray-400 text-sm">
                Feature-Flags und Systemkonfiguration
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

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full" />
          </div>
        ) : (
          <>
            {/* Feature Flags */}
            <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-800/50 rounded-3xl p-6">
              <h2 className="text-lg font-black text-white mb-4">
                ⚡ Feature-Flags
              </h2>
              <div className="space-y-3">
                {toggleFields.map((c) => (
                  <div
                    key={c.key}
                    className="flex items-center justify-between p-4 bg-gray-800/50 rounded-2xl border border-gray-700/50"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">
                        {CONFIG_ICONS[c.key] ?? '⚙️'}
                      </span>
                      <div>
                        <p className="text-white text-sm font-semibold">
                          {c.description ?? c.key}
                        </p>
                        <p className="text-gray-500 text-xs font-mono">
                          {c.key}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`text-xs font-medium ${c.value === 'true' ? 'text-green-400' : 'text-gray-500'}`}
                      >
                        {c.value === 'true' ? 'Aktiv' : 'Inaktiv'}
                      </span>
                      <button
                        onClick={() => toggleConfig(c.key, c.value)}
                        className={`relative w-12 h-6 rounded-full transition-all ${
                          c.value === 'true' ? 'bg-indigo-600' : 'bg-gray-700'
                        }`}
                      >
                        <span
                          className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${
                            c.value === 'true' ? 'left-7' : 'left-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Announcement */}
            <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-800/50 rounded-3xl p-6">
              <h2 className="text-lg font-black text-white mb-4">
                📢 Systembenachrichtigung
              </h2>
              <div className="space-y-3">
                {textFields.map((c) => (
                  <div key={c.key}>
                    <textarea
                      value={c.value}
                      onChange={(e) => {
                        const val = e.target.value;
                        setConfig((prev) =>
                          prev.map((cfg) =>
                            cfg.key === c.key ? { ...cfg, value: val } : cfg
                          )
                        );
                      }}
                      placeholder="Nachricht für alle User eingeben..."
                      className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white text-sm resize-none h-28 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 placeholder-gray-500"
                    />
                  </div>
                ))}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-gray-400 text-sm">
                      Banner anzeigen
                    </span>
                    <button
                      onClick={() =>
                        toggleConfig(
                          'announcement_active',
                          config.find((c) => c.key === 'announcement_active')
                            ?.value ?? 'false'
                        )
                      }
                      className={`relative w-12 h-6 rounded-full transition-all ${
                        config.find((c) => c.key === 'announcement_active')
                          ?.value === 'true'
                          ? 'bg-indigo-600'
                          : 'bg-gray-700'
                      }`}
                    >
                      <span
                        className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${
                          config.find((c) => c.key === 'announcement_active')
                            ?.value === 'true'
                            ? 'left-7'
                            : 'left-1'
                        }`}
                      />
                    </button>
                  </div>
                  <button
                    onClick={() =>
                      saveText(
                        'announcement',
                        config.find((c) => c.key === 'announcement')?.value ??
                          ''
                      )
                    }
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold rounded-xl transition-all"
                  >
                    {saved ? '✓ Gespeichert' : 'Speichern'}
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
}
