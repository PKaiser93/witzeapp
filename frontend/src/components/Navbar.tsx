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
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const username = localStorage.getItem('username');
    const email = localStorage.getItem('email') ?? '';
    setUserDisplay(username ?? email ?? '');
    loadUnreadCount();

    // Alle 30 Sekunden aktualisieren
    const interval = setInterval(loadUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  // Klick außerhalb schließt Dropdown
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
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
    if (res.ok) {
      const data = await res.json();
      setUnreadCount(data.count);
    }
  };

  const loadNotifications = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    const res = await fetch(`${API_URL}/notifications`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const data: Notification[] = await res.json();
      setNotifications(data);
    }
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
    if (!notifOpen) {
      loadNotifications();
    }
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

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('email');
    localStorage.removeItem('username');
    localStorage.removeItem('role');
    router.push('/login');
  };

  return (
    <nav className="h-16 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-6 fixed top-0 left-0 right-0 z-50">
      {/* Logo */}
      <div
        className="flex items-center gap-3 cursor-pointer hover:opacity-90 transition-opacity"
        onClick={() => router.push('/')}
      >
        <span className="text-2xl">😂</span>
        <span className="text-white font-black text-xl tracking-tight">
          WitzeApp
        </span>
      </div>

      {/* Desktop Navigation */}
      <div className="hidden md:flex items-center gap-2">
        <button
          onClick={() => router.push('/')}
          className="px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-lg transition-all text-sm font-medium"
        >
          🏠 Home
        </button>
        <button
          onClick={() => router.push('/profil')}
          className="px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-lg transition-all text-sm font-medium"
        >
          👤 Profil
        </button>
      </div>

      <div className="flex items-center gap-3">
        {/* Benachrichtigungen */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={handleNotifOpen}
            className="relative p-2 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-xl transition-all"
          >
            🔔
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 top-12 bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl w-80 z-50">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
                <span className="text-white font-bold text-sm">
                  Benachrichtigungen
                </span>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="text-indigo-400 hover:text-indigo-300 text-xs font-medium transition-colors"
                  >
                    Alle gelesen
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 text-sm">
                    Keine Benachrichtigungen
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => handleNotifClick(notif)}
                      className={`flex items-start gap-3 px-4 py-3 cursor-pointer hover:bg-gray-800/50 transition-all border-b border-gray-800/50 last:border-0 ${
                        !notif.read ? 'bg-indigo-500/5' : ''
                      }`}
                    >
                      <span className="text-lg flex-shrink-0">
                        {notif.type === 'like' ? '❤️' : '💬'}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-sm ${!notif.read ? 'text-white' : 'text-gray-400'}`}
                        >
                          {notif.message}
                        </p>
                        <p className="text-gray-600 text-xs mt-0.5">
                          {new Date(notif.createdAt).toLocaleString('de-DE', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                      {!notif.read && (
                        <div className="w-2 h-2 bg-indigo-500 rounded-full flex-shrink-0 mt-1.5" />
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Menu */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen((prev) => !prev)}
            className="flex items-center gap-2 px-3 py-2 bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700/50 rounded-xl transition-all group"
          >
            <div className="w-7 h-7 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-md">
              {userDisplay.charAt(0).toUpperCase() || '?'}
            </div>
            <span className="text-gray-300 text-sm hidden md:block max-w-[150px] truncate">
              {userDisplay || 'Gast'}
            </span>
            <span className="text-gray-400 text-xs transition-transform group-hover:rotate-180">
              ▾
            </span>
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-12 bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl w-48 py-1 z-50">
              <button
                onClick={() => {
                  router.push('/profil');
                  setMenuOpen(false);
                }}
                className="w-full text-left px-4 py-3 text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-xl text-sm font-medium transition-all"
              >
                👤 Mein Profil
              </button>
              <hr className="border-gray-800/50 my-1" />
              <button
                onClick={logout}
                className="w-full text-left px-4 py-3 text-red-400 hover:text-red-300 hover:bg-gray-800/50 rounded-xl text-sm font-medium transition-all"
              >
                🚪 Abmelden
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
