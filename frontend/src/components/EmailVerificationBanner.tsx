'use client';
import { useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

export default function EmailVerificationBanner() {
    const [sent, setSent] = useState(false);
    const [loading, setLoading] = useState(false);

    const resend = async () => {
        const token = localStorage.getItem('token');
        if (!token) return;

        setLoading(true);
        try {
            await fetch(`${API_URL}/auth/resend-verification`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
            });
            setSent(true);
        } catch {
            // ignore
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-amber-500/10 border-b border-amber-500/30 px-4 py-2 text-sm text-amber-300 flex items-center justify-between gap-4">
      <span>
        ⚠️ Deine E-Mail-Adresse ist noch nicht bestätigt. Bitte prüfe dein
        Postfach.
      </span>
            {sent ? (
                <span className="text-green-400 font-medium whitespace-nowrap">
          ✓ E-Mail gesendet
        </span>
            ) : (
                <button
                    onClick={resend}
                    disabled={loading}
                    className="whitespace-nowrap bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-semibold px-3 py-1 rounded-lg transition-colors text-xs"
                >
                    {loading ? 'Sende...' : 'Erneut senden'}
                </button>
            )}
        </div>
    );
}
