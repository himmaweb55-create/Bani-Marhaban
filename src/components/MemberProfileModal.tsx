import React from 'react';
import { Anggota } from '../types';
import { Modal } from './Modal';
import { getKinshipTitle } from '../lib/kinship';
import { useAuth } from '../context/AuthContext';
import { User, Heart, Compass, Calendar, MapPin, FileText, CheckCircle2, AlertCircle, Clock } from 'lucide-react';

interface MemberProfileModalProps {
  member: Anggota | null;
  allMembers: Anggota[];
  isOpen: boolean;
  onClose: () => void;
  onSelectMember: (m: Anggota) => void;
  onProposeChange: (m: Anggota) => void;
  onViewPath?: (targetId: string) => void;
}

export const MemberProfileModal: React.FC<MemberProfileModalProps> = ({
  member,
  allMembers,
  isOpen,
  onClose,
  onSelectMember,
  onProposeChange,
  onViewPath,
}) => {
  const { myMemberId } = useAuth();

  if (!member) return null;

  const memberMap = new Map<string, Anggota>(allMembers.map((m) => [m.id, m]));

  const ayah = member.ayahId ? memberMap.get(member.ayahId) : null;
  const ibu = member.ibuId ? memberMap.get(member.ibuId) : null;
  const pasanganList = (member.pasanganIds || [])
    .map((id) => memberMap.get(id))
    .filter(Boolean) as Anggota[];

  const anakList = allMembers.filter(
    (m) => m.ayahId === member.id || m.ibuId === member.id
  );

  const saudaraList = allMembers.filter(
    (m) =>
      m.id !== member.id &&
      ((member.ayahId && m.ayahId === member.ayahId) ||
        (member.ibuId && m.ibuId === member.ibuId))
  );

  const kinshipRelation = myMemberId ? getKinshipTitle(myMemberId, member.id, allMembers) : null;

  const isDeceased = member.statusHidup === 'wafat';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Profil Anggota"
      maxWidth="lg"
      footer={
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            {myMemberId && onViewPath && myMemberId !== member.id && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onViewPath(member.id);
                }}
                className="px-3.5 py-2 rounded-xl bg-[#C9A24B]/15 text-[#9E7A24] hover:bg-[#C9A24B]/25 transition font-semibold text-sm flex items-center gap-1.5"
              >
                <Compass className="w-4 h-4" />
                <span>Lihat Jalur Hubungan</span>
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={() => {
              onClose();
              onProposeChange(member);
            }}
            className="px-4 py-2 rounded-xl bg-[#2F6B4F] text-[#FAF5EA] hover:bg-[#1E4734] transition font-semibold text-sm shadow-xs"
          >
            Usulkan Perubahan
          </button>
        </div>
      }
    >
      <div className="space-y-5">
        {/* Header Profile Card */}
        <div
          className={`p-4 rounded-xl flex items-center gap-4 ${
            isDeceased
              ? 'bg-[#FAF5EA] border-2 border-[#C9A24B]/50'
              : 'bg-[#FAF5EA] border border-[#E9E4D8]'
          }`}
        >
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-[#2F6B4F]/10 flex items-center justify-center text-[#2F6B4F] border border-[#2F6B4F]/20 shrink-0">
              <User className="w-8 h-8" />
            </div>
            {isDeceased && (
              <span className="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-full bg-[#C9A24B] text-[10px] font-bold text-[#FFFFFF]">
                Alm
              </span>
            )}
          </div>

          <div className="grow min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-xl font-bold font-heading text-[#2B2B26] truncate">
                {member.nama}
              </h3>
              <span
                className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                  member.statusVerifikasi === 'Terverifikasi'
                    ? 'bg-[#2F6B4F]/10 text-[#2F6B4F]'
                    : member.statusVerifikasi === 'Perlu Konfirmasi'
                    ? 'bg-[#D9822B]/10 text-[#D9822B]'
                    : 'bg-[#286090]/10 text-[#286090]'
                }`}
              >
                {member.statusVerifikasi}
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs text-[#6B685B] mt-1 flex-wrap font-medium">
              <span>{member.kodeSilsilah}</span>
              <span>•</span>
              <span>{member.nomorAnggota}</span>
              <span>•</span>
              <span>Generasi {member.generasi}</span>
              <span>•</span>
              <span>{member.cabang}</span>
            </div>

            {kinshipRelation && (
              <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#C9A24B]/20 text-[#2B2B26] text-xs font-bold">
                <Heart className="w-3.5 h-3.5 text-[#C9A24B] fill-[#C9A24B]" />
                <span>Hubungan: {kinshipRelation}</span>
              </div>
            )}
          </div>
        </div>

        {/* Data Grid */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="p-3 rounded-xl bg-[#FAF5EA]/50 border border-[#E9E4D8]">
            <span className="text-xs text-[#6B685B] block font-semibold">Jenis Kelamin</span>
            <span className="font-semibold text-[#2B2B26]">
              {member.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan'}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-[#FAF5EA]/50 border border-[#E9E4D8]">
            <span className="text-xs text-[#6B685B] block font-semibold">Status Hidup</span>
            <span className="font-semibold text-[#2B2B26]">
              {isDeceased
                ? `Wafat ${member.tanggalWafat ? `(${member.tanggalWafat})` : ''}`
                : `Hidup ${member.usia ? `(${member.usia} tahun)` : ''}`}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-[#FAF5EA]/50 border border-[#E9E4D8]">
            <span className="text-xs text-[#6B685B] block font-semibold">Tahun Lahir</span>
            <span className="font-semibold text-[#2B2B26]">
              {member.tahunLahir || 'Belum diketahui'}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-[#FAF5EA]/50 border border-[#E9E4D8]">
            <span className="text-xs text-[#6B685B] block font-semibold">Domisili</span>
            <span className="font-semibold text-[#2B2B26] truncate block">
              {member.domisili || 'Belum diketahui'}
            </span>
          </div>
        </div>

        {/* Relatives: Parents & Spouses */}
        <div className="space-y-3">
          <h4 className="text-sm font-bold text-[#2B2B26] uppercase tracking-wider">
            Hubungan Keluarga
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
            <div className="p-3 rounded-xl border border-[#E9E4D8] bg-[#FFFFFF]">
              <span className="text-xs text-[#6B685B] block font-semibold">Ayah</span>
              {ayah ? (
                <button
                  type="button"
                  onClick={() => onSelectMember(ayah)}
                  className="font-bold text-[#2F6B4F] hover:underline text-left block"
                >
                  {ayah.nama}
                </button>
              ) : (
                <span className="text-[#6B685B]">Belum diketahui</span>
              )}
            </div>

            <div className="p-3 rounded-xl border border-[#E9E4D8] bg-[#FFFFFF]">
              <span className="text-xs text-[#6B685B] block font-semibold">Ibu</span>
              {ibu ? (
                <button
                  type="button"
                  onClick={() => onSelectMember(ibu)}
                  className="font-bold text-[#2F6B4F] hover:underline text-left block"
                >
                  {ibu.nama}
                </button>
              ) : (
                <span className="text-[#6B685B]">Belum diketahui</span>
              )}
            </div>
          </div>

          {/* Pasangan */}
          <div className="p-3 rounded-xl border border-[#E9E4D8] bg-[#FFFFFF]">
            <span className="text-xs text-[#6B685B] block font-semibold mb-1">Pasangan</span>
            {pasanganList.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {pasanganList.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => onSelectMember(p)}
                    className="px-2.5 py-1 rounded-lg bg-[#FAF5EA] border border-[#E9E4D8] font-bold text-[#2F6B4F] hover:bg-[#2F6B4F]/10 text-xs"
                  >
                    {p.nama}
                  </button>
                ))}
              </div>
            ) : (
              <span className="text-sm text-[#6B685B]">Belum diketahui</span>
            )}
          </div>

          {/* Anak */}
          <div className="p-3 rounded-xl border border-[#E9E4D8] bg-[#FFFFFF]">
            <span className="text-xs text-[#6B685B] block font-semibold mb-1">
              Anak ({anakList.length})
            </span>
            {anakList.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {anakList.map((a) => (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => onSelectMember(a)}
                    className="px-2.5 py-1 rounded-lg bg-[#FAF5EA] border border-[#E9E4D8] font-semibold text-[#2F6B4F] hover:bg-[#2F6B4F]/10 text-xs"
                  >
                    {a.nama}
                  </button>
                ))}
              </div>
            ) : (
              <span className="text-sm text-[#6B685B]">Belum diketahui</span>
            )}
          </div>

          {/* Saudara Kandung */}
          <div className="p-3 rounded-xl border border-[#E9E4D8] bg-[#FFFFFF]">
            <span className="text-xs text-[#6B685B] block font-semibold mb-1">
              Saudara ({saudaraList.length})
            </span>
            {saudaraList.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {saudaraList.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => onSelectMember(s)}
                    className="px-2.5 py-1 rounded-lg bg-[#FAF5EA] border border-[#E9E4D8] font-semibold text-[#2F6B4F] hover:bg-[#2F6B4F]/10 text-xs"
                  >
                    {s.nama}
                  </button>
                ))}
              </div>
            ) : (
              <span className="text-sm text-[#6B685B]">Belum diketahui</span>
            )}
          </div>
        </div>

        {/* Catatan & Sumber */}
        {(member.catatan || member.sumber) && (
          <div className="p-3.5 rounded-xl bg-[#FAF5EA] border border-[#E9E4D8] space-y-2 text-sm">
            {member.catatan && (
              <div>
                <span className="text-xs text-[#6B685B] block font-semibold">Catatan</span>
                <p className="text-[#2B2B26] font-medium">{member.catatan}</p>
              </div>
            )}
            {member.sumber && (
              <div>
                <span className="text-xs text-[#6B685B] block font-semibold">Sumber Informasi</span>
                <p className="text-[#6B685B] text-xs">{member.sumber}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
};
