import React, { useState, useMemo } from 'react';
import { Anggota } from '../types';
import {
  Search,
  Filter,
  User,
  MapPin,
  ArrowUpDown,
  ChevronDown,
  X,
} from 'lucide-react';

interface AnggotaProps {
  members: Anggota[];
  onSelectMember: (m: Anggota) => void;
}

export const AnggotaPage: React.FC<AnggotaProps> = ({ members, onSelectMember }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterBranch, setFilterBranch] = useState('Semua');
  const [filterGen, setFilterGen] = useState('Semua');
  const [filterGender, setFilterGender] = useState('Semua');
  const [filterStatus, setFilterStatus] = useState('Semua');
  const [filterVerification, setFilterVerification] = useState('Semua');
  const [sortBy, setSortBy] = useState<'nama' | 'generasi'>('generasi');
  const [displayCount, setDisplayCount] = useState(20);

  const branches = useMemo(() => {
    return Array.from(new Set(members.map((m) => m.cabang))).filter(Boolean);
  }, [members]);

  const filteredMembers = useMemo(() => {
    return members
      .filter((m) => {
        if (m.diarsipkan) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = m.nama.toLowerCase().includes(q);
          const matchCode = m.kodeSilsilah.toLowerCase().includes(q);
          const matchNo = m.nomorAnggota.toLowerCase().includes(q);
          const matchDom = (m.domisili || '').toLowerCase().includes(q);
          if (!matchName && !matchCode && !matchNo && !matchDom) return false;
        }
        if (filterBranch !== 'Semua' && m.cabang !== filterBranch) return false;
        if (filterGen !== 'Semua' && m.generasi !== Number(filterGen)) return false;
        if (filterGender !== 'Semua' && m.jenisKelamin !== filterGender) return false;
        if (filterStatus !== 'Semua' && m.statusHidup !== filterStatus) return false;
        if (filterVerification !== 'Semua' && m.statusVerifikasi !== filterVerification) return false;
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'nama') {
          return a.nama.localeCompare(b.nama);
        }
        if (a.generasi !== b.generasi) {
          return a.generasi - b.generasi;
        }
        return a.kodeSilsilah.localeCompare(b.kodeSilsilah);
      });
  }, [
    members,
    searchQuery,
    filterBranch,
    filterGen,
    filterGender,
    filterStatus,
    filterVerification,
    sortBy,
  ]);

  const displayedList = filteredMembers.slice(0, displayCount);

  const hasActiveFilters =
    filterBranch !== 'Semua' ||
    filterGen !== 'Semua' ||
    filterGender !== 'Semua' ||
    filterStatus !== 'Semua' ||
    filterVerification !== 'Semua';

  const resetFilters = () => {
    setFilterBranch('Semua');
    setFilterGen('Semua');
    setFilterGender('Semua');
    setFilterStatus('Semua');
    setFilterVerification('Semua');
    setSearchQuery('');
  };

  return (
    <div className="space-y-4 pb-20 sm:pb-8">
      {/* Header & Search */}
      <div className="p-4 rounded-2xl bg-[#FFFFFF] border border-[#E9E4D8] shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative grow">
            <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B685B]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama atau domisili"
              className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-[#E9E4D8] bg-[#FAF5EA]/50 text-base text-[#2B2B26] focus:outline-hidden focus:border-[#2F6B4F]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B685B] hover:text-[#2B2B26]"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setSortBy(sortBy === 'generasi' ? 'nama' : 'generasi')}
              className="px-3.5 py-2.5 rounded-xl border border-[#E9E4D8] bg-[#FAF5EA]/50 hover:bg-[#FAF5EA] text-xs sm:text-sm font-bold text-[#2B2B26] flex items-center gap-1.5 transition"
            >
              <ArrowUpDown className="w-4 h-4 text-[#2F6B4F]" />
              <span>Urut {sortBy === 'generasi' ? 'Generasi' : 'Nama'}</span>
            </button>
          </div>
        </div>

        {/* Filter Rows */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-[#E9E4D8]/60">
          <select
            value={filterBranch}
            onChange={(e) => setFilterBranch(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-[#E9E4D8] bg-[#FFFFFF] text-xs font-semibold text-[#2B2B26]"
          >
            <option value="Semua">Semua Cabang</option>
            {branches.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>

          <select
            value={filterGen}
            onChange={(e) => setFilterGen(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-[#E9E4D8] bg-[#FFFFFF] text-xs font-semibold text-[#2B2B26]"
          >
            <option value="Semua">Semua Generasi</option>
            <option value="1">Generasi 1</option>
            <option value="2">Generasi 2</option>
            <option value="3">Generasi 3</option>
            <option value="4">Generasi 4</option>
          </select>

          <select
            value={filterGender}
            onChange={(e) => setFilterGender(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-[#E9E4D8] bg-[#FFFFFF] text-xs font-semibold text-[#2B2B26]"
          >
            <option value="Semua">Semua Gender</option>
            <option value="L">Laki-laki</option>
            <option value="P">Perempuan</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-[#E9E4D8] bg-[#FFFFFF] text-xs font-semibold text-[#2B2B26]"
          >
            <option value="Semua">Semua Status</option>
            <option value="hidup">Hidup</option>
            <option value="wafat">Wafat</option>
          </select>

          <select
            value={filterVerification}
            onChange={(e) => setFilterVerification(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-[#E9E4D8] bg-[#FFFFFF] text-xs font-semibold text-[#2B2B26]"
          >
            <option value="Semua">Semua Verifikasi</option>
            <option value="Terverifikasi">Terverifikasi</option>
            <option value="Perlu Konfirmasi">Perlu Konfirmasi</option>
            <option value="Usulan Perubahan">Usulan Perubahan</option>
          </select>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={resetFilters}
              className="px-2.5 py-1.5 rounded-lg bg-[#B3402F]/10 text-[#B3402F] text-xs font-bold hover:bg-[#B3402F]/20 transition"
            >
              Atur Ulang
            </button>
          )}

          <div className="ml-auto text-xs font-semibold text-[#6B685B]">
            {filteredMembers.length} Anggota
          </div>
        </div>
      </div>

      {/* Member Cards Grid */}
      {displayedList.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-[#FFFFFF] border border-[#E9E4D8]">
          <h3 className="text-base font-bold text-[#6B685B]">Belum ada data</h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
          {displayedList.map((m) => {
            const isDeceased = m.statusHidup === 'wafat';
            return (
              <div
                key={m.id}
                onClick={() => onSelectMember(m)}
                className={`p-4 rounded-xl cursor-pointer bg-[#FFFFFF] border border-[#E9E4D8] hover:border-[#2F6B4F] shadow-2xs hover:shadow-xs transition flex flex-col justify-between ${
                  isDeceased ? 'border-2 border-[#C9A24B]/50' : ''
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-[#6B685B]">
                      {m.kodeSilsilah} • {m.nomorAnggota}
                    </span>
                    <span
                      className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${
                        m.statusVerifikasi === 'Terverifikasi'
                          ? 'bg-[#2F6B4F]/10 text-[#2F6B4F]'
                          : m.statusVerifikasi === 'Perlu Konfirmasi'
                          ? 'bg-[#D9822B]/10 text-[#D9822B]'
                          : 'bg-[#286090]/10 text-[#286090]'
                      }`}
                    >
                      {m.statusVerifikasi}
                    </span>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#FAF5EA] border border-[#E9E4D8] flex items-center justify-center text-[#2F6B4F] shrink-0 mt-0.5">
                      <User className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-heading font-bold text-base text-[#2B2B26] line-clamp-1">
                        {m.nama}
                      </h3>
                      <p className="text-xs text-[#6B685B] font-medium">
                        {m.cabang} • Gen {m.generasi}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-[#6B685B] font-medium">
                    <MapPin className="w-3.5 h-3.5 text-[#C9A24B] shrink-0" />
                    <span className="truncate">
                      {m.domisili || 'Belum diketahui'}
                    </span>
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-[#E9E4D8]/60 flex items-center justify-between text-xs text-[#6B685B]">
                  <span>{m.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan'}</span>
                  <span>
                    {isDeceased
                      ? 'Wafat'
                      : m.usia
                      ? `${m.usia} Tahun`
                      : m.tahunLahir
                      ? `Lahir ${m.tahunLahir}`
                      : 'Hidup'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Dimuat bertahap (Load More button) */}
      {filteredMembers.length > displayCount && (
        <div className="flex justify-center pt-2">
          <button
            type="button"
            onClick={() => setDisplayCount((c) => c + 20)}
            className="px-6 py-2.5 rounded-xl border border-[#2F6B4F] text-[#2F6B4F] hover:bg-[#2F6B4F]/5 transition text-sm font-bold shadow-2xs"
          >
            Muat Lebih Banyak
          </button>
        </div>
      )}
    </div>
  );
};
