'use client';
import { useState } from 'react';

const DURATIONS = [
  { value: '1h', label: '1 Stunde' },
  { value: '4h', label: '4 Stunden' },
  { value: '12h', label: '12 Stunden' },
  { value: '1d', label: '1 Tag' },
  { value: '7d', label: '7 Tage' },
  { value: '14d', label: '14 Tage' },
  { value: '30d', label: '30 Tage' },
  { value: '1y', label: '1 Jahr' },
  { value: 'permanent', label: '🔒 Permanent' },
];

interface BanModalProps {
  username: string;
  onBan: (reason: string, duration: string) => void;
  onClose: () => void;
}

export default function BanModal({ username, onBan, onClose }: BanModalProps) {
  const [reason, setReason] = useState('');
  const [duration, setDuration] = useState('1d');

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-gray-700/50 rounded-3xl p-6 w-full max-w-sm shadow-2xl">
        <h2 className="text-white font-black text-lg mb-1">🔨 User bannen</h2>
        <p className="text-gray-400 text-sm mb-4">@{username}</p>

        <div className="space-y-4">
          <div>
            <label className="block text-gray-400 text-xs font-medium mb-2">
              Dauer
            </label>
            <select
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="w-full px-3 py-2.5 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            >
              {DURATIONS.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-gray-400 text-xs font-medium mb-2">
              Grund
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Grund für den Ban..."
              className="w-full px-3 py-2.5 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white text-sm resize-none h-24 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 placeholder-gray-500"
            />
          </div>
        </div>

        <div className="flex gap-3 mt-4">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl text-sm font-medium transition-all"
          >
            Abbrechen
          </button>
          <button
            onClick={() => reason.trim() && onBan(reason.trim(), duration)}
            disabled={!reason.trim()}
            className="flex-1 py-2.5 bg-orange-600 hover:bg-orange-500 disabled:opacity-40 text-white font-bold rounded-xl text-sm transition-all"
          >
            Bannen
          </button>
        </div>
      </div>
    </div>
  );
}
