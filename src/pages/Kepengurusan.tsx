import React from 'react';
import { KepengurusanPeriode, Anggota } from '../types';
import { Award, User, ChevronRight } from 'lucide-react';

interface KepengurusanProps {
  organization: KepengurusanPeriode;
  members: Anggota[];
  onSelectMember: (m: Anggota) => void;
}

export const KepengurusanPage: React.FC<KepengurusanProps> = ({
  organization,
  members,
  onSelectMember,
}) => {
  const memberMap = new Map(members.map((m) => [m.id, m]));

  return (
    <div className="space-y-5 pb-20 sm:pb-8">
      {/* Header */}
      <div className="p-5 sm:p-6 rounded-2xl bg-[#FFFFFF] border border-[#E9E4D8] shadow-2xs space-y-1">
        <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#2F6B4F]/10 text-[#2F6B4F] font-bold">
          Periode Aktif
        </span>
        <h2 className="text-xl sm:text-2xl font-bold font-heading text-[#2B2B26]">
          Susunan Pengurus ({organization.periode})
        </h2>
        <p className="text-xs sm:text-sm text-[#6B685B] font-medium">
          Rukun Family Paguyuban Keluarga Besar Bani Marhaban
        </p>
      </div>

      {/* Structure Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {organization.susunan.map((item) => {
          const member = memberMap.get(item.anggotaId);

          return (
            <div
              key={item.urutan}
              onClick={() => member && onSelectMember(member)}
              className="p-4 rounded-xl bg-[#FFFFFF] border border-[#E9E4D8] hover:border-[#2F6B4F] shadow-2xs hover:shadow-xs transition cursor-pointer flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-[#FAF5EA] border border-[#E9E4D8] flex items-center justify-center text-[#2F6B4F] shrink-0">
                  <Award className="w-5 h-5 text-[#C9A24B]" />
                </div>
                <div>
                  <span className="text-xs font-bold text-[#6B685B] block">
                    {item.jabatan}
                  </span>
                  <h4 className="font-heading font-bold text-base text-[#2B2B26]">
                    {item.anggotaNama}
                  </h4>
                  {member && (
                    <p className="text-xs text-[#2F6B4F] font-semibold mt-0.5">
                      {member.cabang}
                    </p>
                  )}
                </div>
              </div>

              <ChevronRight className="w-4 h-4 text-[#6B685B] shrink-0" />
            </div>
          );
        })}
      </div>

      {/* Riwayat Periode Sebelumnya */}
      <div className="p-5 rounded-2xl bg-[#FFFFFF] border border-[#E9E4D8] shadow-2xs space-y-3">
        <h3 className="font-heading font-bold text-base text-[#2F6B4F]">
          Riwayat Kepengurusan Sebelumnya
        </h3>
        <div className="space-y-2 text-xs text-[#6B685B]">
          <div className="p-3 rounded-xl bg-[#FAF5EA]/50 border border-[#E9E4D8] flex justify-between">
            <span className="font-bold text-[#2B2B26]">Periode 2018 - 2023</span>
            <span>Ketua: H. Mansyur Marhaban</span>
          </div>
          <div className="p-3 rounded-xl bg-[#FAF5EA]/50 border border-[#E9E4D8] flex justify-between">
            <span className="font-bold text-[#2B2B26]">Periode 2013 - 2018</span>
            <span>Ketua: H. Abdullah Marhaban</span>
          </div>
        </div>
      </div>
    </div>
  );
};
