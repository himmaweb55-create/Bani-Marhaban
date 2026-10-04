import React, { useState } from 'react';
import { RiwayatPerubahan } from '../types';
import { History, Search, ArrowRight } from 'lucide-react';

interface RiwayatPerubahanProps {
  history: RiwayatPerubahan[];
}

export const RiwayatPerubahanPage: React.FC<RiwayatPerubahanProps> = ({ history }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredHistory = history.filter((r) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      r.targetNama.toLowerCase().includes(q) ||
      r.kolomDiubah.toLowerCase().includes(q) ||
      r.pengusul.toLowerCase().includes(q) ||
      r.pemverifikasi.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-4 pb-20 sm:pb-8">
      <div className="p-4 rounded-2xl bg-[#FFFFFF] border border-[#E9E4D8] shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <History className="w-6 h-6 text-[#2F6B4F]" />
            <h2 className="text-xl sm:text-2xl font-bold font-heading text-[#2F6B4F]">
              Riwayat Perubahan
            </h2>
          </div>
          <span className="text-xs font-bold text-[#6B685B]">
            {filteredHistory.length} Catatan Riwayat
          </span>
        </div>

        <div className="relative">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-[#6B685B]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama atau pengusul"
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-[#E9E4D8] bg-[#FAF5EA]/50 text-sm focus:outline-hidden focus:border-[#2F6B4F]"
          />
        </div>
      </div>

      <div className="space-y-3">
        {filteredHistory.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-[#FFFFFF] border border-[#E9E4D8]">
            <h3 className="text-base font-bold text-[#6B685B]">Belum ada data</h3>
          </div>
        ) : (
          filteredHistory.map((item) => (
            <div
              key={item.id}
              className="p-4 sm:p-5 rounded-2xl bg-[#FFFFFF] border border-[#E9E4D8] shadow-2xs space-y-2.5"
            >
              <div className="flex items-center justify-between text-xs text-[#6B685B]">
                <span className="font-bold text-[#2F6B4F] uppercase tracking-wider">
                  {item.kolomDiubah}
                </span>
                <span>{item.tanggal}</span>
              </div>

              <h4 className="font-heading font-bold text-base text-[#2B2B26]">
                {item.targetNama}
              </h4>

              <div className="p-3 rounded-xl bg-[#FAF5EA]/60 border border-[#E9E4D8] text-xs flex flex-col sm:flex-row sm:items-center gap-2 justify-between">
                <div className="space-y-0.5">
                  <span className="text-[#6B685B] block">Sebelum:</span>
                  <span className="font-semibold text-[#2B2B26]">{item.nilaiSebelum}</span>
                </div>
                <ArrowRight className="hidden sm:block w-4 h-4 text-[#C9A24B] shrink-0" />
                <div className="space-y-0.5 sm:text-right">
                  <span className="text-[#2F6B4F] font-bold block">Sesudah:</span>
                  <span className="font-semibold text-[#2F6B4F]">{item.nilaiSesudah}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1 text-xs text-[#6B685B] font-medium">
                <span>Pengusul: {item.pengusul}</span>
                <span>Verifikator: {item.pemverifikasi}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
