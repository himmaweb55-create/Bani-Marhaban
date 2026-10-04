import React, { useState } from 'react';
import { KhotmilPeriode, KhotmilJuz, Anggota } from '../types';
import { StorageManager } from '../lib/storage';
import { Modal } from '../components/Modal';
import {
  BookOpen,
  CheckCircle2,
  Calendar,
  Edit2,
  Check,
  X,
  Plus,
} from 'lucide-react';

interface KelolaKhotmilProps {
  period: KhotmilPeriode;
  juzList: KhotmilJuz[];
  members: Anggota[];
}

export const KelolaKhotmil: React.FC<KelolaKhotmilProps> = ({
  period,
  juzList,
  members,
}) => {
  // Modal for editing assignment
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedJuz, setSelectedJuz] = useState<KhotmilJuz | null>(null);
  const [assignedMemberId, setAssignedMemberId] = useState('');
  const [notification, setNotification] = useState('');

  // Modal for creating new period
  const [newPeriodModalOpen, setNewPeriodModalOpen] = useState(false);
  const [newPeriodName, setNewPeriodName] = useState('');
  const [newPeriodDate, setNewPeriodDate] = useState(new Date().toISOString().split('T')[0]);

  const activeMembers = members.filter((m) => !m.diarsipkan);

  const handleToggleKholas = (juz: KhotmilJuz) => {
    const newStatus = juz.status === 'Kholas' ? 'Belum' : 'Kholas';
    const dateStr = newStatus === 'Kholas' ? new Date().toISOString().split('T')[0] : undefined;
    StorageManager.updateKhotmilJuz(juz.id, newStatus, dateStr);
    setNotification(`Juz ${juz.juzNomor} ditandai ${newStatus}`);
    setTimeout(() => setNotification(''), 2500);
  };

  const handleOpenAssignModal = (juz: KhotmilJuz) => {
    setSelectedJuz(juz);
    setAssignedMemberId(juz.anggotaId || '');
    setAssignModalOpen(true);
  };

  const handleSaveAssignment = () => {
    if (!selectedJuz) return;
    const member = members.find((m) => m.id === assignedMemberId);

    const updated = juzList.map((j) => {
      if (j.id === selectedJuz.id) {
        return {
          ...j,
          anggotaId: member?.id || undefined,
          anggotaNama: member?.nama || undefined,
        };
      }
      return j;
    });

    StorageManager.saveKhotmilJuzList(updated);
    setAssignModalOpen(false);
    setNotification(`Pembagian Juz ${selectedJuz.juzNomor} diperbarui`);
    setTimeout(() => setNotification(''), 2500);
  };

  const handleCreateNewPeriod = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPeriodName.trim()) return;

    // Archive current period
    const current = { ...period, status: 'Selesai' as const, tanggalSelesai: new Date().toISOString().split('T')[0] };

    // New period
    const newPeriod: KhotmilPeriode = {
      id: `kp-${Date.now()}`,
      nama: newPeriodName.trim(),
      tanggalMulai: newPeriodDate,
      status: 'Aktif',
    };

    // Reset 30 juz
    const freshJuz: KhotmilJuz[] = Array.from({ length: 30 }).map((_, i) => ({
      id: `kj-${i + 1}`,
      periodeId: newPeriod.id,
      juzNomor: i + 1,
      status: 'Belum',
    }));

    StorageManager.saveKhotmilPeriod(newPeriod);
    StorageManager.saveKhotmilJuzList(freshJuz);

    setNewPeriodModalOpen(false);
    setNotification('Periode Khotmil baru dimulai');
    setTimeout(() => setNotification(''), 3000);
  };

  return (
    <div className="space-y-4 pb-20 sm:pb-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-2xl bg-[#FFFFFF] border border-[#E9E4D8] shadow-2xs">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold font-heading text-[#2F6B4F]">
            Kelola Khotmil Qur'an
          </h2>
          <p className="text-xs text-[#6B685B] font-semibold mt-0.5">
            {period.nama}
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setNewPeriodName(`Khotmil Qur'an Putaran Ke-${Date.now().toString().slice(-2)}`);
            setNewPeriodModalOpen(true);
          }}
          className="px-4 py-2 rounded-xl bg-[#2F6B4F] text-[#FAF5EA] hover:bg-[#1E4734] font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Buat Periode Baru</span>
        </button>
      </div>

      {notification && (
        <div className="p-3.5 rounded-xl bg-[#2F6B4F] text-[#FAF5EA] text-sm font-bold flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="w-5 h-5 text-[#C9A24B]" />
          <span>{notification}</span>
        </div>
      )}

      {/* 30 Juz Management Table / Cards */}
      <div className="space-y-2.5">
        {juzList.map((juz) => {
          const isKholas = juz.status === 'Kholas';
          return (
            <div
              key={juz.id}
              className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition shadow-2xs ${
                isKholas
                  ? 'bg-[#2F6B4F]/5 border-[#2F6B4F]/30'
                  : 'bg-[#FFFFFF] border-[#E9E4D8]'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-[#FAF5EA] border border-[#E9E4D8] flex items-center justify-center font-bold text-xs text-[#2F6B4F]">
                  {juz.juzNomor}
                </span>

                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-sm text-[#2B2B26]">
                      {juz.anggotaNama || 'Belum Dibagi'}
                    </h4>
                    {!juz.anggotaNama && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-[#D9822B]/10 text-[#D9822B] font-bold">
                        Perlu Dibagi
                      </span>
                    )}
                  </div>
                  {isKholas && juz.tanggalLapor && (
                    <p className="text-[11px] text-[#2F6B4F] font-semibold">
                      Kholas ({juz.tanggalLapor})
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                <button
                  type="button"
                  onClick={() => handleOpenAssignModal(juz)}
                  className="px-3 py-1.5 rounded-lg border border-[#E9E4D8] hover:border-[#2F6B4F] text-xs font-bold text-[#2B2B26] flex items-center gap-1"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Ubah Pemegang</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleToggleKholas(juz)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                    isKholas
                      ? 'bg-[#2F6B4F] text-[#FAF5EA] hover:bg-[#1E4734]'
                      : 'border border-[#6B685B] text-[#2B2B26] hover:bg-[#FAF5EA]'
                  }`}
                >
                  {isKholas ? <Check className="w-3.5 h-3.5" /> : null}
                  <span>{isKholas ? 'Kholas' : 'Tandai Kholas'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Assignment Modal */}
      <Modal
        isOpen={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        title={`Pembagian Juz ${selectedJuz?.juzNomor || ''}`}
        footer={
          <div className="flex items-center justify-end gap-2 w-full">
            <button
              type="button"
              onClick={() => setAssignModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-[#E9E4D8] text-sm font-semibold"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleSaveAssignment}
              className="px-5 py-2 rounded-xl bg-[#2F6B4F] text-[#FAF5EA] font-bold text-sm"
            >
              Simpan
            </button>
          </div>
        }
      >
        <div className="space-y-3">
          <label className="text-xs font-bold text-[#6B685B] block">
            Pilih Anggota Keluarga
          </label>
          <select
            value={assignedMemberId}
            onChange={(e) => setAssignedMemberId(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border border-[#E9E4D8] text-sm font-semibold"
          >
            <option value="">Belum Dibagi</option>
            {activeMembers.map((m) => (
              <option key={m.id} value={m.id}>
                {m.nama} ({m.cabang})
              </option>
            ))}
          </select>
        </div>
      </Modal>

      {/* New Period Modal */}
      <Modal
        isOpen={newPeriodModalOpen}
        onClose={() => setNewPeriodModalOpen(false)}
        title="Buat Periode Baru"
        footer={
          <div className="flex items-center justify-end gap-2 w-full">
            <button
              type="button"
              onClick={() => setNewPeriodModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-[#E9E4D8] text-sm font-semibold"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleCreateNewPeriod}
              className="px-5 py-2 rounded-xl bg-[#2F6B4F] text-[#FAF5EA] font-bold text-sm"
            >
              Mulai Periode
            </button>
          </div>
        }
      >
        <form onSubmit={handleCreateNewPeriod} className="space-y-3 text-sm">
          <div className="space-y-1">
            <label className="text-xs font-bold text-[#2B2B26] block">
              Nama Periode <span className="text-[#B3402F]">*</span>
            </label>
            <input
              type="text"
              value={newPeriodName}
              onChange={(e) => setNewPeriodName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-[#E9E4D8]"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-[#2B2B26] block">
              Tanggal Mulai
            </label>
            <input
              type="date"
              value={newPeriodDate}
              onChange={(e) => setNewPeriodDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-[#E9E4D8]"
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};
