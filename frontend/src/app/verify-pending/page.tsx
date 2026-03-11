'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

export default function VerifyPendingPage() {
    const router = useRouter();
    const [sent, setSent] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const resend = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/login');
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`${API_URL}/auth/resend-verification`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                setSent(true);
            } else {
                const data = await res.json();
                setError(data.message ?? 'Fehler beim Senden.');
            }
        } catch {
            setError('Netzwerkfehler – bitte versuche es erneut.');
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        localStorage.clear();
        router.push('/login');
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-gray-950 to-slate-900 p-4">
            <div className="bg-gray-900 border border-gray-800 rounded-3xl p-10 max-w-md w-full text-center shadow-2xl">
                <div className="text-6xl mb-6">📧</div>
                <h1 className="text-2xl font-black text-white mb-2">
                    E-Mail bestätigen
                </h1>
                <p className="text-gray-400 mb-2">
                    Wir haben dir eine Bestätigungs-E-Mail geschickt.
                </p>
                <p className="text-gray-500 text-sm mb-8">
                    Bitte klicke auf den Link in der E-Mail um deinen Account zu
                    aktivieren. Danach kannst du dich neu einloggen.
                </p>

                {error && (
                    <p className="text-red-400 text-sm mb-4 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2">
                        {error}
                    </p>
                )}

                {sent ? (
                    <div className="bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-3 mb-6">
                        <p className="text-green-400 font-medium">✓ E-Mail wurde erneut gesendet!</p>
                        <p className="text-green-400/60 text-xs mt-1">Bitte prüfe dein Postfach.</p>
                    </div>
                ) : (
                    <button
                        onClick={resend}
                        disabled={loading}
                        className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-all mb-3"
                    >
                        {loading ? (
                            <span className="flex items-center justify-center gap-2">
                <span className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
                Sende...
              </span>
                        ) : (
                            '📨 E-Mail erneut senden'
                        )}
                    </button>
                )}

                <button
                    onClick={logout}
                    className="w-full bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white font-medium py-3 rounded-xl transition-all text-sm"
                >
                    Ausloggen
                </button>
            </div>
        </div>
    );
}
