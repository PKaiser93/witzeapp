'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (localStorage.getItem('token')) router.push('/');
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data?.message ?? 'Login fehlgeschlagen.');
        return;
      }

      localStorage.setItem('token', data.access_token);
      localStorage.setItem('email', email);
      if (data.user?.username) {
        localStorage.setItem('username', data.user.username);
      }
      router.push('/');
    } catch {
      setError('Verbindung zum Server fehlgeschlagen.');
    } finally {
      setLoading(false);
    }
  };

  return (
      <main className="min-h-screen bg-gradient-to-br from-slate-950 via-gray-950 to-slate-900 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-800/50 rounded-3xl p-8 shadow-2xl">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <span className="text-3xl">😂</span>
              </div>
              <h1 className="text-3xl font-black text-white mb-1">WitzeApp</h1>
              <p className="text-gray-400 text-sm">Melde dich an</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-gray-300 font-medium mb-2 text-sm">E-Mail</label>
              <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent transition-all"
              />
          </div>

          <div>
            <label className="block text-gray-300 font-medium mb-2 text-sm">Passwort</label>
          <div className="relative">
            <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Dein Passwort"
                className="w-full px-4 py-3 pr-12 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent transition-all"
            />
            <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
            >
              {showPassword ? '🙈' : '👁️'}
            </button>
          </div>
        </div>

        {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-300 p-3 rounded-xl text-sm">
              ⚠️ {error}
            </div>
        )}

        <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-xl shadow-lg hover:shadow-indigo-500/25 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Einloggen...' : 'Einloggen 🚀'}
        </button>
      </form>

  <div className="text-center mt-6 pt-6 border-t border-gray-800">
    <p className="text-gray-400 text-sm">
      Noch kein Account?{' '}
      <button
          onClick={() => router.push('/register')}
          className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors"
      >
        Registrieren
      </button>
    </p>
  </div>
</div>
</div>
</main>
);
}
