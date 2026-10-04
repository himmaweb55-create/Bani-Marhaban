export type Role =
  | 'anggota'
  | 'sesepuh'
  | 'ketua'
  | 'wakil_ketua'
  | 'sekretaris'
  | 'pengelola_arisan'
  | 'admin_khotmil'
  | 'super_admin';

export type StatusVerifikasi = 'Terverifikasi' | 'Perlu Konfirmasi' | 'Usulan Perubahan';

export interface Anggota {
  id: string;
  kodeSilsilah: string;
  nomorAnggota: string;
  nama: string;
  jenisKelamin: 'L' | 'P';
  tahunLahir?: number;
  tanggalLahir?: string;
  usia?: number;
  statusHidup: 'hidup' | 'wafat';
  tanggalWafat?: string;
  ayahId?: string;
  ibuId?: string;
  pasanganIds: string[];
  cabang: string;
  generasi: number;
  domisili?: string;
  catatan?: string;
  sumber?: string;
  statusVerifikasi: StatusVerifikasi;
  diarsipkan: boolean;
  fotoUrl?: string;
  fotoType?: 'tautan' | 'drive';
}

export interface Usulan {
  id: string;
  jenis: 'Koreksi Data' | 'Tambah Anggota' | 'Konfirmasi Data' | 'Tambah Cerita atau Informasi';
  anggotaId?: string;
  anggotaNama?: string;
  isiUsulan: string;
  dataUsulan?: Partial<Anggota>;
  namaPengusul: string;
  kontakPengusul?: string;
  status: 'Menunggu' | 'Disetujui' | 'Ditolak';
  alasanPenolakan?: string;
  tanggal: string;
  konfirmasiSesepuh?: { sesepuhNama: string; catatan: string; tanggal: string }[];
}

export interface RiwayatPerubahan {
  id: string;
  targetType: 'anggota' | 'silsilah' | 'kegiatan';
  targetId: string;
  targetNama: string;
  kolomDiubah: string;
  nilaiSebelum: string;
  nilaiSesudah: string;
  pengusul: string;
  pemverifikasi: string;
  tanggal: string;
}

export interface ArisanPeriode {
  id: string;
  nama: string;
  nominalIuran: number;
  jumlahPutaran: number;
  status: 'Aktif' | 'Selesai';
  tanggalMulai: string;
  jadwalPertemuan?: string;
  lokasiPertemuan?: string;
  albumTertautId?: string;
}

export interface ArisanPeserta {
  id: string;
  periodeId: string;
  anggotaId: string;
  nama: string;
  nomorUndian: number;
  sudahDapat: boolean;
  putaranDapat?: number;
}

export interface ArisanPutaran {
  id: string;
  periodeId: string;
  putaranKe: number;
  tanggalUndian: string;
  penerimaAnggotaId: string;
  penerimaNama: string;
  tautanVideo?: string;
  fotoUrl?: string;
  fotoType?: 'tautan' | 'drive';
  catatan?: string;
}

export interface ArisanPembayaran {
  id: string;
  periodeId: string;
  putaranKe: number;
  pesertaId: string;
  status: 'Lunas' | 'Belum';
  tanggalBayar?: string;
  nominal: number;
}

export interface KhotmilPeriode {
  id: string;
  nama: string;
  tanggalMulai: string;
  tanggalSelesai?: string;
  status: 'Aktif' | 'Selesai';
}

export interface KhotmilJuz {
  id: string;
  periodeId: string;
  juzNomor: number;
  anggotaId?: string;
  anggotaNama?: string;
  status: 'Belum' | 'Kholas';
  tanggalLapor?: string;
  catatan?: string;
}

export interface Kegiatan {
  id: string;
  judul: string;
  jenis: string;
  tanggal: string;
  lokasi: string;
  deskripsi: string;
  status: 'Rencana' | 'Berjalan' | 'Selesai';
  ringkasanHasil?: string;
  albumTertautId?: string;
}

export interface JenisKegiatan {
  id: string;
  nama: string;
  ikon: string;
}

export interface SejarahBab {
  id: string;
  babNomor: number;
  judulBab: string;
  isi: string;
  statusVerifikasi: 'Terverifikasi' | 'Belum Terverifikasi';
}

export interface TimelineEntry {
  id: string;
  tahun: number;
  tanggal?: string;
  judul: string;
  deskripsi: string;
  anggotaTertautId?: string;
  kegiatanTertautId?: string;
  statusVerifikasi: 'Terverifikasi' | 'Belum Terverifikasi';
}

export interface Album {
  id: string;
  judul: string;
  tahun: number;
  kegiatanId?: string;
  sampulUrl?: string;
  sampulType?: 'tautan' | 'drive';
  jumlahFoto: number;
}

export interface GaleriItem {
  id: string;
  albumId: string;
  tipe: 'foto' | 'video';
  sumber: 'tautan' | 'drive';
  nilai: string;
  judul?: string;
  kegiatan?: string;
  tanggal?: string;
  lokasi?: string;
  keterangan?: string;
  orangTerlibatIds: string[];
  cabang?: string;
}

export interface SusunanPengurus {
  jabatan: string;
  anggotaId: string;
  anggotaNama: string;
  urutan: number;
}

export interface KepengurusanPeriode {
  id: string;
  periode: string;
  aktif: boolean;
  susunan: SusunanPengurus[];
}

export interface Berita {
  id: string;
  judul: string;
  tanggal: string;
  isi: string;
  penulis: string;
  tersemat: boolean;
}

export interface NavItemConfig {
  id: string;
  label: string;
  visible: boolean;
  order: number;
}

export interface CMSConfig {
  identitas: {
    nama: string;
    slogan: string;
    logoUrl: string;
    logoType: 'tautan' | 'drive';
    faviconUrl: string;
    metaDescription: string;
  };
  tema: {
    primaryColor: string;
    accentColor: string;
    bgColor: string;
    fontFamily: string;
  };
  navigasi: NavItemConfig[];
  banner: {
    judul: string;
    subjudul: string;
    gambarUrl: string;
    gambarType: 'tautan' | 'drive';
    tombolLabel: string;
    tampil: boolean;
  };
  konten: {
    salamBeranda: string;
    pengumumanBerandaTampil: boolean;
    ringkasanSilsilahTampil: boolean;
  };
  fitur: {
    arisan: boolean;
    khotmil: boolean;
    galeri: boolean;
    kepengurusan: boolean;
    usulan: boolean;
  };
  footer: {
    teks: string;
    kontak: string;
  };
  wakilKetuaBisaVerifikasi: boolean;
}

export interface SinkronisasiConfig {
  webAppUrl: string;
  token: string;
  driveFolderId: string;
  spreadsheetId: string;
  statusKoneksi: 'Belum Terhubung' | 'Terhubung' | 'Gagal';
  terakhirSinkron?: string;
}

export interface LogAktivitas {
  id: string;
  peran: string;
  aksi: string;
  tanggal: string;
}
