'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/AppLayout';
import { fetchWithAuth } from '@/lib/fetchWithAuth';
import { useRequireAdmin } from '@/hooks/useRequireAdmin';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

interface AppConfig {
  id: number;
  key: string;
  value: string;
  description: string | null;
}

const CONFIG_META: Record<string, { icon: string; label: string }> = {
  maintenance: { icon: '🔧', label: 'Wartungsmodus' },
  feature_comments: { icon: '💬', label: 'Kommentare' },
  feature_likes: { icon: '❤️', label: 'Likes' },
  feature_register: { icon: '📝', label: 'Registrierung' },
  feature_report: { icon: '🚩', label: 'Meldungen' },
  feature_delete_account: { icon: '🗑️', label: 'Account löschen' },
};

const ANNOUNCEMENT_KEYS = ['announcement', 'announcement_active'];

function Toggle({
  active,
  onToggle,
}: {
  active: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      className={`relative w-12 h-6 rounded-full transition-all flex-shrink-0 ${
        active ? 'bg-indigo-600' : 'bg-gray-700'
      }`}
    >
      <span
        className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${
          active ? 'left-7' : 'left-1'
        }`}
      />
    </button>
  );
}

export default function AdminConfigPage() {
  const checking = useRequireAdmin();
  const router = useRouter();
  const [config, setConfig] = useState<AppConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (checking) return;
    const load = async () => {
      const res = await fetchWithAuth(`${API_URL}/admin/config`);
      if (res.ok) setConfig(await res.json());
      setLoading(false);
    };
    load();
  }, [checking]);

  const getValue = (key: string) =>
    config.find((c) => c.key === key)?.value ?? 'false';

  const toggleConfig = async (key: string) => {
    const current = getValue(key);
    const newValue = current === 'true' ? 'false' : 'true';
    const res = await fetchWithAuth(`${API_URL}/admin/config/${key}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ value: newValue }),
    });
    if (res.ok)
      setConfig((prev) =>
        prev.map((c) => (c.key === key ? { ...c, value: newValue } : c))
      );
  };

  const updateText = (key: string, value: string) =>
    setConfig((prev) => prev.map((c) => (c.key === key ? { ...c, value } : c)));

  const saveText = async (key: string) => {
    const value = getValue(key);
    const res = await fetchWithAuth(`${API_URL}/admin/config/${key}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ value }),
    });
    if (res.ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  // Feature-Flags: alles außer announcement-Keys
  const featureFlags = config.filter((c) => !ANNOUNCEMENT_KEYS.includes(c.key));
  const announcementActive = getValue('announcement_active') === 'true';
  const announcementText =
    config.find((c) => c.key === 'announcement')?.value ?? '';

  if (checking) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin w-8 h-8 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full" />
        </div>
      </AppLayout>
    );
  }

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
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin w-8 h-8 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full" />
          </div>
        ) : (
          <>
            {/* Feature Flags */}
            <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-800/50 rounded-3xl overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-800/50">
                <h2 className="text-lg font-black text-white">
                  ⚡ Feature-Flags
                </h2>
                <p className="text-gray-500 text-xs mt-0.5">
                  {featureFlags.filter((c) => c.value === 'true').length} von{' '}
                  {featureFlags.length} aktiv
                </p>
              </div>
              <div className="divide-y divide-gray-800/50">
                {featureFlags.length === 0 && (
                  <p className="text-gray-500 text-sm px-6 py-8 text-center">
                    Keine Feature-Flags gefunden
                  </p>
                )}
                {featureFlags.map((c) => {
                  const meta = CONFIG_META[c.key];
                  const isActive = c.value === 'true';
                  return (
                    <div
                      key={c.key}
                      className="flex items-center justify-between px-6 py-4 hover:bg-gray-800/20 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl w-8 text-center">
                          {meta?.icon ?? '⚙️'}
                        </span>
                        <div>
                          <p className="text-white text-sm font-semibold">
                            {c.description ?? meta?.label ?? c.key}
                          </p>
                          <p className="text-gray-600 text-xs font-mono mt-0.5">
                            {c.key}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span
                          className={`text-xs font-semibold ${
                            isActive ? 'text-green-400' : 'text-gray-600'
                          }`}
                        >
                          {isActive ? 'Aktiv' : 'Inaktiv'}
                        </span>
                        <Toggle
                          active={isActive}
                          onToggle={() => toggleConfig(c.key)}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Announcement */}
            <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-800/50 rounded-3xl overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-800/50 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-black text-white">
                    📢 Systembenachrichtigung
                  </h2>
                  <p className="text-gray-500 text-xs mt-0.5">
                    Banner der allen Usern angezeigt wird
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-semibold ${announcementActive ? 'text-green-400' : 'text-gray-600'}`}
                  >
                    {announcementActive ? 'Aktiv' : 'Inaktiv'}
                  </span>
                  <Toggle
                    active={announcementActive}
                    onToggle={() => toggleConfig('announcement_active')}
                  />
                </div>
              </div>
              <div className="p-6 space-y-4">
                <textarea
                  value={announcementText}
                  onChange={(e) => updateText('announcement', e.target.value)}
                  placeholder="Nachricht für alle User eingeben..."
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white text-sm resize-none h-28 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 placeholder-gray-500 transition-all"
                />

                {/* Vorschau */}
                {announcementText && (
                  <div className="px-4 py-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
                    <p className="text-indigo-300 text-xs font-semibold mb-1 uppercase tracking-wider">
                      Vorschau
                    </p>
                    <p className="text-white text-sm">{announcementText}</p>
                  </div>
                )}

                <div className="flex justify-end">
                  <button
                    onClick={() => saveText('announcement')}
                    className={`px-6 py-2.5 text-white text-sm font-bold rounded-xl transition-all ${
                      saved
                        ? 'bg-green-600 hover:bg-green-500'
                        : 'bg-indigo-600 hover:bg-indigo-500'
                    }`}
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
