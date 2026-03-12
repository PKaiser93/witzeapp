// app/hilfe/kontakt/page.tsx
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/AppLayout';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

export default function KontaktPage() {
  const router = useRouter();
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setSending(true);

    try {
      // Optional: eigenen Endpoint bauen, z.B. /support/contact
      const res = await fetch(`${API_URL}/support/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, message, email }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(
          data?.message ?? 'Deine Nachricht konnte nicht gesendet werden.'
        );
        return;
      }

      setSuccess(true);
      setSubject('');
      setMessage('');
    } catch {
      setError('Netzwerkfehler – bitte versuche es später erneut.');
    } finally {
      setSending(false);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto px-4 py-10">
        <button
          onClick={() => router.push('/hilfe')}
          className="mb-4 text-xs text-gray-500 hover:text-gray-300 transition-colors"
        >
          ← Zurück zur Hilfe
        </button>

        <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-800/60 rounded-3xl p-8 shadow-2xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center">
              <span className="text-xl">💬</span>
            </div>
            <div>
              <h1 className="text-xl font-black text-white">
                Kontakt & Feedback
              </h1>
              <p className="text-gray-400 text-xs">
                Melde Probleme, Bugs oder schlage neue Features vor.
              </p>
            </div>
          </div>

          {error && (
            <div className="mb-4 bg-red-500/10 border border-red-500/30 text-red-300 text-sm px-4 py-2 rounded-xl">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 bg-green-500/10 border border-green-500/30 text-green-300 text-sm px-4 py-2 rounded-xl">
              Danke! Deine Nachricht wurde gesendet
              {email && (
                <> – wir haben dir eine Bestätigung per E-Mail geschickt.</>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">
                Betreff
              </label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Worum geht es?"
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700/60 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">
                Nachricht
              </label>
              <textarea
                required
                rows={5}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Beschreibe dein Anliegen so genau wie möglich…"
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700/60 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent transition-all resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">
                E-Mail (optional – mit E-Mail erhältst du eine Bestätigung)
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700/60 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={sending || !subject || !message}
              className="w-full py-3.5 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-xl shadow-lg hover:shadow-indigo-500/25 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {sending ? 'Senden…' : 'Nachricht senden'}
            </button>
          </form>
        </div>
      </div>
    </AppLayout>
  );
}
