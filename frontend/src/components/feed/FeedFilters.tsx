'use client';

interface Kategorie {
    name: string;
    emoji: string;
}

interface Props {
    searchInput: string;
    sort: 'new' | 'top' | 'comments';
    kategorien: Kategorie[];
    selectedKategorie: string | null;
    onSearchChange: (value: string) => void;
    onSearchClear: () => void;
    onSortChange: (sort: 'new' | 'top' | 'comments') => void;
    onKategorieChange: (kategorie: string | null) => void;
}

export default function FeedFilters({
                                        searchInput,
                                        sort,
                                        kategorien,
                                        selectedKategorie,
                                        onSearchChange,
                                        onSearchClear,
                                        onSortChange,
                                        onKategorieChange,
                                    }: Props) {
    return (
        <div className="space-y-3">
            {/* Suchfeld */}
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

            {/* Sort-Buttons */}
            <div className="flex items-center gap-2 flex-wrap">
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

            {/* Kategorie-Chips */}
            {kategorien.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap">
                    {/* Alle-Button */}
                    <button
                        onClick={() => onKategorieChange(null)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all border ${
                            selectedKategorie === null
                                ? 'bg-indigo-600/80 text-white border-indigo-500/50'
                                : 'text-gray-400 hover:text-white bg-gray-900/80 border-gray-800/50 hover:border-gray-700/50'
                        }`}
                    >
                        🌐 Alle
                    </button>
                    {kategorien.map((k) => (
                        <button
                            key={k.name}
                            onClick={() =>
                                onKategorieChange(selectedKategorie === k.name ? null : k.name)
                            }
                            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all border ${
                                selectedKategorie === k.name
                                    ? 'bg-indigo-600/80 text-white border-indigo-500/50'
                                    : 'text-gray-400 hover:text-white bg-gray-900/80 border-gray-800/50 hover:border-gray-700/50'
                            }`}
                        >
                            {k.emoji} {k.name}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
