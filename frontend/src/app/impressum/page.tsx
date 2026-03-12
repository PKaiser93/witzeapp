'use client';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/AppLayout';

export default function ImpressumPage() {
  const router = useRouter();

  return (
      <AppLayout>
        <div className="max-w-3xl mx-auto px-4 py-8">

          {/* Header */}
          <div className="text-center mb-10">
            <span className="text-5xl block mb-4">⚖️</span>
            <h1 className="text-4xl font-black text-white mb-2">Impressum</h1>
            <p className="text-gray-400 text-sm">Angaben gemäß § 5 TMG</p>
          </div>

          <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-800/50 rounded-3xl overflow-hidden">

            <Section title="Betreiber">
              <p>Patrick Kaiser</p>
              <p>Feldstraße 10</p>
              <p>91085 Weisendorf</p>
              <p>Deutschland</p>
            </Section>

            <Section title="Kontakt">
              <p>
                E-Mail:{' '}
                <a
                    href="mailto:patrick@kaiser.gmx"
                    className="text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  patrick@kaiser.gmx
                </a>
              </p>
            </Section>

            <Section title="Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV">
              <p>Patrick Kaiser</p>
              <p>Feldstraße 10</p>
              <p>91085 Weisendorf</p>
            </Section>

            <Section title="Haftungsausschluss">
              <p>
                Die Inhalte dieser Seite wurden mit größtmöglicher Sorgfalt
                erstellt. Für die Richtigkeit, Vollständigkeit und Aktualität
                der Inhalte können wir jedoch keine Gewähr übernehmen. Als
                Diensteanbieter sind wir für eigene Inhalte auf diesen Seiten
                nach den allgemeinen Gesetzen verantwortlich.
              </p>
            </Section>

            <Section title="Urheberrecht">
              <p>
                Die durch die Seitenbetreiber erstellten Inhalte und Werke auf
                diesen Seiten unterliegen dem deutschen Urheberrecht. Die
                Vervielfältigung, Bearbeitung, Verbreitung und jede Art der
                Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen
                der schriftlichen Zustimmung des jeweiligen Autors bzw.
                Erstellers.
              </p>
            </Section>

            <Section title="Streitschlichtung" last>
              <p>
                Die Europäische Kommission stellt eine Plattform zur
                Online-Streitbeilegung (OS) bereit:{' '}
                <a
                    href="https://ec.europa.eu/consumers/odr"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  https://ec.europa.eu/consumers/odr
                </a>
                . Wir sind nicht bereit oder verpflichtet, an
                Streitbeilegungsverfahren vor einer
                Verbraucherschlichtungsstelle teilzunehmen.
              </p>
            </Section>
          </div>
        </div>
      </AppLayout>
  );
}

function Section({
                   title,
                   children,
                   last = false,
                 }: {
  title: string;
  children: React.ReactNode;
  last?: boolean;
}) {
  return (
      <div className={`px-6 py-5 ${!last ? 'border-b border-gray-800/50' : ''}`}>
        <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-3">
          {title}
        </h2>
        <div className="text-gray-400 text-sm leading-relaxed space-y-1">
          {children}
        </div>
      </div>
  );
}
