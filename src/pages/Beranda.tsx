import React from 'react';
import { Anggota, Kegiatan, Berita, CMSConfig } from '../types';
import { useAuth } from '../context/AuthContext';
import {
  Users,
  GitFork,
  CircleDollarSign,
  BookOpen,
  Calendar,
  Layers,
  Sparkles,
  ArrowRight,
  Pin,
  Heart,
  FileText,
} from 'lucide-react';

interface BerandaProps {
  members: Anggota[];
  activities: Kegiatan[];
  news: Berita[];
  cms: CMSConfig;
  onNavigate: (page: string) => void;
  onOpenMyMemberPicker: () => void;
}

export const Beranda: React.FC<BerandaProps> = ({
  members,
  activities,
  news,
  cms,
  onNavigate,
  onOpenMyMemberPicker,
}) => {
  const { roleLabel, myMemberId } = useAuth();

  const myMember = members.find((m) => m.id === myMemberId);

  // Statistics calculation
  const activeMembers = members.filter((m) => !m.diarsipkan);
  const totalKeturunan = activeMembers.length;
  const livingCount = activeMembers.filter((m) => m.statusHidup === 'hidup').length;
  const deceasedCount = activeMembers.filter((m) => m.statusHidup === 'wafat').length;

  const branches = Array.from(new Set(activeMembers.map((m) => m.cabang))).filter(
    (c) => c && c !== 'Pusat' && c !== 'Belum diketahui'
  );
  const totalCabang = branches.length;

  const generations = Array.from(new Set(activeMembers.map((m) => m.generasi)));
  const totalGenerasi = generations.length;

  const pinnedNews = news.filter((n) => n.tersemat);
  const recentActivities = activities.slice(0, 3);

  return (
    <div className="space-y-6 pb-20 sm:pb-8">
      {/* Banner / Welcome Hero */}
      {cms.banner.tampil && (
        <div className="relative rounded-2xl overflow-hidden shadow-md border border-[#E9E4D8] bg-[#2F6B4F] text-[#FAF5EA]">
          <div className="absolute inset-0 opacity-20 mix-blend-overlay">
            <img
              src={cms.banner.gambarUrl}
              alt=""
              className="w-full h-full object-cover"
            />
          </div>
          <div className="relative p-6 sm:p-10 flex flex-col justify-between min-h-[220px]">
            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF5EA]/15 text-[#E5C77A] text-xs font-bold tracking-wide">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{roleLabel}</span>
              </span>
              <h1 className="text-2xl sm:text-4xl font-bold font-heading text-[#FAF5EA]">
                {cms.banner.judul}
              </h1>
              <p className="text-sm sm:text-base text-[#FAF5EA]/90 font-medium max-w-xl">
                {cms.banner.subjudul}
              </p>
            </div>

            <div className="pt-4 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => onNavigate('silsilah')}
                className="px-5 py-2.5 rounded-xl bg-[#C9A24B] hover:bg-[#B8913B] text-[#FAF5EA] font-bold text-sm transition shadow-sm flex items-center gap-2"
              >
                <span>{cms.banner.tombolLabel}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={onOpenMyMemberPicker}
                className="px-4 py-2.5 rounded-xl bg-[#FAF5EA]/15 hover:bg-[#FAF5EA]/25 text-[#FAF5EA] font-semibold text-sm transition border border-[#FAF5EA]/30 flex items-center gap-2"
              >
                <Heart className="w-4 h-4 text-[#E5C77A]" />
                <span>{myMember ? myMember.nama : 'Pilih Nama Saya'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Summary Cards (Peta Data Ringkas) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-bold font-heading text-[#2F6B4F]">
            Peta Data Keluarga
          </h2>
          <button
            type="button"
            onClick={() => onNavigate('peta_data')}
            className="text-xs sm:text-sm font-bold text-[#C9A24B] hover:underline flex items-center gap-1"
          >
            <span>Selengkapnya</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="p-4 rounded-xl bg-[#FFFFFF] border border-[#E9E4D8] shadow-2xs space-y-1">
            <div className="w-9 h-9 rounded-lg bg-[#2F6B4F]/10 flex items-center justify-center text-[#2F6B4F]">
              <Users className="w-5 h-5" />
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold font-heading text-[#2B2B26]">
              {totalKeturunan}
            </p>
            <p className="text-xs sm:text-sm font-semibold text-[#6B685B]">
              Total Keturunan Terdata
            </p>
            <div className="pt-1 flex items-center gap-2 text-[11px] text-[#6B685B]">
              <span>Hidup: {livingCount}</span>
              <span>•</span>
              <span>Wafat: {deceasedCount}</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#FFFFFF] border border-[#E9E4D8] shadow-2xs space-y-1">
            <div className="w-9 h-9 rounded-lg bg-[#C9A24B]/15 flex items-center justify-center text-[#9E7A24]">
              <Layers className="w-5 h-5" />
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold font-heading text-[#2B2B26]">
              {totalGenerasi}
            </p>
            <p className="text-xs sm:text-sm font-semibold text-[#6B685B]">
              Tingkat Generasi
            </p>
            <p className="pt-1 text-[11px] text-[#6B685B]">Generasi 1 sampai 4</p>
          </div>

          <div className="p-4 rounded-xl bg-[#FFFFFF] border border-[#E9E4D8] shadow-2xs space-y-1">
            <div className="w-9 h-9 rounded-lg bg-[#2F6B4F]/10 flex items-center justify-center text-[#2F6B4F]">
              <GitFork className="w-5 h-5" />
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold font-heading text-[#2B2B26]">
              {totalCabang}
            </p>
            <p className="text-xs sm:text-sm font-semibold text-[#6B685B]">
              Cabang Keluarga
            </p>
            <p className="pt-1 text-[11px] text-[#6B685B]">3 Cabang Keturunan</p>
          </div>

          <div className="p-4 rounded-xl bg-[#FFFFFF] border border-[#E9E4D8] shadow-2xs space-y-1">
            <div className="w-9 h-9 rounded-lg bg-[#286090]/10 flex items-center justify-center text-[#286090]">
              <Calendar className="w-5 h-5" />
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold font-heading text-[#2B2B26]">
              {activities.length}
            </p>
            <p className="text-xs sm:text-sm font-semibold text-[#6B685B]">
              Agenda Kegiatan
            </p>
            <p className="pt-1 text-[11px] text-[#6B685B]">Kegiatan Keluarga</p>
          </div>
        </div>
      </div>

      {/* Pinned Announcement */}
      {pinnedNews.length > 0 && (
        <div className="space-y-2">
          {pinnedNews.map((item) => (
            <div
              key={item.id}
              className="p-4 sm:p-5 rounded-xl bg-[#FFFFFF] border-l-4 border-[#C9A24B] border-y border-r border-[#E9E4D8] shadow-2xs space-y-1.5"
            >
              <div className="flex items-center gap-2 text-xs font-bold text-[#9E7A24]">
                <Pin className="w-4 h-4" />
                <span>Pengumuman</span>
                <span>•</span>
                <span>{item.tanggal}</span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-[#2B2B26]">
                {item.judul}
              </h3>
              <p className="text-sm text-[#2B2B26] leading-relaxed">
                {item.isi}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Quick Menu Shortcuts */}
      <div className="space-y-3">
        <h2 className="text-lg sm:text-xl font-bold font-heading text-[#2F6B4F]">
          Pintasan Menu
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { id: 'silsilah', label: 'Silsilah', icon: GitFork, bg: 'bg-[#2F6B4F]/10 text-[#2F6B4F]' },
            { id: 'anggota', label: 'Anggota', icon: Users, bg: 'bg-[#2F6B4F]/10 text-[#2F6B4F]' },
            { id: 'arisan', label: 'Arisan', icon: CircleDollarSign, bg: 'bg-[#C9A24B]/15 text-[#9E7A24]' },
            { id: 'khotmil', label: 'Khotmil Qur\'an', icon: BookOpen, bg: 'bg-[#286090]/10 text-[#286090]' },
            { id: 'kegiatan', label: 'Kegiatan', icon: Calendar, bg: 'bg-[#2F6B4F]/10 text-[#2F6B4F]' },
            { id: 'usulan', label: 'Usulan Data', icon: FileText, bg: 'bg-[#D9822B]/10 text-[#D9822B]' },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onNavigate(item.id)}
                className="p-4 rounded-xl bg-[#FFFFFF] border border-[#E9E4D8] hover:border-[#2F6B4F] shadow-2xs hover:shadow-xs transition text-center flex flex-col items-center justify-center gap-2 group min-h-[96px]"
              >
                <div
                  className={`w-11 h-11 rounded-xl ${item.bg} flex items-center justify-center transition group-hover:scale-105`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-sm font-bold text-[#2B2B26] group-hover:text-[#2F6B4F]">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Latest Activities */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-bold font-heading text-[#2F6B4F]">
            Kegiatan Terbaru
          </h2>
          <button
            type="button"
            onClick={() => onNavigate('kegiatan')}
            className="text-xs sm:text-sm font-bold text-[#C9A24B] hover:underline flex items-center gap-1"
          >
            <span>Semua Kegiatan</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
          {recentActivities.map((act) => (
            <div
              key={act.id}
              className="p-4 rounded-xl bg-[#FFFFFF] border border-[#E9E4D8] shadow-2xs space-y-2 flex flex-col justify-between"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#2F6B4F]/10 text-[#2F6B4F] font-bold">
                    {act.jenis}
                  </span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-md font-semibold ${
                      act.status === 'Selesai'
                        ? 'bg-[#2F6B4F]/10 text-[#2F6B4F]'
                        : act.status === 'Berjalan'
                        ? 'bg-[#C9A24B]/15 text-[#9E7A24]'
                        : 'bg-[#6B685B]/10 text-[#6B685B]'
                    }`}
                  >
                    {act.status}
                  </span>
                </div>
                <h3 className="font-bold text-base text-[#2B2B26] line-clamp-2">
                  {act.judul}
                </h3>
                <p className="text-xs text-[#6B685B] font-medium">{act.tanggal}</p>
                <p className="text-xs text-[#6B685B] line-clamp-1">{act.lokasi}</p>
              </div>

              <button
                type="button"
                onClick={() => onNavigate('kegiatan')}
                className="mt-3 pt-2 border-t border-[#E9E4D8] text-xs font-bold text-[#2F6B4F] hover:underline text-left flex items-center gap-1"
              >
                <span>Lihat Rincian</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
