'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import CommentSection from './CommentSection';
import BlueCheckmark from '@/components/BlueCheckmark';

interface Kategorie {
  name: string;
  emoji: string;
}
interface Comment {
  id: number;
  text: string;
  createdAt: string;
  author: { username: string };
}
interface Witz {
  id: number;
  text: string;
  likes: number;
  userLiked: boolean;
  createdAt: string;
  author?: { username: string; isBlueVerified?: boolean };
  kategorie?: Kategorie;
  commentCount?: number;
}

interface Props {
  witz: Witz;
  isLoggedIn: boolean;
  openComments: boolean;
  comments: Comment[];
  commentText: string;
  commentPosting: boolean;
  featureLikes: boolean;
  featureComments: boolean;
  featureReport: boolean;
  onToggleLike: (e: React.MouseEvent) => void;
  onToggleComments: (e: React.MouseEvent) => void;
  onCommentTextChange: (text: string) => void;
  onPostComment: (e: React.MouseEvent) => void;
  onReport: () => void;
}

export default function WitzCard({
                                   witz,
                                   isLoggedIn,
                                   openComments,
                                   comments,
                                   commentText,
                                   commentPosting,
                                   featureLikes,
                                   featureComments,
                                   featureReport,
                                   onToggleLike,
                                   onToggleComments,
                                   onCommentTextChange,
                                   onPostComment,
                                   onReport,
                                 }: Props) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `${window.location.origin}/witze/${witz.id}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
      <div
          className="bg-gray-900/80 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-5 cursor-pointer hover:border-gray-700/80 transition-all"
          onClick={() => router.push(`/witze/${witz.id}`)}
      >
        {/* Autor */}
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
          <span className="text-white text-xs font-bold">
            {(witz.author?.username ?? 'G').charAt(0).toUpperCase()}
          </span>
          </div>
          <div>
            <p
                onClick={(e) => {
                  e.stopPropagation();
                  router.push(`/profil/${witz.author?.username}`);
                }}
                className="flex items-center gap-1 text-white text-sm font-semibold cursor-pointer hover:text-indigo-400 transition-colors"
            >
              @{witz.author?.username ?? 'Gast'}
              {witz.author?.isBlueVerified && <BlueCheckmark />}
            </p>
            <p className="text-gray-500 text-xs">
              {new Date(witz.createdAt).toLocaleDateString('de-DE', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
              {witz.kategorie && (
                  <span className="ml-2 text-indigo-400">
                {witz.kategorie.emoji} {witz.kategorie.name}
              </span>
              )}
            </p>
          </div>
        </div>

        {/* Text */}
        <p className="text-gray-100 text-base leading-relaxed mb-4 line-clamp-3">
          {witz.text}
        </p>

        <div className="border-t border-gray-800 mb-3" />

        {/* Liker */}
        {witz.likes > 0 && (
            <p className="text-gray-500 text-xs mb-3">
          <span className="text-gray-400">
            {witz.likes === 1 ? '1 Person' : `${witz.likes} Personen`}
          </span>{' '}
              {witz.likes > 1 ? 'haben' : 'hat'} ein ❤️ gegeben
            </p>
        )}

        {/* Aktionen */}
        <div
            className="flex items-center gap-2"
            onClick={(e) => e.stopPropagation()}
        >
          {featureLikes && (
              <button
                  onClick={onToggleLike}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all text-sm font-medium ${
                      witz.userLiked
                          ? 'text-red-400 bg-red-500/10 border border-red-500/30'
                          : 'text-gray-500 hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/20 border border-transparent'
                  }`}
              >
                ♥ <span>{witz.likes ?? 0}</span>
              </button>
          )}
          {featureComments && (
              <button
                  onClick={onToggleComments}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium border transition-all ${
                      openComments
                          ? 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30'
                          : 'text-gray-500 hover:text-white hover:bg-gray-800/50 border-transparent hover:border-gray-700/50'
                  }`}
              >
                💬 <span>{witz.commentCount ?? 0}</span>
              </button>
          )}

          {/* Share Button */}
          <button
              onClick={handleShare}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium border transition-all ${
                  copied
                      ? 'text-green-400 bg-green-500/10 border-green-500/30'
                      : 'text-gray-500 hover:text-indigo-400 hover:bg-indigo-500/10 border-transparent hover:border-indigo-500/20'
              }`}
          >
            {copied ? '✓ Kopiert' : '🔗'}
          </button>

          {featureReport && isLoggedIn && (
              <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onReport();
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium text-gray-500 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all ml-auto"
              >
                🚩
              </button>
          )}
        </div>

        {/* Kommentare */}
        {openComments && (
            <div
                className="mt-4 pt-4 border-t border-gray-800 space-y-3"
                onClick={(e) => e.stopPropagation()}
            >
              <CommentSection
                  isLoggedIn={isLoggedIn}
                  comments={comments}
                  commentText={commentText}
                  commentPosting={commentPosting}
                  onTextChange={onCommentTextChange}
                  onPost={onPostComment}
              />
            </div>
        )}
      </div>
  );
}
