'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/AppLayout';

export default function HilfePage() {
  const router = useRouter();
  const [openIndex, setOpenIndex] = useState<string | null>(null);

  const toggle = (key: string) =>
    setOpenIndex((prev) => (prev === key ? null : key));

  const sections = [
    {
      id: 'faq-start',
      title: '🚀 Erste Schritte',
      items: [
        {
          q: 'Wie registriere ich mich?',
          a: 'Klicke auf "Registrieren" und fülle das Formular aus. Du erhältst danach eine Bestätigungs-E-Mail – erst nach der Bestätigung ist dein Account aktiv.',
        },
        {
          q: 'Ist die WitzeApp kostenlos?',
          a: 'Ja, die WitzeApp ist komplett kostenlos nutzbar.',
        },
        {
          q: 'Kann ich die App ohne Account nutzen?',
          a: 'Ja, als Gast kannst du Witze und Kommentare lesen. Zum Posten, Liken und Kommentieren benötigst du einen Account.',
        },
        {
          q: 'Ich habe mein Passwort vergessen – was tun?',
          a: 'Auf der Login-Seite auf "Passwort vergessen" klicken. Du bekommst einen Reset-Link per E-Mail zugeschickt.',
        },
        {
          q: 'Meine Bestätigungs-E-Mail ist nicht angekommen?',
          a: 'Prüfe deinen Spam-Ordner. Auf der Seite "E-Mail bestätigen" kannst du die E-Mail erneut anfordern.',
        },
      ],
    },
    {
      id: 'faq-posts',
      title: '📝 Witze posten',
      items: [
        {
          q: 'Wie poste ich einen Witz?',
          a: 'Über den "➕ Neuer Witz"-Button oder das Schnelleingabefeld direkt im Feed.',
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
          a: 'Kategorien helfen dabei Witze zu sortieren (z.B. 😂 Flachwitze, 🖤 Schwarzer Humor). Du kannst beim Posten eine Kategorie auswählen.',
        },
        {
          q: 'Gibt es eine Zeichengrenze?',
          a: 'Ja, ein Witz darf maximal 500 Zeichen lang sein.',
        },
      ],
    },
    {
      id: 'faq-likes',
      title: '❤️ Likes & Kommentare',
      items: [
        {
          q: 'Wie like ich einen Witz?',
          a: 'Klicke auf das ♥-Symbol unter einem Witz. Nochmaliges Klicken entfernt den Like.',
        },
        {
          q: 'Wie kommentiere ich?',
          a: 'Klicke auf das 💬-Symbol unter einem Witz um die Kommentare aufzuklappen.',
        },
        {
          q: 'Bekomme ich Benachrichtigungen?',
          a: 'Ja, du wirst benachrichtigt wenn jemand deinen Witz liked, kommentiert oder dir folgt. Die Glocke oben rechts zeigt ungelesene Nachrichten.',
        },
      ],
    },
    {
      id: 'faq-account',
      title: '👤 Profil & Account',
      items: [
        {
          q: 'Wie ändere ich mein Passwort?',
          a: 'Auf deinem Profil unter ⚙️ Einstellungen → "🔒 Passwort ändern".',
        },
        {
          q: 'Wie ändere ich meinen Username?',
          a: 'Auf deinem Profil unter ⚙️ Einstellungen → "✏️ Username ändern".',
        },
        {
          q: 'Wie bearbeite ich meine Bio?',
          a: 'Auf deinem Profil direkt auf den Bio-Text klicken – er wird dann editierbar.',
        },
        {
          q: 'Was ist ein Streak?',
          a: 'Ein Streak zählt wie viele Tage hintereinander du mindestens einen Witz gepostet hast. 🔥 Halte ihn aufrecht!',
        },
        {
          q: 'Was sind Badges?',
          a: 'Badges sind Auszeichnungen die du automatisch verdienst – z.B. für deinen ersten Witz, 10 Likes oder einen 7-Tage-Streak.',
        },
        {
          q: 'Was ist der Rang?',
          a: 'Der Rang steigt mit der Anzahl der erhaltenen Likes – von 🥉 Neuling bis 👑 König der Witze.',
        },
        {
          q: 'Was bedeutet der blaue Haken ✓?',
          a: 'Der blaue Haken kennzeichnet verifizierte Accounts. Du kannst dich dafür auf deinem Profil bewerben, wenn du den Status "Meister" erreicht hast.',
        },
        {
          q: 'Wie kann ich jemandem folgen?',
          a: 'Auf dem öffentlichen Profil eines Users auf "+ Folgen" klicken. Du siehst dann deren Aktivität im Feed.',
        },
        {
          q: 'Kann ich meine Daten exportieren?',
          a: 'Ja, unter ⚙️ Einstellungen → "📦 Daten exportieren" kannst du alle deine Daten als JSON-Datei herunterladen.',
        },
        {
          q: 'Wie lösche ich meinen Account?',
          a: 'Unter ⚙️ Einstellungen → "🗑️ Account löschen" (falls vom Admin aktiviert). Diese Aktion ist unwiderruflich.',
        },
      ],
    },
    {
      id: 'faq-search',
      title: '🔍 Suche & Filter',
      items: [
        {
          q: 'Wie suche ich nach Witzen?',
          a: 'Im Feed oben gibt es eine Suchleiste – gib einen Begriff ein und die Ergebnisse werden live gefiltert.',
        },
        {
          q: 'Wie filtere ich nach Kategorien?',
          a: 'Unter der Suchleiste im Feed kannst du eine Kategorie auswählen um nur Witze dieser Kategorie zu sehen.',
        },
        {
          q: 'Wie sortiere ich den Feed?',
          a: 'Du kannst zwischen "Neu", "Top" (meiste Likes) und "Kommentare" sortieren.',
        },
      ],
    },
    {
      id: 'faq-safety',
      title: '🚩 Melden & Sicherheit',
      items: [
        {
          q: 'Wie melde ich einen Witz?',
          a: 'Klicke auf das 🚩-Symbol unter einem Witz und wähle einen Grund aus.',
        },
        {
          q: 'Was passiert nach einer Meldung?',
          a: 'Ein Admin prüft die Meldung und entscheidet ob der Witz entfernt wird.',
        },
        {
          q: 'Was ist eine Verwarnung?',
          a: 'Admins können User für Regelverstöße verwarnen. Verwarnungen sind nur für dich auf deinem Profil sichtbar.',
        },
        {
          q: 'Ich wurde gebannt – was nun?',
          a: 'Bei einem temporären Ban siehst du wie lange er noch dauert. Bei einem permanenten Ban kannst du keinen neuen Account erstellen.',
        },
      ],
    },
  ];

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-500 mb-4 shadow-lg shadow-indigo-500/30">
            <span className="text-3xl">❓</span>
          </div>
          <h1 className="text-3xl font-black text-white mb-2">Hilfe & FAQ</h1>
          <p className="text-gray-400 text-sm">
            Finde Antworten zu Registrierung, Witzen, Profil und mehr.
          </p>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
          <button
            onClick={() =>
              document
                .getElementById('faq-start')
                ?.scrollIntoView({ behavior: 'smooth' })
            }
            className="bg-gray-900/80 border border-gray-800/60 rounded-2xl px-4 py-3 text-left hover:border-indigo-500/60 hover:bg-gray-900 transition-all"
          >
            <p className="text-xs text-gray-500 mb-1">Neu hier?</p>
            <p className="text-sm font-semibold text-white">Erste Schritte</p>
          </button>
          <button
            onClick={() =>
              document
                .getElementById('faq-posts')
                ?.scrollIntoView({ behavior: 'smooth' })
            }
            className="bg-gray-900/80 border border-gray-800/60 rounded-2xl px-4 py-3 text-left hover:border-indigo-500/60 hover:bg-gray-900 transition-all"
          >
            <p className="text-xs text-gray-500 mb-1">Kreativ werden</p>
            <p className="text-sm font-semibold text-white">Witze posten</p>
          </button>
          <button
            onClick={() =>
              document
                .getElementById('faq-account')
                ?.scrollIntoView({ behavior: 'smooth' })
            }
            className="bg-gray-900/80 border border-gray-800/60 rounded-2xl px-4 py-3 text-left hover:border-indigo-500/60 hover:bg-gray-900 transition-all"
          >
            <p className="text-xs text-gray-500 mb-1">Dein Bereich</p>
            <p className="text-sm font-semibold text-white">Profil & Account</p>
          </button>
        </div>

        {/* Sections */}
        <div className="space-y-4">
          {sections.map((section) => (
            <div
              key={section.title}
              id={section.id}
              className="bg-gray-900/80 backdrop-blur-xl border border-gray-800/50 rounded-3xl overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-gray-800/50">
                <h2 className="text-lg font-black text-white">
                  {section.title}
                </h2>
              </div>
              <div className="divide-y divide-gray-800/50">
                {section.items.map((item, i) => {
                  const key = `${section.title}-${i}`;
                  const isOpen = openIndex === key;
                  return (
                    <button
                      key={i}
                      onClick={() => toggle(key)}
                      className="w-full text-left px-6 py-4 hover:bg-gray-800/40 transition-colors"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <p className="text-white text-sm font-medium">
                          {item.q}
                        </p>
                        <span
                          className={`inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-800/70 text-[10px] text-gray-400 transition-transform flex-shrink-0 ${
                            isOpen ? 'rotate-180' : ''
                          }`}
                        >
                          ▼
                        </span>
                      </div>
                      {isOpen && (
                        <p className="text-gray-400 text-sm mt-2 leading-relaxed">
                          {item.a}
                        </p>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer / Call to action */}
        <div className="mt-10 text-center text-sm text-gray-500">
          <p className="mb-2">Noch Fragen oder einen Bug entdeckt?</p>
          <button
            onClick={() => router.push('/hilfe/kontakt')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-900/80 border border-gray-700/60 text-gray-200 hover:border-indigo-500/60 hover:text-white transition-all text-xs"
          >
            💬 Support kontaktieren
          </button>
        </div>
      </div>
    </AppLayout>
  );
}
