import React, { useState, useMemo } from 'react';
import { Album, GaleriItem, Anggota } from '../types';
import { useAuth } from '../context/AuthContext';
import {
  Image as ImageIcon,
  Video,
  Play,
  X,
  ChevronLeft,
  ChevronRight,
  Calendar,
  MapPin,
  Users,
  ExternalLink,
} from 'lucide-react';

interface GaleriProps {
  albums: Album[];
  galleryItems: GaleriItem[];
  members: Anggota[];
  initialAlbumId?: string;
  onClearInitialAlbum?: () => void;
}

export const GaleriPage: React.FC<GaleriProps> = ({
  albums,
  galleryItems,
  members,
  initialAlbumId,
  onClearInitialAlbum,
}) => {
  const [selectedAlbumId, setSelectedAlbumId] = useState<string>(initialAlbumId || 'Semua');
  const [filterType, setFilterType] = useState<string>('Semua');

  // Fullscreen Viewer Modal
  const [activeViewerIdx, setActiveViewerIdx] = useState<number | null>(null);

  const memberMap = useMemo(() => new Map(members.map((m) => [m.id, m])), [members]);

  const filteredItems = useMemo(() => {
    return galleryItems.filter((item) => {
      if (selectedAlbumId !== 'Semua' && item.albumId !== selectedAlbumId) return false;
      if (filterType !== 'Semua' && item.tipe !== filterType) return false;
      return true;
    });
  }, [galleryItems, selectedAlbumId, filterType]);

  const openViewer = (idx: number) => {
    setActiveViewerIdx(idx);
  };

  const closeViewer = () => {
    setActiveViewerIdx(null);
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (activeViewerIdx === null) return;
    setActiveViewerIdx((prev) => (prev! > 0 ? prev! - 1 : filteredItems.length - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (activeViewerIdx === null) return;
    setActiveViewerIdx((prev) => (prev! < filteredItems.length - 1 ? prev! + 1 : 0));
  };

  const currentItem = activeViewerIdx !== null ? filteredItems[activeViewerIdx] : null;

  return (
    <div className="space-y-4 pb-20 sm:pb-8">
      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-2xl bg-[#FFFFFF] border border-[#E9E4D8] shadow-2xs">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold font-heading text-[#2F6B4F]">
            Galeri & Dokumentasi
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedAlbumId}
            onChange={(e) => {
              setSelectedAlbumId(e.target.value);
              if (onClearInitialAlbum) onClearInitialAlbum();
            }}
            className="px-3 py-1.5 rounded-xl border border-[#E9E4D8] bg-[#FAF5EA]/50 text-xs sm:text-sm font-semibold text-[#2B2B26]"
          >
            <option value="Semua">Semua Album</option>
            {albums.map((a) => (
              <option key={a.id} value={a.id}>
                {a.judul} ({a.tahun})
              </option>
            ))}
          </select>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-[#E9E4D8] bg-[#FAF5EA]/50 text-xs sm:text-sm font-semibold text-[#2B2B26]"
          >
            <option value="Semua">Semua Media</option>
            <option value="foto">Foto Saja</option>
            <option value="video">Video Saja</option>
          </select>
        </div>
      </div>

      {/* Gallery Items Grid */}
      {filteredItems.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-[#FFFFFF] border border-[#E9E4D8]">
          <h3 className="text-base font-bold text-[#6B685B]">Belum ada data</h3>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {filteredItems.map((item, idx) => {
            const isVideo = item.tipe === 'video';

            return (
              <div
                key={item.id}
                onClick={() => openViewer(idx)}
                className="group relative rounded-xl overflow-hidden bg-[#FAF5EA] border border-[#E9E4D8] cursor-pointer shadow-2xs hover:shadow-xs aspect-square flex flex-col justify-end"
              >
                {isVideo ? (
                  <div className="absolute inset-0 bg-[#2B2B26] flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-[#C9A24B] flex items-center justify-center text-white shadow-md group-hover:scale-110 transition">
                      <Play className="w-6 h-6 fill-white ml-0.5" />
                    </div>
                  </div>
                ) : (
                  <img
                    src={item.nilai}
                    alt={item.judul || ''}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                )}

                {/* Bottom Title Bar Overlay */}
                <div className="relative p-2.5 bg-gradient-to-t from-black/80 via-black/40 to-transparent text-white space-y-0.5">
                  <p className="text-xs font-bold truncate">
                    {item.judul || item.kegiatan || 'Dokumentasi'}
                  </p>
                  <p className="text-[10px] text-white/80 truncate">
                    {item.lokasi || item.tanggal || ''}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Fullscreen Viewer Modal */}
      {currentItem && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex flex-col justify-between p-4 sm:p-6"
          onClick={closeViewer}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between text-white pb-3 shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <h3 className="font-heading font-bold text-base sm:text-lg">
                {currentItem.judul || 'Dokumentasi'}
              </h3>
              <p className="text-xs text-white/70">
                {currentItem.kegiatan} • {currentItem.tanggal}
              </p>
            </div>
            <button
              type="button"
              onClick={closeViewer}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition text-white"
              aria-label="Tutup"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Media Center */}
          <div
            className="relative flex items-center justify-center grow overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Prev Button */}
            <button
              type="button"
              onClick={handlePrev}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-10 p-2.5 rounded-full bg-black/50 hover:bg-black/80 text-white transition"
              aria-label="Sebelumnya"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            {/* Content: Photo or Video */}
            {currentItem.tipe === 'video' ? (
              <div className="flex flex-col items-center gap-4 text-center p-6 bg-white/5 rounded-2xl max-w-md">
                <Video className="w-16 h-16 text-[#C9A24B]" />
                <h4 className="text-white font-bold text-lg">{currentItem.judul}</h4>
                <a
                  href={currentItem.nilai}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-2.5 rounded-xl bg-[#C9A24B] hover:bg-[#B8913B] text-white font-bold text-sm inline-flex items-center gap-2 transition"
                >
                  <span>Buka Video</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            ) : (
              <img
                src={currentItem.nilai}
                alt=""
                className="max-h-[70vh] max-w-full object-contain rounded-lg shadow-2xl"
              />
            )}

            {/* Next Button */}
            <button
              type="button"
              onClick={handleNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-10 p-2.5 rounded-full bg-black/50 hover:bg-black/80 text-white transition"
              aria-label="Berikutnya"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

          {/* Footer Metadata */}
          <div
            className="pt-3 text-white text-xs space-y-1 max-w-2xl mx-auto text-center shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            {currentItem.keterangan && (
              <p className="text-white/90 font-medium">{currentItem.keterangan}</p>
            )}
            {currentItem.orangTerlibatIds && currentItem.orangTerlibatIds.length > 0 && (
              <p className="text-white/70">
                Bersama:{' '}
                {currentItem.orangTerlibatIds
                  .map((id) => memberMap.get(id)?.nama)
                  .filter(Boolean)
                  .join(', ')}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
