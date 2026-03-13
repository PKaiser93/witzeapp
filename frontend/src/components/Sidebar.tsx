'use client';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

interface Kategorie {
  id: number;
  name: string;
  emoji: string;
}

interface NavItem {
  emoji: string;
  name: string;
  path: string;
}

const NAV_ITEMS: NavItem[] = [
  { emoji: '🏠', name: 'Home', path: '/' },
  { emoji: '✏️', name: 'Witz posten', path: '/post' },
  { emoji: '👥', name: 'Following', path: '/following' },
  { emoji: '🏆', name: 'Leaderboard', path: '/leaderboard' },
  { emoji: '🔔', name: 'Benachrichtigungen', path: '/notifications' },
  { emoji: '📜', name: 'Regeln', path: '/regeln' },
];

const PROFIL_ITEMS: NavItem[] = [
  { emoji: '👤', name: 'Mein Profil', path: '/profil' },
  { emoji: '❓', name: 'Hilfe', path: '/hilfe' },
];

const ADMIN_ITEMS: NavItem[] = [
  { emoji: '⚙️', name: 'Dashboard', path: '/admin' },
  { emoji: '👤', name: 'User-Verwaltung', path: '/admin/users' },
  { emoji: '🚩', name: 'Meldungen', path: '/admin/reports' },
  { emoji: '🔧', name: 'App-Einstellungen', path: '/admin/config' },
  { emoji: '📋', name: 'Audit-Log', path: '/admin/logs' },
  { emoji: '🏷️', name: 'Kategorien', path: '/admin/kategorien' },
];

function SectionLabel({ label }: { label: string }) {
  return (
    <p className="text-gray-600 text-xs font-bold uppercase tracking-widest px-2 mb-2 mt-1">
      {label}
    </p>
  );
}

function Divider() {
  return <hr className="border-gray-800/60 my-3" />;
}

function NavButton({
  item,
  active,
  onClick,
}: {
  item: NavItem;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all border ${
        active
          ? 'bg-indigo-600/80 text-white border-indigo-500/50 shadow-md shadow-indigo-500/10'
          : 'text-gray-400 hover:text-white hover:bg-gray-800/50 border-transparent hover:border-gray-700/50'
      }`}
    >
      <span className="text-base w-5 text-center flex-shrink-0">
        {item.emoji}
      </span>
      <span className="truncate">{item.name}</span>
    </button>
  );
}

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [kategorien, setKategorien] = useState<Kategorie[]>([]);

  const isLoggedIn = !!user;
  const isAdmin = user?.role === 'ADMIN';

  useEffect(() => {
    fetch(`${API_URL}/witze/kategorien`)
      .then((res) => (res.ok ? res.json() : []))
      .then(setKategorien)
      .catch(() => {});
  }, []);

  const currentKategorie = searchParams.get('kategorie');

  const kategorienList: NavItem[] = [
    { emoji: '🔥', name: 'Alle Witze', path: '/' },
    ...kategorien.map((k) => ({
      emoji: k.emoji,
      name: k.name,
      path: `/?kategorie=${k.name.toLowerCase().replace(/\s+/g, '-')}`,
    })),
  ];

  return (
    <aside className="w-60 bg-gray-900/80 backdrop-blur-xl border-r border-gray-800/50 fixed left-0 top-16 bottom-0 overflow-y-auto hidden md:flex flex-col">
      <div className="flex-1 p-4 space-y-0.5">
        {isLoggedIn && (
          <>
            <SectionLabel label="Menü" />
            {NAV_ITEMS.map((item) => (
              <NavButton
                key={item.path}
                item={item}
                active={pathname === item.path}
                onClick={() => router.push(item.path)}
              />
            ))}

            <Divider />

            <SectionLabel label="Account" />
            {PROFIL_ITEMS.map((item) => (
              <NavButton
                key={item.path}
                item={item}
                active={pathname === item.path}
                onClick={() => router.push(item.path)}
              />
            ))}
          </>
        )}

        {isAdmin && (
          <>
            <Divider />
            <SectionLabel label="Admin" />
            {ADMIN_ITEMS.map((item) => (
              <NavButton
                key={item.path}
                item={item}
                active={pathname === item.path}
                onClick={() => router.push(item.path)}
              />
            ))}
          </>
        )}

        <Divider />
        <SectionLabel label="Kategorien" />
        <div className="space-y-0.5">
          {kategorienList.map((kat) => {
            const katSlug = kat.path.split('=')[1] ?? null;
            const active =
              katSlug === null
                ? pathname === '/' && !currentKategorie
                : currentKategorie === katSlug;

            return (
              <button
                key={kat.name}
                onClick={() => router.push(kat.path)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all border ${
                  active
                    ? 'text-indigo-400 bg-indigo-900/30 border-indigo-500/20'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/30 border-transparent'
                }`}
              >
                <span className="text-base w-5 text-center flex-shrink-0">
                  {kat.emoji}
                </span>
                <span className="truncate">{kat.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
