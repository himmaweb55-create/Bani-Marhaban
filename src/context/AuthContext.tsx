import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Role } from '../types';
import { StorageManager } from '../lib/storage';

interface AuthContextType {
  role: Role | null;
  roleLabel: string;
  login: (password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  canVerify: boolean;
  canManageGenealogy: boolean;
  canManageInformation: boolean;
  canManageArisan: boolean;
  canManageKhotmil: boolean;
  isSuperAdmin: boolean;
  canSeeArisanPayments: boolean;
  canConfirmProposal: boolean;
  myMemberId: string | null;
  setMyMemberId: (id: string | null) => void;
}

const ROLE_LABELS: Record<Role, string> = {
  anggota: 'Anggota Keluarga',
  sesepuh: 'Sesepuh',
  ketua: 'Ketua Paguyuban',
  wakil_ketua: 'Wakil Ketua',
  sekretaris: 'Sekretaris',
  pengelola_arisan: 'Pengelola Arisan',
  admin_khotmil: 'Admin Khotmil Qur\'an',
  super_admin: 'Super Admin',
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const INACTIVITY_TIMEOUT = 60 * 60 * 1000; // 60 minutes

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<Role | null>(() => {
    return (sessionStorage.getItem('bm_current_role') as Role) || null;
  });

  const [myMemberId, setMyMemberIdState] = useState<string | null>(() => {
    return localStorage.getItem('bm_selected_my_id') || null;
  });

  const setMyMemberId = useCallback((id: string | null) => {
    if (id) {
      localStorage.setItem('bm_selected_my_id', id);
    } else {
      localStorage.removeItem('bm_selected_my_id');
    }
    setMyMemberIdState(id);
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem('bm_current_role');
    sessionStorage.removeItem('bm_last_activity');
    setRole(null);
  }, []);

  // Inactivity detection
  useEffect(() => {
    if (!role) return;

    let timeoutId: NodeJS.Timeout;

    const resetTimer = () => {
      sessionStorage.setItem('bm_last_activity', Date.now().toString());
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        logout();
      }, INACTIVITY_TIMEOUT);
    };

    const checkInitial = () => {
      const last = sessionStorage.getItem('bm_last_activity');
      if (last) {
        const diff = Date.now() - parseInt(last, 10);
        if (diff > INACTIVITY_TIMEOUT) {
          logout();
          return;
        }
      }
      resetTimer();
    };

    checkInitial();

    const activityEvents = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart'];
    const handleActivity = () => resetTimer();

    activityEvents.forEach((ev) => window.addEventListener(ev, handleActivity, { passive: true }));

    return () => {
      clearTimeout(timeoutId);
      activityEvents.forEach((ev) => window.removeEventListener(ev, handleActivity));
    };
  }, [role, logout]);

  const login = async (password: string): Promise<{ success: boolean; error?: string }> => {
    if (!password.trim()) {
      return { success: false, error: 'Kata sandi wajib diisi' };
    }

    const matchedRole = await StorageManager.verifyPassword(password.trim());
    if (matchedRole) {
      setRole(matchedRole);
      sessionStorage.setItem('bm_current_role', matchedRole);
      sessionStorage.setItem('bm_last_activity', Date.now().toString());
      StorageManager.addLog(matchedRole, 'Masuk ke aplikasi');
      return { success: true };
    }

    return { success: false, error: 'Kata sandi salah' };
  };

  const cms = StorageManager.getCMS();
  const wakilBisaVerifikasi = cms.wakilKetuaBisaVerifikasi ?? true;

  const isSuperAdmin = role === 'super_admin';
  const canVerify = isSuperAdmin || role === 'ketua' || (role === 'wakil_ketua' && wakilBisaVerifikasi);
  const canManageGenealogy = isSuperAdmin || role === 'ketua' || role === 'wakil_ketua';
  const canManageInformation = isSuperAdmin || role === 'sekretaris';
  const canManageArisan = isSuperAdmin || role === 'pengelola_arisan';
  const canManageKhotmil = isSuperAdmin || role === 'admin_khotmil';
  const canSeeArisanPayments = isSuperAdmin || role === 'pengelola_arisan' || role === 'ketua' || role === 'wakil_ketua';
  const canConfirmProposal = role === 'sesepuh' || canVerify;

  return (
    <AuthContext.Provider
      value={{
        role,
        roleLabel: role ? ROLE_LABELS[role] : '',
        login,
        logout,
        canVerify,
        canManageGenealogy,
        canManageInformation,
        canManageArisan,
        canManageKhotmil,
        isSuperAdmin,
        canSeeArisanPayments,
        canConfirmProposal,
        myMemberId,
        setMyMemberId,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
