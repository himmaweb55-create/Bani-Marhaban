import React, { useState } from 'react';
import { Kegiatan, JenisKegiatan, Berita, Album } from '../types';
import { StorageManager } from '../lib/storage';
import { Modal } from '../components/Modal';
import {
  Plus,
  Edit2,
  Calendar,
  Newspaper,
  Pin,
  Tag,
  CheckCircle2,
  Trash2,
} from 'lucide-react';

interface KelolaInformasiProps {
  activities: Kegiatan[];
  activityTypes: JenisKegiatan[];
  news: Berita[];
  albums: Album[];
}

export const KelolaInformasi: React.FC<KelolaInformasiProps> = ({
  activities,
  activityTypes,
  news,
  albums,
}) => {
  const [activeTab, setActiveTab] = useState<'kegiatan' | 'berita' | 'jenis'>('kegiatan');
  const [notification, setNotification] = useState('');

  // Activity Form Modal
  const [activityModalOpen, setActivityModalOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Kegiatan | null>(null);
  const [actJudul, setActJudul] = useState('');
  const [actJenis, setActJenis] = useState('');
  const [actTanggal, setActTanggal] = useState('');
  const [actLokasi, setActLokasi] = useState('');
  const [actDeskripsi, setActDeskripsi] = useState('');
  const [actStatus, setActStatus] = useState<'Rencana' | 'Berjalan' | 'Selesai'>('Rencana');
  const [actHasil, setActHasil] = useState('');
  const [actAlbumId, setActAlbumId] = useState('');

  // News Form Modal
  const [newsModalOpen, setNewsModalOpen] = useState(false);
  const [editingNews, setEditingNews] = useState<Berita | null>(null);
  const [newsJudul, setNewsJudul] = useState('');
  const [newsTanggal, setNewsTanggal] = useState('');
  const [newsIsi, setNewsIsi] = useState('');
  const [newsPenulis, setNewsPenulis] = useState('');
  const [newsTersemat, setNewsTersemat] = useState(false);

  // New Activity Type Modal
  const [typeModalOpen, setTypeModalOpen] = useState(false);
  const [typeName, setTypeName] = useState('');

  const openAddActivity = () => {
    setEditingActivity(null);
    setActJudul('');
    setActJenis(activityTypes[0]?.nama || 'Silaturahmi');
    setActTanggal(new Date().toISOString().split('T')[0]);
    setActLokasi('');
    setActDeskripsi('');
    setActStatus('Rencana');
    setActHasil('');
    setActAlbumId('');
    setActivityModalOpen(true);
  };

  const openEditActivity = (act: Kegiatan) => {
    setEditingActivity(act);
    setActJudul(act.judul);
    setActJenis(act.jenis);
    setActTanggal(act.tanggal);
    setActLokasi(act.lokasi);
    setActDeskripsi(act.deskripsi);
    setActStatus(act.status);
    setActHasil(act.ringkasanHasil || '');
    setActAlbumId(act.albumTertautId || '');
    setActivityModalOpen(true);
  };

  const handleSaveActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!actJudul.trim()) return;

    const toSave: Kegiatan = {
      id: editingActivity ? editingActivity.id : `kg-${Date.now()}`,
      judul: actJudul.trim(),
      jenis: actJenis,
      tanggal: actTanggal,
      lokasi: actLokasi.trim(),
      deskripsi: actDeskripsi.trim(),
      status: actStatus,
      ringkasanHasil: actHasil.trim() || undefined,
      albumTertautId: actAlbumId || undefined,
    };

    StorageManager.saveActivity(toSave);
    setActivityModalOpen(false);
    setNotification('Data kegiatan berhasil disimpan');
    setTimeout(() => setNotification(''), 3000);
  };

  const openAddNews = () => {
    setEditingNews(null);
    setNewsJudul('');
    setNewsTanggal(new Date().toISOString().split('T')[0]);
    setNewsIsi('');
    setNewsPenulis('Sekretaris Paguyuban');
    setNewsTersemat(false);
    setNewsModalOpen(true);
  };

  const openEditNews = (n: Berita) => {
    setEditingNews(n);
    setNewsJudul(n.judul);
    setNewsTanggal(n.tanggal);
    setNewsIsi(n.isi);
    setNewsPenulis(n.penulis);
    setNewsTersemat(n.tersemat);
    setNewsModalOpen(true);
  };

  const handleSaveNews = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsJudul.trim() || !newsIsi.trim()) return;

    const toSave: Berita = {
      id: editingNews ? editingNews.id : `br-${Date.now()}`,
      judul: newsJudul.trim(),
      tanggal: newsTanggal,
      isi: newsIsi.trim(),
      penulis: newsPenulis.trim() || 'Sekretaris Paguyuban',
      tersemat: newsTersemat,
    };

    StorageManager.saveNews(toSave);
    setNewsModalOpen(false);
    setNotification('Berita/pengumuman berhasil disimpan');
    setTimeout(() => setNotification(''), 3000);
  };

  const handleSaveType = (e: React.FormEvent) => {
    e.preventDefault();
    if (!typeName.trim()) return;

    StorageManager.saveActivityType({
      id: `jt-${Date.now()}`,
      nama: typeName.trim(),
      ikon: 'Calendar',
    });

    setTypeModalOpen(false);
    setTypeName('');
    setNotification('Jenis kegiatan baru berhasil ditambahkan');
    setTimeout(() => setNotification(''), 3000);
  };

  return (
    <div className="space-y-4 pb-20 sm:pb-8">
      {/* Top Bar Navigation */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-2xl bg-[#FFFFFF] border border-[#E9E4D8] shadow-2xs">
        <div className="inline-flex rounded-xl p-1 bg-[#FAF5EA] border border-[#E9E4D8]">
          <button
            type="button"
            onClick={() => setActiveTab('kegiatan')}
            className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition ${
              activeTab === 'kegiatan'
                ? 'bg-[#2F6B4F] text-[#FAF5EA] shadow-xs'
                : 'text-[#2B2B26] hover:text-[#2F6B4F]'
            }`}
          >
            Agenda Kegiatan
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('berita')}
            className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition ${
              activeTab === 'berita'
                ? 'bg-[#2F6B4F] text-[#FAF5EA] shadow-xs'
                : 'text-[#2B2B26] hover:text-[#2F6B4F]'
            }`}
          >
            Berita & Pengumuman
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('jenis')}
            className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition ${
              activeTab === 'jenis'
                ? 'bg-[#2F6B4F] text-[#FAF5EA] shadow-xs'
                : 'text-[#2B2B26] hover:text-[#2F6B4F]'
            }`}
          >
            Jenis Kegiatan
          </button>
        </div>

        {activeTab === 'kegiatan' && (
          <button
            type="button"
            onClick={openAddActivity}
            className="px-4 py-2 rounded-xl bg-[#2F6B4F] text-[#FAF5EA] hover:bg-[#1E4734] font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Kegiatan</span>
          </button>
        )}

        {activeTab === 'berita' && (
          <button
            type="button"
            onClick={openAddNews}
            className="px-4 py-2 rounded-xl bg-[#2F6B4F] text-[#FAF5EA] hover:bg-[#1E4734] font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Berita</span>
          </button>
        )}

        {activeTab === 'jenis' && (
          <button
            type="button"
            onClick={() => setTypeModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-[#2F6B4F] text-[#FAF5EA] hover:bg-[#1E4734] font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Jenis</span>
          </button>
        )}
      </div>

      {notification && (
        <div className="p-3.5 rounded-xl bg-[#2F6B4F] text-[#FAF5EA] text-sm font-bold flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="w-5 h-5 text-[#C9A24B]" />
          <span>{notification}</span>
        </div>
      )}

      {/* TAB 1: KEGIATAN */}
      {activeTab === 'kegiatan' && (
        <div className="space-y-3">
          {activities.map((act) => (
            <div
              key={act.id}
              className="p-4 sm:p-5 rounded-2xl bg-[#FFFFFF] border border-[#E9E4D8] shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#2F6B4F]/10 text-[#2F6B4F] font-bold">
                    {act.jenis}
                  </span>
                  <span className="text-xs font-semibold text-[#6B685B]">
                    {act.tanggal}
                  </span>
                </div>
                <h4 className="font-heading font-bold text-base text-[#2B2B26]">
                  {act.judul}
                </h4>
                <p className="text-xs text-[#6B685B] font-medium">{act.lokasi}</p>
              </div>

              <button
                type="button"
                onClick={() => openEditActivity(act)}
                className="px-3.5 py-1.5 rounded-lg border border-[#E9E4D8] hover:border-[#2F6B4F] text-xs font-bold text-[#2F6B4F] flex items-center gap-1.5 self-end sm:self-center"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Ubah</span>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* TAB 2: BERITA & PENGUMUMAN */}
      {activeTab === 'berita' && (
        <div className="space-y-3">
          {news.map((item) => (
            <div
              key={item.id}
              className="p-4 sm:p-5 rounded-2xl bg-[#FFFFFF] border border-[#E9E4D8] shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="space-y-1.5 max-w-2xl">
                <div className="flex items-center gap-2">
                  {item.tersemat && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#C9A24B]/20 text-[#9E7A24] font-bold flex items-center gap-1">
                      <Pin className="w-3 h-3" />
                      <span>Tersemat</span>
                    </span>
                  )}
                  <span className="text-xs text-[#6B685B] font-medium">
                    {item.tanggal}
                  </span>
                </div>
                <h4 className="font-heading font-bold text-base text-[#2B2B26]">
                  {item.judul}
                </h4>
                <p className="text-xs text-[#2B2B26] line-clamp-2 leading-relaxed">
                  {item.isi}
                </p>
              </div>

              <button
                type="button"
                onClick={() => openEditNews(item)}
                className="px-3.5 py-1.5 rounded-lg border border-[#E9E4D8] hover:border-[#2F6B4F] text-xs font-bold text-[#2F6B4F] flex items-center gap-1.5 self-end sm:self-center"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Ubah</span>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: JENIS KEGIATAN */}
      {activeTab === 'jenis' && (
        <div className="p-5 rounded-2xl bg-[#FFFFFF] border border-[#E9E4D8] shadow-2xs space-y-3">
          <h3 className="font-heading font-bold text-base text-[#2F6B4F]">
            Daftar Jenis Kegiatan Dinamis
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
            {activityTypes.map((t) => (
              <div
                key={t.id}
                className="p-3 rounded-xl border border-[#E9E4D8] bg-[#FAF5EA]/40 text-xs font-bold text-[#2B2B26] flex items-center gap-2"
              >
                <Tag className="w-4 h-4 text-[#C9A24B]" />
                <span>{t.nama}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Activity Edit/Add Modal */}
      <Modal
        isOpen={activityModalOpen}
        onClose={() => setActivityModalOpen(false)}
        title={editingActivity ? 'Ubah Kegiatan' : 'Tambah Kegiatan'}
        maxWidth="lg"
        footer={
          <div className="flex items-center justify-end gap-2 w-full">
            <button
              type="button"
              onClick={() => setActivityModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-[#E9E4D8] text-sm font-semibold"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleSaveActivity}
              className="px-5 py-2 rounded-xl bg-[#2F6B4F] text-[#FAF5EA] font-bold text-sm"
            >
              Simpan
            </button>
          </div>
        }
      >
        <form onSubmit={handleSaveActivity} className="space-y-3 text-sm">
          <div className="space-y-1">
            <label className="text-xs font-bold text-[#2B2B26] block">
              Judul Kegiatan <span className="text-[#B3402F]">*</span>
            </label>
            <input
              type="text"
              value={actJudul}
              onChange={(e) => setActJudul(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-[#E9E4D8]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#2B2B26] block">Jenis</label>
              <select
                value={actJenis}
                onChange={(e) => setActJenis(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#E9E4D8]"
              >
                {activityTypes.map((t) => (
                  <option key={t.id} value={t.nama}>
                    {t.nama}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-[#2B2B26] block">Status</label>
              <select
                value={actStatus}
                onChange={(e) => setActStatus(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl border border-[#E9E4D8]"
              >
                <option value="Rencana">Rencana</option>
                <option value="Berjalan">Berjalan</option>
                <option value="Selesai">Selesai</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#2B2B26] block">Tanggal</label>
              <input
                type="date"
                value={actTanggal}
                onChange={(e) => setActTanggal(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#E9E4D8]"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#2B2B26] block">Lokasi</label>
              <input
                type="text"
                value={actLokasi}
                onChange={(e) => setActLokasi(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#E9E4D8]"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-[#2B2B26] block">Deskripsi</label>
            <textarea
              value={actDeskripsi}
              onChange={(e) => setActDeskripsi(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 rounded-xl border border-[#E9E4D8]"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-[#2B2B26] block">Ringkasan Hasil</label>
            <textarea
              value={actHasil}
              onChange={(e) => setActHasil(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 rounded-xl border border-[#E9E4D8]"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-[#2B2B26] block">Tautkan Album</label>
            <select
              value={actAlbumId}
              onChange={(e) => setActAlbumId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-[#E9E4D8]"
            >
              <option value="">Tidak ada album tertaut</option>
              {albums.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.judul} ({a.tahun})
                </option>
              ))}
            </select>
          </div>
        </form>
      </Modal>

      {/* News Edit/Add Modal */}
      <Modal
        isOpen={newsModalOpen}
        onClose={() => setNewsModalOpen(false)}
        title={editingNews ? 'Ubah Berita' : 'Tambah Berita'}
        maxWidth="lg"
        footer={
          <div className="flex items-center justify-end gap-2 w-full">
            <button
              type="button"
              onClick={() => setNewsModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-[#E9E4D8] text-sm font-semibold"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleSaveNews}
              className="px-5 py-2 rounded-xl bg-[#2F6B4F] text-[#FAF5EA] font-bold text-sm"
            >
              Simpan
            </button>
          </div>
        }
      >
        <form onSubmit={handleSaveNews} className="space-y-3 text-sm">
          <div className="space-y-1">
            <label className="text-xs font-bold text-[#2B2B26] block">
              Judul <span className="text-[#B3402F]">*</span>
            </label>
            <input
              type="text"
              value={newsJudul}
              onChange={(e) => setNewsJudul(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-[#E9E4D8]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#2B2B26] block">Tanggal</label>
              <input
                type="date"
                value={newsTanggal}
                onChange={(e) => setNewsTanggal(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#E9E4D8]"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#2B2B26] block">Penulis</label>
              <input
                type="text"
                value={newsPenulis}
                onChange={(e) => setNewsPenulis(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#E9E4D8]"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-[#2B2B26] block">
              Isi <span className="text-[#B3402F]">*</span>
            </label>
            <textarea
              value={newsIsi}
              onChange={(e) => setNewsIsi(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 rounded-xl border border-[#E9E4D8]"
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="tersemat"
              checked={newsTersemat}
              onChange={(e) => setNewsTersemat(e.target.checked)}
              className="w-4 h-4 rounded text-[#2F6B4F]"
            />
            <label htmlFor="tersemat" className="text-xs font-bold text-[#2B2B26]">
              Sematkan di Beranda
            </label>
          </div>
        </form>
      </Modal>

      {/* Add Type Modal */}
      <Modal
        isOpen={typeModalOpen}
        onClose={() => setTypeModalOpen(false)}
        title="Tambah Jenis Kegiatan"
        footer={
          <div className="flex items-center justify-end gap-2 w-full">
            <button
              type="button"
              onClick={() => setTypeModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-[#E9E4D8] text-sm font-semibold"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleSaveType}
              className="px-5 py-2 rounded-xl bg-[#2F6B4F] text-[#FAF5EA] font-bold text-sm"
            >
              Simpan
            </button>
          </div>
        }
      >
        <form onSubmit={handleSaveType} className="space-y-3 text-sm">
          <div className="space-y-1">
            <label className="text-xs font-bold text-[#2B2B26] block">
              Nama Jenis Kegiatan <span className="text-[#B3402F]">*</span>
            </label>
            <input
              type="text"
              value={typeName}
              onChange={(e) => setTypeName(e.target.value)}
              placeholder="Contoh: Takziyah"
              className="w-full px-3 py-2 rounded-xl border border-[#E9E4D8]"
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};
