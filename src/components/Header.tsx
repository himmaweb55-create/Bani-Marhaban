import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { PWAInstallButton } from './PWAInstallButton';
import {
  Menu,
  X,
  Home,
  GitFork,
  Users,
  PieChart,
  CircleDollarSign,
  BookOpen,
  Calendar,
  History,
  Image,
  Award,
  FileText,
  KeyRound,
  LogOut,
  ShieldCheck,
  UserCheck,
  Edit3,
  Sliders,
  ChevronRight,
} from 'lucide-react';

interface HeaderProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  cmsName?: string;
  cmsSlogan?: string;
}

export const Header: React.FC<HeaderProps> = ({
  currentPage,
  onNavigate,
  cmsName = 'BANI MARHABAN',
  cmsSlogan = 'Mengenal Asal • Menjaga Silaturahim • Mewariskan Cerita',
}) => {
  const {
    role,
    roleLabel,
    logout,
    canVerify,
    canManageGenealogy,
    canManageInformation,
    canManageArisan,
    canManageKhotmil,
    isSuperAdmin,
  } = useAuth();

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isDrawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isDrawerOpen]);

  const handleSelectPage = (page: string) => {
    onNavigate(page);
    setIsDrawerOpen(false);
  };

  const navItems = [
    { id: 'beranda', label: 'Beranda', icon: Home, visible: true },
    { id: 'silsilah', label: 'Silsilah Keluarga', icon: GitFork, visible: true },
    { id: 'anggota', label: 'Daftar Anggota', icon: Users, visible: true },
    { id: 'peta_data', label: 'Peta Data', icon: PieChart, visible: true },
    { id: 'arisan', label: 'Arisan', icon: CircleDollarSign, visible: true },
    { id: 'khotmil', label: 'Khotmil Qur\'an', icon: BookOpen, visible: true },
    { id: 'kegiatan', label: 'Kegiatan', icon: Calendar, visible: true },
    { id: 'sejarah', label: 'Sejarah Kita', icon: History, visible: true },
    { id: 'galeri', label: 'Galeri', icon: Image, visible: true },
    { id: 'kepengurusan', label: 'Kepengurusan', icon: Award, visible: true },
    { id: 'usulan', label: 'Usulan Data', icon: FileText, visible: true },
  ];

  const adminItems = [
    { id: 'verifikasi', label: 'Verifikasi', icon: ShieldCheck, visible: canVerify },
    { id: 'kelola_silsilah', label: 'Kelola Silsilah', icon: Edit3, visible: canManageGenealogy },
    { id: 'kelola_informasi', label: 'Kelola Informasi', icon: FileText, visible: canManageInformation },
    { id: 'kelola_arisan', label: 'Kelola Arisan', icon: CircleDollarSign, visible: canManageArisan },
    { id: 'kelola_khotmil', label: 'Kelola Khotmil', icon: BookOpen, visible: canManageKhotmil },
    { id: 'riwayat', label: 'Riwayat Perubahan', icon: History, visible: canManageGenealogy || isSuperAdmin },
    { id: 'super_admin', label: 'Dasbor Super Admin', icon: Sliders, visible: isSuperAdmin },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#FAF5EA]/95 backdrop-blur-md border-b border-[#E9E4D8] h-16 sm:h-20 transition-all">
        <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 flex items-center justify-between gap-3">
          {/* Logo & Identity */}
          <button
            onClick={() => handleSelectPage('beranda')}
            className="flex items-center gap-3 text-left focus:outline-hidden group"
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#2F6B4F] border-2 border-[#C9A24B] flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
              <span className="font-heading font-bold text-sm sm:text-base text-[#FAF5EA] tracking-wider">
                BM
              </span>
            </div>
            <div className="flex flex-col">
              <span className="font-heading font-bold text-lg sm:text-xl text-[#2F6B4F] leading-tight tracking-tight">
                {cmsName}
              </span>
              <span className="hidden sm:block text-xs text-[#6B685B] line-clamp-1 font-medium">
                {cmsSlogan}
              </span>
            </div>
          </button>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            {navItems.slice(0, 6).map((item) => (
              <button
                key={item.id}
                onClick={() => handleSelectPage(item.id)}
                className={`px-3 py-2 rounded-xl text-sm font-semibold transition ${
                  currentPage === item.id
                    ? 'bg-[#2F6B4F] text-[#FAF5EA]'
                    : 'text-[#2B2B26] hover:bg-[#E9E4D8]/60 hover:text-[#2F6B4F]'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Right Area: Role Badge & Hamburger Button */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden md:flex flex-col items-end">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#2F6B4F]/10 text-[#2F6B4F] border border-[#2F6B4F]/20">
                {roleLabel}
              </span>
            </div>

            {/* Hamburger Button (min 44px touch target) */}
            <button
              type="button"
              onClick={() => setIsDrawerOpen(!isDrawerOpen)}
              className="w-11 h-11 flex items-center justify-center rounded-xl border border-[#E9E4D8] bg-[#FFFFFF] text-[#2F6B4F] hover:bg-[#E9E4D8]/50 transition shadow-2xs"
              aria-label={isDrawerOpen ? 'Tutup Menu' : 'Buka Menu'}
            >
              {isDrawerOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer (85% width on mobile) with Dark Backdrop */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsDrawerOpen(false)}
          />

          {/* Drawer Panel */}
          <div
            className="relative w-[85%] max-w-sm h-full bg-[#FFFFFF] shadow-2xl flex flex-col z-10 border-l border-[#E9E4D8] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div className="p-4 sm:p-5 border-b border-[#E9E4D8] bg-[#FAF5EA] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-[#2F6B4F] border-2 border-[#C9A24B] flex items-center justify-center shrink-0">
                  <span className="font-heading font-bold text-xs text-[#FAF5EA]">BM</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-heading font-bold text-base text-[#2F6B4F]">
                    {cmsName}
                  </span>
                  <span className="text-xs text-[#2F6B4F] font-semibold">
                    {roleLabel}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="w-10 h-10 flex items-center justify-center rounded-lg text-[#6B685B] hover:text-[#2B2B26] hover:bg-[#E9E4D8]/60 transition"
                aria-label="Tutup Menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Menu List */}
            <div className="p-4 overflow-y-auto grow space-y-1">
              <div className="pb-2">
                <p className="px-3 py-1 text-xs font-bold text-[#6B685B] uppercase tracking-wider">
                  Menu Utama
                </p>
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentPage === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSelectPage(item.id)}
                      className={`w-full min-h-[48px] px-3.5 py-2.5 rounded-xl flex items-center justify-between transition text-left text-base font-semibold ${
                        isActive
                          ? 'bg-[#2F6B4F] text-[#FAF5EA] shadow-xs'
                          : 'text-[#2B2B26] hover:bg-[#FAF5EA] hover:text-[#2F6B4F]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`w-5 h-5 ${isActive ? 'text-[#C9A24B]' : 'text-[#6B685B]'}`} />
                        <span>{item.label}</span>
                      </div>
                      <ChevronRight className={`w-4 h-4 ${isActive ? 'text-[#FAF5EA]' : 'text-[#E9E4D8]'}`} />
                    </button>
                  );
                })}
              </div>

              {/* Pengurus & Admin section */}
              {adminItems.some((i) => i.visible) && (
                <div className="pt-2 border-t border-[#E9E4D8]">
                  <p className="px-3 py-1 text-xs font-bold text-[#6B685B] uppercase tracking-wider">
                    Pengurus
                  </p>
                  {adminItems
                    .filter((i) => i.visible)
                    .map((item) => {
                      const Icon = item.icon;
                      const isActive = currentPage === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => handleSelectPage(item.id)}
                          className={`w-full min-h-[48px] px-3.5 py-2.5 rounded-xl flex items-center justify-between transition text-left text-base font-semibold ${
                            isActive
                              ? 'bg-[#2F6B4F] text-[#FAF5EA] shadow-xs'
                              : 'text-[#2B2B26] hover:bg-[#FAF5EA] hover:text-[#2F6B4F]'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <Icon className={`w-5 h-5 ${isActive ? 'text-[#C9A24B]' : 'text-[#C9A24B]'}`} />
                            <span>{item.label}</span>
                          </div>
                          <ChevronRight className={`w-4 h-4 ${isActive ? 'text-[#FAF5EA]' : 'text-[#E9E4D8]'}`} />
                        </button>
                      );
                    })}
                </div>
              )}

              {/* Account section */}
              <div className="pt-2 border-t border-[#E9E4D8]">
                <p className="px-3 py-1 text-xs font-bold text-[#6B685B] uppercase tracking-wider">
                  Akun
                </p>
                <button
                  onClick={() => handleSelectPage('kata_sandi')}
                  className={`w-full min-h-[48px] px-3.5 py-2.5 rounded-xl flex items-center justify-between transition text-left text-base font-semibold ${
                    currentPage === 'kata_sandi'
                      ? 'bg-[#2F6B4F] text-[#FAF5EA] shadow-xs'
                      : 'text-[#2B2B26] hover:bg-[#FAF5EA] hover:text-[#2F6B4F]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <KeyRound className="w-5 h-5 text-[#6B685B]" />
                    <span>Kata Sandi</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#E9E4D8]" />
                </button>
              </div>
            </div>

            {/* Drawer Footer Actions */}
            <div className="p-4 border-t border-[#E9E4D8] bg-[#FAF5EA] flex flex-col gap-2 shrink-0">
              <PWAInstallButton onInstalled={() => setIsDrawerOpen(false)} />
              <button
                onClick={() => {
                  setIsDrawerOpen(false);
                  logout();
                }}
                className="w-full min-h-[48px] px-4 py-2.5 rounded-xl border border-[#B3402F] text-[#B3402F] hover:bg-[#B3402F]/10 transition flex items-center justify-center gap-2 font-semibold text-base"
              >
                <LogOut className="w-5 h-5" />
                <span>Keluar</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
