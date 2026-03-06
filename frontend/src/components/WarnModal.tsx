'use client';
import { useState } from 'react';

interface WarnModalProps {
  username: string;
  onWarn: (reason: string) => void;
  onClose: () => void;
}

export default function WarnModal({
  username,
  onWarn,
  onClose,
}: WarnModalProps) {
  const [reason, setReason] = useState('');

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-gray-700/50 rounded-3xl p-6 w-full max-w-sm shadow-2xl">
        <h2 className="text-white font-black text-lg mb-1">
          ⚠️ User verwarnen
        </h2>
        <p className="text-gray-400 text-sm mb-4">@{username}</p>

        <div>
          <label className="block text-gray-400 text-xs font-medium mb-2">
            Grund
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Grund für die Verwarnung..."
            className="w-full px-3 py-2.5 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white text-sm resize-none h-24 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 placeholder-gray-500"
          />
        </div>

        <div className="flex gap-3 mt-4">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl text-sm font-medium transition-all"
          >
            Abbrechen
          </button>
          <button
            onClick={() => reason.trim() && onWarn(reason.trim())}
            disabled={!reason.trim()}
            className="flex-1 py-2.5 bg-yellow-600 hover:bg-yellow-500 disabled:opacity-40 text-white font-bold rounded-xl text-sm transition-all"
          >
            Verwarnen
          </button>
        </div>
      </div>
    </div>
  );
}
