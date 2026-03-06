'use client';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

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
  { emoji: '👤', name: 'Profil', path: '/profil' },
  { emoji: '🏆', name: 'Leaderboard', path: '/leaderboard' },
  { emoji: '✏️', name: 'Witz posten', path: '/post' },
];

const ADMIN_ITEMS: NavItem[] = [
  { emoji: '⚙️', name: 'Admin Panel', path: '/admin' },
  { emoji: '🏷️', name: 'Kategorie erstellen', path: '/kategorien/neu' },
];

interface NavButtonProps {
  item: NavItem;
  active: boolean;
  onClick: () => void;
}

function NavButton({ item, active, onClick }: NavButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all border ${
        active
          ? 'bg-indigo-600/80 text-white border-indigo-500/50 shadow-lg shadow-indigo-500/10'
          : 'text-gray-400 hover:text-white hover:bg-gray-800/50 border-transparent hover:border-gray-700/50'
      }`}
    >
      <span className="text-lg">{item.emoji}</span>
      <span>{item.name}</span>
    </button>
  );
}

interface SectionProps {
  label: string;
}

function SectionLabel({ label }: SectionProps) {
  return (
    <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider px-2 mb-3">
      {label}
    </p>
  );
}

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const [kategorien, setKategorien] = useState<Kategorie[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    setIsAdmin(localStorage.getItem('role') === 'ADMIN');
    fetch(`${API_URL}/witze/kategorien`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setKategorien(data))
      .catch(() => {});
  }, []);

  const isKategorieActive = (path: string) => {
    if (typeof window === 'undefined') return false;
    const kategorie = new URLSearchParams(path.split('?')[1]).get('kategorie');
    const current = new URLSearchParams(window.location.search).get(
      'kategorie'
    );
    if (!kategorie) return pathname === '/' && !current;
    return current === kategorie;
  };

  const kategorienList: NavItem[] = [
    { emoji: '🔥', name: 'Alle Witze', path: '/' },
    ...kategorien.map((k) => ({
      emoji: k.emoji,
      name: k.name,
      path: `/?kategorie=${k.name.toLowerCase().replace(/\s+/g, '-')}`,
    })),
  ];

  return (
    <aside className="w-64 bg-gray-900/80 backdrop-blur-xl border-r border-gray-800/50 fixed left-0 top-16 bottom-0 overflow-y-auto hidden md:block">
      <div className="p-6 space-y-1">
        {/* Navigation */}
        <SectionLabel label="Navigation" />
        {NAV_ITEMS.map((item) => (
          <NavButton
            key={item.path}
            item={item}
            active={pathname === item.path}
            onClick={() => router.push(item.path)}
          />
        ))}

        {/* Admin */}
        {isAdmin && (
          <>
            <div className="pt-4 pb-1">
              <hr className="border-gray-800/50 mb-4" />
              <SectionLabel label="Admin" />
            </div>
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

        {/* Kategorien */}
        <div className="pt-4">
          <hr className="border-gray-800/50 mb-4" />
          <SectionLabel label="Kategorien" />
          <div className="space-y-1">
            {kategorienList.map((kat) => (
              <button
                key={kat.name}
                onClick={() => router.push(kat.path)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all border ${
                  isKategorieActive(kat.path)
                    ? 'text-indigo-400 bg-indigo-900/30 border-indigo-500/30 font-semibold'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/30 border-transparent hover:border-gray-700/50'
                }`}
              >
                <span className="text-lg">{kat.emoji}</span>
                <span className="truncate">{kat.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}
