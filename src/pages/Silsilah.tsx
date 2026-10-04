import React, { useState, useMemo } from 'react';
import { Anggota } from '../types';
import { useAuth } from '../context/AuthContext';
import { findKinshipPath } from '../lib/kinship';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  List,
  Network,
  ChevronDown,
  ChevronRight,
  User,
  Heart,
  Compass,
  Filter,
} from 'lucide-react';

interface SilsilahProps {
  members: Anggota[];
  onSelectMember: (m: Anggota) => void;
  highlightedPath?: string[];
  onOpenMyMemberPicker: () => void;
}

export const Silsilah: React.FC<SilsilahProps> = ({
  members,
  onSelectMember,
  highlightedPath = [],
  onOpenMyMemberPicker,
}) => {
  const { myMemberId } = useAuth();
  const [viewMode, setViewMode] = useState<'pohon' | 'daftar'>('daftar');
  const [selectedBranch, setSelectedBranch] = useState<string>('Semua');
  const [selectedGen, setSelectedGen] = useState<string>('Semua');
  const [zoom, setZoom] = useState(1);
  const [activePath, setActivePath] = useState<string[]>(highlightedPath);

  // For collapsible list view
  const [expandedBranches, setExpandedBranches] = useState<Record<string, boolean>>({
    'Cabang H. Abdullah': true,
    'Cabang Hj. Khadijah': true,
    'Cabang H. Mansyur': true,
  });

  const memberMap = useMemo(() => new Map(members.map((m) => [m.id, m])), [members]);

  const branches = useMemo(() => {
    return Array.from(new Set(members.map((m) => m.cabang))).filter(
      (c) => c && c !== 'Pusat' && c !== 'Belum diketahui'
    );
  }, [members]);

  const filteredMembers = useMemo(() => {
    return members.filter((m) => {
      if (m.diarsipkan) return false;
      if (selectedBranch !== 'Semua' && m.cabang !== selectedBranch && m.cabang !== 'Pusat') {
        return false;
      }
      if (selectedGen !== 'Semua' && m.generasi !== Number(selectedGen)) {
        return false;
      }
      return true;
    });
  }, [members, selectedBranch, selectedGen]);

  const toggleBranch = (branch: string) => {
    setExpandedBranches((prev) => ({ ...prev, [branch]: !prev[branch] }));
  };

  const myMember = memberMap.get(myMemberId || '');

  const handleHighlightPathTo = (targetId: string) => {
    if (!myMemberId) {
      onOpenMyMemberPicker();
      return;
    }
    const path = findKinshipPath(myMemberId, targetId, members);
    setActivePath(path);
  };

  const renderMemberCard = (m: Anggota, isCompact = false) => {
    const isDeceased = m.statusHidup === 'wafat';
    const isHighlighted = activePath.includes(m.id);
    const isMe = myMemberId === m.id;

    return (
      <div
        key={m.id}
        onClick={() => onSelectMember(m)}
        className={`cursor-pointer rounded-xl transition-all duration-200 p-3 select-none flex flex-col justify-between ${
          isHighlighted
            ? 'ring-3 ring-[#C9A24B] shadow-md bg-[#FFF9E6]'
            : isMe
            ? 'ring-2 ring-[#2F6B4F] bg-[#FAF5EA]'
            : 'bg-[#FFFFFF] border border-[#E9E4D8] shadow-2xs hover:shadow-xs hover:border-[#2F6B4F]'
        } ${isDeceased ? 'border-2 border-[#C9A24B]/60' : ''} ${
          isCompact ? 'min-w-[140px]' : 'min-w-[170px] max-w-[210px]'
        }`}
      >
        <div className="flex items-start justify-between gap-1.5 mb-1.5">
          <div className="flex items-center gap-1.5">
            <span
              className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                m.statusVerifikasi === 'Terverifikasi'
                  ? 'bg-[#2F6B4F]'
                  : m.statusVerifikasi === 'Perlu Konfirmasi'
                  ? 'bg-[#D9822B]'
                  : 'bg-[#286090]'
              }`}
            />
            <span className="text-[11px] font-bold text-[#6B685B] truncate">
              {m.kodeSilsilah}
            </span>
          </div>
          {isDeceased && (
            <span className="text-[10px] px-1 rounded bg-[#C9A24B]/20 text-[#9E7A24] font-bold shrink-0">
              Alm
            </span>
          )}
        </div>

        <p className="font-heading font-bold text-sm text-[#2B2B26] line-clamp-2 leading-snug">
          {m.nama}
        </p>

        <div className="mt-2 pt-1.5 border-t border-[#E9E4D8]/60 flex items-center justify-between text-[11px] text-[#6B685B]">
          <span>G{m.generasi}</span>
          <span>{m.tahunLahir ? `${m.tahunLahir}` : m.usia ? `${m.usia} th` : '-'}</span>
          <span>{m.jenisKelamin === 'L' ? 'L' : 'P'}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4 pb-20 sm:pb-8">
      {/* Top Controls Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-2xl bg-[#FFFFFF] border border-[#E9E4D8] shadow-2xs">
        {/* View Switcher: Daftar vs Bagan Pohon */}
        <div className="inline-flex rounded-xl p-1 bg-[#FAF5EA] border border-[#E9E4D8] self-start sm:self-center">
          <button
            type="button"
            onClick={() => setViewMode('daftar')}
            className={`px-3.5 py-1.5 rounded-lg flex items-center gap-2 font-bold text-sm transition ${
              viewMode === 'daftar'
                ? 'bg-[#2F6B4F] text-[#FAF5EA] shadow-xs'
                : 'text-[#2B2B26] hover:text-[#2F6B4F]'
            }`}
          >
            <List className="w-4 h-4" />
            <span>Daftar Silsilah</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('pohon')}
            className={`px-3.5 py-1.5 rounded-lg flex items-center gap-2 font-bold text-sm transition ${
              viewMode === 'pohon'
                ? 'bg-[#2F6B4F] text-[#FAF5EA] shadow-xs'
                : 'text-[#2B2B26] hover:text-[#2F6B4F]'
            }`}
          >
            <Network className="w-4 h-4" />
            <span>Bagan Pohon</span>
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Cabang Filter */}
          <select
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
            className="px-3 py-2 rounded-xl border border-[#E9E4D8] bg-[#FAF5EA]/50 text-xs sm:text-sm font-semibold text-[#2B2B26] focus:outline-hidden focus:border-[#2F6B4F]"
          >
            <option value="Semua">Semua Cabang</option>
            {branches.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>

          {/* Generasi Filter */}
          <select
            value={selectedGen}
            onChange={(e) => setSelectedGen(e.target.value)}
            className="px-3 py-2 rounded-xl border border-[#E9E4D8] bg-[#FAF5EA]/50 text-xs sm:text-sm font-semibold text-[#2B2B26] focus:outline-hidden focus:border-[#2F6B4F]"
          >
            <option value="Semua">Semua Generasi</option>
            <option value="1">Generasi 1</option>
            <option value="2">Generasi 2</option>
            <option value="3">Generasi 3</option>
            <option value="4">Generasi 4</option>
          </select>

          {/* User selector button */}
          <button
            type="button"
            onClick={onOpenMyMemberPicker}
            className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition ${
              myMember
                ? 'bg-[#C9A24B]/15 text-[#9E7A24] border border-[#C9A24B]/30'
                : 'bg-[#FAF5EA] border border-[#E9E4D8] text-[#2B2B26] hover:border-[#2F6B4F]'
            }`}
          >
            <Heart className="w-3.5 h-3.5 text-[#C9A24B]" />
            <span className="truncate max-w-[120px]">
              {myMember ? myMember.nama : 'Pilih Nama Saya'}
            </span>
          </button>
        </div>
      </div>

      {/* Path Highlight Indicator if active */}
      {activePath.length > 0 && (
        <div className="flex items-center justify-between p-3 rounded-xl bg-[#FFF9E6] border border-[#C9A24B]/40 text-xs font-semibold text-[#9E7A24]">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-[#C9A24B]" />
            <span>Jalur Hubungan Aktif ({activePath.length} Rantai Keluarga)</span>
          </div>
          <button
            type="button"
            onClick={() => setActivePath([])}
            className="px-2 py-1 rounded-md bg-[#FFFFFF] border border-[#C9A24B]/30 hover:bg-[#FAF5EA] text-[#2B2B26]"
          >
            Hapus Sorotan
          </button>
        </div>
      )}

      {/* VIEW MODE 1: DAFTAR SILSILAH (Hierarchical Collapsible List - ideal for Mobile) */}
      {viewMode === 'daftar' && (
        <div className="space-y-4">
          {/* Leluhur / Generasi 1 */}
          <div className="p-4 rounded-2xl bg-[#FFFFFF] border border-[#E9E4D8] shadow-2xs space-y-3">
            <h3 className="font-heading font-bold text-base text-[#2F6B4F]">
              Generasi 1 • Leluhur
            </h3>
            <div className="flex flex-wrap gap-3">
              {members
                .filter((m) => m.generasi === 1 && !m.diarsipkan)
                .map((m) => renderMemberCard(m))}
            </div>
          </div>

          {/* Cabang Keturunan */}
          {branches.map((branch) => {
            const isExpanded = expandedBranches[branch] ?? true;
            const branchMembers = filteredMembers.filter(
              (m) => m.cabang === branch && m.generasi > 1
            );

            if (selectedBranch !== 'Semua' && selectedBranch !== branch) return null;

            return (
              <div
                key={branch}
                className="rounded-2xl bg-[#FFFFFF] border border-[#E9E4D8] shadow-2xs overflow-hidden"
              >
                {/* Branch Header Accordion */}
                <button
                  type="button"
                  onClick={() => toggleBranch(branch)}
                  className="w-full p-4 flex items-center justify-between bg-[#FAF5EA]/50 hover:bg-[#FAF5EA] transition border-b border-[#E9E4D8]"
                >
                  <div className="flex items-center gap-2">
                    {isExpanded ? (
                      <ChevronDown className="w-5 h-5 text-[#2F6B4F]" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-[#6B685B]" />
                    )}
                    <h3 className="font-heading font-bold text-base text-[#2B2B26]">
                      {branch}
                    </h3>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-[#2F6B4F]/10 text-[#2F6B4F] font-bold">
                      {branchMembers.length} Anggota
                    </span>
                  </div>
                </button>

                {/* Branch Members by Generation */}
                {isExpanded && (
                  <div className="p-4 space-y-4">
                    {[2, 3, 4].map((gen) => {
                      const genMembers = branchMembers.filter((m) => m.generasi === gen);
                      if (genMembers.length === 0) return null;

                      return (
                        <div key={gen} className="space-y-2">
                          <p className="text-xs font-bold text-[#6B685B] uppercase tracking-wider pl-1">
                            Generasi {gen}
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                            {genMembers.map((m) => renderMemberCard(m))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW MODE 2: BAGAN POHON (Interactive Pan & Zoom Canvas) */}
      {viewMode === 'pohon' && (
        <div className="relative rounded-2xl bg-[#FFFFFF] border border-[#E9E4D8] shadow-2xs overflow-hidden min-h-[500px]">
          {/* Zoom controls */}
          <div className="absolute top-4 right-4 z-10 flex items-center gap-1.5 p-1 rounded-xl bg-[#FAF5EA] border border-[#E9E4D8] shadow-xs">
            <button
              type="button"
              onClick={() => setZoom((z) => Math.min(z + 0.15, 1.6))}
              className="p-2 rounded-lg text-[#2F6B4F] hover:bg-[#FFFFFF] transition"
              aria-label="Perbesar"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setZoom((z) => Math.max(z - 0.15, 0.6))}
              className="p-2 rounded-lg text-[#2F6B4F] hover:bg-[#FFFFFF] transition"
              aria-label="Perkecil"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setZoom(1)}
              className="p-2 rounded-lg text-[#6B685B] hover:bg-[#FFFFFF] transition"
              aria-label="Atur Ulang Ukuran"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* Pan Canvas Area */}
          <div className="p-6 overflow-x-auto overflow-y-auto max-h-[700px]">
            <div
              className="transition-transform duration-150 origin-top flex flex-col items-center gap-10 min-w-[800px] py-4"
              style={{ transform: `scale(${zoom})` }}
            >
              {/* Level 1: Leluhur */}
              <div className="flex flex-col items-center">
                <span className="text-xs font-bold text-[#6B685B] uppercase tracking-wider mb-2">
                  Generasi 1 • Leluhur
                </span>
                <div className="flex items-center gap-4 p-3 rounded-2xl bg-[#FAF5EA] border border-[#E9E4D8]">
                  {members
                    .filter((m) => m.generasi === 1)
                    .map((m) => renderMemberCard(m, true))}
                </div>
                {/* Connecting Line Down */}
                <div className="w-0.5 h-8 bg-[#C9A24B]" />
              </div>

              {/* Level 2: Cabang Utama */}
              <div className="flex flex-col items-center w-full">
                <span className="text-xs font-bold text-[#6B685B] uppercase tracking-wider mb-2">
                  Generasi 2 • Tiga Cabang
                </span>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl justify-items-center">
                  {branches.map((bName) => {
                    const head = members.find((m) => m.cabang === bName && m.generasi === 2 && m.ayahId);
                    const spouse = head?.pasanganIds?.[0] ? memberMap.get(head.pasanganIds[0]) : null;

                    return (
                      <div key={bName} className="flex flex-col items-center w-full">
                        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#FAF5EA]/80 border border-[#E9E4D8]">
                          {head && renderMemberCard(head, true)}
                          {spouse && renderMemberCard(spouse, true)}
                        </div>

                        {/* Connector down to Gen 3 */}
                        <div className="w-0.5 h-6 bg-[#C9A24B]" />

                        {/* Gen 3 for this branch */}
                        <div className="w-full p-2 rounded-xl bg-[#FAF5EA]/30 border border-dashed border-[#E9E4D8] flex flex-wrap gap-2 justify-center">
                          {members
                            .filter((m) => m.cabang === bName && m.generasi === 3 && !m.diarsipkan)
                            .map((m) => renderMemberCard(m, true))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Level 3: Generasi 4 (Cicit) */}
              <div className="flex flex-col items-center w-full">
                <span className="text-xs font-bold text-[#6B685B] uppercase tracking-wider mb-2">
                  Generasi 4 • Cicit
                </span>
                <div className="flex flex-wrap gap-3 justify-center max-w-5xl">
                  {members
                    .filter((m) => m.generasi === 4 && !m.diarsipkan)
                    .map((m) => renderMemberCard(m, true))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
