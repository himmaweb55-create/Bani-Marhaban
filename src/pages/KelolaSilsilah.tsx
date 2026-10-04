import React, { useState } from 'react';
import { Anggota, StatusVerifikasi } from '../types';
import { useAuth } from '../context/AuthContext';
import { StorageManager } from '../lib/storage';
import { Modal } from '../components/Modal';
import {
  Plus,
  Edit2,
  Archive,
  RotateCcw,
  Search,
  AlertCircle,
  CheckCircle2,
  User,
} from 'lucide-react';

interface KelolaSilsilahProps {
  members: Anggota[];
}

export const KelolaSilsilah: React.FC<KelolaSilsilahProps> = ({ members }) => {
  const { roleLabel } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [showArchived, setShowArchived] = useState(false);

  // Form modal
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Anggota | null>(null);

  // Form states
  const [nama, setNama] = useState('');
  const [kodeSilsilah, setKodeSilsilah] = useState('');
  const [nomorAnggota, setNomorAnggota] = useState('');
  const [jenisKelamin, setJenisKelamin] = useState<'L' | 'P'>('L');
  const [tahunLahir, setTahunLahir] = useState<string>('');
  const [usia, setUsia] = useState<string>('');
  const [statusHidup, setStatusHidup] = useState<'hidup' | 'wafat'>('hidup');
  const [tanggalWafat, setTanggalWafat] = useState('');
  const [cabang, setCabang] = useState('Cabang H. Abdullah');
  const [generasi, setGenerasi] = useState<number>(3);
  const [ayahId, setAyahId] = useState('');
  const [ibuId, setIbuId] = useState('');
  const [pasanganId, setPasanganId] = useState('');
  const [domisili, setDomisili] = useState('');
  const [catatan, setCatatan] = useState('');
  const [statusVerifikasi, setStatusVerifikasi] = useState<StatusVerifikasi>('Terverifikasi');

  const [errorMessage, setErrorMessage] = useState('');
  const [notification, setNotification] = useState('');

  const branches = [
    'Cabang H. Abdullah',
    'Cabang Hj. Khadijah',
    'Cabang H. Mansyur',
    'Pusat',
    'Belum diketahui',
  ];

  const maleMembers = members.filter((m) => m.jenisKelamin === 'L' && !m.diarsipkan);
  const femaleMembers = members.filter((m) => m.jenisKelamin === 'P' && !m.diarsipkan);

  // Duplicate name check
  const duplicateNameFound =
    nama.trim() &&
    members.some(
      (m) =>
        (!editingMember || m.id !== editingMember.id) &&
        m.nama.trim().toLowerCase() === nama.trim().toLowerCase()
    );

  const openAddModal = () => {
    setEditingMember(null);
    setNama('');
    setKodeSilsilah(`BM.3.${members.length + 1}`);
    setNomorAnggota(`BM-${String(members.length + 1).padStart(3, '0')}`);
    setJenisKelamin('L');
    setTahunLahir('');
    setUsia('');
    setStatusHidup('hidup');
    setTanggalWafat('');
    setCabang('Cabang H. Abdullah');
    setGenerasi(3);
    setAyahId('');
    setIbuId('');
    setPasanganId('');
    setDomisili('');
    setCatatan('');
    setStatusVerifikasi('Terverifikasi');
    setErrorMessage('');
    setFormModalOpen(true);
  };

  const openEditModal = (m: Anggota) => {
    setEditingMember(m);
    setNama(m.nama);
    setKodeSilsilah(m.kodeSilsilah);
    setNomorAnggota(m.nomorAnggota);
    setJenisKelamin(m.jenisKelamin);
    setTahunLahir(m.tahunLahir ? String(m.tahunLahir) : '');
    setUsia(m.usia ? String(m.usia) : '');
    setStatusHidup(m.statusHidup);
    setTanggalWafat(m.tanggalWafat || '');
    setCabang(m.cabang);
    setGenerasi(m.generasi);
    setAyahId(m.ayahId || '');
    setIbuId(m.ibuId || '');
    setPasanganId(m.pasanganIds?.[0] || '');
    setDomisili(m.domisili || '');
    setCatatan(m.catatan || '');
    setStatusVerifikasi(m.statusVerifikasi);
    setErrorMessage('');
    setFormModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!nama.trim()) {
      setErrorMessage('Nama anggota wajib diisi');
      return;
    }

    const memberToSave: Anggota = {
      id: editingMember ? editingMember.id : `m-${Date.now()}`,
      kodeSilsilah: kodeSilsilah.trim() || `BM.${generasi}.${Date.now().toString().slice(-3)}`,
      nomorAnggota: nomorAnggota.trim() || `BM-${String(members.length + 1).padStart(3, '0')}`,
      nama: nama.trim(),
      jenisKelamin,
      tahunLahir: tahunLahir ? parseInt(tahunLahir, 10) : undefined,
      usia: usia ? parseInt(usia, 10) : undefined,
      statusHidup,
      tanggalWafat: statusHidup === 'wafat' ? tanggalWafat : undefined,
      cabang,
      generasi,
      ayahId: ayahId || undefined,
      ibuId: ibuId || undefined,
      pasanganIds: pasanganId ? [pasanganId] : editingMember ? editingMember.pasanganIds : [],
      domisili: domisili.trim() || undefined,
      catatan: catatan.trim() || undefined,
      statusVerifikasi,
      diarsipkan: editingMember ? editingMember.diarsipkan : false,
    };

    StorageManager.saveMember(memberToSave, roleLabel);
    setFormModalOpen(false);
    setNotification('Data silsilah berhasil disimpan');
    setTimeout(() => setNotification(''), 3000);
  };

  const handleArchive = (m: Anggota) => {
    StorageManager.archiveMember(m.id, roleLabel);
    setNotification('Anggota berhasil diarsipkan');
    setTimeout(() => setNotification(''), 3000);
  };

  const handleRestore = (m: Anggota) => {
    StorageManager.restoreMember(m.id, roleLabel);
    setNotification('Anggota berhasil dipulihkan');
    setTimeout(() => setNotification(''), 3000);
  };

  const filteredMembers = members.filter((m) => {
    if (!showArchived && m.diarsipkan) return false;
    if (showArchived && !m.diarsipkan) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        m.nama.toLowerCase().includes(q) ||
        m.kodeSilsilah.toLowerCase().includes(q) ||
        m.cabang.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-4 pb-20 sm:pb-8">
      {/* Top action bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-2xl bg-[#FFFFFF] border border-[#E9E4D8] shadow-2xs">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold font-heading text-[#2F6B4F]">
            Kelola Data Silsilah
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowArchived(!showArchived)}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold border transition ${
              showArchived
                ? 'bg-[#6B685B] text-white border-[#6B685B]'
                : 'border-[#E9E4D8] text-[#2B2B26] hover:bg-[#FAF5EA]'
            }`}
          >
            {showArchived ? 'Lihat Anggota Aktif' : 'Lihat Arsip'}
          </button>

          {!showArchived && (
            <button
              type="button"
              onClick={openAddModal}
              className="px-4 py-2 rounded-xl bg-[#2F6B4F] text-[#FAF5EA] hover:bg-[#1E4734] transition text-xs sm:text-sm font-bold shadow-xs flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Anggota</span>
            </button>
          )}
        </div>
      </div>

      {notification && (
        <div className="p-3.5 rounded-xl bg-[#2F6B4F] text-[#FAF5EA] text-sm font-bold flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="w-5 h-5 text-[#C9A24B]" />
          <span>{notification}</span>
        </div>
      )}

      {/* Search */}
      <div className="p-3.5 rounded-xl bg-[#FFFFFF] border border-[#E9E4D8] shadow-2xs">
        <div className="relative">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-[#6B685B]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari anggota untuk diedit"
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-[#E9E4D8] bg-[#FAF5EA]/50 text-sm focus:outline-hidden focus:border-[#2F6B4F]"
          />
        </div>
      </div>

      {/* List */}
      <div className="space-y-3">
        {filteredMembers.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-[#FFFFFF] border border-[#E9E4D8]">
            <h3 className="text-base font-bold text-[#6B685B]">Belum ada data</h3>
          </div>
        ) : (
          filteredMembers.map((m) => (
            <div
              key={m.id}
              className="p-4 rounded-xl bg-[#FFFFFF] border border-[#E9E4D8] shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
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
                <h4 className="font-heading font-bold text-base text-[#2B2B26]">
                  {m.nama}
                </h4>
                <p className="text-xs text-[#6B685B] font-medium">
                  {m.cabang} • Generasi {m.generasi} • {m.statusHidup === 'wafat' ? 'Wafat' : 'Hidup'}
                </p>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                {!m.diarsipkan ? (
                  <>
                    <button
                      type="button"
                      onClick={() => openEditModal(m)}
                      className="px-3.5 py-1.5 rounded-lg border border-[#E9E4D8] hover:border-[#2F6B4F] text-xs font-bold text-[#2F6B4F] flex items-center gap-1.5"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Ubah</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleArchive(m)}
                      className="px-3.5 py-1.5 rounded-lg border border-[#B3402F]/30 hover:bg-[#B3402F]/10 text-xs font-bold text-[#B3402F] flex items-center gap-1.5"
                    >
                      <Archive className="w-3.5 h-3.5" />
                      <span>Arsipkan</span>
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleRestore(m)}
                    className="px-3.5 py-1.5 rounded-lg bg-[#2F6B4F] text-white text-xs font-bold flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Pulihkan</span>
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Edit / Add Member Modal */}
      <Modal
        isOpen={formModalOpen}
        onClose={() => setFormModalOpen(false)}
        title={editingMember ? 'Ubah Anggota Silsilah' : 'Tambah Anggota Silsilah'}
        maxWidth="xl"
        footer={
          <div className="flex items-center justify-end gap-2 w-full">
            <button
              type="button"
              onClick={() => setFormModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-[#E9E4D8] text-sm font-semibold"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 rounded-xl bg-[#2F6B4F] text-[#FAF5EA] font-bold text-sm"
            >
              Simpan
            </button>
          </div>
        }
      >
        <form onSubmit={handleSave} className="space-y-4 text-sm">
          {duplicateNameFound && (
            <div className="p-3 rounded-xl bg-[#D9822B]/10 border border-[#D9822B]/30 flex items-center gap-2 text-xs text-[#D9822B] font-bold">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>Nama serupa telah ada di daftar keluarga</span>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-bold text-[#2B2B26] block">
              Nama Lengkap <span className="text-[#B3402F]">*</span>
            </label>
            <input
              type="text"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-[#E9E4D8]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#2B2B26] block">
                Kode Silsilah
              </label>
              <input
                type="text"
                value={kodeSilsilah}
                onChange={(e) => setKodeSilsilah(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#E9E4D8]"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#2B2B26] block">
                Nomor Anggota
              </label>
              <input
                type="text"
                value={nomorAnggota}
                onChange={(e) => setNomorAnggota(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#E9E4D8]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#2B2B26] block">
                Jenis Kelamin
              </label>
              <select
                value={jenisKelamin}
                onChange={(e) => setJenisKelamin(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl border border-[#E9E4D8]"
              >
                <option value="L">Laki-laki</option>
                <option value="P">Perempuan</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-[#2B2B26] block">
                Generasi
              </label>
              <select
                value={generasi}
                onChange={(e) => setGenerasi(parseInt(e.target.value, 10))}
                className="w-full px-3 py-2 rounded-xl border border-[#E9E4D8]"
              >
                <option value={1}>1 (Leluhur)</option>
                <option value={2}>2 (Cabang)</option>
                <option value={3}>3 (Cucu)</option>
                <option value={4}>4 (Cicit)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-[#2B2B26] block">
                Status Hidup
              </label>
              <select
                value={statusHidup}
                onChange={(e) => setStatusHidup(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl border border-[#E9E4D8]"
              >
                <option value="hidup">Hidup</option>
                <option value="wafat">Wafat</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-[#2B2B26] block">
                Tahun Lahir
              </label>
              <input
                type="number"
                value={tahunLahir}
                onChange={(e) => setTahunLahir(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#E9E4D8]"
              />
            </div>
          </div>

          {statusHidup === 'wafat' && (
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#2B2B26] block">
                Tanggal Wafat
              </label>
              <input
                type="date"
                value={tanggalWafat}
                onChange={(e) => setTanggalWafat(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#E9E4D8]"
              />
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-bold text-[#2B2B26] block">Cabang</label>
            <select
              value={cabang}
              onChange={(e) => setCabang(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-[#E9E4D8]"
            >
              {branches.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>

          {/* Hubungkan Orang Tua & Pasangan */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#2B2B26] block">Ayah</label>
              <select
                value={ayahId}
                onChange={(e) => setAyahId(e.target.value)}
                className="w-full px-2.5 py-2 rounded-xl border border-[#E9E4D8] text-xs"
              >
                <option value="">Belum diketahui</option>
                {maleMembers.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.nama} ({m.kodeSilsilah})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-[#2B2B26] block">Ibu</label>
              <select
                value={ibuId}
                onChange={(e) => setIbuId(e.target.value)}
                className="w-full px-2.5 py-2 rounded-xl border border-[#E9E4D8] text-xs"
              >
                <option value="">Belum diketahui</option>
                {femaleMembers.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.nama} ({m.kodeSilsilah})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-[#2B2B26] block">Pasangan</label>
              <select
                value={pasanganId}
                onChange={(e) => setPasanganId(e.target.value)}
                className="w-full px-2.5 py-2 rounded-xl border border-[#E9E4D8] text-xs"
              >
                <option value="">Belum ada / Belum diketahui</option>
                {members
                  .filter((m) => !editingMember || m.id !== editingMember.id)
                  .map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.nama}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-[#2B2B26] block">Domisili</label>
            <input
              type="text"
              value={domisili}
              onChange={(e) => setDomisili(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-[#E9E4D8]"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-[#2B2B26] block">
              Status Verifikasi
            </label>
            <select
              value={statusVerifikasi}
              onChange={(e) => setStatusVerifikasi(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl border border-[#E9E4D8]"
            >
              <option value="Terverifikasi">Terverifikasi</option>
              <option value="Perlu Konfirmasi">Perlu Konfirmasi</option>
              <option value="Usulan Perubahan">Usulan Perubahan</option>
            </select>
          </div>

          {errorMessage && (
            <p className="text-xs text-[#B3402F] font-bold">{errorMessage}</p>
          )}
        </form>
      </Modal>
    </div>
  );
};
