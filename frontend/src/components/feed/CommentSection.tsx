'use client';
import { useRouter } from 'next/navigation';
import BlueCheckmark from '@/components/BlueCheckmark';

interface Comment {
  id: number;
  text: string;
  createdAt: string;
  author: { username: string; isBlueVerified?: boolean };
}

interface Props {
  isLoggedIn: boolean;
  comments: Comment[];
  commentText: string;
  commentPosting: boolean;
  onTextChange: (text: string) => void;
  onPost: (e: React.MouseEvent) => void;
}

export default function CommentSection({
  isLoggedIn,
  comments,
  commentText,
  commentPosting,
  onTextChange,
  onPost,
}: Props) {
  const router = useRouter();

  return (
    <>
      {isLoggedIn ? (
        <div className="flex gap-2">
          <input
            value={commentText}
            onChange={(e) => onTextChange(e.target.value)}
            onKeyDown={(e) =>
              e.key === 'Enter' && !e.shiftKey && onPost(e as any)
            }
            placeholder="Kommentar schreiben..."
            className="flex-1 px-3 py-2 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm transition-all"
          />
          <button
            onClick={onPost}
            disabled={!commentText.trim() || commentPosting}
            className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-bold rounded-xl text-sm transition-all"
          >
            ➤
          </button>
        </div>
      ) : (
        <p className="text-gray-500 text-xs text-center py-2">
          <button
            onClick={() => router.push('/login')}
            className="text-indigo-400 hover:text-indigo-300 font-medium"
          >
            Einloggen
          </button>{' '}
          um zu kommentieren
        </p>
      )}
      {comments.length === 0 && (
        <p className="text-gray-500 text-xs text-center py-2">
          Noch keine Kommentare
        </p>
      )}
      {comments.map((c) => (
        <div key={c.id} className="flex items-start gap-2">
          <div className="w-7 h-7 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xs font-bold">
              {c.author.username.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 bg-gray-800/50 rounded-xl px-3 py-2">
            <div className="flex items-center gap-2 mb-1">
              <span className="flex items-center gap-1 text-white text-xs font-semibold">
                @{c.author.username}
                {c.author.isBlueVerified && <BlueCheckmark size={3} />}
              </span>
              <span className="text-gray-600 text-xs">
                {new Date(c.createdAt).toLocaleString('de-DE', {
                  day: 'numeric',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
            <p className="text-gray-300 text-sm">{c.text}</p>
          </div>
        </div>
      ))}
    </>
  );
}
