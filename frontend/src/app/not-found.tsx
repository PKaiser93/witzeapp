'use client';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/AppLayout';

const JOKES = [
    'Diese Seite ist so selten wie ein guter Witz von dir.',
    'Error 404 – wie dein Witz-Repertoire: leer.',
    'Die Seite hat sich selbst gemeldet und wurde gelöscht.',
    'Hier ist nichts. Wie die Pointe deines letzten Witzes.',
    'Diese URL existiert nicht – genau wie dein Humor.',
];

export default function NotFound() {
    const router = useRouter();
    const joke = JOKES[Math.floor(Math.random() * JOKES.length)];

    return (
        <AppLayout>
            <div className="max-w-lg mx-auto px-4 py-20 text-center">

                {/* 404 */}
                <div className="relative mb-8">
                    <p className="text-[120px] font-black text-gray-800/80 leading-none select-none">
                        404
                    </p>
                    <span className="absolute inset-0 flex items-center justify-center text-6xl">
            😵
          </span>
                </div>

                <h1 className="text-2xl font-black text-white mb-3">
                    Seite nicht gefunden
                </h1>

                {/* Witz */}
                <div className="mb-8 px-5 py-4 bg-gray-900/80 border border-gray-800/50 rounded-2xl">
                    <p className="text-gray-400 text-sm italic">
                        „{joke}"
                    </p>
                </div>

                {/* Buttons */}
                <div className="flex items-center justify-center gap-3">
                    <button
                        onClick={() => router.back()}
                        className="px-5 py-2.5 bg-gray-800/80 hover:bg-gray-700/80 border border-gray-700/50 text-gray-300 hover:text-white font-medium rounded-xl text-sm transition-all"
                    >
                        ← Zurück
                    </button>
                    <button
                        onClick={() => router.push('/')}
                        className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-sm transition-all"
                    >
                        🏠 Zum Forum
                    </button>
                </div>
            </div>
        </AppLayout>
    );
}
