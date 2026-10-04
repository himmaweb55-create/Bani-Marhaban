import {
  Anggota,
  Usulan,
  RiwayatPerubahan,
  ArisanPeriode,
  ArisanPeserta,
  ArisanPutaran,
  ArisanPembayaran,
  KhotmilPeriode,
  KhotmilJuz,
  Kegiatan,
  JenisKegiatan,
  SejarahBab,
  TimelineEntry,
  Album,
  GaleriItem,
  KepengurusanPeriode,
  Berita,
  CMSConfig,
  SinkronisasiConfig,
  LogAktivitas,
  Role,
} from '../types';
import {
  initialMembers,
  initialProposals,
  initialHistory,
  initialArisanPeriod,
  initialArisanParticipants,
  initialArisanRounds,
  initialArisanPayments,
  initialKhotmilPeriod,
  initialKhotmilJuz,
  initialActivityTypes,
  initialActivities,
  initialAlbums,
  initialGalleryItems,
  initialHistoryChapters,
  initialTimelineEntries,
  initialOrganization,
  initialNews,
  initialCMSConfig,
  initialSyncConfig,
  initialLogs,
} from '../data/seedData';
import { db } from './firebase';
import {
  collection,
  doc,
  setDoc,
  getDocs,
  onSnapshot,
} from 'firebase/firestore';

const SALT = 'BANI_MARHABAN_2026_SALT_SECURE';

export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + SALT);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

const DEFAULT_PASSWORDS: Record<Role, string> = {
  anggota: 'anggota123',
  sesepuh: 'sesepuh123',
  ketua: 'ketua123',
  wakil_ketua: 'wakilketua123',
  sekretaris: 'sekretaris123',
  pengelola_arisan: 'pengelolaarisan123',
  admin_khotmil: 'adminkhotmil123',
  super_admin: 'superadmin123',
};

type Listener = () => void;
const listeners = new Set<Listener>();

export function subscribeToStore(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function notifyListeners() {
  listeners.forEach((l) => l());
}

function getStoredItem<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(`bm_${key}`);
    if (!raw) return defaultValue;
    return JSON.parse(raw);
  } catch {
    return defaultValue;
  }
}

function setStoredItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(`bm_${key}`, JSON.stringify(value));
    notifyListeners();
  } catch (e) {
    console.error(`Error saving ${key}:`, e);
  }
}

// Firestore Background Synchronization
let isFirestoreInitialized = false;

function initFirestoreSync() {
  if (isFirestoreInitialized || typeof window === 'undefined') return;
  isFirestoreInitialized = true;

  try {
    // Sync Members
    const membersCol = collection(db, 'anggota');
    onSnapshot(
      membersCol,
      (snapshot) => {
        if (!snapshot.empty) {
          const remoteMembers: Anggota[] = [];
          snapshot.forEach((d) => remoteMembers.push(d.data() as Anggota));
          if (remoteMembers.length > 0) {
            setStoredItem('members', remoteMembers);
          }
        } else {
          // Seed to firestore if remote is empty
          initialMembers.forEach((m) => {
            setDoc(doc(db, 'anggota', m.id), m).catch(() => {});
          });
        }
      },
      () => {
        // Silently handle offline
      }
    );

    // Sync Proposals
    const proposalsCol = collection(db, 'usulan');
    onSnapshot(
      proposalsCol,
      (snapshot) => {
        if (!snapshot.empty) {
          const list: Usulan[] = [];
          snapshot.forEach((d) => list.push(d.data() as Usulan));
          setStoredItem('proposals', list);
        }
      },
      () => {}
    );

    // Sync History
    const historyCol = collection(db, 'riwayatPerubahan');
    onSnapshot(
      historyCol,
      (snapshot) => {
        if (!snapshot.empty) {
          const list: RiwayatPerubahan[] = [];
          snapshot.forEach((d) => list.push(d.data() as RiwayatPerubahan));
          setStoredItem('history', list);
        }
      },
      () => {}
    );
  } catch (err) {
    console.error('Firestore init error:', err);
  }
}

// Start Firestore Sync in background
initFirestoreSync();

export class StorageManager {
  static async initDefaults() {
    if (!localStorage.getItem('bm_passwords_initialized')) {
      const hashes: Record<string, string> = {};
      for (const [role, pass] of Object.entries(DEFAULT_PASSWORDS)) {
        hashes[role] = await hashPassword(pass);
      }
      localStorage.setItem('bm_passwords', JSON.stringify(hashes));
      localStorage.setItem('bm_passwords_initialized', 'true');
    }
  }

  // Auth
  static async verifyPassword(plainText: string): Promise<Role | null> {
    await this.initDefaults();
    const hashes = getStoredItem<Record<string, string>>('passwords', {});
    const inputHash = await hashPassword(plainText);

    for (const [role, storedHash] of Object.entries(hashes)) {
      if (storedHash === inputHash) {
        return role as Role;
      }
    }
    return null;
  }

  static async changePassword(role: Role, newPassword: string): Promise<boolean> {
    await this.initDefaults();
    const hashes = getStoredItem<Record<string, string>>('passwords', {});
    hashes[role] = await hashPassword(newPassword);
    setStoredItem('passwords', hashes);
    this.addLog(role, `Kata sandi diubah`);

    // Sync to firestore settings
    setDoc(doc(db, 'pengaturan', 'passwords'), { hashes }).catch(() => {});
    return true;
  }

  // Members
  static getMembers(): Anggota[] {
    return getStoredItem<Anggota[]>('members', initialMembers);
  }

  static saveMember(member: Anggota, operatorRole: string = 'Pengurus'): void {
    const members = this.getMembers();
    const existingIndex = members.findIndex((m) => m.id === member.id);
    if (existingIndex >= 0) {
      const old = members[existingIndex];
      members[existingIndex] = member;
      this.addHistory({
        id: `rh-${Date.now()}`,
        targetType: 'anggota',
        targetId: member.id,
        targetNama: member.nama,
        kolomDiubah: 'Pembaruan Data Anggota',
        nilaiSebelum: old.nama,
        nilaiSesudah: member.nama,
        pengusul: operatorRole,
        pemverifikasi: operatorRole,
        tanggal: new Date().toISOString().split('T')[0],
      });
    } else {
      members.push(member);
      this.addHistory({
        id: `rh-${Date.now()}`,
        targetType: 'anggota',
        targetId: member.id,
        targetNama: member.nama,
        kolomDiubah: 'Penambahan Anggota Baru',
        nilaiSebelum: '-',
        nilaiSesudah: member.nama,
        pengusul: operatorRole,
        pemverifikasi: operatorRole,
        tanggal: new Date().toISOString().split('T')[0],
      });
    }
    setStoredItem('members', members);
    this.addLog(operatorRole, `Simpan anggota: ${member.nama}`);

    // Firestore sync
    setDoc(doc(db, 'anggota', member.id), member).catch(() => {});
  }

  static archiveMember(id: string, operatorRole: string = 'Pengurus'): void {
    const members = this.getMembers();
    const member = members.find((m) => m.id === id);
    if (member) {
      member.diarsipkan = true;
      setStoredItem('members', members);
      this.addHistory({
        id: `rh-${Date.now()}`,
        targetType: 'anggota',
        targetId: member.id,
        targetNama: member.nama,
        kolomDiubah: 'Status Arsip',
        nilaiSebelum: 'Aktif',
        nilaiSesudah: 'Diarsipkan',
        pengusul: operatorRole,
        pemverifikasi: operatorRole,
        tanggal: new Date().toISOString().split('T')[0],
      });
      this.addLog(operatorRole, `Arsipkan anggota: ${member.nama}`);

      // Firestore sync
      setDoc(doc(db, 'anggota', member.id), member).catch(() => {});
    }
  }

  static restoreMember(id: string, operatorRole: string = 'Pengurus'): void {
    const members = this.getMembers();
    const member = members.find((m) => m.id === id);
    if (member) {
      member.diarsipkan = false;
      setStoredItem('members', members);
      this.addHistory({
        id: `rh-${Date.now()}`,
        targetType: 'anggota',
        targetId: member.id,
        targetNama: member.nama,
        kolomDiubah: 'Status Arsip',
        nilaiSebelum: 'Diarsipkan',
        nilaiSesudah: 'Aktif',
        pengusul: operatorRole,
        pemverifikasi: operatorRole,
        tanggal: new Date().toISOString().split('T')[0],
      });
      this.addLog(operatorRole, `Pulihkan anggota: ${member.nama}`);

      // Firestore sync
      setDoc(doc(db, 'anggota', member.id), member).catch(() => {});
    }
  }

  // Proposals
  static getProposals(): Usulan[] {
    return getStoredItem<Usulan[]>('proposals', initialProposals);
  }

  static saveProposal(proposal: Usulan): void {
    const list = this.getProposals();
    const idx = list.findIndex((u) => u.id === proposal.id);
    if (idx >= 0) {
      list[idx] = proposal;
    } else {
      list.unshift(proposal);
    }
    setStoredItem('proposals', list);
    this.addLog('Anggota', `Kirim usulan: ${proposal.jenis}`);

    // Firestore sync
    setDoc(doc(db, 'usulan', proposal.id), proposal).catch(() => {});
  }

  static addSesepuhConfirmation(proposalId: string, sesepuhNama: string, catatan: string): void {
    const list = this.getProposals();
    const prop = list.find((p) => p.id === proposalId);
    if (prop) {
      if (!prop.konfirmasiSesepuh) prop.konfirmasiSesepuh = [];
      prop.konfirmasiSesepuh.push({
        sesepuhNama,
        catatan,
        tanggal: new Date().toISOString().split('T')[0],
      });
      setStoredItem('proposals', list);
      this.addLog('Sesepuh', `Konfirmasi usulan: ${prop.id}`);

      // Firestore sync
      setDoc(doc(db, 'usulan', prop.id), prop).catch(() => {});
    }
  }

  static approveProposal(proposalId: string, verifierRole: string): void {
    const list = this.getProposals();
    const prop = list.find((p) => p.id === proposalId);
    if (!prop) return;

    prop.status = 'Disetujui';

    // Apply changes to main data
    if (prop.jenis === 'Koreksi Data' && prop.anggotaId && prop.dataUsulan) {
      const members = this.getMembers();
      const mIdx = members.findIndex((m) => m.id === prop.anggotaId);
      if (mIdx >= 0) {
        members[mIdx] = {
          ...members[mIdx],
          ...prop.dataUsulan,
          statusVerifikasi: 'Terverifikasi',
        };
        setStoredItem('members', members);
        setDoc(doc(db, 'anggota', members[mIdx].id), members[mIdx]).catch(() => {});

        this.addHistory({
          id: `rh-${Date.now()}`,
          targetType: 'anggota',
          targetId: members[mIdx].id,
          targetNama: members[mIdx].nama,
          kolomDiubah: 'Persetujuan Koreksi Data',
          nilaiSebelum: 'Usulan Masuk',
          nilaiSesudah: 'Terverifikasi',
          pengusul: prop.namaPengusul,
          pemverifikasi: verifierRole,
          tanggal: new Date().toISOString().split('T')[0],
        });
      }
    } else if (prop.jenis === 'Tambah Anggota' && prop.dataUsulan) {
      const members = this.getMembers();
      const newId = `m-${Date.now()}`;
      const newMember: Anggota = {
        id: newId,
        kodeSilsilah: `BM.${prop.dataUsulan.generasi || 4}.${members.length + 1}`,
        nomorAnggota: `BM-${String(members.length + 1).padStart(3, '0')}`,
        nama: prop.dataUsulan.nama || 'Anggota Baru',
        jenisKelamin: prop.dataUsulan.jenisKelamin || 'L',
        tahunLahir: prop.dataUsulan.tahunLahir,
        statusHidup: 'hidup',
        pasanganIds: [],
        cabang: prop.dataUsulan.cabang || 'Cabang H. Abdullah',
        generasi: prop.dataUsulan.generasi || 4,
        domisili: prop.dataUsulan.domisili || '',
        catatan: prop.isiUsulan,
        sumber: `Usulan dari ${prop.namaPengusul}`,
        statusVerifikasi: 'Terverifikasi',
        diarsipkan: false,
      };
      members.push(newMember);
      setStoredItem('members', members);
      setDoc(doc(db, 'anggota', newId), newMember).catch(() => {});

      this.addHistory({
        id: `rh-${Date.now()}`,
        targetType: 'anggota',
        targetId: newId,
        targetNama: newMember.nama,
        kolomDiubah: 'Penerimaan Anggota Baru',
        nilaiSebelum: '-',
        nilaiSesudah: newMember.nama,
        pengusul: prop.namaPengusul,
        pemverifikasi: verifierRole,
        tanggal: new Date().toISOString().split('T')[0],
      });
    }

    setStoredItem('proposals', list);
    setDoc(doc(db, 'usulan', prop.id), prop).catch(() => {});
    this.addLog(verifierRole, `Setujui usulan: ${prop.id}`);
  }

  static rejectProposal(proposalId: string, alasan: string, verifierRole: string): void {
    const list = this.getProposals();
    const prop = list.find((p) => p.id === proposalId);
    if (!prop) return;

    prop.status = 'Ditolak';
    prop.alasanPenolakan = alasan;
    setStoredItem('proposals', list);
    setDoc(doc(db, 'usulan', prop.id), prop).catch(() => {});
    this.addLog(verifierRole, `Tolak usulan: ${prop.id}`);
  }

  // History (Immutable - never deleted)
  static getHistory(): RiwayatPerubahan[] {
    return getStoredItem<RiwayatPerubahan[]>('history', initialHistory);
  }

  static addHistory(record: RiwayatPerubahan): void {
    const list = this.getHistory();
    list.unshift(record);
    setStoredItem('history', list);
    setDoc(doc(db, 'riwayatPerubahan', record.id), record).catch(() => {});
  }

  // Arisan
  static getArisanPeriod(): ArisanPeriode {
    return getStoredItem<ArisanPeriode>('arisan_period', initialArisanPeriod);
  }

  static saveArisanPeriod(period: ArisanPeriode): void {
    setStoredItem('arisan_period', period);
    setDoc(doc(db, 'arisanPeriode', period.id), period).catch(() => {});
  }

  static getArisanParticipants(): ArisanPeserta[] {
    return getStoredItem<ArisanPeserta[]>('arisan_participants', initialArisanParticipants);
  }

  static saveArisanParticipants(list: ArisanPeserta[]): void {
    setStoredItem('arisan_participants', list);
  }

  static getArisanRounds(): ArisanPutaran[] {
    return getStoredItem<ArisanPutaran[]>('arisan_rounds', initialArisanRounds);
  }

  static saveArisanRound(round: ArisanPutaran): void {
    const list = this.getArisanRounds();
    const idx = list.findIndex((r) => r.id === round.id || r.putaranKe === round.putaranKe);
    if (idx >= 0) {
      list[idx] = round;
    } else {
      list.push(round);
    }
    setStoredItem('arisan_rounds', list);
    setDoc(doc(db, 'arisanPutaran', round.id), round).catch(() => {});

    // Update participant status
    const participants = this.getArisanParticipants();
    const p = participants.find((pt) => pt.anggotaId === round.penerimaAnggotaId);
    if (p) {
      p.sudahDapat = true;
      p.putaranDapat = round.putaranKe;
      this.saveArisanParticipants(participants);
    }
  }

  static getArisanPayments(): ArisanPembayaran[] {
    return getStoredItem<ArisanPembayaran[]>('arisan_payments', initialArisanPayments);
  }

  static saveArisanPayment(payment: ArisanPembayaran): void {
    const list = this.getArisanPayments();
    const idx = list.findIndex((p) => p.id === payment.id);
    if (idx >= 0) {
      list[idx] = payment;
    } else {
      list.push(payment);
    }
    setStoredItem('arisan_payments', list);
    setDoc(doc(db, 'arisanPembayaran', payment.id), payment).catch(() => {});
  }

  // Khotmil
  static getKhotmilPeriod(): KhotmilPeriode {
    return getStoredItem<KhotmilPeriode>('khotmil_period', initialKhotmilPeriod);
  }

  static saveKhotmilPeriod(period: KhotmilPeriode): void {
    setStoredItem('khotmil_period', period);
    setDoc(doc(db, 'khotmilPeriode', period.id), period).catch(() => {});
  }

  static getKhotmilJuz(): KhotmilJuz[] {
    return getStoredItem<KhotmilJuz[]>('khotmil_juz', initialKhotmilJuz);
  }

  static saveKhotmilJuzList(list: KhotmilJuz[]): void {
    setStoredItem('khotmil_juz', list);
  }

  static updateKhotmilJuz(juzId: string, status: 'Belum' | 'Kholas', tanggalLapor?: string): void {
    const list = this.getKhotmilJuz();
    const juz = list.find((j) => j.id === juzId);
    if (juz) {
      juz.status = status;
      juz.tanggalLapor = status === 'Kholas' ? (tanggalLapor || new Date().toISOString().split('T')[0]) : undefined;
      setStoredItem('khotmil_juz', list);
      setDoc(doc(db, 'khotmilJuz', juz.id), juz).catch(() => {});
    }
  }

  // Activities & Types
  static getActivities(): Kegiatan[] {
    return getStoredItem<Kegiatan[]>('activities', initialActivities);
  }

  static saveActivity(activity: Kegiatan): void {
    const list = this.getActivities();
    const idx = list.findIndex((a) => a.id === activity.id);
    if (idx >= 0) {
      list[idx] = activity;
    } else {
      list.unshift(activity);
    }
    setStoredItem('activities', list);
    setDoc(doc(db, 'kegiatan', activity.id), activity).catch(() => {});
  }

  static getActivityTypes(): JenisKegiatan[] {
    return getStoredItem<JenisKegiatan[]>('activity_types', initialActivityTypes);
  }

  static saveActivityType(type: JenisKegiatan): void {
    const list = this.getActivityTypes();
    if (!list.some((t) => t.id === type.id || t.nama.toLowerCase() === type.nama.toLowerCase())) {
      list.push(type);
      setStoredItem('activity_types', list);
    }
  }

  // Albums & Gallery
  static getAlbums(): Album[] {
    return getStoredItem<Album[]>('albums', initialAlbums);
  }

  static saveAlbum(album: Album): void {
    const list = this.getAlbums();
    const idx = list.findIndex((a) => a.id === album.id);
    if (idx >= 0) {
      list[idx] = album;
    } else {
      list.unshift(album);
    }
    setStoredItem('albums', list);
  }

  static getGalleryItems(): GaleriItem[] {
    return getStoredItem<GaleriItem[]>('gallery_items', initialGalleryItems);
  }

  static saveGalleryItem(item: GaleriItem): void {
    const list = this.getGalleryItems();
    const idx = list.findIndex((g) => g.id === item.id);
    if (idx >= 0) {
      list[idx] = item;
    } else {
      list.unshift(item);
    }
    setStoredItem('gallery_items', list);
  }

  // History Chapters & Timeline
  static getHistoryChapters(): SejarahBab[] {
    return getStoredItem<SejarahBab[]>('history_chapters', initialHistoryChapters);
  }

  static saveHistoryChapter(chapter: SejarahBab): void {
    const list = this.getHistoryChapters();
    const idx = list.findIndex((c) => c.id === chapter.id);
    if (idx >= 0) {
      list[idx] = chapter;
    } else {
      list.push(chapter);
    }
    setStoredItem('history_chapters', list);
  }

  static getTimeline(): TimelineEntry[] {
    return getStoredItem<TimelineEntry[]>('timeline', initialTimelineEntries);
  }

  static saveTimelineEntry(entry: TimelineEntry): void {
    const list = this.getTimeline();
    const idx = list.findIndex((t) => t.id === entry.id);
    if (idx >= 0) {
      list[idx] = entry;
    } else {
      list.push(entry);
    }
    list.sort((a, b) => a.tahun - b.tahun);
    setStoredItem('timeline', list);
  }

  // Organization
  static getOrganization(): KepengurusanPeriode {
    return getStoredItem<KepengurusanPeriode>('organization', initialOrganization);
  }

  static saveOrganization(org: KepengurusanPeriode): void {
    setStoredItem('organization', org);
  }

  // News
  static getNews(): Berita[] {
    return getStoredItem<Berita[]>('news', initialNews);
  }

  static saveNews(item: Berita): void {
    const list = this.getNews();
    const idx = list.findIndex((n) => n.id === item.id);
    if (idx >= 0) {
      list[idx] = item;
    } else {
      list.unshift(item);
    }
    setStoredItem('news', list);
  }

  // CMS
  static getCMS(): CMSConfig {
    return getStoredItem<CMSConfig>('cms_config', initialCMSConfig);
  }

  static saveCMS(config: CMSConfig): void {
    setStoredItem('cms_config', config);
    setDoc(doc(db, 'pengaturan', 'cms'), { config }).catch(() => {});
  }

  static resetCMS(): CMSConfig {
    setStoredItem('cms_config', initialCMSConfig);
    setDoc(doc(db, 'pengaturan', 'cms'), { config: initialCMSConfig }).catch(() => {});
    return initialCMSConfig;
  }

  // Sync Config
  static getSyncConfig(): SinkronisasiConfig {
    return getStoredItem<SinkronisasiConfig>('sync_config', initialSyncConfig);
  }

  static saveSyncConfig(cfg: SinkronisasiConfig): void {
    setStoredItem('sync_config', cfg);
    setDoc(doc(db, 'pengaturan', 'sinkronisasi'), { cfg }).catch(() => {});
  }

  // Logs
  static getLogs(): LogAktivitas[] {
    return getStoredItem<LogAktivitas[]>('logs', initialLogs);
  }

  static addLog(peran: string, aksi: string): void {
    const list = this.getLogs();
    const dateStr = new Date().toISOString().replace('T', ' ').substring(0, 16);
    list.unshift({
      id: `log-${Date.now()}`,
      peran,
      aksi,
      tanggal: dateStr,
    });
    setStoredItem('logs', list.slice(0, 200));
  }
}
