'use client';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/AppLayout';

const CHANGELOG = [
  {
    version: '1.3.0',
    date: '12.03.2026',
    type: 'release',
    changes: [
      { type: 'new', text: 'Verified Badge (blauer Haken) – Bewerbungssystem für verifizierte Accounts' },
      { type: 'new', text: 'Leaderboard mit Podium für Top 3, Rang-Anzeige und Verified Badge' },
      { type: 'new', text: 'Witz teilen – Share-Button mit Copy-Link in Feed, Detail- und Following-Seite' },
      { type: 'new', text: 'Witz-Detail-Seite komplett überarbeitet – Share, isBlueVerified in Kommentaren' },
      { type: 'improved', text: 'Post-Seite – Kategorie als Button-Grid, Live-Vorschau, Zeichenzähler' },
      { type: 'improved', text: 'Following-Seite – BlueCheckmark, Share-Button, typisiertes Interface' },
      { type: 'improved', text: 'Navbar – Posten-Button, Notification-Badge, User-Menu mit Unread-Count' },
      { type: 'improved', text: 'Sidebar – aufgeräumt in Menü/Account/Admin-Sektionen' },
      { type: 'improved', text: 'Hilfe & FAQ – Accordion, alle neuen Features ergänzt' },
      { type: 'improved', text: 'Report-Modal – Emojis, Checkmark, Backdrop-Close, Spinner' },
      { type: 'improved', text: 'Admin Config – Feature-Flags wieder sichtbar, Announcement-Fix' },
      { type: 'improved', text: 'Admin Audit-Log – Suchfeld, Anzahl-Badges, klickbarer Admin' },
      { type: 'fix', text: 'Admin Config – announcement_active Filter-Bug behoben' },
      { type: 'fix', text: 'fetchWithAuth – automatischer Token-Refresh bei 401, kein ungewolltes Ausloggen mehr' },
      { type: 'fix', text: 'Datenexport – isBlueVerified, rang, streaks, Kategorien, Benachrichtigungen ergänzt' },
      { type: 'fix', text: 'AppConfig Seed – Prisma pg-Adapter, alle Feature-Flags als Default angelegt' },
      { type: 'security', text: 'ENV Validierung erweitert – JWT_REFRESH_SECRET, RESEND_API_KEY, APP_URL' },
    ],
  },
  {
    version: '1.2.0',
    date: '10.03.2026',
    type: 'release',
    changes: [
      { type: 'new', text: 'E-Mail-Verifizierung beim Registrieren' },
      { type: 'new', text: 'Passwort vergessen / Reset-Flow per E-Mail' },
      { type: 'new', text: 'Resend.com als Mail-Provider' },
      { type: 'new', text: 'Expired Token Cleanup Cronjob' },
      { type: 'new', text: 'Cursor-basierte Pagination im Feed' },
      { type: 'new', text: 'Witz-Suche & Kategorie-Filter im Feed' },
      { type: 'new', text: 'Öffentliche Profilseiten' },
      { type: 'new', text: 'Admin-Panel – User-Übersicht überarbeitet' },
      { type: 'improved', text: 'Feed-Sortierung: Neu, Top, Kommentare' },
      { type: 'security', text: 'Token Blacklist beim Logout' },
    ],
  },
  {
    version: '1.1.0',
    date: '09.03.2026',
    type: 'release',
    changes: [
      { type: 'new', text: 'JWT Refresh Token System' },
      { type: 'new', text: 'User folgen & Following-Feed' },
      { type: 'new', text: 'Badges & Achievements System' },
      { type: 'new', text: 'Streak-System – tägliches Posten wird belohnt' },
      { type: 'new', text: 'Rang-System mit 7 Stufen' },
      { type: 'new', text: 'Benachrichtigungen für Likes, Kommentare & Follows' },
      { type: 'new', text: 'Kategorien mit Filterung' },
      { type: 'new', text: 'Kommentare direkt im Feed' },
      { type: 'improved', text: 'Feed Performance – Cursor-Pagination vorbereitet' },
      { type: 'security', text: 'Rate Limiting & Brute-Force-Schutz' },
    ],
  },
  {
    version: '1.0.0',
    date: '08.03.2026',
    type: 'release',
    changes: [
      { type: 'new', text: 'Öffentlicher Feed – Witze ohne Login lesbar' },
      { type: 'new', text: 'Registrierung & Login' },
      { type: 'new', text: 'Admin-Panel mit separaten Seiten' },
      { type: 'new', text: 'Ban-System mit Zeitangabe' },
      { type: 'new', text: 'Verwarnungssystem' },
      { type: 'new', text: 'Melde-System für Witze' },
      { type: 'new', text: 'Feature-Flags für Admins' },
      { type: 'new', text: 'Wartungsmodus & Systembenachrichtigungen' },
      { type: 'new', text: 'Audit-Log für Admin-Aktionen' },
      { type: 'new', text: 'Daten-Export (DSGVO Art. 20)' },
      { type: 'new', text: 'Profilbeschreibung (Bio), Username & Passwort ändern' },
      { type: 'new', text: 'Hilfe & FAQ, Impressum & Datenschutzerklärung' },
    ],
  },
];

const TYPE_CONFIG = {
  new:      { label: 'Neu',        color: 'bg-green-500/20 text-green-300 border-green-500/30' },
  fix:      { label: 'Fix',        color: 'bg-red-500/20 text-red-300 border-red-500/30' },
  improved: { label: 'Verbessert', color: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
  security: { label: 'Sicherheit', color: 'bg-orange-500/20 text-orange-300 border-orange-500/30' },
};

const RELEASE_TYPE = {
  release: { label: 'Release', color: 'bg-indigo-600 text-white' },
  hotfix:  { label: 'Hotfix',  color: 'bg-red-600 text-white' },
  beta:    { label: 'Beta',    color: 'bg-yellow-600 text-white' },
};

export default function ChangelogPage() {
  const router = useRouter();

  return (
      <AppLayout>
        <div className="max-w-3xl mx-auto px-4 py-8">

          {/* Header */}
          <div className="text-center mb-10">
            <span className="text-5xl block mb-4">📝</span>
            <h1 className="text-4xl font-black text-white mb-2">Changelog</h1>
            <p className="text-gray-400 text-sm">
              Alle Änderungen und neuen Features der WitzeApp
            </p>
          </div>

          {/* Einträge */}
          <div className="space-y-6">
            {CHANGELOG.map((entry, idx) => {
              const releaseConfig = RELEASE_TYPE[entry.type as keyof typeof RELEASE_TYPE];
              const isLatest = idx === 0;
              return (
                  <div
                      key={entry.version}
                      className={`bg-gray-900/80 backdrop-blur-xl border rounded-3xl overflow-hidden ${
                          isLatest ? 'border-indigo-500/30' : 'border-gray-800/50'
                      }`}
                  >
                    {/* Version Header */}
                    <div className={`px-6 py-4 border-b ${isLatest ? 'border-indigo-500/20 bg-indigo-500/5' : 'border-gray-800/50'}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <h2 className="text-xl font-black text-white">
                            v{entry.version}
                          </h2>
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${releaseConfig.color}`}>
                        {releaseConfig.label}
                      </span>
                          {isLatest && (
                              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-500/20 text-green-300 border border-green-500/30">
                          Aktuell
                        </span>
                          )}
                        </div>
                        <span className="text-gray-500 text-sm">{entry.date}</span>
                      </div>
                    </div>

                    {/* Changes */}
                    <div className="divide-y divide-gray-800/30">
                      {entry.changes.map((change, i) => {
                        const typeConfig = TYPE_CONFIG[change.type as keyof typeof TYPE_CONFIG];
                        return (
                            <div key={i} className="flex items-start gap-3 px-6 py-3">
                        <span className={`px-2 py-0.5 rounded-md text-xs font-medium border flex-shrink-0 mt-0.5 ${typeConfig.color}`}>
                          {typeConfig.label}
                        </span>
                              <p className="text-gray-300 text-sm leading-relaxed">
                                {change.text}
                              </p>
                            </div>
                        );
                      })}
                    </div>
                  </div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="text-center mt-10 text-gray-600 text-sm">
            <p>WitzeApp · Made with ❤️ in Bayern</p>
          </div>
        </div>
      </AppLayout>
  );
}
