"use client";
import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

axios.defaults.baseURL = "http://localhost:3000";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [username, setUsername] = useState("");
  const [usernameSuggestion, setUsernameSuggestion] = useState("");
  const [usernameAvailable, setUsernameAvailable] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const checkUsername = useCallback(async (name: string) => {
    if (!name.trim()) {
      setUsernameAvailable(true);
      return;
    }
    try {
      const { data } = await axios.get(
        `/auth/check-username/${encodeURIComponent(name)}`,
      );
      setUsernameAvailable(data.available);
      if (!data.available) {
        const suggestion = await axios.get(
          `/auth/suggest-username?base=${encodeURIComponent(name)}`,
        );
        setUsernameSuggestion(suggestion.data);
      }
    } catch (err) {
      console.error("Username check failed:", err);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => checkUsername(username), 300);
    return () => clearTimeout(timer);
  }, [username, checkUsername]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirm) {
      setError("Passwörter stimmen nicht überein.");
      return;
    }
    if (password.length < 6) {
      setError("Passwort muss mindestens 6 Zeichen lang sein.");
      return;
    }
    if (!usernameAvailable || !username.trim()) {
      setError("Username ungültig oder bereits vergeben.");
      return;
    }

    setLoading(true);
    try {
      await axios.post("/auth/register", { email, password, username });
      const res = await axios.post("/auth/login", { email, password });
      localStorage.setItem("token", res.data.access_token);
      localStorage.setItem("email", email);
      localStorage.setItem("username", username);
      router.push("/");
    } catch (err: any) {
      setError(err.response?.data?.message || "Registrierung fehlgeschlagen.");
    } finally {
      setLoading(false);
    }
  };

  const useSuggestion = () => {
    setUsername(usernameSuggestion);
    setUsernameAvailable(true);
    setError("");
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-gray-950 to-slate-900 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-800/50 rounded-3xl p-8 shadow-2xl">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <span className="text-3xl">😂</span>
            </div>
            <h1 className="text-3xl font-black text-white mb-1">WitzeApp</h1>
            <p className="text-gray-400 text-sm">Erstelle deinen Account</p>
          </div>

          {/* Form */}
          <form
            onSubmit={handleRegister}
            className="space-y-5"
            suppressHydrationWarning
          >
            <div>
              <label className="block text-gray-300 font-medium mb-2 text-sm">
                E-Mail
              </label>
              <input
                type="email"
                suppressHydrationWarning
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="block text-gray-300 font-medium mb-2 text-sm">
                Username
              </label>
              <div className="relative">
                <input
                  type="text"
                  suppressHydrationWarning
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Dein öffentlicher Username"
                  className={`w-full px-4 py-3 rounded-xl bg-gray-800/50 border text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 pr-12 transition-all ${
                    !usernameAvailable && username
                      ? "border-red-400 focus:ring-red-400"
                      : "border-gray-700/50 focus:border-transparent"
                  }`}
                />
                <span
                  className={`absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium ${
                    usernameAvailable ? "text-green-400" : "text-red-400"
                  }`}
                >
                  {username ? (usernameAvailable ? "✓ Frei" : "✗ Belegt") : ""}
                </span>
              </div>
              {!usernameAvailable && usernameSuggestion && (
                <button
                  type="button"
                  suppressHydrationWarning
                  onClick={useSuggestion}
                  className="mt-2 w-full bg-green-500/10 hover:bg-green-500/20 border border-green-500/30 text-green-300 px-3 py-2 text-xs rounded-lg font-medium transition-all"
                >
                  🔮 Vorschlag: @{usernameSuggestion}
                </button>
              )}
            </div>

            <div>
              <label className="block text-gray-300 font-medium mb-2 text-sm">
                Passwort
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  suppressHydrationWarning
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mindestens 6 Zeichen"
                  className="w-full px-4 py-3 pr-12 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  suppressHydrationWarning
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-gray-300 font-medium mb-2 text-sm">
                Passwort bestätigen
              </label>
              <input
                type="password"
                suppressHydrationWarning
                required
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Passwort wiederholen"
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent transition-all"
              />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-300 p-3 rounded-xl text-sm backdrop-blur-sm">
                ⚠️ {error}
              </div>
            )}

            <button
              type="submit"
              suppressHydrationWarning
              disabled={loading}
              className="w-full py-3.5 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-xl shadow-lg hover:shadow-indigo-500/25 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Registrieren..." : "Account erstellen 🎉"}
            </button>
          </form>

          <div className="text-center mt-6 pt-6 border-t border-gray-800">
            <p className="text-gray-400 text-sm">
              Schon ein Account?{" "}
              <a
                href="/login"
                className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors"
              >
                Einloggen
              </a>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
