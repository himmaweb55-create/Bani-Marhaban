import React from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download } from 'lucide-react';

interface PWAInstallButtonProps {
  className?: string;
  onInstalled?: () => void;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  className = '',
  onInstalled,
}) => {
  const { isInstallable, isInstalled, install } = usePWAInstall();

  if (isInstalled || !isInstallable) {
    return null;
  }

  const handleInstall = async () => {
    const success = await install();
    if (success && onInstalled) {
      onInstalled();
    }
  };

  return (
    <button
      onClick={handleInstall}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl bg-[#2F6B4F] text-[#FAF5EA] hover:bg-[#1E4734] transition text-base font-medium shadow-sm w-full ${className}`}
    >
      <Download className="w-5 h-5 text-[#C9A24B]" />
      <span>Pasang Aplikasi</span>
    </button>
  );
};
