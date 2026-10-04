import React from 'react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { WifiOff } from 'lucide-react';

export const OfflineBadge: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div
      role="status"
      className="fixed top-4 right-4 z-50 flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#B3402F] text-white text-xs font-semibold shadow-md animate-pulse"
    >
      <WifiOff className="w-3.5 h-3.5" />
      <span>Offline</span>
    </div>
  );
};
