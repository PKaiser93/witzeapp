'use client';
import { useRouter } from 'next/navigation';

export default function ImpressumPage() {
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
          <h1 className="text-3xl font-black text-white">Impressum</h1>
        </div>

        <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-800/50 rounded-3xl p-8 space-y-6">
          <section>
            <h2 className="text-lg font-bold text-white mb-3">
              Angaben gemäß § 5 TMG
            </h2>
            <p className="text-gray-400 text-sm leading-relaxed">
              Patrick Kaiser
              <br />
              Feldstraße 10
              <br />
              91085 Weisendorf
              <br />
              Deutschland
            </p>
          </section>

          <hr className="border-gray-800" />

          <section>
            <h2 className="text-lg font-bold text-white mb-3">Kontakt</h2>
            <p className="text-gray-400 text-sm leading-relaxed">
              E-Mail: patrick@kaiser.gmx
            </p>
          </section>

          <hr className="border-gray-800" />

          <section>
            <h2 className="text-lg font-bold text-white mb-3">
              Verantwortlich für den Inhalt
            </h2>
            <p className="text-gray-400 text-sm leading-relaxed">
              Patrick Kaiser
              <br />
              Feldstraße 10
              <br />
              91085 Weisendorf
            </p>
          </section>

          <hr className="border-gray-800" />

          <section>
            <h2 className="text-lg font-bold text-white mb-3">
              Haftungsausschluss
            </h2>
            <p className="text-gray-400 text-sm leading-relaxed">
              Die Inhalte dieser Seite wurden mit größtmöglicher Sorgfalt
              erstellt. Für die Richtigkeit, Vollständigkeit und Aktualität der
              Inhalte können wir jedoch keine Gewähr übernehmen. Als
              Diensteanbieter sind wir für eigene Inhalte auf diesen Seiten nach
              den allgemeinen Gesetzen verantwortlich.
            </p>
          </section>

          <hr className="border-gray-800" />

          <section>
            <h2 className="text-lg font-bold text-white mb-3">Urheberrecht</h2>
            <p className="text-gray-400 text-sm leading-relaxed">
              Die durch die Seitenbetreiber erstellten Inhalte und Werke auf
              diesen Seiten unterliegen dem deutschen Urheberrecht. Die
              Vervielfältigung, Bearbeitung, Verbreitung und jede Art der
              Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der
              schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
