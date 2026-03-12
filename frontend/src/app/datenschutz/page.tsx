'use client';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/AppLayout';

function Section({
                   number,
                   title,
                   children,
                   last = false,
                 }: {
  number: string;
  title: string;
  children: React.ReactNode;
  last?: boolean;
}) {
  return (
      <div className={`px-6 py-5 ${!last ? 'border-b border-gray-800/50' : ''}`}>
        <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-3">
          {number}. {title}
        </h2>
        <div className="text-gray-400 text-sm leading-relaxed space-y-2">
          {children}
        </div>
      </div>
  );
}

function List({ items }: { items: string[] }) {
    return (
        <ul className="space-y-1.5">
            {items.map((item, i) => (
                <li>
                <span className="text-indigo-500 mt-0.5 flex-shrink-0">•</span>
                <span>{item}</span>
                </li>
            ))}
        </ul>
    );
}


export default function DatenschutzPage() {
  const router = useRouter();

  return (
      <AppLayout>
        <div className="max-w-3xl mx-auto px-4 py-8">

          {/* Header */}
          <div className="text-center mb-10">
            <span className="text-5xl block mb-4">🔒</span>
            <h1 className="text-4xl font-black text-white mb-2">
              Datenschutzerklärung
            </h1>
            <p className="text-gray-400 text-sm">
              Zuletzt aktualisiert: März 2026
            </p>
          </div>

          <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-800/50 rounded-3xl overflow-hidden">

            <Section number="1" title="Verantwortlicher">
              <p>
                Patrick Kaiser
                <br />
                Feldstraße 10, 91085 Weisendorf
                <br />
                E-Mail:{' '}
                <a
                    href="mailto:patrick@kaiser.gmx"
                    className="text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  patrick@kaiser.gmx
                </a>
              </p>
            </Section>

            <Section number="2" title="Welche Daten wir erheben">
              <List
                  items={[
                    'E-Mail-Adresse (bei Registrierung)',
                    'Benutzername (bei Registrierung)',
                    'Passwort (verschlüsselt gespeichert mit bcrypt)',
                    'Gepostete Witze und Kommentare',
                    'Likes und Follower-Beziehungen',
                    'Benachrichtigungen und Interaktionen',
                    'Admin-Aktionen (Audit-Log, max. 30 Tage)',
                  ]}
              />
            </Section>

            <Section number="3" title="Zweck der Datenverarbeitung">
              <List
                  items={[
                    'Bereitstellung der Plattform-Funktionen',
                    'Authentifizierung und Sicherheit (JWT, Refresh Token)',
                    'Moderation und Missbrauchsschutz',
                    'Benachrichtigungen über Aktivitäten',
                  ]}
              />
            </Section>

            <Section number="4" title="Rechtsgrundlage">
              <p>
                Die Verarbeitung erfolgt auf Basis von Art. 6 Abs. 1 lit. b DSGVO
                (Vertragserfüllung) sowie Art. 6 Abs. 1 lit. f DSGVO (berechtigte
                Interessen an Sicherheit und Missbrauchsschutz).
              </p>
            </Section>

            <Section number="5" title="Speicherdauer">
              <List
                  items={[
                    'Account-Daten: bis zur Löschung des Accounts',
                    'Audit-Logs: maximal 30 Tage',
                    'Server-Logs: maximal 7 Tage',
                    'Abgelaufene JWT-Tokens: werden automatisch bereinigt',
                    'Passwort-Reset-Tokens: 1 Stunde Gültigkeit',
                  ]}
              />
            </Section>

            <Section number="6" title="Deine Rechte (DSGVO)">
              <List
                  items={[
                    'Auskunft über gespeicherte Daten (Art. 15 DSGVO)',
                    'Berichtigung unrichtiger Daten (Art. 16 DSGVO)',
                    'Löschung deiner Daten (Art. 17 DSGVO) – über "Account löschen" im Profil',
                    'Datenportabilität (Art. 20 DSGVO) – über "Daten exportieren" im Profil',
                    'Widerspruch gegen die Verarbeitung (Art. 21 DSGVO)',
                  ]}
              />
              <p className="mt-2">
                Kontakt für Datenschutzanfragen:{' '}
                <a
                    href="mailto:patrick@kaiser.gmx"
                    className="text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  patrick@kaiser.gmx
                </a>
              </p>
            </Section>

            <Section number="7" title="Cookies & lokale Speicherung">
              <p>
                Wir verwenden keine Tracking-Cookies oder Analyse-Tools. Es werden
                ausschließlich technisch notwendige Daten im{' '}
                <span className="text-white font-medium">localStorage</span> des
                Browsers gespeichert:
              </p>
              <List
                  items={[
                    'token – JWT Access Token für die Authentifizierung',
                    'refresh_token – für automatische Token-Erneuerung',
                    'username – für die Anzeige im UI',
                    'role – für die Anzeige von Admin-Funktionen',
                  ]}
              />
            </Section>

            <Section number="8" title="Datenweitergabe">
              <p>
                Deine Daten werden nicht an Dritte weitergegeben. Ausnahme: Der
                E-Mail-Versand (Verifizierung, Passwort-Reset) erfolgt über{' '}
                <span className="text-white font-medium">Resend</span> (
                <a
                    href="https://resend.com/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  Datenschutz
                </a>
                ).
              </p>
            </Section>

            <Section number="9" title="Beschwerderecht" last>
              <p>
                Du hast das Recht, dich bei der zuständigen Datenschutzbehörde zu
                beschweren. In Bayern ist dies das{' '}
                <a
                    href="https://www.lda.bayern.de"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  Bayerische Landesamt für Datenschutzaufsicht (BayLDA)
                </a>
                .
              </p>
            </Section>
          </div>
        </div>
      </AppLayout>
  );
}
