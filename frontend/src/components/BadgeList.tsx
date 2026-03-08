interface Badge {
  id: number;
  key: string;
  emoji: string;
  label: string;
  description: string;
  awardedAt: string;
}

interface BadgeListProps {
  badges: Badge[];
}

export default function BadgeList({ badges }: BadgeListProps) {
  if (!badges || !Array.isArray(badges) || badges.length === 0) return null;
  if (badges.length === 0) return null;

  return (
    <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-800/50 rounded-3xl p-6">
      <h2 className="text-lg font-black text-white mb-4">🏅 Badges</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {badges.map((b) => (
          <div
            key={b.id}
            className="flex flex-col items-center gap-2 p-4 bg-gray-800/50 rounded-2xl border border-gray-700/50 text-center group relative"
            title={b.description}
          >
            <span className="text-3xl">{b.emoji}</span>
            <p className="text-white text-xs font-bold">{b.label}</p>
            <p className="text-gray-500 text-xs">{b.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
