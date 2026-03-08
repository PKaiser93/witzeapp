'use client';
import { useRouter } from 'next/navigation';

const CHANGELOG = [
  {
    version: '1.0.0',
    date: '08.03.2026',
    type: 'release',
    changes: [
      { type: 'new', text: 'Öffentlicher Feed – Witze ohne Login lesbar' },
      { type: 'new', text: 'User folgen & Following-Feed' },
      { type: 'new', text: 'Öffentliche Profilseiten' },
      { type: 'new', text: 'Badges & Achievements System' },
      { type: 'new', text: 'Streak-System – tägliches Posten wird belohnt' },
      { type: 'new', text: 'Rang-System mit 7 Stufen' },
      { type: 'new', text: 'Admin-Panel mit separaten Seiten' },
      { type: 'new', text: 'Ban-System mit Zeitangabe' },
      { type: 'new', text: 'Verwarnungssystem' },
      { type: 'new', text: 'Melde-System für Witze' },
      { type: 'new', text: 'Feature-Flags für Admins' },
      { type: 'new', text: 'Wartungsmodus' },
      { type: 'new', text: 'Systembenachrichtigungen' },
      { type: 'new', text: 'Audit-Log für Admin-Aktionen' },
      { type: 'new', text: 'Automatisches Log-Cleanup nach 30 Tagen' },
      {
        type: 'new',
        text: 'Benachrichtigungen für Likes, Kommentare & Follows',
      },
      { type: 'new', text: 'Kategorien mit Filterung' },
      { type: 'new', text: 'Suche & Sortierung im Feed' },
      { type: 'new', text: 'Kommentare direkt im Feed' },
      { type: 'new', text: 'Daten-Export (DSGVO Art. 20)' },
      { type: 'new', text: 'Rate Limiting & Brute-Force-Schutz' },
      { type: 'new', text: 'Profilbeschreibung (Bio)' },
      { type: 'new', text: 'Username ändern' },
      { type: 'new', text: 'Passwort ändern' },
      { type: 'new', text: 'Account löschen' },
      { type: 'new', text: 'Hilfe & FAQ Seite' },
      { type: 'new', text: 'Impressum & Datenschutzerklärung' },
    ],
  },
];

const TYPE_CONFIG = {
  new: {
    label: 'Neu',
    color: 'bg-green-500/20 text-green-300 border-green-500/30',
  },
  fix: { label: 'Fix', color: 'bg-red-500/20 text-red-300 border-red-500/30' },
  improved: {
    label: 'Verbessert',
    color: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  },
  security: {
    label: 'Sicherheit',
    color: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
  },
};

const RELEASE_TYPE = {
  release: { label: 'Release', color: 'bg-indigo-600 text-white' },
  hotfix: { label: 'Hotfix', color: 'bg-red-600 text-white' },
  beta: { label: 'Beta', color: 'bg-yellow-600 text-white' },
};

export default function ChangelogPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-gray-950 to-slate-900">
      <div className="max-w-3xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.back()}
            className="text-gray-400 hover:text-white transition-colors text-sm"
          >
            ← Zurück
          </button>
        </div>

        <div className="text-center mb-12">
          <span className="text-5xl block mb-4">📝</span>
          <h1 className="text-4xl font-black text-white mb-3">Changelog</h1>
          <p className="text-gray-400">
            Alle Änderungen und neuen Features der WitzeApp
          </p>
        </div>

        {/* Entries */}
        <div className="space-y-8">
          {CHANGELOG.map((entry) => {
            const releaseConfig =
              RELEASE_TYPE[entry.type as keyof typeof RELEASE_TYPE];
            return (
              <div key={entry.version} className="relative">
                {/* Version Header */}
                <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-800/50 rounded-3xl p-6 mb-1">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <h2 className="text-2xl font-black text-white">
                        v{entry.version}
                      </h2>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${releaseConfig.color}`}
                      >
                        {releaseConfig.label}
                      </span>
                    </div>
                    <span className="text-gray-500 text-sm">{entry.date}</span>
                  </div>

                  {/* Changes */}
                  <div className="space-y-2">
                    {entry.changes.map((change, i) => {
                      const typeConfig =
                        TYPE_CONFIG[change.type as keyof typeof TYPE_CONFIG];
                      return (
                        <div
                          key={i}
                          className="flex items-start gap-3 py-2 border-b border-gray-800/50 last:border-0"
                        >
                          <span
                            className={`px-2 py-0.5 rounded-md text-xs font-medium border flex-shrink-0 mt-0.5 ${typeConfig.color}`}
                          >
                            {typeConfig.label}
                          </span>
                          <p className="text-gray-300 text-sm">{change.text}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="text-center mt-12 text-gray-600 text-sm">
          <p>WitzeApp · Made with ❤️ in Bayern</p>
        </div>
      </div>
    </main>
  );
}
