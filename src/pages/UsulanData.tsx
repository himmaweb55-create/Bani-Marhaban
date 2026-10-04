import React, { useState } from 'react';
import { Anggota, Usulan } from '../types';
import { useAuth } from '../context/AuthContext';
import { StorageManager } from '../lib/storage';
import { Modal } from '../components/Modal';
import {
  FileText,
  Plus,
  Clock,
  CheckCircle2,
  XCircle,
  Search,
  MessageSquare,
  Check,
} from 'lucide-react';

interface UsulanDataProps {
  proposals: Usulan[];
  members: Anggota[];
  initialSelectedMember?: Anggota | null;
  onClearInitialMember?: () => void;
}

export const UsulanData: React.FC<UsulanDataProps> = ({
  proposals,
  members,
  initialSelectedMember,
  onClearInitialMember,
}) => {
  const { role, canConfirmProposal } = useAuth();

  const [activeTab, setActiveTab] = useState<'daftar' | 'buat'>('daftar');
  const [jenis, setJenis] = useState<
    'Koreksi Data' | 'Tambah Anggota' | 'Konfirmasi Data' | 'Tambah Cerita atau Informasi'
  >('Koreksi Data');
  const [selectedMemberId, setSelectedMemberId] = useState<string>(
    initialSelectedMember?.id || ''
  );
  const [memberSearch, setMemberSearch] = useState('');
  const [isiUsulan, setIsiUsulan] = useState('');
  const [namaPengusul, setNamaPengusul] = useState('');
  const [kontakPengusul, setKontakPengusul] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successNotification, setSuccessNotification] = useState('');

  // Sesepuh confirmation dialog state
  const [sesepuhConfirmModalOpen, setSesepuhConfirmModalOpen] = useState(false);
  const [confirmingProposal, setConfirmingProposal] = useState<Usulan | null>(null);
  const [sesepuhNama, setSesepuhNama] = useState('Sesepuh Keluarga');
  const [sesepuhCatatan, setSesepuhCatatan] = useState('');

  const activeMembers = members.filter((m) => !m.diarsipkan);

  const matchedMembers = memberSearch.trim()
    ? activeMembers.filter((m) =>
        m.nama.toLowerCase().includes(memberSearch.toLowerCase())
      )
    : [];

  const handleSelectMemberFromSearch = (m: Anggota) => {
    setSelectedMemberId(m.id);
    setMemberSearch(m.nama);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!isiUsulan.trim()) {
      setErrorMessage('Isi usulan wajib diisi');
      return;
    }
    if (!namaPengusul.trim()) {
      setErrorMessage('Nama pengusul wajib diisi');
      return;
    }

    const selectedMember = members.find((m) => m.id === selectedMemberId);

    const newProposal: Usulan = {
      id: `u-${Date.now()}`,
      jenis,
      anggotaId: selectedMemberId || undefined,
      anggotaNama: selectedMember?.nama,
      isiUsulan: isiUsulan.trim(),
      namaPengusul: namaPengusul.trim(),
      kontakPengusul: kontakPengusul.trim() || undefined,
      status: 'Menunggu',
      tanggal: new Date().toISOString().split('T')[0],
    };

    StorageManager.saveProposal(newProposal);

    // Reset form
    setIsiUsulan('');
    setNamaPengusul('');
    setKontakPengusul('');
    setSelectedMemberId('');
    setMemberSearch('');
    if (onClearInitialMember) onClearInitialMember();

    setSuccessNotification('Usulan berhasil dikirim');
    setActiveTab('daftar');

    setTimeout(() => {
      setSuccessNotification('');
    }, 4000);
  };

  const handleOpenSesepuhModal = (prop: Usulan) => {
    setConfirmingProposal(prop);
    setSesepuhCatatan('');
    setSesepuhConfirmModalOpen(true);
  };

  const handleSaveSesepuhConfirm = () => {
    if (!confirmingProposal) return;
    StorageManager.addSesepuhConfirmation(
      confirmingProposal.id,
      sesepuhNama.trim() || 'Sesepuh Keluarga',
      sesepuhCatatan.trim() || 'Dikonfirmasi oleh sesepuh'
    );
    setSesepuhConfirmModalOpen(false);
    setSuccessNotification('Konfirmasi sesepuh berhasil dicatat');
    setTimeout(() => {
      setSuccessNotification('');
    }, 3000);
  };

  return (
    <div className="space-y-4 pb-20 sm:pb-8">
      {/* Top Tab Bar */}
      <div className="flex items-center justify-between p-4 rounded-2xl bg-[#FFFFFF] border border-[#E9E4D8] shadow-2xs">
        <div className="inline-flex rounded-xl p-1 bg-[#FAF5EA] border border-[#E9E4D8]">
          <button
            type="button"
            onClick={() => setActiveTab('daftar')}
            className={`px-4 py-1.5 rounded-lg text-sm font-bold transition ${
              activeTab === 'daftar'
                ? 'bg-[#2F6B4F] text-[#FAF5EA] shadow-xs'
                : 'text-[#2B2B26] hover:text-[#2F6B4F]'
            }`}
          >
            Daftar Usulan ({proposals.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('buat')}
            className={`px-4 py-1.5 rounded-lg text-sm font-bold flex items-center gap-1.5 transition ${
              activeTab === 'buat'
                ? 'bg-[#2F6B4F] text-[#FAF5EA] shadow-xs'
                : 'text-[#2B2B26] hover:text-[#2F6B4F]'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>Kirim Usulan</span>
          </button>
        </div>
      </div>

      {/* Brief Success Notification */}
      {successNotification && (
        <div className="p-3.5 rounded-xl bg-[#2F6B4F] text-[#FAF5EA] text-sm font-bold flex items-center gap-2 shadow-xs animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-[#C9A24B]" />
          <span>{successNotification}</span>
        </div>
      )}

      {/* TAB 1: DAFTAR USULAN */}
      {activeTab === 'daftar' && (
        <div className="space-y-3">
          {proposals.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-[#FFFFFF] border border-[#E9E4D8]">
              <h3 className="text-base font-bold text-[#6B685B]">Belum ada data</h3>
            </div>
          ) : (
            proposals.map((prop) => {
              const statusColor =
                prop.status === 'Disetujui'
                  ? 'bg-[#2F6B4F]/10 text-[#2F6B4F] border-[#2F6B4F]/30'
                  : prop.status === 'Ditolak'
                  ? 'bg-[#B3402F]/10 text-[#B3402F] border-[#B3402F]/30'
                  : 'bg-[#D9822B]/10 text-[#D9822B] border-[#D9822B]/30';

              const StatusIcon =
                prop.status === 'Disetujui'
                  ? CheckCircle2
                  : prop.status === 'Ditolak'
                  ? XCircle
                  : Clock;

              return (
                <div
                  key={prop.id}
                  className="p-4 sm:p-5 rounded-2xl bg-[#FFFFFF] border border-[#E9E4D8] shadow-2xs space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E9E4D8]/60 pb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2.5 py-0.5 rounded-md bg-[#2F6B4F]/10 text-[#2F6B4F] font-bold">
                        {prop.jenis}
                      </span>
                      {prop.anggotaNama && (
                        <span className="text-xs font-bold text-[#2B2B26]">
                          • {prop.anggotaNama}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full font-bold border ${statusColor}`}
                      >
                        <StatusIcon className="w-3.5 h-3.5" />
                        <span>{prop.status}</span>
                      </span>
                      <span className="text-xs text-[#6B685B] font-medium">
                        {prop.tanggal}
                      </span>
                    </div>
                  </div>

                  <p className="text-sm sm:text-base text-[#2B2B26] leading-relaxed font-medium">
                    {prop.isiUsulan}
                  </p>

                  {/* Sesepuh Confirmation Notes if available */}
                  {prop.konfirmasiSesepuh && prop.konfirmasiSesepuh.length > 0 && (
                    <div className="p-3 rounded-xl bg-[#FAF5EA] border border-[#E9E4D8] space-y-1 text-xs">
                      <span className="font-bold text-[#C9A24B] uppercase tracking-wider block">
                        Konfirmasi Sesepuh:
                      </span>
                      {prop.konfirmasiSesepuh.map((ks, i) => (
                        <div key={i} className="text-[#2B2B26]">
                          <strong>{ks.sesepuhNama}</strong> ({ks.tanggal}): {ks.catatan}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Rejection Reason if rejected */}
                  {prop.status === 'Ditolak' && prop.alasanPenolakan && (
                    <div className="p-3 rounded-xl bg-[#B3402F]/10 border border-[#B3402F]/30 text-xs text-[#B3402F] space-y-0.5 font-medium">
                      <span className="font-bold block">Alasan Penolakan:</span>
                      <span>{prop.alasanPenolakan}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-1 text-xs text-[#6B685B] font-semibold">
                    <span>Pengusul: {prop.namaPengusul}</span>

                    {/* Sesepuh Confirmation Action button */}
                    {canConfirmProposal && prop.status === 'Menunggu' && (
                      <button
                        type="button"
                        onClick={() => handleOpenSesepuhModal(prop)}
                        className="px-3 py-1.5 rounded-lg bg-[#C9A24B]/15 text-[#9E7A24] hover:bg-[#C9A24B]/25 transition font-bold"
                      >
                        Konfirmasi Sesepuh
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* TAB 2: BUAT USULAN FORM */}
      {activeTab === 'buat' && (
        <div className="p-5 sm:p-6 rounded-2xl bg-[#FFFFFF] border border-[#E9E4D8] shadow-2xs space-y-5">
          <h3 className="font-heading font-bold text-lg text-[#2F6B4F]">
            Formulir Usulan
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-[#2B2B26] block">
                Jenis Usulan <span className="text-[#B3402F]">*</span>
              </label>
              <select
                value={jenis}
                onChange={(e) => setJenis(e.target.value as any)}
                className="w-full px-3 py-2.5 rounded-xl border border-[#E9E4D8] bg-[#FAF5EA]/30 text-sm font-semibold text-[#2B2B26] focus:outline-hidden focus:border-[#2F6B4F]"
              >
                <option value="Koreksi Data">Koreksi Data</option>
                <option value="Tambah Anggota">Tambah Anggota</option>
                <option value="Konfirmasi Data">Konfirmasi Data</option>
                <option value="Tambah Cerita atau Informasi">Tambah Cerita atau Informasi</option>
              </select>
            </div>

            {/* Anggota Terkait (Searchable Member Picker) */}
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-[#2B2B26] block">
                Anggota Terkait
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={memberSearch}
                  onChange={(e) => {
                    setMemberSearch(e.target.value);
                    if (!e.target.value) setSelectedMemberId('');
                  }}
                  placeholder="Ketik nama anggota"
                  className="w-full px-3 py-2.5 rounded-xl border border-[#E9E4D8] bg-[#FAF5EA]/30 text-sm text-[#2B2B26] focus:outline-hidden focus:border-[#2F6B4F]"
                />
                {matchedMembers.length > 0 && (
                  <div className="absolute top-full left-0 right-0 z-20 mt-1 max-h-48 overflow-y-auto rounded-xl border border-[#E9E4D8] bg-[#FFFFFF] shadow-lg p-1 space-y-1">
                    {matchedMembers.slice(0, 5).map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => handleSelectMemberFromSearch(m)}
                        className="w-full px-3 py-2 rounded-lg text-left text-xs font-semibold hover:bg-[#FAF5EA] text-[#2B2B26] flex items-center justify-between"
                      >
                        <span>{m.nama}</span>
                        <span className="text-[#6B685B]">{m.kodeSilsilah}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Isi Usulan */}
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-[#2B2B26] block">
                Isi Usulan <span className="text-[#B3402F]">*</span>
              </label>
              <textarea
                value={isiUsulan}
                onChange={(e) => setIsiUsulan(e.target.value)}
                rows={4}
                className="w-full px-3 py-2.5 rounded-xl border border-[#E9E4D8] bg-[#FAF5EA]/30 text-sm text-[#2B2B26] focus:outline-hidden focus:border-[#2F6B4F]"
              />
            </div>

            {/* Identitas Pengusul */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-[#2B2B26] block">
                  Nama Pengusul <span className="text-[#B3402F]">*</span>
                </label>
                <input
                  type="text"
                  value={namaPengusul}
                  onChange={(e) => setNamaPengusul(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-[#E9E4D8] bg-[#FAF5EA]/30 text-sm text-[#2B2B26] focus:outline-hidden focus:border-[#2F6B4F]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-bold text-[#2B2B26] block">
                  Kontak (Opsional)
                </label>
                <input
                  type="text"
                  value={kontakPengusul}
                  onChange={(e) => setKontakPengusul(e.target.value)}
                  placeholder="08..."
                  className="w-full px-3 py-2.5 rounded-xl border border-[#E9E4D8] bg-[#FAF5EA]/30 text-sm text-[#2B2B26] focus:outline-hidden focus:border-[#2F6B4F]"
                />
              </div>
            </div>

            {errorMessage && (
              <p className="text-xs text-[#B3402F] font-bold">{errorMessage}</p>
            )}

            {/* Action Bar */}
            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setActiveTab('daftar')}
                className="px-5 py-2.5 rounded-xl border border-[#E9E4D8] text-[#2B2B26] hover:bg-[#FAF5EA] font-semibold text-sm transition"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-[#2F6B4F] text-[#FAF5EA] hover:bg-[#1E4734] font-bold text-sm transition shadow-xs"
              >
                Kirim
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Sesepuh Confirmation Modal */}
      <Modal
        isOpen={sesepuhConfirmModalOpen}
        onClose={() => setSesepuhConfirmModalOpen(false)}
        title="Konfirmasi Sesepuh"
        footer={
          <div className="flex items-center justify-end gap-2 w-full">
            <button
              type="button"
              onClick={() => setSesepuhConfirmModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-[#E9E4D8] text-sm font-semibold"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleSaveSesepuhConfirm}
              className="px-4 py-2 rounded-xl bg-[#2F6B4F] text-[#FAF5EA] text-sm font-bold"
            >
              Simpan Konfirmasi
            </button>
          </div>
        }
      >
        <div className="space-y-3">
          <div className="space-y-1">
            <label className="text-xs font-bold text-[#6B685B] block">
              Nama Sesepuh
            </label>
            <input
              type="text"
              value={sesepuhNama}
              onChange={(e) => setSesepuhNama(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-[#E9E4D8] text-sm font-semibold"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-[#6B685B] block">
              Catatan Konfirmasi
            </label>
            <textarea
              value={sesepuhCatatan}
              onChange={(e) => setSesepuhCatatan(e.target.value)}
              rows={3}
              placeholder="Catatan kebenaran data"
              className="w-full px-3 py-2 rounded-xl border border-[#E9E4D8] text-sm"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};
