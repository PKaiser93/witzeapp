"use client";
import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import AppLayout from "@/components/AppLayout";

export const dynamicParams = true;
export const viewport = {
    width: 'device-width',
    initialScale: 1,
    themeColor: '#3730a3'
};

export default function WitzDetail() {
    const params = useParams();
    const router = useRouter();
    const [witz, setWitz] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const id = params?.id ? parseInt(params.id as string, 10) : 0;

    // 🔒 Sicheres Laden
    const loadWitz = useCallback(async () => {
        if (!id || id <= 0) {
            setError('Ungültige Witz-ID');
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError('');
            const token = localStorage.getItem('token');

            if (!token) {
                router.push('/login');
                return;
            }

            const { data } = await axios.get(`/witz/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
                timeout: 5000  // 5s Timeout
            });

            setWitz(data);
        } catch (err: any) {
            console.error('Witz laden fehlgeschlagen:', err);
            setError(err.response?.status === 404
                ? 'Witz nicht gefunden'
                : 'Fehler beim Laden. Versuche es erneut.'
            );
        } finally {
            setLoading(false);
        }
    }, [id, router]);

    // 🔒 Sicheres Toggelen
    const toggleLike = useCallback(async () => {
        if (!id || !witz) return;

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                router.push('/login');
                return;
            }

            await axios.patch(`/witz/${id}/like`, {}, {
                headers: { Authorization: `Bearer ${token}` },
                timeout: 3000
            });

            router.refresh();  // 🔄 Neu laden (sicher!)
        } catch (err: any) {
            console.error('Like fehlgeschlagen:', err);
            alert('Like konnte nicht gespeichert werden.');
        }
    }, [id, witz, router]);

    useEffect(() => {
        loadWitz();
    }, [loadWitz]);

    if (loading) {
        return (
            <AppLayout>
                <div className="max-w-2xl mx-auto py-20 text-center">
                    <div className="animate-spin w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full mx-auto mb-4"></div>
                    <p className="text-gray-400">Witz wird geladen...</p>
                </div>
            </AppLayout>
        );
    }

    if (error || !witz) {
        return (
            <AppLayout>
                <div className="max-w-2xl mx-auto py-20 text-center">
                    <div className="w-20 h-20 bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <span className="text-4xl text-gray-500">😢</span>
                    </div>
                    <h1 className="text-2xl font-black text-white mb-2">{error || 'Witz nicht verfügbar'}</h1>
                    <button
                        onClick={() => router.push('/')}
                        className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg transition-all"
                    >
                        Zurück zum Forum
                    </button>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout>
            <div className="max-w-2xl mx-auto space-y-8 py-8">
                {/* Zurück Button */}
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors"
                >
                    ← Zurück zum Forum
                </button>

                {/* Witz Card */}
                <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-800/50 rounded-3xl p-8 shadow-2xl">
                    <div className="flex items-start gap-4 mb-8">
                        <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                            <span className="text-indigo-100 text-2xl">{witz.kategorie?.emoji || '📝'}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <h1 className="text-3xl md:text-4xl font-black text-white mb-4 leading-tight">
                                "{witz.text}"
                            </h1>
                            <div className="flex flex-wrap items-center gap-4 text-gray-400 text-sm">
                                <span className="font-semibold">@{witz.author.username}</span>
                                <span>•</span>
                                <span>{new Date(witz.createdAt).toLocaleString('de-DE', {
                                    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                                })}</span>
                                {witz.kategorie && (
                                    <>
                                        <span>•</span>
                                        <span className="flex items-center gap-1 px-3 py-1 bg-indigo-500/20 border border-indigo-500/30 rounded-xl text-indigo-300 font-medium">
                                            {witz.kategorie.emoji} {witz.kategorie.name}
                                        </span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Like Button */}
                    <div className="flex items-center gap-3 p-4 bg-gray-800/50 rounded-2xl border border-gray-700/50 ml-auto w-fit">
                        <button
                            onClick={toggleLike}
                            disabled={loading}
                            className={`p-4 rounded-2xl transition-all shadow-lg flex items-center gap-2 text-lg font-bold ${witz.userLiked
                                ? 'bg-red-500/20 text-red-400 border-2 border-red-500/50 shadow-red-500/25 hover:shadow-red-500/40'
                                : 'bg-gray-700/50 text-gray-400 border-2 border-gray-700/50 hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/40 hover:shadow-red-500/25'
                                } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                            title={witz.userLiked ? 'Unlike' : 'Like'}
                        >
                            <span className="text-2xl">♥</span>
                        </button>
                        <span className="text-2xl font-black text-white">{witz.likes}</span>
                        <span className="text-gray-500 text-sm">Likes</span>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
