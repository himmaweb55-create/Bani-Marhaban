import React, { useState } from 'react';
import {
  Anggota,
  CMSConfig,
  SinkronisasiConfig,
  LogAktivitas,
  Album,
  GaleriItem,
  Kegiatan,
  JenisKegiatan,
  Berita,
} from '../../types';
import { StorageManager } from '../../lib/storage';
import { googleAppsScriptTemplate } from '../../lib/appsScriptCode';
import { ImageField } from '../../components/ImageField';
import { Modal } from '../../components/Modal';
import {
  Sliders,
  Users,
  KeyRound,
  FileSpreadsheet,
  Image as ImageIcon,
  Calendar,
  Palette,
  RefreshCw,
  Activity,
  Server,
  Copy,
  Check,
  CheckCircle2,
  XCircle,
  Download,
  Upload,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';

interface SuperAdminProps {
  members: Anggota[];
  cms: CMSConfig;
  syncConfig: SinkronisasiConfig;
  logs: LogAktivitas[];
  albums: Album[];
  galleryItems: GaleriItem[];
  activities: Kegiatan[];
  activityTypes: JenisKegiatan[];
  news: Berita[];
  onSelectMember: (m: Anggota) => void;
}

export const SuperAdminDashboard: React.FC<SuperAdminProps> = ({
  members,
  cms,
  syncConfig,
  logs,
  albums,
  galleryItems,
  activities,
  activityTypes,
  news,
  onSelectMember,
}) => {
  const [activeTab, setActiveTab] = useState<
    | 'ringkasan'
    | 'akun'
    | 'anggota'
    | 'impor'
    | 'dokumentasi'
    | 'kegiatan'
    | 'cms'
    | 'sinkronisasi'
    | 'log'
    | 'firebase'
  >('ringkasan');

  // CMS sub-tabs
  const [cmsSubTab, setCmsSubTab] = useState<
    | 'identitas'
    | 'tema'
    | 'navigasi'
    | 'banner'
    | 'konten'
    | 'fitur'
    | 'footer'
    | 'simpan'
  >('identitas');

  // CMS local state
  const [cmsState, setCmsState] = useState<CMSConfig>(cms);

  // Sync state
  const [syncState, setSyncState] = useState<SinkronisasiConfig>(syncConfig);
  const [isTestingSync, setIsTestingSync] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>(
    syncConfig.terakhirSinkron || '2026-10-03 16:45'
  );

  // Initial Import state
  const [importFileText, setImportFileText] = useState('');
  const [importPreviewData, setImportPreviewData] = useState<any[]>([]);
  const [duplicateNames, setDuplicateNames] = useState<string[]>([]);
  const [importSuccessMessage, setImportSuccessMessage] = useState('');

  // Notification
  const [notification, setNotification] = useState('');

  // Role permissions
  const [wakilBisaVerifikasi, setWakilBisaVerifikasi] = useState<boolean>(
    cms.wakilKetuaBisaVerifikasi ?? true
  );

  // Member search in Data Anggota tab
  const [memberSearch, setMemberSearch] = useState('');

  // DOCUMENTATION state: Add Album Modal
  const [addAlbumModalOpen, setAddAlbumModalOpen] = useState(false);
  const [newAlbumJudul, setNewAlbumJudul] = useState('');
  const [newAlbumTahun, setNewAlbumTahun] = useState<number>(2026);
  const [newAlbumSampul, setNewAlbumSampul] = useState('');

  // DOCUMENTATION state: Add Media Modal
  const [addMediaModalOpen, setAddMediaModalOpen] = useState(false);
  const [mediaAlbumId, setMediaAlbumId] = useState(albums[0]?.id || '');
  const [mediaType, setMediaType] = useState<'foto' | 'video'>('foto');
  const [mediaValue, setMediaValue] = useState('');
  const [mediaJudul, setMediaJudul] = useState('');
  const [mediaLokasi, setMediaLokasi] = useState('');

  // Copy Google Apps Script code
  const handleCopyAppsScript = () => {
    navigator.clipboard.writeText(googleAppsScriptTemplate);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  // Save Sync Configuration
  const handleSaveSync = (e: React.FormEvent) => {
    e.preventDefault();
    StorageManager.saveSyncConfig(syncState);
    setNotification('Pengaturan sinkronisasi disimpan');
    setTimeout(() => setNotification(''), 3000);
  };

  // Test Connection
  const handleTestConnection = () => {
    setIsTestingSync(true);
    setTimeout(() => {
      setIsTestingSync(false);
      const isConnected = !!syncState.webAppUrl;
      const updated = {
        ...syncState,
        statusKoneksi: (isConnected ? 'Terhubung' : 'Gagal') as any,
      };
      setSyncState(updated);
      StorageManager.saveSyncConfig(updated);
      setNotification(isConnected ? 'Koneksi Berhasil' : 'Koneksi Gagal');
      setTimeout(() => setNotification(''), 3000);
    }, 1000);
  };

  // Sync Collection to Sheets
  const handleSyncCollection = (collectionName: string) => {
    const timeNow = new Date().toISOString().replace('T', ' ').substring(0, 16);
    setLastSyncTime(timeNow);
    const updated = { ...syncState, terakhirSinkron: timeNow };
    setSyncState(updated);
    StorageManager.saveSyncConfig(updated);
    StorageManager.addLog('Super Admin', `Sinkronkan ${collectionName} ke Sheets`);
    setNotification(`Sinkronisasi ${collectionName} berhasil`);
    setTimeout(() => setNotification(''), 3000);
  };

  // Save CMS Config
  const handleSaveCMS = () => {
    const updated = { ...cmsState, wakilKetuaBisaVerifikasi: wakilBisaVerifikasi };
    StorageManager.saveCMS(updated);
    setNotification('Pengaturan CMS disimpan');
    setTimeout(() => setNotification(''), 3000);
  };

  // Reset CMS Config
  const handleResetCMS = () => {
    const reset = StorageManager.resetCMS();
    setCmsState(reset);
    setWakilBisaVerifikasi(reset.wakilKetuaBisaVerifikasi);
    setNotification('Pengaturan CMS dipulihkan ke bawaan');
    setTimeout(() => setNotification(''), 3000);
  };

  // Export Data to CSV
  const handleExportCSV = () => {
    const activeMembers = members.filter((m) => !m.diarsipkan);
    const headers = [
      'Nomor Anggota',
      'Kode Silsilah',
      'Nama Lengkap',
      'Jenis Kelamin',
      'Generasi',
      'Cabang',
      'Tahun Lahir',
      'Status Hidup',
      'Domisili',
      'Status Verifikasi',
    ];
    const rows = activeMembers.map((m) => [
      m.nomorAnggota,
      m.kodeSilsilah,
      `"${m.nama}"`,
      m.jenisKelamin,
      m.generasi,
      `"${m.cabang}"`,
      m.tahunLahir || '',
      m.statusHidup,
      `"${m.domisili || ''}"`,
      m.statusVerifikasi,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Daftar_Keluarga_Bani_Marhaban_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Parse simulated CSV/Excel initial import
  const handleParseImport = (text: string) => {
    setImportFileText(text);
    const lines = text.trim().split('\n').filter(Boolean);
    if (lines.length < 2) return;

    const dataRows = lines.slice(1).map((line, idx) => {
      const parts = line.split(',').map((p) => p.trim().replace(/^"|"$/g, ''));
      return {
        id: `imp-${idx + 1}`,
        nomorAnggota: parts[0] || `BM-${String(idx + 100).padStart(3, '0')}`,
        kodeSilsilah: parts[1] || `BM.3.${idx + 10}`,
        nama: parts[2] || parts[0] || 'Nama Anggota',
        jenisKelamin: (parts[3] === 'P' ? 'P' : 'L') as 'L' | 'P',
        generasi: parseInt(parts[4] || '3', 10) || 3,
        cabang: parts[5] || 'Belum diketahui',
        statusHidup: (parts[6]?.toLowerCase() === 'wafat' ? 'wafat' : 'hidup') as 'hidup' | 'wafat',
        domisili: parts[7] || '',
      };
    });

    setImportPreviewData(dataRows);

    // Detect duplicates
    const existingNames = new Set(members.map((m) => m.nama.toLowerCase().trim()));
    const dupes: string[] = [];
    dataRows.forEach((r) => {
      if (existingNames.has(r.nama.toLowerCase().trim())) {
        dupes.push(r.nama);
      }
    });
    setDuplicateNames(dupes);
  };

  const handleExecuteImport = () => {
    importPreviewData.forEach((row) => {
      const newMember: Anggota = {
        id: `m-imp-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        nomorAnggota: row.nomorAnggota,
        kodeSilsilah: row.kodeSilsilah,
        nama: row.nama,
        jenisKelamin: row.jenisKelamin,
        generasi: row.generasi,
        cabang: row.cabang,
        statusHidup: row.statusHidup,
        domisili: row.domisili,
        pasanganIds: [],
        statusVerifikasi: 'Perlu Konfirmasi',
        diarsipkan: false,
        sumber: 'Impor Data Awal 2026',
      };
      StorageManager.saveMember(newMember, 'Super Admin');
    });

    setImportPreviewData([]);
    setImportFileText('');
    setImportSuccessMessage('Data berhasil diimpor dengan status Perlu Konfirmasi');
    setTimeout(() => setImportSuccessMessage(''), 4000);
  };

  const handleSaveNewAlbum = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAlbumJudul.trim()) return;

    StorageManager.saveAlbum({
      id: `alb-${Date.now()}`,
      judul: newAlbumJudul.trim(),
      tahun: newAlbumTahun,
      sampulUrl: newAlbumSampul || 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=800&q=80',
      jumlahFoto: 0,
    });

    setAddAlbumModalOpen(false);
    setNewAlbumJudul('');
    setNotification('Album berhasil dibuat');
    setTimeout(() => setNotification(''), 3000);
  };

  const handleSaveNewMedia = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mediaValue.trim()) return;

    StorageManager.saveGalleryItem({
      id: `gi-${Date.now()}`,
      albumId: mediaAlbumId,
      tipe: mediaType,
      sumber: 'tautan',
      nilai: mediaValue.trim(),
      judul: mediaJudul.trim() || undefined,
      lokasi: mediaLokasi.trim() || undefined,
      orangTerlibatIds: [],
    });

    setAddMediaModalOpen(false);
    setMediaValue('');
    setMediaJudul('');
    setNotification('Dokumentasi berhasil diunggah');
    setTimeout(() => setNotification(''), 3000);
  };

  return (
    <div className="space-y-4 pb-20 sm:pb-8">
      {/* Top Header */}
      <div className="p-4 rounded-2xl bg-[#FFFFFF] border border-[#E9E4D8] shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-[#2F6B4F]/10 flex items-center justify-center text-[#2F6B4F]">
            <Sliders className="w-5 h-5 text-[#C9A24B]" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold font-heading text-[#2F6B4F]">
              Dasbor Super Admin
            </h2>
          </div>
        </div>
      </div>

      {notification && (
        <div className="p-3.5 rounded-xl bg-[#2F6B4F] text-[#FAF5EA] text-sm font-bold flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="w-5 h-5 text-[#C9A24B]" />
          <span>{notification}</span>
        </div>
      )}

      {/* Tabs Bar (Scrollable on small mobile) */}
      <div className="overflow-x-auto pb-1">
        <div className="inline-flex rounded-xl p-1 bg-[#FAF5EA] border border-[#E9E4D8] min-w-max">
          {[
            { id: 'ringkasan', label: 'Ringkasan' },
            { id: 'akun', label: 'Akun dan Kata Sandi' },
            { id: 'anggota', label: 'Data Anggota' },
            { id: 'impor', label: 'Impor Data Awal' },
            { id: 'dokumentasi', label: 'Dokumentasi' },
            { id: 'kegiatan', label: 'Kegiatan' },
            { id: 'cms', label: 'CMS' },
            { id: 'sinkronisasi', label: 'Sinkronisasi' },
            { id: 'log', label: 'Log Aktivitas' },
            { id: 'firebase', label: 'Penggunaan Firebase' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition ${
                activeTab === tab.id
                  ? 'bg-[#2F6B4F] text-[#FAF5EA] shadow-xs'
                  : 'text-[#2B2B26] hover:text-[#2F6B4F]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* TAB 1: RINGKASAN */}
      {activeTab === 'ringkasan' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="p-4 rounded-2xl bg-[#FFFFFF] border border-[#E9E4D8] shadow-2xs space-y-1">
              <span className="text-xs font-bold text-[#6B685B]">Total Anggota</span>
              <p className="text-2xl font-black text-[#2F6B4F]">{members.length}</p>
            </div>
            <div className="p-4 rounded-2xl bg-[#FFFFFF] border border-[#E9E4D8] shadow-2xs space-y-1">
              <span className="text-xs font-bold text-[#6B685B]">Total Album</span>
              <p className="text-2xl font-black text-[#C9A24B]">{albums.length}</p>
            </div>
            <div className="p-4 rounded-2xl bg-[#FFFFFF] border border-[#E9E4D8] shadow-2xs space-y-1">
              <span className="text-xs font-bold text-[#6B685B]">Total Berita</span>
              <p className="text-2xl font-black text-[#286090]">{news.length}</p>
            </div>
            <div className="p-4 rounded-2xl bg-[#FFFFFF] border border-[#E9E4D8] shadow-2xs space-y-1">
              <span className="text-xs font-bold text-[#6B685B]">Catatan Log</span>
              <p className="text-2xl font-black text-[#2B2B26]">{logs.length}</p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: AKUN DAN KATA SANDI */}
      {activeTab === 'akun' && (
        <div className="p-5 sm:p-6 rounded-2xl bg-[#FFFFFF] border border-[#E9E4D8] shadow-2xs space-y-5">
          <h3 className="font-heading font-bold text-lg text-[#2F6B4F]">
            Pengaturan Akun dan Izin
          </h3>

          <div className="p-4 rounded-xl bg-[#FAF5EA] border border-[#E9E4D8] space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-sm text-[#2B2B26]">
                  Hak Verifikasi Wakil Ketua
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setWakilBisaVerifikasi(!wakilBisaVerifikasi)}
                className={`w-12 h-6 rounded-full transition-colors relative ${
                  wakilBisaVerifikasi ? 'bg-[#2F6B4F]' : 'bg-[#E9E4D8]'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${
                    wakilBisaVerifikasi ? 'left-6.5' : 'left-0.5'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: DATA ANGGOTA */}
      {activeTab === 'anggota' && (
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-2xl bg-[#FFFFFF] border border-[#E9E4D8]">
            <input
              type="text"
              value={memberSearch}
              onChange={(e) => setMemberSearch(e.target.value)}
              placeholder="Cari anggota"
              className="px-3.5 py-2 rounded-xl border border-[#E9E4D8] text-sm grow max-w-sm"
            />

            <button
              type="button"
              onClick={handleExportCSV}
              className="px-4 py-2 rounded-xl bg-[#2F6B4F] text-[#FAF5EA] font-bold text-sm flex items-center justify-center gap-1.5"
            >
              <Download className="w-4 h-4" />
              <span>Ekspor CSV</span>
            </button>
          </div>

          <div className="p-4 rounded-2xl bg-[#FFFFFF] border border-[#E9E4D8] overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-[#E9E4D8] text-[#6B685B] font-bold">
                  <th className="py-2.5 pr-2">Kode</th>
                  <th className="py-2.5 px-2">Nama</th>
                  <th className="py-2.5 px-2">Cabang</th>
                  <th className="py-2.5 px-2">Generasi</th>
                  <th className="py-2.5 px-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E9E4D8]/60">
                {members
                  .filter((m) =>
                    memberSearch.trim()
                      ? m.nama.toLowerCase().includes(memberSearch.toLowerCase())
                      : true
                  )
                  .map((m) => (
                    <tr
                      key={m.id}
                      onClick={() => onSelectMember(m)}
                      className="cursor-pointer hover:bg-[#FAF5EA]/50"
                    >
                      <td className="py-2.5 pr-2 font-bold text-[#6B685B]">{m.kodeSilsilah}</td>
                      <td className="py-2.5 px-2 font-bold text-[#2B2B26]">{m.nama}</td>
                      <td className="py-2.5 px-2 font-semibold text-[#6B685B]">{m.cabang}</td>
                      <td className="py-2.5 px-2 font-semibold text-[#6B685B]">Gen {m.generasi}</td>
                      <td className="py-2.5 px-2">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                            m.statusVerifikasi === 'Terverifikasi'
                              ? 'bg-[#2F6B4F]/10 text-[#2F6B4F]'
                              : 'bg-[#D9822B]/10 text-[#D9822B]'
                          }`}
                        >
                          {m.statusVerifikasi}
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: IMPOR DATA AWAL */}
      {activeTab === 'impor' && (
        <div className="p-5 sm:p-6 rounded-2xl bg-[#FFFFFF] border border-[#E9E4D8] shadow-2xs space-y-4">
          <h3 className="font-heading font-bold text-lg text-[#2F6B4F]">
            Impor Data Awal
          </h3>

          {importSuccessMessage && (
            <div className="p-3.5 rounded-xl bg-[#2F6B4F] text-[#FAF5EA] text-sm font-bold flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-[#C9A24B]" />
              <span>{importSuccessMessage}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#2B2B26] block">
              Format CSV / Teks
            </label>
            <textarea
              value={importFileText}
              onChange={(e) => handleParseImport(e.target.value)}
              placeholder="NoAnggota,KodeSilsilah,Nama,JenisKelamin(L/P),Generasi,Cabang,Status(hidup/wafat),Domisili"
              rows={4}
              className="w-full px-3 py-2 rounded-xl border border-[#E9E4D8] font-mono text-xs"
            />
          </div>

          {duplicateNames.length > 0 && (
            <div className="p-3.5 rounded-xl bg-[#D9822B]/10 border border-[#D9822B]/30 text-xs text-[#D9822B] space-y-1">
              <span className="font-bold flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" />
                <span>Peringatan Nama Ganda:</span>
              </span>
              <p>{duplicateNames.join(', ')}</p>
            </div>
          )}

          {importPreviewData.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-bold text-sm text-[#2B2B26]">
                Pratinjau ({importPreviewData.length} Baris)
              </h4>
              <div className="max-h-48 overflow-y-auto border border-[#E9E4D8] rounded-xl p-2 text-xs space-y-1">
                {importPreviewData.map((row) => (
                  <div key={row.id} className="flex items-center justify-between py-1 border-b border-[#E9E4D8]/50">
                    <span className="font-bold text-[#2B2B26]">{row.nama}</span>
                    <span className="text-[#6B685B]">{row.cabang} • Gen {row.generasi}</span>
                  </div>
                ))}
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleExecuteImport}
                  className="px-5 py-2.5 rounded-xl bg-[#2F6B4F] text-[#FAF5EA] font-bold text-sm shadow-xs"
                >
                  Masukkan ke Aplikasi
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 5: DOKUMENTASI */}
      {activeTab === 'dokumentasi' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-[#FFFFFF] border border-[#E9E4D8] flex items-center justify-between">
            <h3 className="font-heading font-bold text-base text-[#2F6B4F]">
              Kelola Album dan Dokumentasi
            </h3>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setAddAlbumModalOpen(true)}
                className="px-3.5 py-1.5 rounded-xl bg-[#FAF5EA] border border-[#E9E4D8] hover:border-[#2F6B4F] text-xs font-bold text-[#2F6B4F]"
              >
                Buat Album
              </button>
              <button
                type="button"
                onClick={() => setAddMediaModalOpen(true)}
                className="px-3.5 py-1.5 rounded-xl bg-[#2F6B4F] text-[#FAF5EA] text-xs font-bold"
              >
                Unggah Media
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {albums.map((alb) => (
              <div key={alb.id} className="p-4 rounded-xl bg-[#FFFFFF] border border-[#E9E4D8] shadow-2xs space-y-2">
                <img src={alb.sampulUrl} alt="" className="w-full h-32 object-cover rounded-lg" />
                <h4 className="font-heading font-bold text-sm text-[#2B2B26]">{alb.judul}</h4>
                <p className="text-xs text-[#6B685B] font-semibold">{alb.tahun}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: KEGIATAN */}
      {activeTab === 'kegiatan' && (
        <div className="p-5 rounded-2xl bg-[#FFFFFF] border border-[#E9E4D8] shadow-2xs space-y-3">
          <h3 className="font-heading font-bold text-base text-[#2F6B4F]">
            Ringkasan Agenda Kegiatan
          </h3>
          <p className="text-xs text-[#6B685B]">
            Kelola agenda kegiatan melalui menu Kelola Informasi di header.
          </p>
        </div>
      )}

      {/* TAB 7: CMS (8 Sub-tabs) */}
      {activeTab === 'cms' && (
        <div className="space-y-4">
          <div className="overflow-x-auto pb-1">
            <div className="inline-flex rounded-xl p-1 bg-[#FAF5EA] border border-[#E9E4D8] min-w-max">
              {[
                { id: 'identitas', label: 'Identitas' },
                { id: 'tema', label: 'Tema' },
                { id: 'navigasi', label: 'Navigasi' },
                { id: 'banner', label: 'Banner dan Beranda' },
                { id: 'konten', label: 'Konten' },
                { id: 'fitur', label: 'Fitur' },
                { id: 'footer', label: 'Footer dan Kontak' },
                { id: 'simpan', label: 'Pratinjau dan Simpan' },
              ].map((st) => (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => setCmsSubTab(st.id as any)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    cmsSubTab === st.id
                      ? 'bg-[#2F6B4F] text-[#FAF5EA] shadow-xs'
                      : 'text-[#2B2B26] hover:text-[#2F6B4F]'
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>
          </div>

          <div className="p-5 sm:p-6 rounded-2xl bg-[#FFFFFF] border border-[#E9E4D8] shadow-2xs space-y-4">
            {cmsSubTab === 'identitas' && (
              <div className="space-y-3 text-sm">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#2B2B26] block">Nama Aplikasi</label>
                  <input
                    type="text"
                    value={cmsState.identitas.nama}
                    onChange={(e) =>
                      setCmsState({
                        ...cmsState,
                        identitas: { ...cmsState.identitas, nama: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-[#E9E4D8]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#2B2B26] block">Slogan</label>
                  <input
                    type="text"
                    value={cmsState.identitas.slogan}
                    onChange={(e) =>
                      setCmsState({
                        ...cmsState,
                        identitas: { ...cmsState.identitas, slogan: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-[#E9E4D8]"
                  />
                </div>
              </div>
            )}

            {cmsSubTab === 'tema' && (
              <div className="space-y-3 text-sm">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#2B2B26] block">Warna Utama</label>
                    <input
                      type="text"
                      value={cmsState.tema.primaryColor}
                      onChange={(e) =>
                        setCmsState({
                          ...cmsState,
                          tema: { ...cmsState.tema, primaryColor: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-[#E9E4D8]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#2B2B26] block">Warna Aksen</label>
                    <input
                      type="text"
                      value={cmsState.tema.accentColor}
                      onChange={(e) =>
                        setCmsState({
                          ...cmsState,
                          tema: { ...cmsState.tema, accentColor: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-[#E9E4D8]"
                    />
                  </div>
                </div>
              </div>
            )}

            {cmsSubTab === 'banner' && (
              <div className="space-y-3 text-sm">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#2B2B26] block">Judul Banner</label>
                  <input
                    type="text"
                    value={cmsState.banner.judul}
                    onChange={(e) =>
                      setCmsState({
                        ...cmsState,
                        banner: { ...cmsState.banner, judul: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-[#E9E4D8]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#2B2B26] block">Subjudul Banner</label>
                  <input
                    type="text"
                    value={cmsState.banner.subjudul}
                    onChange={(e) =>
                      setCmsState({
                        ...cmsState,
                        banner: { ...cmsState.banner, subjudul: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-[#E9E4D8]"
                  />
                </div>
                <ImageField
                  label="Gambar Banner"
                  value={cmsState.banner.gambarUrl}
                  sourceType={cmsState.banner.gambarType}
                  onChange={(val, srcType) =>
                    setCmsState({
                      ...cmsState,
                      banner: { ...cmsState.banner, gambarUrl: val, gambarType: srcType },
                    })
                  }
                />
              </div>
            )}

            {cmsSubTab === 'fitur' && (
              <div className="space-y-2 text-sm">
                {[
                  { id: 'arisan', label: 'Arisan' },
                  { id: 'khotmil', label: 'Khotmil Qur\'an' },
                  { id: 'galeri', label: 'Galeri' },
                  { id: 'kepengurusan', label: 'Kepengurusan' },
                  { id: 'usulan', label: 'Usulan Data' },
                ].map((f) => (
                  <div key={f.id} className="flex items-center justify-between p-2.5 rounded-xl border border-[#E9E4D8]">
                    <span className="font-bold text-[#2B2B26]">{f.label}</span>
                    <button
                      type="button"
                      onClick={() =>
                        setCmsState({
                          ...cmsState,
                          fitur: { ...cmsState.fitur, [f.id]: !(cmsState.fitur as any)[f.id] },
                        })
                      }
                      className={`w-10 h-5 rounded-full relative transition ${
                        (cmsState.fitur as any)[f.id] ? 'bg-[#2F6B4F]' : 'bg-[#E9E4D8]'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-transform ${
                          (cmsState.fitur as any)[f.id] ? 'left-5.5' : 'left-0.5'
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {cmsSubTab === 'simpan' && (
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={handleResetCMS}
                  className="px-4 py-2 rounded-xl border border-[#B3402F] text-[#B3402F] font-bold text-sm"
                >
                  Pulihkan Bawaan
                </button>
                <button
                  type="button"
                  onClick={handleSaveCMS}
                  className="px-6 py-2.5 rounded-xl bg-[#2F6B4F] text-[#FAF5EA] font-bold text-sm"
                >
                  Simpan Pengaturan
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 8: SINKRONISASI (Strict compliance: only code box, copy button, inputs, status badge, sync buttons) */}
      {activeTab === 'sinkronisasi' && (
        <div className="space-y-4">
          {/* Code box */}
          <div className="p-4 rounded-2xl bg-[#FFFFFF] border border-[#E9E4D8] shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#6B685B] uppercase tracking-wider">
                Kode Google Apps Script
              </span>
              <button
                type="button"
                onClick={handleCopyAppsScript}
                className="px-3.5 py-1.5 rounded-xl bg-[#2F6B4F] text-[#FAF5EA] hover:bg-[#1E4734] transition text-xs font-bold flex items-center gap-1.5"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCode ? 'Disalin' : 'Salin Kode'}</span>
              </button>
            </div>
            <pre className="p-3 bg-[#FAF5EA] rounded-xl text-xs font-mono text-[#2B2B26] overflow-x-auto max-h-56 border border-[#E9E4D8]">
              {googleAppsScriptTemplate}
            </pre>
          </div>

          {/* Configuration Form */}
          <form onSubmit={handleSaveSync} className="p-5 rounded-2xl bg-[#FFFFFF] border border-[#E9E4D8] shadow-2xs space-y-4 text-sm">
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#2B2B26] block">URL Web App</label>
              <input
                type="url"
                value={syncState.webAppUrl}
                onChange={(e) => setSyncState({ ...syncState, webAppUrl: e.target.value })}
                placeholder="https://script.google.com/macros/s/..."
                className="w-full px-3 py-2 rounded-xl border border-[#E9E4D8]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-[#2B2B26] block">Token</label>
              <input
                type="password"
                value={syncState.token}
                onChange={(e) => setSyncState({ ...syncState, token: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-[#E9E4D8]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#2B2B26] block">ID Folder Drive</label>
                <input
                  type="text"
                  value={syncState.driveFolderId}
                  onChange={(e) => setSyncState({ ...syncState, driveFolderId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#E9E4D8]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#2B2B26] block">ID Spreadsheet</label>
                <input
                  type="text"
                  value={syncState.spreadsheetId}
                  onChange={(e) => setSyncState({ ...syncState, spreadsheetId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#E9E4D8]"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleTestConnection}
                  disabled={isTestingSync}
                  className="px-4 py-2 rounded-xl border border-[#2F6B4F] text-[#2F6B4F] hover:bg-[#2F6B4F]/5 text-xs font-bold"
                >
                  {isTestingSync ? 'Memeriksa...' : 'Uji Koneksi'}
                </button>
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                    syncState.statusKoneksi === 'Terhubung'
                      ? 'bg-[#2F6B4F]/10 text-[#2F6B4F]'
                      : syncState.statusKoneksi === 'Gagal'
                      ? 'bg-[#B3402F]/10 text-[#B3402F]'
                      : 'bg-[#6B685B]/10 text-[#6B685B]'
                  }`}
                >
                  {syncState.statusKoneksi}
                </span>
              </div>

              <button
                type="submit"
                className="px-6 py-2 rounded-xl bg-[#2F6B4F] text-[#FAF5EA] font-bold text-xs sm:text-sm"
              >
                Simpan
              </button>
            </div>
          </form>

          {/* Backup Collections */}
          <div className="p-5 rounded-2xl bg-[#FFFFFF] border border-[#E9E4D8] shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-sm text-[#2B2B26]">
                Cadangan Koleksi
              </h4>
              <span className="text-xs text-[#6B685B]">
                Terakhir: {lastSyncTime}
              </span>
            </div>

            <div className="divide-y divide-[#E9E4D8]">
              {['Anggota', 'Riwayat Perubahan', 'Usulan', 'Arisan', 'Khotmil Qur\'an'].map(
                (col) => (
                  <div key={col} className="py-2.5 flex items-center justify-between text-xs sm:text-sm">
                    <span className="font-semibold text-[#2B2B26]">{col}</span>
                    <button
                      type="button"
                      onClick={() => handleSyncCollection(col)}
                      className="px-3.5 py-1 rounded-lg border border-[#2F6B4F] text-[#2F6B4F] hover:bg-[#2F6B4F]/5 font-bold text-xs"
                    >
                      Sinkronkan
                    </button>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 9: LOG AKTIVITAS */}
      {activeTab === 'log' && (
        <div className="p-4 rounded-2xl bg-[#FFFFFF] border border-[#E9E4D8] shadow-2xs space-y-2">
          {logs.map((l) => (
            <div key={l.id} className="p-3 rounded-xl bg-[#FAF5EA]/50 border border-[#E9E4D8] text-xs flex justify-between">
              <div>
                <span className="font-bold text-[#2F6B4F]">{l.peran}:</span>{' '}
                <span className="text-[#2B2B26]">{l.aksi}</span>
              </div>
              <span className="text-[#6B685B]">{l.tanggal}</span>
            </div>
          ))}
        </div>
      )}

      {/* TAB 10: PENGGUNAAN FIREBASE */}
      {activeTab === 'firebase' && (
        <div className="p-5 sm:p-6 rounded-2xl bg-[#FFFFFF] border border-[#E9E4D8] shadow-2xs space-y-5">
          <h3 className="font-heading font-bold text-lg text-[#2F6B4F]">
            Penggunaan Kuota Firebase
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-[#E9E4D8] bg-[#FAF5EA]/30 space-y-2">
              <div className="flex justify-between text-xs font-bold text-[#2B2B26]">
                <span>Operasi Baca (Read)</span>
                <span>1.420 / 50.000 per hari (2.8%)</span>
              </div>
              <div className="w-full h-3 rounded-full bg-[#E9E4D8] overflow-hidden">
                <div className="h-full bg-[#2F6B4F] rounded-full" style={{ width: '2.8%' }} />
              </div>
            </div>

            <div className="p-4 rounded-xl border border-[#E9E4D8] bg-[#FAF5EA]/30 space-y-2">
              <div className="flex justify-between text-xs font-bold text-[#2B2B26]">
                <span>Operasi Tulis (Write)</span>
                <span>310 / 20.000 per hari (1.5%)</span>
              </div>
              <div className="w-full h-3 rounded-full bg-[#E9E4D8] overflow-hidden">
                <div className="h-full bg-[#2F6B4F] rounded-full" style={{ width: '1.5%' }} />
              </div>
            </div>

            <div className="p-4 rounded-xl border border-[#E9E4D8] bg-[#FAF5EA]/30 space-y-2">
              <div className="flex justify-between text-xs font-bold text-[#2B2B26]">
                <span>Operasi Hapus (Delete)</span>
                <span>0 / 20.000 per hari (0%)</span>
              </div>
              <div className="w-full h-3 rounded-full bg-[#E9E4D8] overflow-hidden">
                <div className="h-full bg-[#2F6B4F] rounded-full" style={{ width: '0%' }} />
              </div>
            </div>

            <div className="p-4 rounded-xl border border-[#E9E4D8] bg-[#FAF5EA]/30 space-y-2">
              <div className="flex justify-between text-xs font-bold text-[#2B2B26]">
                <span>Penyimpanan Firestore</span>
                <span>4.2 MB / 1.000 MB (0.4%)</span>
              </div>
              <div className="w-full h-3 rounded-full bg-[#E9E4D8] overflow-hidden">
                <div className="h-full bg-[#2F6B4F] rounded-full" style={{ width: '0.4%' }} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Album Modal */}
      <Modal
        isOpen={addAlbumModalOpen}
        onClose={() => setAddAlbumModalOpen(false)}
        title="Buat Album Baru"
        footer={
          <div className="flex items-center justify-end gap-2 w-full">
            <button
              type="button"
              onClick={() => setAddAlbumModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-[#E9E4D8] text-sm font-semibold"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleSaveNewAlbum}
              className="px-5 py-2 rounded-xl bg-[#2F6B4F] text-[#FAF5EA] font-bold text-sm"
            >
              Simpan Album
            </button>
          </div>
        }
      >
        <form onSubmit={handleSaveNewAlbum} className="space-y-3 text-sm">
          <div className="space-y-1">
            <label className="text-xs font-bold text-[#2B2B26] block">Judul Album</label>
            <input
              type="text"
              value={newAlbumJudul}
              onChange={(e) => setNewAlbumJudul(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-[#E9E4D8]"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-[#2B2B26] block">Tahun</label>
            <input
              type="number"
              value={newAlbumTahun}
              onChange={(e) => setNewAlbumTahun(parseInt(e.target.value, 10))}
              className="w-full px-3 py-2 rounded-xl border border-[#E9E4D8]"
            />
          </div>
          <ImageField
            label="Sampul Album"
            value={newAlbumSampul}
            onChange={(val) => setNewAlbumSampul(val)}
          />
        </form>
      </Modal>

      {/* Add Media Modal */}
      <Modal
        isOpen={addMediaModalOpen}
        onClose={() => setAddMediaModalOpen(false)}
        title="Unggah Media"
        footer={
          <div className="flex items-center justify-end gap-2 w-full">
            <button
              type="button"
              onClick={() => setAddMediaModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-[#E9E4D8] text-sm font-semibold"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleSaveNewMedia}
              className="px-5 py-2 rounded-xl bg-[#2F6B4F] text-[#FAF5EA] font-bold text-sm"
            >
              Simpan Media
            </button>
          </div>
        }
      >
        <form onSubmit={handleSaveNewMedia} className="space-y-3 text-sm">
          <div className="space-y-1">
            <label className="text-xs font-bold text-[#2B2B26] block">Pilih Album</label>
            <select
              value={mediaAlbumId}
              onChange={(e) => setMediaAlbumId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-[#E9E4D8]"
            >
              {albums.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.judul}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-[#2B2B26] block">Tipe Media</label>
            <select
              value={mediaType}
              onChange={(e) => setMediaType(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl border border-[#E9E4D8]"
            >
              <option value="foto">Foto</option>
              <option value="video">Video</option>
            </select>
          </div>

          {mediaType === 'foto' ? (
            <ImageField
              label="Foto"
              value={mediaValue}
              onChange={(val) => setMediaValue(val)}
            />
          ) : (
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#2B2B26] block">Tautan Video</label>
              <input
                type="url"
                value={mediaValue}
                onChange={(e) => setMediaValue(e.target.value)}
                placeholder="https://youtube.com/..."
                className="w-full px-3 py-2 rounded-xl border border-[#E9E4D8]"
              />
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-bold text-[#2B2B26] block">Judul (Opsional)</label>
            <input
              type="text"
              value={mediaJudul}
              onChange={(e) => setMediaJudul(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-[#E9E4D8]"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-[#2B2B26] block">Lokasi (Opsional)</label>
            <input
              type="text"
              value={mediaLokasi}
              onChange={(e) => setMediaLokasi(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-[#E9E4D8]"
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};
