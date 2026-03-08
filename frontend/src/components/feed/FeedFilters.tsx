'use client';

interface Props {
  searchInput: string;
  sort: 'new' | 'top' | 'comments';
  onSearchChange: (value: string) => void;
  onSearchClear: () => void;
  onSortChange: (sort: 'new' | 'top' | 'comments') => void;
}

export default function FeedFilters({
  searchInput,
  sort,
  onSearchChange,
  onSearchClear,
  onSortChange,
}: Props) {
  return (
    <div className="space-y-3">
      <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-800/50 rounded-2xl px-4 py-3 flex items-center gap-3">
        <span className="text-gray-500">🔍</span>
        <input
          value={searchInput}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Witze durchsuchen..."
          className="flex-1 bg-transparent text-white placeholder-gray-500 focus:outline-none text-sm"
        />
        {searchInput && (
          <button
            onClick={onSearchClear}
            className="text-gray-500 hover:text-white transition-colors text-xs"
          >
            ✕
          </button>
        )}
      </div>
      <div className="flex items-center gap-2">
        {(['new', 'top', 'comments'] as const).map((s) => (
          <button
            key={s}
            onClick={() => onSortChange(s)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all border ${
              sort === s
                ? 'bg-indigo-600/80 text-white border-indigo-500/50'
                : 'text-gray-400 hover:text-white bg-gray-900/80 border-gray-800/50 hover:border-gray-700/50'
            }`}
          >
            {s === 'new' && '🕐 Neu'}
            {s === 'top' && '🔥 Top'}
            {s === 'comments' && '💬 Meistkommentiert'}
          </button>
        ))}
      </div>
    </div>
  );
}
