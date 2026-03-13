'use client';
import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

type Status = 'loading' | 'success' | 'error';

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { loginWithToken } = useAuth();
  const [status, setStatus] = useState<Status>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setStatus('error');
      setMessage('Kein Token angegeben.');
      return;
    }

    fetch(`${API_URL}/auth/verify-email?token=${token}`, {
      credentials: 'include', // falls der Server hier schon den Refresh-Cookie setzt
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.access_token) {
          // zentral im AuthContext speichern
          loginWithToken(data.access_token);
          setStatus('success');
        } else {
          setStatus('error');
          setMessage(data.message ?? 'Verifizierung fehlgeschlagen.');
        }
      })
      .catch(() => {
        setStatus('error');
        setMessage('Netzwerkfehler – bitte versuche es erneut.');
      });
  }, [searchParams, loginWithToken]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-10 max-w-md w-full text-center shadow-xl">
        {status === 'loading' && (
          <>
            <div className="text-4xl mb-4 animate-pulse">📧</div>
            <h1 className="text-xl font-semibold text-white">
              E-Mail wird verifiziert...
            </h1>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="text-5xl mb-4">✅</div>
            <h1 className="text-2xl font-bold text-white mb-2">
              E-Mail bestätigt!
            </h1>
            <p className="text-gray-400 mb-6">
              Dein Account ist jetzt vollständig aktiviert.
            </p>
            <button
              onClick={() => router.push('/')}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-6 py-2 rounded-lg transition-colors"
            >
              Zur App →
            </button>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="text-5xl mb-4">❌</div>
            <h1 className="text-2xl font-bold text-white mb-2">
              Verifizierung fehlgeschlagen
            </h1>
            <p className="text-gray-400 mb-6">{message}</p>
            <button
              onClick={() => router.push('/')}
              className="bg-gray-700 hover:bg-gray-600 text-white font-semibold px-6 py-2 rounded-lg transition-colors"
            >
              Zurück zur App
            </button>
          </>
        )}
      </div>
    </div>
  );
}
