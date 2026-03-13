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
        <li key={i} className="flex gap-2">
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
          {/* 1 Verantwortlicher */}
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

          {/* 2 Welche Daten wir erheben */}
          <Section number="2" title="Welche Daten wir erheben">
            <List
              items={[
                'Registrierungsdaten: E-Mail-Adresse, Benutzername, Passwort (gehasht mit bcrypt)',
                'Inhalte auf der Plattform: gepostete Witze, Kommentare, Likes, Follower-Beziehungen',
                'Kommunikations- und Supportdaten: Nachrichten über das Kontaktformular inkl. optional angegebener E-Mail-Adresse',
                'System- und Sicherheitsdaten: technische Protokolle (Server-Logs, Audit-Logs) zur Fehleranalyse und Missbrauchserkennung',
                'Nutzungsbezogene Daten in deinem Profil: z.B. Badges, Verifizierungsstatus, Streaks',
              ]}
            />
          </Section>

          {/* 3 Zweck der Datenverarbeitung */}
          <Section number="3" title="Zweck der Datenverarbeitung">
            <List
              items={[
                'Bereitstellung und Betrieb der WitzeApp-Plattform',
                'Durchführung von Registrierung, Login und Authentifizierung',
                'Moderation, Missbrauchserkennung und Sicherstellung eines fairen und sicheren Umgangs',
                'Benachrichtigungen über Aktivitäten (z.B. neue Kommentare, Follower) – soweit von dir gewünscht',
                'Bearbeitung von Anfragen, Feedback und Support-Nachrichten',
                'Erfüllung gesetzlicher Aufbewahrungs- und Nachweispflichten',
              ]}
            />
          </Section>

          {/* 4 Rechtsgrundlage */}
          <Section number="4" title="Rechtsgrundlage">
            <p>
              Die Verarbeitung deiner Daten erfolgt insbesondere auf folgenden
              Rechtsgrundlagen der DSGVO:
            </p>
            <List
              items={[
                'Art. 6 Abs. 1 lit. b DSGVO – zur Erfüllung unseres Nutzungsvertrags mit dir (z.B. Registrierung, Nutzung der App)',
                'Art. 6 Abs. 1 lit. f DSGVO – auf Basis unserer berechtigten Interessen (z.B. Sicherheit, Missbrauchsbekämpfung, Stabilität des Dienstes)',
                'Art. 6 Abs. 1 lit. c DSGVO – soweit wir gesetzlich zur Aufbewahrung bestimmter Daten verpflichtet sind',
              ]}
            />
          </Section>

          {/* 5 Speicherdauer */}
          <Section number="5" title="Speicherdauer">
            <List
              items={[
                'Account-Daten: bis zur Löschung des Accounts (oder solange rechtliche Pflichten bestehen)',
                'Support- und Kontaktanfragen: in der Regel bis zu 12 Monate nach Abschluss des Vorgangs',
                'Audit-Logs und sicherheitsrelevante Protokolle: maximal 30 Tage, sofern keine Sicherheitsvorfälle eine längere Aufbewahrung erfordern',
                'Server-Logs: in der Regel maximal 7 Tage',
                'Passwort-Reset- und Verifizierungs-Links: typischerweise 1 Stunde (Reset) bzw. 24 Stunden (Verifizierung) gültig',
              ]}
            />
          </Section>

          {/* 6 Rechte nach DSGVO */}
          <Section number="6" title="Deine Rechte (DSGVO)">
            <List
              items={[
                'Auskunft über gespeicherte Daten (Art. 15 DSGVO)',
                'Berichtigung unrichtiger Daten (Art. 16 DSGVO)',
                'Löschung deiner Daten (Art. 17 DSGVO) – über „Account löschen“ im Profil',
                'Datenportabilität (Art. 20 DSGVO) – über „Daten exportieren“ im Profil (soweit angeboten)',
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
              . Damit wir deine Anfrage korrekt zuordnen können, können wir dich
              bitten, Angaben zu deiner Registrierung zu machen (z.B.
              Benutzername oder E-Mail-Adresse).
            </p>
          </Section>

          {/* 7 Cookies & lokale Speicherung */}
          <Section number="7" title="Cookies & lokale Speicherung">
            <p>
              Wir setzen keine Tracking-Cookies oder Analyse-Tools ein. Zur
              technischen Bereitstellung der Funktionen nutzen wir lokale
              Speichermechanismen deines Browsers (z.B. localStorage):
            </p>
            <List
              items={[
                'kurzlebige Tokens für die Authentifizierung und Sitzungserneuerung',
                'Anzeigeinformationen wie dein Benutzername oder Rollen für das UI',
              ]}
            />
            <p>
              Diese Daten verbleiben auf deinem Gerät und werden beim Logout
              oder Entfernen im Browser entfernt. Bitte achte darauf, dein Gerät
              zu schützen und die WitzeApp nicht auf fremden Geräten eingeloggt
              zu lassen.
            </p>
          </Section>

          {/* 8 Datenweitergabe */}
          <Section number="8" title="Datenweitergabe">
            <p>
              Wir verkaufen deine Daten nicht und geben sie grundsätzlich nicht
              an Dritte weiter. Für einzelne Funktionen setzen wir jedoch
              Dienstleister als Auftragsverarbeiter ein:
            </p>
            <List
              items={[
                'E-Mail-Versand (z.B. Verifizierungs- und Support-E-Mails) über Resend, einen spezialisierten E-Mail-Dienstleister.',
              ]}
            />
            <p>
              Resend verarbeitet E-Mail-Adressen und Inhalte in unserem Auftrag
              und kann Daten in den USA speichern. Resend ist nach eigener
              Aussage GDPR-konform und u.a. unter dem EU-US Data Privacy
              Framework zertifiziert. Details findest du in der{' '}
              <a
                href="https://resend.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                Datenschutzerklärung von Resend
              </a>{' '}
              und im{' '}
              <a
                href="https://resend.com/legal/dpa"
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                Data Processing Addendum (DPA)
              </a>
              .
            </p>
          </Section>

          {/* 9 Beschwerderecht */}
          <Section number="9" title="Beschwerderecht" last>
            <p>
              Wenn du der Meinung bist, dass die Verarbeitung deiner
              personenbezogenen Daten gegen Datenschutzrecht verstößt, hast du
              das Recht auf Beschwerde bei einer Aufsichtsbehörde (Art. 77
              DSGVO). In Bayern ist dies insbesondere das{' '}
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
