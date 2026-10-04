import React from 'react';
import {
  ArisanPeriode,
  ArisanPeserta,
  ArisanPutaran,
  ArisanPembayaran,
} from '../types';
import { useAuth } from '../context/AuthContext';
import {
  CircleDollarSign,
  Calendar,
  MapPin,
  Video,
  Award,
  ExternalLink,
  Users,
} from 'lucide-react';

interface ArisanProps {
  period: ArisanPeriode;
  participants: ArisanPeserta[];
  rounds: ArisanPutaran[];
  payments: ArisanPembayaran[];
  onNavigateToManage?: () => void;
}

export const ArisanPage: React.FC<ArisanProps> = ({
  period,
  participants,
  rounds,
  payments,
  onNavigateToManage,
}) => {
  const { canManageArisan, canSeeArisanPayments } = useAuth();

  const completedRounds = rounds.length;
  const remainingRounds = Math.max(period.jumlahPutaran - completedRounds, 0);

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="space-y-5 pb-20 sm:pb-8">
      {/* Header and Period Information */}
      <div className="p-5 sm:p-6 rounded-2xl bg-[#FFFFFF] border border-[#E9E4D8] shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E9E4D8]/60 pb-4">
          <div className="space-y-1">
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#2F6B4F]/10 text-[#2F6B4F] font-bold">
              {period.status}
            </span>
            <h2 className="text-xl sm:text-2xl font-bold font-heading text-[#2B2B26]">
              {period.nama}
            </h2>
          </div>

          {canManageArisan && onNavigateToManage && (
            <button
              type="button"
              onClick={onNavigateToManage}
              className="px-4 py-2 rounded-xl bg-[#2F6B4F] text-[#FAF5EA] hover:bg-[#1E4734] transition font-bold text-sm shadow-xs self-start sm:self-auto"
            >
              Kelola Arisan
            </button>
          )}
        </div>

        {/* Recap Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
          <div className="p-3.5 rounded-xl bg-[#FAF5EA]/50 border border-[#E9E4D8]">
            <span className="text-xs text-[#6B685B] block font-semibold">Iuran per Putaran</span>
            <span className="font-bold text-base text-[#2F6B4F]">
              {formatRupiah(period.nominalIuran)}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-[#FAF5EA]/50 border border-[#E9E4D8]">
            <span className="text-xs text-[#6B685B] block font-semibold">Jumlah Peserta</span>
            <span className="font-bold text-base text-[#2B2B26]">
              {participants.length} Orang
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-[#FAF5EA]/50 border border-[#E9E4D8]">
            <span className="text-xs text-[#6B685B] block font-semibold">Putaran Selesai</span>
            <span className="font-bold text-base text-[#C9A24B]">
              {completedRounds} dari {period.jumlahPutaran}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-[#FAF5EA]/50 border border-[#E9E4D8]">
            <span className="text-xs text-[#6B685B] block font-semibold">Sisa Putaran</span>
            <span className="font-bold text-base text-[#2B2B26]">
              {remainingRounds} Putaran
            </span>
          </div>
        </div>

        {/* Meeting Venue & Schedule */}
        {(period.jadwalPertemuan || period.lokasiPertemuan) && (
          <div className="p-3.5 rounded-xl bg-[#FAF5EA] border border-[#E9E4D8] flex flex-col sm:flex-row gap-3 text-xs text-[#2B2B26]">
            {period.jadwalPertemuan && (
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#C9A24B] shrink-0" />
                <span>{period.jadwalPertemuan}</span>
              </div>
            )}
            {period.lokasiPertemuan && (
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#C9A24B] shrink-0" />
                <span>{period.lokasiPertemuan}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Rounds Archive / Story of Each Round */}
      <div className="space-y-3">
        <h3 className="font-heading font-bold text-lg text-[#2F6B4F]">
          Riwayat Putaran dan Penerima
        </h3>

        {rounds.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-[#FFFFFF] border border-[#E9E4D8]">
            <h4 className="text-base font-bold text-[#6B685B]">Belum ada data</h4>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {rounds.map((round) => (
              <div
                key={round.id}
                className="p-5 rounded-2xl bg-[#FFFFFF] border border-[#E9E4D8] shadow-2xs space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#C9A24B]/15 text-[#9E7A24] font-bold">
                      Putaran Ke-{round.putaranKe}
                    </span>
                    <span className="text-xs text-[#6B685B] font-medium">
                      {round.tanggalUndian}
                    </span>
                  </div>

                  <div className="flex items-start gap-3 pt-1">
                    <div className="w-10 h-10 rounded-full bg-[#2F6B4F]/10 flex items-center justify-center text-[#2F6B4F] shrink-0">
                      <Award className="w-5 h-5 text-[#C9A24B]" />
                    </div>
                    <div>
                      <span className="text-xs text-[#6B685B] font-semibold">Penerima:</span>
                      <h4 className="font-heading font-bold text-base text-[#2B2B26]">
                        {round.penerimaNama}
                      </h4>
                    </div>
                  </div>

                  {round.catatan && (
                    <p className="text-xs text-[#6B685B] leading-relaxed pt-1">
                      {round.catatan}
                    </p>
                  )}
                </div>

                {round.tautanVideo && (
                  <div className="pt-2 border-t border-[#E9E4D8]/60">
                    <a
                      href={round.tautanVideo}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-[#2F6B4F] hover:underline"
                    >
                      <Video className="w-4 h-4" />
                      <span>Video Pengundian</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Participants List */}
      <div className="p-5 rounded-2xl bg-[#FFFFFF] border border-[#E9E4D8] shadow-2xs space-y-3">
        <h3 className="font-heading font-bold text-lg text-[#2F6B4F]">
          Daftar Peserta
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {participants.map((p) => (
            <div
              key={p.id}
              className="p-3 rounded-xl border border-[#E9E4D8] bg-[#FAF5EA]/30 flex items-center justify-between text-xs"
            >
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#FAF5EA] border border-[#E9E4D8] flex items-center justify-center font-bold text-[#6B685B]">
                  {p.nomorUndian}
                </span>
                <span className="font-bold text-[#2B2B26] truncate max-w-[150px]">
                  {p.nama}
                </span>
              </div>
              <span
                className={`px-2 py-0.5 rounded-md font-bold ${
                  p.sudahDapat
                    ? 'bg-[#2F6B4F]/10 text-[#2F6B4F]'
                    : 'bg-[#6B685B]/10 text-[#6B685B]'
                }`}
              >
                {p.sudahDapat ? `Putaran ${p.putaranDapat}` : 'Belum'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
