import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { StorageManager, subscribeToStore } from './lib/storage';
import { Anggota } from './types';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { OfflineBadge } from './components/OfflineBadge';
import { MemberProfileModal } from './components/MemberProfileModal';
import { MyMemberPickerModal } from './components/MyMemberPickerModal';

// Pages
import { Login } from './pages/Login';
import { Beranda } from './pages/Beranda';
import { Silsilah } from './pages/Silsilah';
import { AnggotaPage } from './pages/Anggota';
import { PetaData } from './pages/PetaData';
import { ArisanPage } from './pages/Arisan';
import { KelolaArisan } from './pages/KelolaArisan';
import { KhotmilPage } from './pages/Khotmil';
import { KelolaKhotmil } from './pages/KelolaKhotmil';
import { KegiatanPage } from './pages/Kegiatan';
import { KelolaInformasi } from './pages/KelolaInformasi';
import { SejarahPage } from './pages/Sejarah';
import { GaleriPage } from './pages/Galeri';
import { KepengurusanPage } from './pages/Kepengurusan';
import { UsulanData } from './pages/UsulanData';
import { Verifikasi } from './pages/Verifikasi';
import { KelolaSilsilah } from './pages/KelolaSilsilah';
import { RiwayatPerubahanPage } from './pages/RiwayatPerubahan';
import { KataSandiPage } from './pages/KataSandi';
import { SuperAdminDashboard } from './pages/SuperAdmin';

export const AppContent: React.FC = () => {
  const { role, canVerify, canManageGenealogy, canManageInformation, canManageArisan, canManageKhotmil, isSuperAdmin } = useAuth();

  const [currentPage, setCurrentPage] = useState('beranda');

  // Reactive State from StorageManager
  const [members, setMembers] = useState(() => StorageManager.getMembers());
  const [proposals, setProposals] = useState(() => StorageManager.getProposals());
  const [history, setHistory] = useState(() => StorageManager.getHistory());
  const [arisanPeriod, setArisanPeriod] = useState(() => StorageManager.getArisanPeriod());
  const [arisanParticipants, setArisanParticipants] = useState(() => StorageManager.getArisanParticipants());
  const [arisanRounds, setArisanRounds] = useState(() => StorageManager.getArisanRounds());
  const [arisanPayments, setArisanPayments] = useState(() => StorageManager.getArisanPayments());
  const [khotmilPeriod, setKhotmilPeriod] = useState(() => StorageManager.getKhotmilPeriod());
  const [khotmilJuz, setKhotmilJuz] = useState(() => StorageManager.getKhotmilJuz());
  const [activities, setActivities] = useState(() => StorageManager.getActivities());
  const [activityTypes, setActivityTypes] = useState(() => StorageManager.getActivityTypes());
  const [albums, setAlbums] = useState(() => StorageManager.getAlbums());
  const [galleryItems, setGalleryItems] = useState(() => StorageManager.getGalleryItems());
  const [historyChapters, setHistoryChapters] = useState(() => StorageManager.getHistoryChapters());
  const [timeline, setTimeline] = useState(() => StorageManager.getTimeline());
  const [organization, setOrganization] = useState(() => StorageManager.getOrganization());
  const [news, setNews] = useState(() => StorageManager.getNews());
  const [cms, setCms] = useState(() => StorageManager.getCMS());
  const [syncConfig, setSyncConfig] = useState(() => StorageManager.getSyncConfig());
  const [logs, setLogs] = useState(() => StorageManager.getLogs());

  // Modals & Navigation state
  const [selectedMemberForProfile, setSelectedMemberForProfile] = useState<Anggota | null>(null);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [myMemberPickerOpen, setMyMemberPickerOpen] = useState(false);
  const [initialProposalMember, setInitialProposalMember] = useState<Anggota | null>(null);
  const [initialAlbumIdForGallery, setInitialAlbumIdForGallery] = useState<string | undefined>(undefined);
  const [treeHighlightedPath, setTreeHighlightedPath] = useState<string[]>([]);

  // Subscribe to real-time storage events
  useEffect(() => {
    const unsubscribe = subscribeToStore(() => {
      setMembers(StorageManager.getMembers());
      setProposals(StorageManager.getProposals());
      setHistory(StorageManager.getHistory());
      setArisanPeriod(StorageManager.getArisanPeriod());
      setArisanParticipants(StorageManager.getArisanParticipants());
      setArisanRounds(StorageManager.getArisanRounds());
      setArisanPayments(StorageManager.getArisanPayments());
      setKhotmilPeriod(StorageManager.getKhotmilPeriod());
      setKhotmilJuz(StorageManager.getKhotmilJuz());
      setActivities(StorageManager.getActivities());
      setActivityTypes(StorageManager.getActivityTypes());
      setAlbums(StorageManager.getAlbums());
      setGalleryItems(StorageManager.getGalleryItems());
      setHistoryChapters(StorageManager.getHistoryChapters());
      setTimeline(StorageManager.getTimeline());
      setOrganization(StorageManager.getOrganization());
      setNews(StorageManager.getNews());
      setCms(StorageManager.getCMS());
      setSyncConfig(StorageManager.getSyncConfig());
      setLogs(StorageManager.getLogs());
    });
    return unsubscribe;
  }, []);

  // Handlers
  const handleOpenMemberProfile = (m: Anggota) => {
    setSelectedMemberForProfile(m);
    setProfileModalOpen(true);
  };

  const handleProposeChangeFromProfile = (m: Anggota) => {
    setInitialProposalMember(m);
    setCurrentPage('usulan');
  };

  const handleViewPathInTree = (targetId: string) => {
    setTreeHighlightedPath([targetId]);
    setCurrentPage('silsilah');
  };

  const handleViewAlbumFromActivity = (albumId: string) => {
    setInitialAlbumIdForGallery(albumId);
    setCurrentPage('galeri');
  };

  // If not logged in, show Login
  if (!role) {
    return (
      <>
        <OfflineBadge />
        <Login
          onSuccess={() => setCurrentPage('beranda')}
          cmsName={cms.identitas.nama}
          cmsSlogan={cms.identitas.slogan}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF5EA] flex flex-col text-[#2B2B26]">
      <OfflineBadge />

      {/* Top Header */}
      <Header
        currentPage={currentPage}
        onNavigate={(page) => setCurrentPage(page)}
        cmsName={cms.identitas.nama}
        cmsSlogan={cms.identitas.slogan}
      />

      {/* Main Content Area */}
      <main className="grow max-w-7xl w-full mx-auto px-4 sm:px-6 pt-4 sm:pt-6">
        {currentPage === 'beranda' && (
          <Beranda
            members={members}
            activities={activities}
            news={news}
            cms={cms}
            onNavigate={(p) => setCurrentPage(p)}
            onOpenMyMemberPicker={() => setMyMemberPickerOpen(true)}
          />
        )}

        {currentPage === 'silsilah' && (
          <Silsilah
            members={members}
            onSelectMember={handleOpenMemberProfile}
            highlightedPath={treeHighlightedPath}
            onOpenMyMemberPicker={() => setMyMemberPickerOpen(true)}
          />
        )}

        {currentPage === 'anggota' && (
          <AnggotaPage
            members={members}
            onSelectMember={handleOpenMemberProfile}
          />
        )}

        {currentPage === 'peta_data' && (
          <PetaData
            members={members}
            onSelectMember={handleOpenMemberProfile}
          />
        )}

        {currentPage === 'arisan' && (
          <ArisanPage
            period={arisanPeriod}
            participants={arisanParticipants}
            rounds={arisanRounds}
            payments={arisanPayments}
            onNavigateToManage={() => setCurrentPage('kelola_arisan')}
          />
        )}

        {currentPage === 'kelola_arisan' && canManageArisan && (
          <KelolaArisan
            period={arisanPeriod}
            participants={arisanParticipants}
            rounds={arisanRounds}
            payments={arisanPayments}
            members={members}
          />
        )}

        {currentPage === 'khotmil' && (
          <KhotmilPage
            period={khotmilPeriod}
            juzList={khotmilJuz}
            onNavigateToManage={() => setCurrentPage('kelola_khotmil')}
          />
        )}

        {currentPage === 'kelola_khotmil' && canManageKhotmil && (
          <KelolaKhotmil
            period={khotmilPeriod}
            juzList={khotmilJuz}
            members={members}
          />
        )}

        {currentPage === 'kegiatan' && (
          <KegiatanPage
            activities={activities}
            activityTypes={activityTypes}
            albums={albums}
            onNavigateToManage={() => setCurrentPage('kelola_informasi')}
            onViewAlbum={handleViewAlbumFromActivity}
          />
        )}

        {currentPage === 'kelola_informasi' && canManageInformation && (
          <KelolaInformasi
            activities={activities}
            activityTypes={activityTypes}
            news={news}
            albums={albums}
          />
        )}

        {currentPage === 'sejarah' && (
          <SejarahPage
            chapters={historyChapters}
            timeline={timeline}
          />
        )}

        {currentPage === 'galeri' && (
          <GaleriPage
            albums={albums}
            galleryItems={galleryItems}
            members={members}
            initialAlbumId={initialAlbumIdForGallery}
            onClearInitialAlbum={() => setInitialAlbumIdForGallery(undefined)}
          />
        )}

        {currentPage === 'kepengurusan' && (
          <KepengurusanPage
            organization={organization}
            members={members}
            onSelectMember={handleOpenMemberProfile}
          />
        )}

        {currentPage === 'usulan' && (
          <UsulanData
            proposals={proposals}
            members={members}
            initialSelectedMember={initialProposalMember}
            onClearInitialMember={() => setInitialProposalMember(null)}
          />
        )}

        {currentPage === 'verifikasi' && canVerify && (
          <Verifikasi
            proposals={proposals}
            members={members}
          />
        )}

        {currentPage === 'kelola_silsilah' && canManageGenealogy && (
          <KelolaSilsilah members={members} />
        )}

        {currentPage === 'riwayat' && (canManageGenealogy || isSuperAdmin) && (
          <RiwayatPerubahanPage history={history} />
        )}

        {currentPage === 'kata_sandi' && <KataSandiPage />}

        {currentPage === 'super_admin' && isSuperAdmin && (
          <SuperAdminDashboard
            members={members}
            cms={cms}
            syncConfig={syncConfig}
            logs={logs}
            albums={albums}
            galleryItems={galleryItems}
            activities={activities}
            activityTypes={activityTypes}
            news={news}
            onSelectMember={handleOpenMemberProfile}
          />
        )}
      </main>

      {/* Footer (desktop only or extra spacing) */}
      <footer className="border-t border-[#E9E4D8] py-6 text-center text-xs text-[#6B685B] hidden sm:block">
        <p>{cms.footer.teks}</p>
        <p className="mt-1 font-semibold">{cms.footer.kontak}</p>
      </footer>

      {/* Mobile Bottom Navigation */}
      <BottomNav
        currentPage={currentPage}
        onNavigate={(page) => setCurrentPage(page)}
      />

      {/* Global Modals */}
      <MemberProfileModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        member={selectedMemberForProfile}
        allMembers={members}
        onSelectMember={handleOpenMemberProfile}
        onProposeChange={handleProposeChangeFromProfile}
        onViewPath={handleViewPathInTree}
      />

      <MyMemberPickerModal
        isOpen={myMemberPickerOpen}
        onClose={() => setMyMemberPickerOpen(false)}
        members={members}
      />
    </div>
  );
};

export default function App() {
  return <AppContent />;
}
