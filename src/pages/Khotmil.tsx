import React from 'react';
import { KhotmilPeriode, KhotmilJuz } from '../types';
import { useAuth } from '../context/AuthContext';
import { BookOpen, CheckCircle2, Clock, Calendar } from 'lucide-react';

interface KhotmilProps {
  period: KhotmilPeriode;
  juzList: KhotmilJuz[];
  onNavigateToManage?: () => void;
}

export const KhotmilPage: React.FC<KhotmilProps> = ({
  period,
  juzList,
  onNavigateToManage,
}) => {
  const { canManageKhotmil } = useAuth();

  const kholasCount = juzList.filter((j) => j.status === 'Kholas').length;
  const progressPct = Math.round((kholasCount / 30) * 100);

  return (
    <div className="space-y-5 pb-20 sm:pb-8">
      {/* Header & Progress */}
      <div className="p-5 sm:p-6 rounded-2xl bg-[#FFFFFF] border border-[#E9E4D8] shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E9E4D8]/60 pb-4">
          <div className="space-y-1">
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#2F6B4F]/10 text-[#2F6B4F] font-bold">
              {period.status}
            </span>
            <h2 className="text-xl sm:text-2xl font-bold font-heading text-[#2B2B26]">
              {period.nama}
            </h2>
            <div className="flex items-center gap-1.5 text-xs text-[#6B685B] font-medium pt-0.5">
              <Calendar className="w-3.5 h-3.5 text-[#C9A24B]" />
              <span>Dimulai {period.tanggalMulai}</span>
            </div>
          </div>

          {canManageKhotmil && onNavigateToManage && (
            <button
              type="button"
              onClick={onNavigateToManage}
              className="px-4 py-2 rounded-xl bg-[#2F6B4F] text-[#FAF5EA] hover:bg-[#1E4734] transition font-bold text-sm shadow-xs self-start sm:self-auto"
            >
              Kelola Khotmil
            </button>
          )}
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs sm:text-sm font-bold text-[#2B2B26]">
            <span>Progres Khotmil</span>
            <span className="text-[#2F6B4F]">
              {kholasCount} dari 30 Juz Kholas ({progressPct}%)
            </span>
          </div>
          <div className="w-full h-3.5 rounded-full bg-[#FAF5EA] overflow-hidden border border-[#E9E4D8]">
            <div
              className="h-full rounded-full bg-[#2F6B4F] transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* 30 Juz Grid */}
      <div className="space-y-3">
        <h3 className="font-heading font-bold text-lg text-[#2F6B4F]">
          Pembagian 30 Juz
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-2.5">
          {juzList.map((juz) => {
            const isKholas = juz.status === 'Kholas';
            return (
              <div
                key={juz.id}
                className={`p-3 rounded-xl border flex flex-col justify-between transition min-h-[110px] ${
                  isKholas
                    ? 'bg-[#2F6B4F]/5 border-[#2F6B4F]/40'
                    : 'bg-[#FFFFFF] border-[#E9E4D8]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="font-heading font-bold text-sm text-[#2B2B26]">
                      Juz {juz.juzNomor}
                    </span>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold ${
                        isKholas
                          ? 'bg-[#2F6B4F] text-[#FAF5EA]'
                          : 'bg-[#6B685B]/15 text-[#6B685B]'
                      }`}
                    >
                      {isKholas ? 'Kholas' : 'Belum'}
                    </span>
                  </div>

                  <p className="font-semibold text-xs text-[#2B2B26] line-clamp-2 mt-1">
                    {juz.anggotaNama || 'Belum Dibagi'}
                  </p>
                </div>

                <div className="text-[10px] text-[#6B685B] font-medium pt-1 border-t border-[#E9E4D8]/60">
                  {isKholas ? juz.tanggalLapor || 'Selesai' : 'Sedang Dibaca'}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
