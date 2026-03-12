'use client';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

interface Notification {
  id: number;
  type: string;
  message: string;
  witzId?: number;
  read: boolean;
  createdAt: string;
}

export default function Navbar() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [userDisplay, setUserDisplay] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const notifRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');
    const email = localStorage.getItem('email') ?? '';
    setIsLoggedIn(!!token);
    setUserDisplay(username ?? email ?? '');
    if (token) {
      loadUnreadCount();
      const interval = setInterval(loadUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, []);

  // Click outside – beide Dropdowns
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node))
        setNotifOpen(false);
      if (menuRef.current && !menuRef.current.contains(e.target as Node))
        setMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const loadUnreadCount = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    const res = await fetch(`${API_URL}/notifications/unread-count`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) setUnreadCount((await res.json()).count);
  };

  const loadNotifications = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    const res = await fetch(`${API_URL}/notifications`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) setNotifications(await res.json());
  };

  const markAllRead = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    await fetch(`${API_URL}/notifications/read-all`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
    });
    setUnreadCount(0);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleNotifOpen = () => {
    setNotifOpen((prev) => !prev);
    if (!notifOpen) loadNotifications();
  };

  const handleNotifClick = async (notif: Notification) => {
    const token = localStorage.getItem('token');
    if (!token) return;
    if (!notif.read) {
      await fetch(`${API_URL}/notifications/${notif.id}/read`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
      setUnreadCount((prev) => Math.max(0, prev - 1));
      setNotifications((prev) =>
          prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n))
      );
    }
    if (notif.witzId) {
      router.push(`/witze/${notif.witzId}`);
      setNotifOpen(false);
    }
  };

  const logout = async () => {
    const refreshToken = localStorage.getItem('refresh_token');
    const token = localStorage.getItem('token');
    if (refreshToken) {
      await fetch(`${API_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });
    }
    localStorage.clear();
    router.push('/login');
  };

  const notifIcon = (type: string) => {
    if (type === 'like') return '❤️';
    if (type === 'warning') return '⚠️';
    if (type === 'follow') return '👥';
    return '💬';
  };

  return (
      <nav className="h-16 bg-gray-900/95 backdrop-blur-xl border-b border-gray-800/50 flex items-center justify-between px-4 md:px-6 fixed top-0 left-0 right-0 z-50">

        {/* Logo */}
        <div
            onClick={() => router.push('/')}
            className="flex items-center gap-2.5 cursor-pointer hover:opacity-90 transition-opacity select-none"
        >
          <span className="text-2xl">😂</span>
          <span className="text-white font-black text-xl tracking-tight">
          WitzeApp
        </span>
        </div>

        {/* Rechte Seite */}
        <div className="flex items-center gap-2">
          {isLoggedIn ? (
              <>
                {/* Neuer Witz – schnell erreichbar */}
                <button
                    onClick={() => router.push('/post')}
                    className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600/80 hover:bg-indigo-600 border border-indigo-500/50 text-white text-sm font-bold rounded-xl transition-all"
                >
                  ✏️ <span>Posten</span>
                </button>

                {/* Benachrichtigungen */}
                <div className="relative" ref={notifRef}>
                  <button
                      onClick={handleNotifOpen}
                      className={`relative p-2 rounded-xl transition-all ${
                          notifOpen
                              ? 'text-white bg-gray-800/80'
                              : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                      }`}
                  >
                    <span className="text-xl">🔔</span>
                    {unreadCount > 0 && (
                        <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-xs font-black rounded-full flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                    )}
                  </button>

                  {notifOpen && (
                      <div className="absolute right-0 top-12 bg-gray-900/98 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl shadow-black/50 w-80 z-50 overflow-hidden">
                        {/* Header */}
                        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800/80">
                          <div className="flex items-center gap-2">
                      <span className="text-white font-bold text-sm">
                        Benachrichtigungen
                      </span>
                            {unreadCount > 0 && (
                                <span className="px-1.5 py-0.5 bg-indigo-500/20 text-indigo-400 text-xs font-bold rounded-full">
                          {unreadCount} neu
                        </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            {unreadCount > 0 && (
                                <button
                                    onClick={markAllRead}
                                    className="text-indigo-400 hover:text-indigo-300 text-xs font-medium transition-colors"
                                >
                                  Alle gelesen
                                </button>
                            )}
                            <button
                                onClick={() => {
                                  router.push('/notifications');
                                  setNotifOpen(false);
                                }}
                                className="text-gray-500 hover:text-gray-300 text-xs transition-colors"
                            >
                              Alle →
                            </button>
                          </div>
                        </div>

                        {/* Liste */}
                        <div className="max-h-80 overflow-y-auto">
                          {notifications.length === 0 ? (
                              <div className="flex flex-col items-center justify-center py-10 gap-2">
                                <span className="text-3xl">🔔</span>
                                <p className="text-gray-500 text-sm">
                                  Keine Benachrichtigungen
                                </p>
                              </div>
                          ) : (
                              notifications.map((notif) => (
                                  <div
                                      key={notif.id}
                                      onClick={() => handleNotifClick(notif)}
                                      className={`flex items-start gap-3 px-4 py-3 cursor-pointer hover:bg-gray-800/50 transition-all border-b border-gray-800/30 last:border-0 ${
                                          !notif.read ? 'bg-indigo-500/5' : ''
                                      }`}
                                  >
                          <span className="text-base flex-shrink-0 mt-0.5">
                            {notifIcon(notif.type)}
                          </span>
                                    <div className="flex-1 min-w-0">
                                      <p className={`text-sm leading-snug ${!notif.read ? 'text-white' : 'text-gray-400'}`}>
                                        {notif.message}
                                      </p>
                                      <p className="text-gray-600 text-xs mt-1">
                                        {new Date(notif.createdAt).toLocaleString('de-DE', {
                                          day: 'numeric',
                                          month: 'short',
                                          hour: '2-digit',
                                          minute: '2-digit',
                                        })}
                                      </p>
                                    </div>
                                    {!notif.read && (
                                        <div className="w-2 h-2 bg-indigo-500 rounded-full flex-shrink-0 mt-2" />
                                    )}
                                  </div>
                              ))
                          )}
                        </div>
                      </div>
                  )}
                </div>

                {/* User Menu */}
                <div className="relative" ref={menuRef}>
                  <button
                      onClick={() => setMenuOpen((prev) => !prev)}
                      className={`flex items-center gap-2 pl-2 pr-3 py-1.5 border rounded-xl transition-all ${
                          menuOpen
                              ? 'bg-gray-800 border-gray-600/50'
                              : 'bg-gray-800/50 hover:bg-gray-700/50 border-gray-700/50'
                      }`}
                  >
                    <div className="w-7 h-7 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white text-sm font-black shadow-md">
                      {userDisplay.charAt(0).toUpperCase() || '?'}
                    </div>
                    <span className="text-gray-300 text-sm hidden md:block max-w-[120px] truncate font-medium">
                  {userDisplay}
                </span>
                    <span className={`text-gray-500 text-xs transition-transform duration-200 ${menuOpen ? 'rotate-180' : ''}`}>
                  ▾
                </span>
                  </button>

                  {menuOpen && (
                      <div className="absolute right-0 top-12 bg-gray-900/98 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl shadow-black/50 w-48 overflow-hidden z-50">
                        <div className="px-4 py-3 border-b border-gray-800/80">
                          <p className="text-white text-sm font-bold truncate">
                            {userDisplay}
                          </p>
                          <p className="text-gray-500 text-xs mt-0.5">Eingeloggt</p>
                        </div>
                        <div className="py-1">
                          <button
                              onClick={() => { router.push('/profil'); setMenuOpen(false); }}
                              className="w-full text-left px-4 py-2.5 text-gray-300 hover:text-white hover:bg-gray-800/50 text-sm font-medium transition-all"
                          >
                            👤 Mein Profil
                          </button>
                          <button
                              onClick={() => { router.push('/notifications'); setMenuOpen(false); }}
                              className="w-full text-left px-4 py-2.5 text-gray-300 hover:text-white hover:bg-gray-800/50 text-sm font-medium transition-all flex items-center justify-between"
                          >
                            <span>🔔 Benachrichtigungen</span>
                            {unreadCount > 0 && (
                                <span className="px-1.5 py-0.5 bg-red-500/20 text-red-400 text-xs font-bold rounded-full">
                          {unreadCount}
                        </span>
                            )}
                          </button>
                          <button
                              onClick={() => { router.push('/hilfe'); setMenuOpen(false); }}
                              className="w-full text-left px-4 py-2.5 text-gray-300 hover:text-white hover:bg-gray-800/50 text-sm font-medium transition-all"
                          >
                            ❓ Hilfe
                          </button>
                        </div>
                        <div className="border-t border-gray-800/80 py-1">
                          <button
                              onClick={logout}
                              className="w-full text-left px-4 py-2.5 text-red-400 hover:text-red-300 hover:bg-red-500/5 text-sm font-medium transition-all"
                          >
                            🚪 Abmelden
                          </button>
                        </div>
                      </div>
                  )}
                </div>
              </>
          ) : (
              /* Gast */
              <div className="flex items-center gap-2">
                <button
                    onClick={() => router.push('/hilfe')}
                    className="hidden md:block px-3 py-2 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-xl transition-all text-sm font-medium"
                >
                  ❓ Hilfe
                </button>
                <button
                    onClick={() => router.push('/login')}
                    className="px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-800/50 border border-gray-700/50 rounded-xl transition-all text-sm font-medium"
                >
                  Einloggen
                </button>
                <button
                    onClick={() => router.push('/register')}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all text-sm"
                >
                  Registrieren
                </button>
              </div>
          )}
        </div>
      </nav>
  );
}
