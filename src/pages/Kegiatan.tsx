import React, { useState, useMemo } from 'react';
import { Kegiatan, JenisKegiatan, Album } from '../types';
import { useAuth } from '../context/AuthContext';
import { Modal } from '../components/Modal';
import {
  Calendar,
  MapPin,
  Clock,
  ArrowRight,
  Image as ImageIcon,
  CheckCircle2,
} from 'lucide-react';

interface KegiatanProps {
  activities: Kegiatan[];
  activityTypes: JenisKegiatan[];
  albums: Album[];
  onNavigateToManage?: () => void;
  onViewAlbum?: (albumId: string) => void;
}

export const KegiatanPage: React.FC<KegiatanProps> = ({
  activities,
  activityTypes,
  albums,
  onNavigateToManage,
  onViewAlbum,
}) => {
  const { canManageInformation } = useAuth();
  const [selectedType, setSelectedType] = useState<string>('Semua');
  const [selectedYear, setSelectedYear] = useState<string>('Semua');

  // Detail Modal
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<Kegiatan | null>(null);

  const albumMap = useMemo(() => new Map(albums.map((a) => [a.id, a])), [albums]);

  const years = useMemo(() => {
    const list = activities.map((a) => a.tanggal.split('-')[0]).filter(Boolean);
    return Array.from(new Set(list)).sort().reverse();
  }, [activities]);

  const filteredActivities = useMemo(() => {
    return activities.filter((a) => {
      if (selectedType !== 'Semua' && a.jenis !== selectedType) return false;
      if (selectedYear !== 'Semua' && !a.tanggal.startsWith(selectedYear)) return false;
      return true;
    });
  }, [activities, selectedType, selectedYear]);

  const handleOpenDetail = (act: Kegiatan) => {
    setSelectedActivity(act);
    setDetailModalOpen(true);
  };

  return (
    <div className="space-y-4 pb-20 sm:pb-8">
      {/* Header & Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-2xl bg-[#FFFFFF] border border-[#E9E4D8] shadow-2xs">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold font-heading text-[#2F6B4F]">
            Agenda Kegiatan Keluarga
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-[#E9E4D8] bg-[#FAF5EA]/50 text-xs sm:text-sm font-semibold text-[#2B2B26]"
          >
            <option value="Semua">Semua Jenis</option>
            {activityTypes.map((t) => (
              <option key={t.id} value={t.nama}>
                {t.nama}
              </option>
            ))}
          </select>

          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-[#E9E4D8] bg-[#FAF5EA]/50 text-xs sm:text-sm font-semibold text-[#2B2B26]"
          >
            <option value="Semua">Semua Tahun</option>
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>

          {canManageInformation && onNavigateToManage && (
            <button
              type="button"
              onClick={onNavigateToManage}
              className="px-3.5 py-1.5 rounded-xl bg-[#2F6B4F] text-[#FAF5EA] hover:bg-[#1E4734] transition text-xs sm:text-sm font-bold shadow-xs"
            >
              Kelola Informasi
            </button>
          )}
        </div>
      </div>

      {/* Activities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredActivities.length === 0 ? (
          <div className="col-span-full p-12 text-center rounded-2xl bg-[#FFFFFF] border border-[#E9E4D8]">
            <h3 className="text-base font-bold text-[#6B685B]">Belum ada data</h3>
          </div>
        ) : (
          filteredActivities.map((act) => {
            const linkedAlbum = act.albumTertautId ? albumMap.get(act.albumTertautId) : null;

            return (
              <div
                key={act.id}
                onClick={() => handleOpenDetail(act)}
                className="p-5 rounded-2xl bg-[#FFFFFF] border border-[#E9E4D8] hover:border-[#2F6B4F] shadow-2xs hover:shadow-xs transition cursor-pointer flex flex-col justify-between space-y-3"
              >
                <div className="space-y-2">
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

                  <h3 className="font-heading font-bold text-base text-[#2B2B26] line-clamp-2">
                    {act.judul}
                  </h3>

                  <div className="space-y-1 text-xs text-[#6B685B] font-medium pt-1">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-[#C9A24B]" />
                      <span>{act.tanggal}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#C9A24B]" />
                      <span className="truncate">{act.lokasi}</span>
                    </div>
                  </div>

                  <p className="text-xs text-[#2B2B26] line-clamp-2 leading-relaxed">
                    {act.deskripsi}
                  </p>
                </div>

                <div className="pt-2 border-t border-[#E9E4D8]/60 flex items-center justify-between text-xs">
                  {linkedAlbum ? (
                    <span className="inline-flex items-center gap-1 text-[#2F6B4F] font-semibold">
                      <ImageIcon className="w-3.5 h-3.5" />
                      <span>Dokumentasi Ada</span>
                    </span>
                  ) : (
                    <span />
                  )}

                  <span className="text-[#2F6B4F] font-bold inline-flex items-center gap-1">
                    <span>Rincian</span>
                    <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Activity Detail Modal */}
      {selectedActivity && (
        <Modal
          isOpen={detailModalOpen}
          onClose={() => setDetailModalOpen(false)}
          title="Rincian Kegiatan"
          maxWidth="lg"
        >
          <div className="space-y-4">
            <div className="space-y-1">
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#2F6B4F]/10 text-[#2F6B4F] font-bold">
                {selectedActivity.jenis}
              </span>
              <h3 className="font-heading font-bold text-xl text-[#2B2B26] pt-1">
                {selectedActivity.judul}
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-[#FAF5EA] border border-[#E9E4D8]">
                <span className="text-[#6B685B] block font-semibold">Tanggal</span>
                <span className="font-bold text-sm text-[#2B2B26]">
                  {selectedActivity.tanggal}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-[#FAF5EA] border border-[#E9E4D8]">
                <span className="text-[#6B685B] block font-semibold">Status</span>
                <span className="font-bold text-sm text-[#2B2B26]">
                  {selectedActivity.status}
                </span>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-xs font-bold text-[#6B685B] uppercase tracking-wider block">
                Lokasi
              </span>
              <p className="text-sm font-semibold text-[#2B2B26]">
                {selectedActivity.lokasi}
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-xs font-bold text-[#6B685B] uppercase tracking-wider block">
                Deskripsi
              </span>
              <p className="text-sm text-[#2B2B26] leading-relaxed">
                {selectedActivity.deskripsi}
              </p>
            </div>

            {selectedActivity.ringkasanHasil && (
              <div className="p-4 rounded-xl bg-[#FAF5EA] border border-[#E9E4D8] space-y-1">
                <span className="text-xs font-bold text-[#2F6B4F] uppercase tracking-wider block">
                  Ringkasan Hasil
                </span>
                <p className="text-xs sm:text-sm text-[#2B2B26] leading-relaxed font-medium">
                  {selectedActivity.ringkasanHasil}
                </p>
              </div>
            )}

            {selectedActivity.albumTertautId && onViewAlbum && (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setDetailModalOpen(false);
                    onViewAlbum(selectedActivity.albumTertautId!);
                  }}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#2F6B4F] text-[#FAF5EA] hover:bg-[#1E4734] font-bold text-sm flex items-center justify-center gap-2"
                >
                  <ImageIcon className="w-4 h-4" />
                  <span>Lihat Album Dokumentasi</span>
                </button>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};
