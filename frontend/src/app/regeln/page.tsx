'use client';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/AppLayout';

const RULES = [
    {
        category: '😂 Witze & Inhalte',
        rules: [
            {
                title: 'Originelle Witze',
                text: 'Poste eigene oder frei verfügbare Witze. Kein direktes Kopieren aus urheberrechtlich geschützten Quellen.',
            },
            {
                title: 'Keine Beleidigungen',
                text: 'Witze die gezielt Personen oder Gruppen beleidigen, herabwürdigen oder diskriminieren sind nicht erlaubt.',
            },
            {
                title: 'Kein Hassinhalt',
                text: 'Inhalte die Hass aufgrund von Herkunft, Religion, Geschlecht, sexueller Orientierung oder Behinderung fördern sind verboten.',
            },
            {
                title: 'Kein expliziter Inhalt',
                text: 'Sexuell explizite oder pornografische Inhalte sind nicht erlaubt.',
            },
            {
                title: 'Kein Spam',
                text: 'Mehrfaches Posten des gleichen Witzes oder sinnloser Inhalte ist nicht erlaubt.',
            },
        ],
    },
    {
        category: '💬 Kommentare & Interaktion',
        rules: [
            {
                title: 'Respektvoller Umgang',
                text: 'Behandle andere User mit Respekt. Beleidigungen, Drohungen oder persönliche Angriffe sind verboten.',
            },
            {
                title: 'Kein Harassment',
                text: 'Das gezielte Belästigen oder Verfolgen anderer User wird nicht toleriert.',
            },
            {
                title: 'Konstruktive Kritik',
                text: 'Kritik ist willkommen – aber bitte sachlich und konstruktiv formuliert.',
            },
        ],
    },
    {
        category: '👤 Account & Verhalten',
        rules: [
            {
                title: 'Ein Account pro Person',
                text: 'Jede Person darf nur einen Account besitzen. Mehrfachaccounts zum Umgehen von Sperren sind verboten.',
            },
            {
                title: 'Kein Impersonating',
                text: 'Das Ausgeben als andere Personen oder bekannte Persönlichkeiten ist nicht erlaubt.',
            },
            {
                title: 'Keine automatisierten Aktionen',
                text: 'Bots, Skripte oder automatisierte Tools zum Liken, Kommentieren oder Posten sind verboten.',
            },
            {
                title: 'Korrekte Angaben',
                text: 'Deine E-Mail-Adresse muss erreichbar sein. Fake-Accounts werden gelöscht.',
            },
        ],
    },
    {
        category: '🚩 Meldungen & Moderation',
        rules: [
            {
                title: 'Meldungen sinnvoll nutzen',
                text: 'Nutze die Meldefunktion nur für echte Regelverstöße – kein Missbrauch zum Melden von Witzen die dir nicht gefallen.',
            },
            {
                title: 'Admin-Entscheidungen',
                text: 'Entscheidungen der Admins sind bindend. Bei Fragen kannst du dich im Forum melden.',
            },
            {
                title: 'Konsequenzen',
                text: 'Regelverstöße können zu Verwarnungen, temporären oder permanenten Sperren führen.',
            },
        ],
    },
    {
        category: '✅ Verified Badge',
        rules: [
            {
                title: 'Voraussetzung',
                text: 'Du kannst dich für den blauen Haken bewerben sobald du den Rang "Meister" (100+ Likes) erreicht hast.',
            },
            {
                title: 'Kein Anspruch',
                text: 'Das Erfüllen der Voraussetzungen gibt keinen automatischen Anspruch auf Verifizierung – Admins entscheiden.',
            },
            {
                title: 'Entzug',
                text: 'Der Verified Status kann bei Regelverstößen jederzeit entzogen werden.',
            },
        ],
    },
];

export default function RegelnPage() {
    const router = useRouter();

    return (
        <AppLayout>
            <div className="max-w-3xl mx-auto px-4 py-8">

                {/* Header */}
                <div className="text-center mb-10">
                    <span className="text-5xl block mb-4">📜</span>
                    <h1 className="text-4xl font-black text-white mb-2">
                        Community-Regeln
                    </h1>
                    <p className="text-gray-400 text-sm max-w-lg mx-auto">
                        Damit die WitzeApp für alle ein angenehmer Ort bleibt, bitten wir
                        dich folgende Regeln zu beachten.
                    </p>
                </div>

                {/* Hinweis-Banner */}
                <div className="mb-8 px-5 py-4 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl flex items-start gap-3">
                    <span className="text-xl flex-shrink-0">💡</span>
                    <p className="text-indigo-300 text-sm leading-relaxed">
                        Bei Fragen oder Unklarheiten kannst du dich jederzeit an einen Admin
                        wenden. Melde regelwidrige Inhalte über das{' '}
                        <span className="font-semibold">🚩-Symbol</span> unter einem Witz.
                    </p>
                </div>

                {/* Regeln */}
                <div className="space-y-5">
                    {RULES.map((section) => (
                        <div
                            key={section.category}
                            className="bg-gray-900/80 backdrop-blur-xl border border-gray-800/50 rounded-3xl overflow-hidden"
                        >
                            <div className="px-6 py-4 border-b border-gray-800/50">
                                <h2 className="text-lg font-black text-white">
                                    {section.category}
                                </h2>
                            </div>
                            <div className="divide-y divide-gray-800/30">
                                {section.rules.map((rule, i) => (
                                    <div key={i} className="px-6 py-4 flex items-start gap-4">
                                        <div className="w-6 h-6 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-indigo-400 text-xs font-black">
                        {i + 1}
                      </span>
                                        </div>
                                        <div>
                                            <p className="text-white text-sm font-semibold mb-0.5">
                                                {rule.title}
                                            </p>
                                            <p className="text-gray-400 text-sm leading-relaxed">
                                                {rule.text}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Konsequenzen */}
                <div className="mt-6 p-5 bg-red-500/5 border border-red-500/20 rounded-2xl">
                    <div className="flex items-start gap-3">
                        <span className="text-xl flex-shrink-0">⚠️</span>
                        <div>
                            <p className="text-red-300 font-semibold text-sm mb-1">
                                Konsequenzen bei Verstößen
                            </p>
                            <p className="text-gray-400 text-sm leading-relaxed">
                                Je nach Schwere des Verstoßes kann es zu einer{' '}
                                <span className="text-yellow-300">Verwarnung</span>, einer{' '}
                                <span className="text-orange-300">temporären Sperre</span> oder
                                einem{' '}
                                <span className="text-red-300">permanenten Ban</span> kommen.
                                Wiederholte Verstöße werden strenger geahndet.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
