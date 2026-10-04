import React, { useState } from 'react';
import { Usulan, Anggota } from '../types';
import { useAuth } from '../context/AuthContext';
import { StorageManager } from '../lib/storage';
import { Modal } from '../components/Modal';
import {
  ShieldCheck,
  Check,
  X,
  Clock,
  ArrowRight,
  User,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

interface VerifikasiProps {
  proposals: Usulan[];
  members: Anggota[];
}

export const Verifikasi: React.FC<VerifikasiProps> = ({ proposals, members }) => {
  const { roleLabel } = useAuth();
  const [filterStatus, setFilterStatus] = useState<string>('Menunggu');
  const [filterType, setFilterType] = useState<string>('Semua');

  // Rejection modal state
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectingProposal, setRejectingProposal] = useState<Usulan | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectError, setRejectError] = useState('');

  // Notification
  const [notification, setNotification] = useState('');

  const memberMap = new Map(members.map((m) => [m.id, m]));

  const filteredProposals = proposals.filter((p) => {
    if (filterStatus !== 'Semua' && p.status !== filterStatus) return false;
    if (filterType !== 'Semua' && p.jenis !== filterType) return false;
    return true;
  });

  const handleApprove = (p: Usulan) => {
    StorageManager.approveProposal(p.id, roleLabel);
    setNotification('Usulan berhasil disetujui');
    setTimeout(() => setNotification(''), 3000);
  };

  const handleOpenReject = (p: Usulan) => {
    setRejectingProposal(p);
    setRejectReason('');
    setRejectError('');
    setRejectModalOpen(true);
  };

  const handleConfirmReject = () => {
    if (!rejectReason.trim()) {
      setRejectError('Alasan penolakan wajib diisi');
      return;
    }
    if (!rejectingProposal) return;

    StorageManager.rejectProposal(rejectingProposal.id, rejectReason.trim(), roleLabel);
    setRejectModalOpen(false);
    setNotification('Usulan ditolak');
    setTimeout(() => setNotification(''), 3000);
  };

  return (
    <div className="space-y-4 pb-20 sm:pb-8">
      {/* Header & Filters */}
      <div className="p-4 rounded-2xl bg-[#FFFFFF] border border-[#E9E4D8] shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold font-heading text-[#2F6B4F]">
              Antrean Verifikasi
            </h2>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-[#E9E4D8] bg-[#FAF5EA]/50 text-xs sm:text-sm font-semibold text-[#2B2B26]"
            >
              <option value="Semua">Semua Status</option>
              <option value="Menunggu">Menunggu</option>
              <option value="Disetujui">Disetujui</option>
              <option value="Ditolak">Ditolak</option>
            </select>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-[#E9E4D8] bg-[#FAF5EA]/50 text-xs sm:text-sm font-semibold text-[#2B2B26]"
            >
              <option value="Semua">Semua Jenis</option>
              <option value="Koreksi Data">Koreksi Data</option>
              <option value="Tambah Anggota">Tambah Anggota</option>
              <option value="Konfirmasi Data">Konfirmasi Data</option>
              <option value="Tambah Cerita atau Informasi">Tambah Cerita atau Informasi</option>
            </select>
          </div>
        </div>
      </div>

      {notification && (
        <div className="p-3.5 rounded-xl bg-[#2F6B4F] text-[#FAF5EA] text-sm font-bold flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="w-5 h-5 text-[#C9A24B]" />
          <span>{notification}</span>
        </div>
      )}

      {/* Queue List */}
      <div className="space-y-4">
        {filteredProposals.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-[#FFFFFF] border border-[#E9E4D8]">
            <h3 className="text-base font-bold text-[#6B685B]">Belum ada data</h3>
          </div>
        ) : (
          filteredProposals.map((prop) => {
            const currentMember = prop.anggotaId ? memberMap.get(prop.anggotaId) : null;

            return (
              <div
                key={prop.id}
                className="p-5 rounded-2xl bg-[#FFFFFF] border border-[#E9E4D8] shadow-2xs space-y-4"
              >
                {/* Meta header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E9E4D8]/60 pb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs px-2.5 py-1 rounded-md bg-[#2F6B4F]/10 text-[#2F6B4F] font-bold">
                      {prop.jenis}
                    </span>
                    <span className="text-sm font-bold text-[#2B2B26]">
                      Pengusul: {prop.namaPengusul}
                    </span>
                    {prop.kontakPengusul && (
                      <span className="text-xs text-[#6B685B]">
                        ({prop.kontakPengusul})
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                        prop.status === 'Disetujui'
                          ? 'bg-[#2F6B4F]/10 text-[#2F6B4F]'
                          : prop.status === 'Ditolak'
                          ? 'bg-[#B3402F]/10 text-[#B3402F]'
                          : 'bg-[#D9822B]/10 text-[#D9822B]'
                      }`}
                    >
                      {prop.status}
                    </span>
                    <span className="text-xs text-[#6B685B] font-medium">
                      {prop.tanggal}
                    </span>
                  </div>
                </div>

                {/* Diff Viewer if Koreksi Data */}
                {prop.jenis === 'Koreksi Data' && currentMember && prop.dataUsulan ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-xl bg-[#FAF5EA]/50 border border-[#E9E4D8] text-sm">
                    <div className="space-y-1">
                      <span className="text-xs font-bold text-[#6B685B] uppercase tracking-wider block">
                        Nilai Saat Ini
                      </span>
                      <p className="font-bold text-[#2B2B26]">{currentMember.nama}</p>
                      <p className="text-xs text-[#6B685B]">
                        Lahir: {currentMember.tahunLahir || '-'} • Usia: {currentMember.usia || '-'} th
                      </p>
                      <p className="text-xs text-[#6B685B]">
                        Domisili: {currentMember.domisili || '-'}
                      </p>
                    </div>

                    <div className="space-y-1 sm:border-l sm:border-[#E9E4D8] sm:pl-3">
                      <span className="text-xs font-bold text-[#2F6B4F] uppercase tracking-wider block">
                        Nilai Usulan
                      </span>
                      <p className="font-bold text-[#2F6B4F]">
                        {prop.dataUsulan.nama || currentMember.nama}
                      </p>
                      <p className="text-xs text-[#2F6B4F]">
                        Lahir: {prop.dataUsulan.tahunLahir || currentMember.tahunLahir || '-'} • Usia: {prop.dataUsulan.usia || currentMember.usia || '-'} th
                      </p>
                      <p className="text-xs text-[#2F6B4F]">
                        Domisili: {prop.dataUsulan.domisili || currentMember.domisili || '-'}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="p-3.5 rounded-xl bg-[#FAF5EA]/50 border border-[#E9E4D8] text-sm space-y-1">
                    <span className="text-xs font-bold text-[#6B685B] uppercase tracking-wider block">
                      Rincian Usulan
                    </span>
                    <p className="text-[#2B2B26] font-medium leading-relaxed">
                      {prop.isiUsulan}
                    </p>
                  </div>
                )}

                {/* Sesepuh Confirmation */}
                {prop.konfirmasiSesepuh && prop.konfirmasiSesepuh.length > 0 && (
                  <div className="p-3 rounded-xl bg-[#FFF9E6] border border-[#C9A24B]/40 space-y-1 text-xs">
                    <span className="font-bold text-[#9E7A24] uppercase tracking-wider block">
                      Konfirmasi Sesepuh:
                    </span>
                    {prop.konfirmasiSesepuh.map((ks, i) => (
                      <p key={i} className="text-[#2B2B26]">
                        <strong>{ks.sesepuhNama}</strong> ({ks.tanggal}): {ks.catatan}
                      </p>
                    ))}
                  </div>
                )}

                {/* Action buttons if status is Menunggu */}
                {prop.status === 'Menunggu' && (
                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => handleOpenReject(prop)}
                      className="px-4 py-2 rounded-xl border border-[#B3402F] text-[#B3402F] hover:bg-[#B3402F]/10 font-bold text-sm transition"
                    >
                      Tolak
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApprove(prop)}
                      className="px-5 py-2 rounded-xl bg-[#2F6B4F] text-[#FAF5EA] hover:bg-[#1E4734] font-bold text-sm transition shadow-xs flex items-center gap-1.5"
                    >
                      <Check className="w-4 h-4" />
                      <span>Setujui</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Reject Reason Dialog (strictly brief per specification: title, field, 2 buttons) */}
      <Modal
        isOpen={rejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        title="Alasan Penolakan"
        footer={
          <div className="flex items-center justify-end gap-2 w-full">
            <button
              type="button"
              onClick={() => setRejectModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-[#E9E4D8] text-sm font-semibold"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleConfirmReject}
              className="px-4 py-2 rounded-xl bg-[#B3402F] text-white text-sm font-bold"
            >
              Tolak Usulan
            </button>
          </div>
        }
      >
        <div className="space-y-2">
          <label className="text-xs font-bold text-[#6B685B] block">
            Alasan <span className="text-[#B3402F]">*</span>
          </label>
          <textarea
            value={rejectReason}
            onChange={(e) => {
              setRejectReason(e.target.value);
              setRejectError('');
            }}
            rows={3}
            className="w-full px-3 py-2 rounded-xl border border-[#E9E4D8] text-sm text-[#2B2B26] focus:outline-hidden focus:border-[#B3402F]"
          />
          {rejectError && (
            <p className="text-xs text-[#B3402F] font-semibold">{rejectError}</p>
          )}
        </div>
      </Modal>
    </div>
  );
};
