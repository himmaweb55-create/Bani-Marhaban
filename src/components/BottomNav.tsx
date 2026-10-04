import React from 'react';
import { Home, GitFork, CircleDollarSign, Calendar } from 'lucide-react';

interface BottomNavProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentPage, onNavigate }) => {
  const items = [
    { id: 'beranda', label: 'Beranda', icon: Home },
    { id: 'silsilah', label: 'Silsilah', icon: GitFork },
    { id: 'arisan', label: 'Arisan', icon: CircleDollarSign },
    { id: 'kegiatan', label: 'Kegiatan', icon: Calendar },
  ];

  return (
    <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#FAF5EA]/95 backdrop-blur-md border-t border-[#E9E4D8] pb-[env(safe-area-inset-bottom)] shadow-lg">
      <div className="flex items-center justify-around h-16 px-2">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex flex-col items-center justify-center flex-1 h-full min-h-[48px] py-1 transition-colors ${
                isActive
                  ? 'text-[#2F6B4F]'
                  : 'text-[#6B685B] hover:text-[#2B2B26]'
              }`}
            >
              <div
                className={`p-1 rounded-lg transition-transform ${
                  isActive ? 'bg-[#2F6B4F]/10 scale-110' : ''
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-[#2F6B4F]' : 'currentColor'}`} />
              </div>
              <span className={`text-[11px] font-semibold tracking-tight ${isActive ? 'text-[#2F6B4F]' : ''}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
