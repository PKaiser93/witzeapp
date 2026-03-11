'use client';
import { useRouter } from 'next/navigation';
import BlueCheckmark from '@/components/BlueCheckmark';

interface WitzOfTheDay {
  id: number;
  text: string;
  author?: { username: string; isBlueVerified?: boolean };
  kategorie?: { name: string; emoji: string };
  _count: { likeLikes: number };
}

export default function WitzOfTheDayBanner({ witz }: { witz: WitzOfTheDay }) {
  const router = useRouter();
  return (
    <div
      onClick={() => router.push(`/witze/${witz.id}`)}
      className="bg-gradient-to-br from-indigo-900/40 to-purple-900/40 backdrop-blur-xl border border-indigo-500/30 rounded-3xl p-6 cursor-pointer hover:border-indigo-500/50 transition-all"
    >
      <div className="flex items-center gap-2 mb-3">
        <span className="text-yellow-400 text-lg">⭐</span>
        <span className="text-indigo-300 text-xs font-bold uppercase tracking-wider">
          Witz des Tages
        </span>
      </div>
      <p className="text-white text-lg leading-relaxed mb-4">"{witz.text}"</p>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-white text-xs font-bold">
              {(witz.author?.username ?? 'G').charAt(0).toUpperCase()}
            </span>
          </div>
          <span className="flex items-center gap-1 text-gray-400 text-sm">
            @{witz.author?.username ?? 'Gast'}
            {witz.author?.isBlueVerified && <BlueCheckmark />}
          </span>
          {witz.kategorie && (
            <span className="text-indigo-400 text-xs">
              {witz.kategorie.emoji} {witz.kategorie.name}
            </span>
          )}
        </div>
        <span className="text-gray-500 text-xs">
          ❤️ {witz._count.likeLikes}
        </span>
      </div>
    </div>
  );
}
