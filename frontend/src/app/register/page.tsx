'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [username, setUsername] = useState('');
  const [usernameSuggestion, setUsernameSuggestion] = useState('');
  const [usernameAvailable, setUsernameAvailable] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [registerEnabled, setRegisterEnabled] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/config`)
      .then((res) => res.json())
      .then((data) => setRegisterEnabled(data.feature_register !== 'false'))
      .catch(() => {});
  }, []);

  const checkUsername = useCallback(async (name: string) => {
    if (!name.trim()) {
      setUsernameAvailable(true);
      setUsernameSuggestion('');
      return;
    }
    try {
      const res = await fetch(
        `${API_URL}/auth/check-username/${encodeURIComponent(name)}`
      );
      const data = await res.json();
      setUsernameAvailable(data.available);
      if (!data.available) {
        const suggestRes = await fetch(
          `${API_URL}/auth/suggest-username?base=${encodeURIComponent(name)}`
        );
        const suggestion = await suggestRes.json();
        setUsernameSuggestion(suggestion);
      } else {
        setUsernameSuggestion('');
      }
    } catch {}
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => checkUsername(username), 300);
    return () => clearTimeout(timer);
  }, [username, checkUsername]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!registerEnabled) {
      setError('Registrierung ist derzeit deaktiviert.');
      return;
    }
    if (password !== confirm) {
      setError('Passwörter stimmen nicht überein.');
      return;
    }
    if (password.length < 6) {
      setError('Passwort muss mindestens 6 Zeichen lang sein.');
      return;
    }
    if (!usernameAvailable || !username.trim()) {
      setError('Username ungültig oder bereits vergeben.');
      return;
    }

    setLoading(true);
    try {
      const registerRes = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, username }),
      });
      if (!registerRes.ok) {
        const data = await registerRes.json();
        setError(data?.message ?? 'Registrierung fehlgeschlagen.');
        return;
      }
      const loginRes = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const loginData = await loginRes.json();
      localStorage.setItem('token', loginData.access_token);
      localStorage.setItem('refresh_token', loginData.refresh_token);
      localStorage.setItem('email', email);
      localStorage.setItem('username', username);
      if (loginData.user?.role)
        localStorage.setItem('role', loginData.user.role);
      router.push('/');
    } catch {
      setError('Verbindung zum Server fehlgeschlagen.');
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
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/')}
            className="px-4 py-2 text-gray-400 hover:text-white text-sm transition-colors"
          >
            ← Zurück zum Forum
          </button>
          <button
            onClick={() => router.push('/hilfe')}
            className="px-4 py-2 text-gray-400 hover:text-white text-sm transition-colors"
          >
            ❓ Hilfe
          </button>
        </div>
      </nav>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <span className="text-2xl">😂</span>
            </div>
            <h1 className="text-3xl font-black text-white mb-1">
              Account erstellen
            </h1>
            <p className="text-gray-400 text-sm">
              Werde Teil der WitzeApp Community
            </p>
          </div>

          <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-800/50 rounded-3xl p-8 shadow-2xl">
            {!registerEnabled ? (
              <div className="text-center py-8">
                <span className="text-4xl block mb-4">🔒</span>
                <p className="text-red-400 font-semibold mb-2">
                  Registrierung deaktiviert
                </p>
                <p className="text-gray-500 text-sm mb-6">
                  Die Registrierung ist derzeit nicht möglich.
                </p>
                <button
                  onClick={() => router.push('/login')}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all text-sm"
                >
                  Zum Login
                </button>
              </div>
            ) : (
              <form onSubmit={handleRegister} className="space-y-4">
                {/* E-Mail */}
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

                {/* Username */}
                <div>
                  <label className="block text-gray-300 font-medium mb-2 text-sm">
                    Username
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Dein öffentlicher Username"
                      className={`w-full px-4 py-3 pr-20 rounded-xl bg-gray-800/50 border text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all ${
                        username && !usernameAvailable
                          ? 'border-red-400 focus:ring-red-400'
                          : 'border-gray-700/50 focus:border-transparent'
                      }`}
                    />
                    {username && (
                      <span
                        className={`absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium ${usernameAvailable ? 'text-green-400' : 'text-red-400'}`}
                      >
                        {usernameAvailable ? '✓ Frei' : '✗ Belegt'}
                      </span>
                    )}
                  </div>
                  {!usernameAvailable && usernameSuggestion && (
                    <button
                      type="button"
                      onClick={() => {
                        setUsername(usernameSuggestion);
                        setUsernameAvailable(true);
                        setError('');
                      }}
                      className="mt-2 w-full bg-green-500/10 hover:bg-green-500/20 border border-green-500/30 text-green-300 px-3 py-2 text-xs rounded-lg font-medium transition-all"
                    >
                      🔮 Vorschlag: @{usernameSuggestion}
                    </button>
                  )}
                </div>

                {/* Passwort */}
                <div>
                  <label className="block text-gray-300 font-medium mb-2 text-sm">
                    Passwort
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Mindestens 6 Zeichen"
                      className="w-full px-4 py-3 pr-12 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((p) => !p)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                    >
                      {showPassword ? '🙈' : '👁️'}
                    </button>
                  </div>
                </div>

                {/* Passwort bestätigen */}
                <div>
                  <label className="block text-gray-300 font-medium mb-2 text-sm">
                    Passwort bestätigen
                  </label>
                  <input
                    type="password"
                    required
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    placeholder="Passwort wiederholen"
                    className={`w-full px-4 py-3 bg-gray-800/50 border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent transition-all ${
                      confirm && confirm !== password
                        ? 'border-red-400'
                        : 'border-gray-700/50'
                    }`}
                  />
                  {confirm && confirm !== password && (
                    <p className="text-red-400 text-xs mt-1">
                      Passwörter stimmen nicht überein
                    </p>
                  )}
                </div>

                {error && (
                  <div className="bg-red-500/10 border border-red-500/30 text-red-300 p-3 rounded-xl text-sm flex items-center gap-2">
                    <span>⚠️</span>
                    <span>{error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={
                    loading ||
                    !email ||
                    !password ||
                    !username ||
                    !usernameAvailable
                  }
                  className="w-full py-3.5 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-xl shadow-lg hover:shadow-indigo-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="animate-spin w-4 h-4 border-2 border-white/20 border-t-white rounded-full" />
                      Registrieren...
                    </span>
                  ) : (
                    'Account erstellen 🎉'
                  )}
                </button>
              </form>
            )}

            <div className="mt-6 pt-6 border-t border-gray-800 space-y-3">
              <p className="text-gray-400 text-sm text-center">
                Schon ein Account?{' '}
                <button
                  onClick={() => router.push('/login')}
                  className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors"
                >
                  Einloggen
                </button>
              </p>
              <p className="text-gray-600 text-xs text-center">
                Oder{' '}
                <button
                  onClick={() => router.push('/')}
                  className="text-gray-500 hover:text-gray-300 transition-colors"
                >
                  als Gast weiterbrowsen
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
