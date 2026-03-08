'use client';
import { useRouter } from 'next/navigation';

export default function HilfePage() {
  const router = useRouter();

  const sections = [
    {
      title: '🚀 Erste Schritte',
      items: [
        {
          q: 'Wie registriere ich mich?',
          a: 'Klicke auf "Registrieren" oben rechts und fülle das Formular aus.',
        },
        {
          q: 'Ist die WitzeApp kostenlos?',
          a: 'Ja, die WitzeApp ist komplett kostenlos nutzbar.',
        },
        {
          q: 'Kann ich die App ohne Account nutzen?',
          a: 'Ja, als Gast kannst du Witze lesen und Kommentare lesen. Zum Posten, Liken und Kommentieren benötigst du einen Account.',
        },
      ],
    },
    {
      title: '📝 Witze posten',
      items: [
        {
          q: 'Wie poste ich einen Witz?',
          a: 'Entweder über den "Neuer Witz"-Button oder das Schnelleingabefeld im Forum.',
        },
        {
          q: 'Kann ich meinen Witz bearbeiten?',
          a: 'Ja, auf deinem Profil kannst du eigene Witze bearbeiten. Bearbeitete Witze werden mit einem ✏️-Badge markiert.',
        },
        {
          q: 'Wie lösche ich einen Witz?',
          a: 'Auf deinem Profil beim jeweiligen Witz auf das 🗑️-Symbol klicken.',
        },
        {
          q: 'Was sind Kategorien?',
          a: 'Kategorien helfen dabei Witze zu sortieren. Du kannst beim Posten eine Kategorie auswählen.',
        },
      ],
    },
    {
      title: '❤️ Likes & Kommentare',
      items: [
        {
          q: 'Wie like ich einen Witz?',
          a: 'Klicke auf das ♥-Symbol unter einem Witz. Nochmaliges Klicken entfernt den Like.',
        },
        {
          q: 'Wie kommentiere ich?',
          a: 'Klicke auf das 💬-Symbol unter einem Witz um die Kommentare zu öffnen.',
        },
        {
          q: 'Bekomme ich Benachrichtigungen?',
          a: 'Ja, du wirst benachrichtigt wenn jemand deinen Witz liked, kommentiert oder dir folgt.',
        },
      ],
    },
    {
      title: '👤 Profil & Account',
      items: [
        {
          q: 'Wie ändere ich mein Passwort?',
          a: 'Auf deinem Profil auf "🔒 Passwort" klicken.',
        },
        {
          q: 'Wie ändere ich meinen Username?',
          a: 'Auf deinem Profil auf "✏️ Username" klicken.',
        },
        {
          q: 'Was ist ein Streak?',
          a: 'Ein Streak zählt wie viele Tage hintereinander du mindestens einen Witz gepostet hast.',
        },
        {
          q: 'Was sind Badges?',
          a: 'Badges sind Auszeichnungen die du automatisch verdienst. z.B. für deinen ersten Witz oder 10 Likes.',
        },
        {
          q: 'Was ist der Rang?',
          a: 'Der Rang steigt mit der Anzahl der Likes die du erhalten hast – von 🥉 Neuling bis 👑 König der Witze.',
        },
      ],
    },
    {
      title: '🚩 Melden & Sicherheit',
      items: [
        {
          q: 'Wie melde ich einen Witz?',
          a: 'Klicke auf das 🚩-Symbol unter einem Witz und wähle einen Grund aus.',
        },
        {
          q: 'Was passiert nach einer Meldung?',
          a: 'Ein Admin prüft die Meldung und entscheidet ob der Witz gelöscht wird.',
        },
        {
          q: 'Was ist eine Verwarnung?',
          a: 'Admins können User für Regelverstöße verwarnen. Verwarnungen sind nur für dich sichtbar.',
        },
      ],
    },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-gray-950 to-slate-900">
      <div className="max-w-3xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="text-5xl block mb-4">❓</span>
          <h1 className="text-4xl font-black text-white mb-3">Hilfe & FAQ</h1>
          <p className="text-gray-400">
            Antworten auf häufige Fragen zur WitzeApp
          </p>
          <div className="flex gap-3 justify-center mt-6">
            <button
              onClick={() => router.push('/')}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-sm transition-all"
            >
              🏠 Zum Forum
            </button>
            <button
              onClick={() => router.push('/register')}
              className="px-5 py-2.5 bg-gray-800 hover:bg-gray-700 border border-gray-700/50 text-gray-300 font-bold rounded-xl text-sm transition-all"
            >
              Registrieren
            </button>
          </div>
        </div>

        {/* Sections */}
        <div className="space-y-6">
          {sections.map((section) => (
            <div
              key={section.title}
              className="bg-gray-900/80 backdrop-blur-xl border border-gray-800/50 rounded-3xl p-6"
            >
              <h2 className="text-xl font-black text-white mb-4">
                {section.title}
              </h2>
              <div className="space-y-4">
                {section.items.map((item, i) => (
                  <div
                    key={i}
                    className="border-b border-gray-800/50 last:border-0 pb-4 last:pb-0"
                  >
                    <p className="text-white text-sm font-semibold mb-1">
                      {item.q}
                    </p>
                    <p className="text-gray-400 text-sm">{item.a}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-gray-600 text-sm">
          <p>Noch Fragen? Schreib einen Kommentar oder melde dich an.</p>
        </div>
      </div>
    </main>
  );
}
