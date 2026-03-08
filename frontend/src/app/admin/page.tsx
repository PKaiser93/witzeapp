'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/AppLayout';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

interface Stats {
  userCount: number;
  witzCount: number;
  commentCount: number;
  likeCount: number;
}

function getAuthHeader() {
  const token = localStorage.getItem('token');
  return { Authorization: `Bearer ${token}` };
}

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [reportCount, setReportCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (localStorage.getItem('role') !== 'ADMIN') {
      router.push('/');
      return;
    }
    const load = async () => {
      const [statsRes, reportsRes] = await Promise.all([
        fetch(`${API_URL}/admin/stats`, { headers: getAuthHeader() }),
        fetch(`${API_URL}/admin/reports`, { headers: getAuthHeader() }),
      ]);
      if (statsRes.ok) setStats(await statsRes.json());
      if (reportsRes.ok) {
        const data = await reportsRes.json();
        setReportCount(data.length);
      }
      setLoading(false);
    };
    load();
  }, [router]);

  const QUICK_LINKS = [
    {
      emoji: '👤',
      label: 'User verwalten',
      path: '/admin/users',
      color: 'from-indigo-600 to-purple-600',
    },
    {
      emoji: '🚩',
      label: 'Meldungen',
      path: '/admin/reports',
      color: 'from-red-600 to-orange-600',
      badge: reportCount,
    },
    {
      emoji: '🔧',
      label: 'Einstellungen',
      path: '/admin/config',
      color: 'from-gray-600 to-gray-500',
    },
    {
      emoji: '📋',
      label: 'Audit-Log',
      path: '/admin/logs',
      color: 'from-emerald-600 to-teal-600',
    },
    {
      emoji: '🏷️',
      label: 'Kategorien',
      path: '/admin/kategorien',
      color: 'from-blue-600 to-cyan-600',
    },
  ];

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-800/50 rounded-3xl p-6 md:p-8">
          <h1 className="text-3xl font-black text-white mb-1">
            ⚙️ Admin Dashboard
          </h1>
          <p className="text-gray-400 text-sm">Willkommen im Admin-Bereich</p>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              {
                label: 'User',
                value: stats.userCount,
                emoji: '👤',
                color: 'from-indigo-500 to-purple-600',
              },
              {
                label: 'Witze',
                value: stats.witzCount,
                emoji: '📝',
                color: 'from-emerald-500 to-teal-500',
              },
              {
                label: 'Kommentare',
                value: stats.commentCount,
                emoji: '💬',
                color: 'from-blue-500 to-cyan-500',
              },
              {
                label: 'Likes',
                value: stats.likeCount,
                emoji: '❤️',
                color: 'from-red-500 to-pink-500',
              },
            ].map((s) => (
              <div
                key={s.label}
                className="bg-gray-900/80 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-5"
              >
                <div
                  className={`w-10 h-10 bg-gradient-to-br ${s.color} rounded-xl flex items-center justify-center mb-3`}
                >
                  <span className="text-lg">{s.emoji}</span>
                </div>
                <p className="text-3xl font-black text-white">{s.value}</p>
                <p className="text-gray-500 text-xs mt-1 uppercase tracking-wider">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Quick Links */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {QUICK_LINKS.map((link) => (
            <button
              key={link.path}
              onClick={() => router.push(link.path)}
              className="relative bg-gray-900/80 backdrop-blur-xl border border-gray-800/50 hover:border-gray-700/80 rounded-2xl p-6 text-left transition-all hover:shadow-lg group"
            >
              {link.badge !== undefined && link.badge > 0 && (
                <span className="absolute top-3 right-3 w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {link.badge}
                </span>
              )}
              <div
                className={`w-12 h-12 bg-gradient-to-br ${link.color} rounded-xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-105 transition-transform`}
              >
                <span className="text-2xl">{link.emoji}</span>
              </div>
              <p className="text-white font-bold text-sm">{link.label}</p>
            </button>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
