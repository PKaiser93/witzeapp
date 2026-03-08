'use client';
import { useRouter } from 'next/navigation';

export default function DatenschutzPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-gray-950 to-slate-900">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.back()}
            className="text-gray-400 hover:text-white transition-colors text-sm"
          >
            ← Zurück
          </button>
          <h1 className="text-3xl font-black text-white">
            Datenschutzerklärung
          </h1>
        </div>

        <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-800/50 rounded-3xl p-8 space-y-6 text-gray-400 text-sm leading-relaxed">
          <section>
            <h2 className="text-lg font-bold text-white mb-3">
              1. Verantwortlicher
            </h2>
            <p>
              Patrick Kaiser, Feldstraße 10, 91085 Weisendorf, E-Mail:
              patrick@kaiser.gmx
            </p>
          </section>

          <hr className="border-gray-800" />

          <section>
            <h2 className="text-lg font-bold text-white mb-3">
              2. Welche Daten wir erheben
            </h2>
            <ul className="list-disc list-inside space-y-1">
              <li>E-Mail-Adresse (bei Registrierung)</li>
              <li>Benutzername (bei Registrierung)</li>
              <li>Passwort (verschlüsselt gespeichert)</li>
              <li>Gepostete Witze und Kommentare</li>
              <li>Likes und Follower-Beziehungen</li>
              <li>Admin-Aktionen (Audit-Log, max. 30 Tage)</li>
            </ul>
          </section>

          <hr className="border-gray-800" />

          <section>
            <h2 className="text-lg font-bold text-white mb-3">
              3. Zweck der Datenverarbeitung
            </h2>
            <ul className="list-disc list-inside space-y-1">
              <li>Bereitstellung der Plattform-Funktionen</li>
              <li>Authentifizierung und Sicherheit</li>
              <li>Moderation und Missbrauchsschutz</li>
            </ul>
          </section>

          <hr className="border-gray-800" />

          <section>
            <h2 className="text-lg font-bold text-white mb-3">
              4. Rechtsgrundlage
            </h2>
            <p>
              Die Verarbeitung erfolgt auf Basis von Art. 6 Abs. 1 lit. b DSGVO
              (Vertragserfüllung) sowie Art. 6 Abs. 1 lit. f DSGVO (berechtigte
              Interessen).
            </p>
          </section>

          <hr className="border-gray-800" />

          <section>
            <h2 className="text-lg font-bold text-white mb-3">
              5. Speicherdauer
            </h2>
            <ul className="list-disc list-inside space-y-1">
              <li>Account-Daten: bis zur Löschung des Accounts</li>
              <li>Audit-Logs: maximal 30 Tage</li>
              <li>Server-Logs: maximal 7 Tage</li>
            </ul>
          </section>

          <hr className="border-gray-800" />

          <section>
            <h2 className="text-lg font-bold text-white mb-3">
              6. Deine Rechte
            </h2>
            <ul className="list-disc list-inside space-y-1">
              <li>Auskunft über gespeicherte Daten (Art. 15 DSGVO)</li>
              <li>Berichtigung unrichtiger Daten (Art. 16 DSGVO)</li>
              <li>
                Löschung deiner Daten (Art. 17 DSGVO) – über "Account löschen"
              </li>
              <li>Datenportabilität (Art. 20 DSGVO)</li>
              <li>Widerspruch gegen die Verarbeitung (Art. 21 DSGVO)</li>
            </ul>
            <p className="mt-2">
              Kontakt für Datenschutzanfragen: patrick@kaiser.gmx
            </p>
          </section>

          <hr className="border-gray-800" />

          <section>
            <h2 className="text-lg font-bold text-white mb-3">7. Cookies</h2>
            <p>
              Wir verwenden keine Tracking-Cookies. Es werden ausschließlich
              technisch notwendige Daten im localStorage des Browsers
              gespeichert (Login-Token, Username).
            </p>
          </section>

          <hr className="border-gray-800" />

          <section>
            <h2 className="text-lg font-bold text-white mb-3">
              8. Beschwerderecht
            </h2>
            <p>
              Du hast das Recht, dich bei der zuständigen Datenschutzbehörde zu
              beschweren. In Bayern ist dies das Bayerische Landesamt für
              Datenschutzaufsicht (BayLDA).
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
