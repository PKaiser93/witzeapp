'use client';
import { useAppConfig } from '@/context/AppConfigContext';

export default function AnnouncementBanner() {
  const { announcement, announcement_active } = useAppConfig();

  if (!announcement_active || !announcement) return null;

  return (
    <div className="fixed top-16 left-0 right-0 z-40 bg-indigo-600/90 backdrop-blur-sm border-b border-indigo-500/50 px-6 py-2.5 text-center">
      <p className="text-white text-sm font-medium">📢 {announcement}</p>
    </div>
  );
}
