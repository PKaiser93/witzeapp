'use client';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/AppLayout';
import { fetchWithAuth } from '@/lib/fetchWithAuth';
import { useAuth } from '@/context/AuthContext';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

interface Notification {
  id: number;
  type: string;
  message: string;
  witzId?: number;
  read: boolean;
  createdAt: string;
}

function getTypeConfig(type: string) {
  switch (type) {
    case 'like':
      return {
        emoji: '❤️',
        color: 'text-red-400',
        bg: 'bg-red-500/10 border-red-500/20',
      };
    case 'comment':
      return {
        emoji: '💬',
        color: 'text-indigo-400',
        bg: 'bg-indigo-500/10 border-indigo-500/20',
      };
    case 'warning':
      return {
        emoji: '⚠️',
        color: 'text-yellow-400',
        bg: 'bg-yellow-500/10 border-yellow-500/20',
      };
    case 'follow':
      return {
        emoji: '👥',
        color: 'text-green-400',
        bg: 'bg-green-500/10 border-green-500/20',
      };
    default:
      return {
        emoji: '🔔',
        color: 'text-gray-400',
        bg: 'bg-gray-500/10 border-gray-500/20',
      };
  }
}

export default function NotificationsPage() {
  const router = useRouter();
  const { user, accessToken, refreshToken } = useAuth();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  const isLoggedIn = !!user;

  const loadNotifications = useCallback(async () => {
    if (!accessToken || !isLoggedIn) return;
    setLoading(true);
    try {
      const res = await fetchWithAuth(
        `${API_URL}/notifications`,
        accessToken,
        refreshToken
      );
      if (res.ok) {
        const data: Notification[] = await res.json();
        setNotifications(data);
        setUnreadCount(data.filter((n) => !n.read).length);
      }
    } finally {
      setLoading(false);
    }
  }, [accessToken, refreshToken, isLoggedIn]);

  useEffect(() => {
    if (!isLoggedIn) {
      router.push('/login');
      return;
    }
    if (!accessToken) return;
    loadNotifications();
  }, [isLoggedIn, accessToken, loadNotifications, router]);

  const markAllRead = async () => {
    if (!accessToken || !isLoggedIn) return;
    await fetchWithAuth(
      `${API_URL}/notifications/read-all`,
      accessToken,
      refreshToken,
      {
        method: 'PATCH',
      }
    );
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const handleClick = async (notif: Notification) => {
    if (!accessToken || !isLoggedIn) return;
    if (!notif.read) {
      await fetchWithAuth(
        `${API_URL}/notifications/${notif.id}/read`,
        accessToken,
        refreshToken,
        {
          method: 'PATCH',
        }
      );
      setNotifications((prev) =>
        prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }
    if (notif.witzId) router.push(`/witze/${notif.witzId}`);
  };

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-white">
              🔔 Benachrichtigungen
            </h1>
            {unreadCount > 0 && (
              <p className="text-indigo-400 text-sm mt-0.5">
                {unreadCount} ungelesene
              </p>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="px-4 py-2 bg-gray-900/80 hover:bg-gray-800/80 border border-gray-700/50 text-indigo-400 hover:text-indigo-300 text-sm font-medium rounded-xl transition-all"
            >
              ✓ Alle gelesen
            </button>
          )}
        </div>

        {/* Liste */}
        <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-800/50 rounded-3xl overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="animate-spin w-8 h-8 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-16">
              <span className="text-5xl block mb-4">🔕</span>
              <h3 className="text-lg font-bold text-gray-400 mb-1">
                Keine Benachrichtigungen
              </h3>
              <p className="text-gray-600 text-sm">
                Wenn jemand deinen Witz liked oder kommentiert, siehst du es
                hier.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-800/50">
              {notifications.map((notif) => {
                const config = getTypeConfig(notif.type);
                return (
                  <div
                    key={notif.id}
                    onClick={() => handleClick(notif)}
                    className={`flex items-start gap-4 px-6 py-4 transition-all ${
                      notif.witzId ? 'cursor-pointer hover:bg-gray-800/30' : ''
                    } ${!notif.read ? 'bg-indigo-500/5' : ''}`}
                  >
                    {/* Icon */}
                    <div
                      className={`w-10 h-10 rounded-2xl border flex items-center justify-center flex-shrink-0 ${config.bg}`}
                    >
                      <span className="text-lg">{config.emoji}</span>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm ${
                          !notif.read
                            ? 'text-white font-medium'
                            : 'text-gray-300'
                        }`}
                      >
                        {notif.message}
                      </p>
                      <p className="text-gray-600 text-xs mt-1">
                        {new Date(notif.createdAt).toLocaleString('de-DE', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                      {notif.witzId && (
                        <p className="text-indigo-400 text-xs mt-1">
                          → Witz ansehen
                        </p>
                      )}
                    </div>

                    {/* Unread dot */}
                    {!notif.read && (
                      <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full flex-shrink-0 mt-1.5" />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
