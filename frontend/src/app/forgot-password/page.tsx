'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setSent(true);
      } else {
        let message = 'Fehler beim Senden.';
        try {
          const data = await res.json();
          if (data?.message) message = data.message;
        } catch {
          // falls Response kein JSON ist
        }
        setError(message);
      }
    } catch {
      setError('Netzwerkfehler – bitte versuche es erneut.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-gray-950 to-slate-900 flex flex-col">
      {/* Mini-Navbar */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-gray-800/50">
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <span className="text-xl">😂</span>
          <span className="text-white font-black text-lg">WitzeApp</span>
        </button>
        <button
          onClick={() => router.push('/login')}
          className="px-4 py-2 text-gray-400 hover:text-white text-sm transition-colors"
        >
          ← Zurück zum Login
        </button>
      </nav>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <span className="text-2xl">🔑</span>
            </div>
            <h1 className="text-3xl font-black text-white mb-1">
              Passwort vergessen?
            </h1>
            <p className="text-gray-400 text-sm">
              Wir schicken dir einen Reset-Link per E-Mail
            </p>
          </div>

          <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-800/50 rounded-3xl p-8 shadow-2xl">
            {sent ? (
              <div className="text-center">
                <div className="text-5xl mb-4">📧</div>
                <h2 className="text-xl font-bold text-white mb-2">
                  E-Mail gesendet!
                </h2>
                <p className="text-gray-400 text-sm mb-6">
                  Falls ein Account mit dieser E-Mail existiert, haben wir dir
                  einen Reset-Link geschickt. Der Link ist 1 Stunde gültig.
                </p>
                <button
                  onClick={() => router.push('/login')}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all"
                >
                  Zurück zum Login
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-gray-300 font-medium mb-2 text-sm">
                    E-Mail
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent transition-all"
                  />
                </div>

                {error && (
                  <div className="bg-red-500/10 border border-red-500/30 text-red-300 p-3 rounded-xl text-sm flex items-center gap-2">
                    <span>⚠️</span>
                    <span>{error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || !email}
                  className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="animate-spin w-4 h-4 border-2 border-white/20 border-t-white rounded-full" />
                      Sende...
                    </span>
                  ) : (
                    '📨 Reset-Link senden'
                  )}
                </button>

                <p className="text-gray-600 text-xs text-center">
                  Du erinnerst dich?{' '}
                  <button
                    type="button"
                    onClick={() => router.push('/login')}
                    className="text-indigo-400 hover:text-indigo-300 transition-colors"
                  >
                    Zurück zum Login
                  </button>
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
