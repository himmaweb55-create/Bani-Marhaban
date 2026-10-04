import React, { useMemo } from 'react';
import { Anggota } from '../types';
import {
  Users,
  Printer,
  Calendar,
  AlertTriangle,
  ChevronRight,
  TrendingUp,
  PieChart as PieIcon,
  BarChart3,
  UserCheck,
} from 'lucide-react';

interface PetaDataProps {
  members: Anggota[];
  onSelectMember: (m: Anggota) => void;
}

export const PetaData: React.FC<PetaDataProps> = ({ members, onSelectMember }) => {
  const activeMembers = useMemo(() => members.filter((m) => !m.diarsipkan), [members]);

  const total = activeMembers.length;
  const living = activeMembers.filter((m) => m.statusHidup === 'hidup').length;
  const deceased = activeMembers.filter((m) => m.statusHidup === 'wafat').length;

  // By Generation
  const genStats = useMemo(() => {
    const counts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0 };
    activeMembers.forEach((m) => {
      if (counts[m.generasi] !== undefined) counts[m.generasi]++;
    });
    return counts;
  }, [activeMembers]);

  // By Branch
  const branchStats = useMemo(() => {
    const counts: Record<string, number> = {};
    activeMembers.forEach((m) => {
      const b = m.cabang || 'Belum diketahui';
      counts[b] = (counts[b] || 0) + 1;
    });
    return counts;
  }, [activeMembers]);

  // Verification Status
  const verificationStats = useMemo(() => {
    const counts = {
      Terverifikasi: 0,
      'Perlu Konfirmasi': 0,
      'Usulan Perubahan': 0,
    };
    activeMembers.forEach((m) => {
      if (counts[m.statusVerifikasi] !== undefined) {
        counts[m.statusVerifikasi]++;
      }
    });
    return counts;
  }, [activeMembers]);

  // Members needing completion (missing parents, missing branch, or unlinked)
  const incompleteMembers = useMemo(() => {
    return activeMembers.filter((m) => {
      if (m.generasi > 1 && (!m.ayahId && !m.ibuId)) return true;
      if (m.cabang === 'Belum diketahui') return true;
      return false;
    });
  }, [activeMembers]);

  // Timeline growth data (approximate years based on birth year ranges)
  const growthTimeline = useMemo(() => {
    return [
      { tahun: '1940', count: 2 },
      { tahun: '1970', count: 8 },
      { tahun: '1990', count: 18 },
      { tahun: '2010', count: 32 },
      { tahun: '2026', count: total },
    ];
  }, [total]);

  const handlePrint = () => {
    window.print();
  };

  const currentDate = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="space-y-6 pb-20 sm:pb-8 print:p-0">
      {/* Header with Print action */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl bg-[#FFFFFF] border border-[#E9E4D8] shadow-2xs">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold font-heading text-[#2F6B4F]">
            Peta Data Keluarga
          </h2>
          <p className="text-xs text-[#6B685B] font-semibold mt-0.5">
            Pembaruan Terkini: {currentDate}
          </p>
        </div>

        <button
          type="button"
          onClick={handlePrint}
          className="px-4 py-2.5 rounded-xl border border-[#2F6B4F] text-[#2F6B4F] hover:bg-[#2F6B4F]/5 transition text-sm font-bold flex items-center gap-2 self-stretch sm:self-auto justify-center"
        >
          <Printer className="w-4 h-4" />
          <span>Cetak Laporan</span>
        </button>
      </div>

      {/* Top 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="p-5 rounded-2xl bg-[#FFFFFF] border border-[#E9E4D8] shadow-2xs space-y-1">
          <span className="text-xs font-bold text-[#6B685B] uppercase tracking-wider">
            Total Keturunan Terdata
          </span>
          <p className="text-3xl sm:text-4xl font-black font-heading text-[#2F6B4F]">
            {total}
          </p>
          <span className="text-xs text-[#6B685B] block pt-1 font-medium">
            Mencakup 4 Tingkat Generasi
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-[#FFFFFF] border border-[#E9E4D8] shadow-2xs space-y-1">
          <span className="text-xs font-bold text-[#6B685B] uppercase tracking-wider">
            Anggota Hidup
          </span>
          <p className="text-3xl sm:text-4xl font-black font-heading text-[#2B2B26]">
            {living}
          </p>
          <span className="text-xs text-[#6B685B] block pt-1 font-medium">
            {total ? Math.round((living / total) * 100) : 0}% dari seluruh keturunan
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-[#FFFFFF] border border-[#E9E4D8] shadow-2xs space-y-1 border-l-4 border-l-[#C9A24B]">
          <span className="text-xs font-bold text-[#6B685B] uppercase tracking-wider">
            Anggota Wafat
          </span>
          <p className="text-3xl sm:text-4xl font-black font-heading text-[#9E7A24]">
            {deceased}
          </p>
          <span className="text-xs text-[#6B685B] block pt-1 font-medium">
            {total ? Math.round((deceased / total) * 100) : 0}% tercatat rapi
          </span>
        </div>
      </div>

      {/* Generation Bar Chart & Branch Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Grafik Batang: Generasi */}
        <div className="p-5 rounded-2xl bg-[#FFFFFF] border border-[#E9E4D8] shadow-2xs space-y-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-[#2F6B4F]" />
            <h3 className="font-heading font-bold text-lg text-[#2B2B26]">
              Jumlah Anggota per Generasi
            </h3>
          </div>

          <div className="space-y-3 pt-2">
            {[1, 2, 3, 4].map((g) => {
              const count = genStats[g] || 0;
              const percentage = total ? Math.round((count / total) * 100) : 0;
              return (
                <div key={g} className="space-y-1">
                  <div className="flex justify-between text-xs sm:text-sm font-bold text-[#2B2B26]">
                    <span>Generasi {g}</span>
                    <span>
                      {count} ({percentage}%)
                    </span>
                  </div>
                  <div className="w-full h-4 rounded-full bg-[#FAF5EA] overflow-hidden border border-[#E9E4D8]">
                    <div
                      className="h-full rounded-full bg-[#2F6B4F] transition-all duration-500"
                      style={{ width: `${Math.max(percentage, 4)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Grafik Distribusi per Cabang */}
        <div className="p-5 rounded-2xl bg-[#FFFFFF] border border-[#E9E4D8] shadow-2xs space-y-4">
          <div className="flex items-center gap-2">
            <PieIcon className="w-5 h-5 text-[#C9A24B]" />
            <h3 className="font-heading font-bold text-lg text-[#2B2B26]">
              Distribusi per Cabang
            </h3>
          </div>

          <div className="space-y-3 pt-2">
            {Object.entries(branchStats).map(([branchName, count], idx) => {
              const pct = total ? Math.round((count / total) * 100) : 0;
              const colors = ['bg-[#2F6B4F]', 'bg-[#C9A24B]', 'bg-[#286090]', 'bg-[#6B685B]'];
              const barColor = colors[idx % colors.length];

              return (
                <div key={branchName} className="space-y-1">
                  <div className="flex justify-between text-xs sm:text-sm font-bold text-[#2B2B26]">
                    <span className="truncate pr-2">{branchName}</span>
                    <span className="shrink-0">
                      {count} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full h-4 rounded-full bg-[#FAF5EA] overflow-hidden border border-[#E9E4D8]">
                    <div
                      className={`h-full rounded-full ${barColor} transition-all duration-500`}
                      style={{ width: `${Math.max(pct, 4)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Verification Status & Growth Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Status Verifikasi */}
        <div className="p-5 rounded-2xl bg-[#FFFFFF] border border-[#E9E4D8] shadow-2xs space-y-4">
          <div className="flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-[#2F6B4F]" />
            <h3 className="font-heading font-bold text-lg text-[#2B2B26]">
              Kelengkapan dan Status Verifikasi
            </h3>
          </div>

          <div className="space-y-3 pt-2">
            {Object.entries(verificationStats).map(([statusName, count]) => {
              const pct = total ? Math.round((count / total) * 100) : 0;
              const barColor =
                statusName === 'Terverifikasi'
                  ? 'bg-[#2F6B4F]'
                  : statusName === 'Perlu Konfirmasi'
                  ? 'bg-[#D9822B]'
                  : 'bg-[#286090]';

              return (
                <div key={statusName} className="space-y-1">
                  <div className="flex justify-between text-xs sm:text-sm font-bold text-[#2B2B26]">
                    <span>{statusName}</span>
                    <span>
                      {count} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full h-4 rounded-full bg-[#FAF5EA] overflow-hidden border border-[#E9E4D8]">
                    <div
                      className={`h-full rounded-full ${barColor} transition-all duration-500`}
                      style={{ width: `${Math.max(pct, 4)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Perkembangan Jumlah Anggota Terdata */}
        <div className="p-5 rounded-2xl bg-[#FFFFFF] border border-[#E9E4D8] shadow-2xs space-y-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#2F6B4F]" />
            <h3 className="font-heading font-bold text-lg text-[#2B2B26]">
              Perkembangan Data Keturunan
            </h3>
          </div>

          <div className="pt-4 flex items-end justify-between h-40 gap-2 border-b border-[#E9E4D8] px-2">
            {growthTimeline.map((item) => {
              const heightPct = Math.round((item.count / total) * 100);
              return (
                <div key={item.tahun} className="flex flex-col items-center gap-1.5 flex-1">
                  <span className="text-[11px] font-bold text-[#2B2B26]">
                    {item.count}
                  </span>
                  <div
                    className="w-full max-w-[36px] rounded-t-lg bg-[#2F6B4F] transition-all duration-500"
                    style={{ height: `${Math.max(heightPct, 15)}%` }}
                  />
                  <span className="text-xs font-semibold text-[#6B685B] mt-1">
                    {item.tahun}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Perlu Dilengkapi (Clickable List to Profile) */}
      <div className="p-5 rounded-2xl bg-[#FFFFFF] border border-[#E9E4D8] shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-[#D9822B]" />
            <h3 className="font-heading font-bold text-lg text-[#2B2B26]">
              Perlu Dilengkapi ({incompleteMembers.length})
            </h3>
          </div>
        </div>

        {incompleteMembers.length === 0 ? (
          <p className="text-sm font-semibold text-[#6B685B]">Belum ada data</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {incompleteMembers.map((m) => (
              <div
                key={m.id}
                onClick={() => onSelectMember(m)}
                className="p-3.5 rounded-xl border border-[#E9E4D8] bg-[#FAF5EA]/50 hover:bg-[#FAF5EA] hover:border-[#2F6B4F] transition cursor-pointer flex items-center justify-between"
              >
                <div>
                  <h4 className="font-heading font-bold text-sm text-[#2B2B26]">
                    {m.nama}
                  </h4>
                  <p className="text-xs text-[#D9822B] font-semibold mt-0.5">
                    {!m.ayahId && !m.ibuId
                      ? 'Belum ada data orang tua'
                      : 'Cabang belum terhubung'}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-[#6B685B]" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
