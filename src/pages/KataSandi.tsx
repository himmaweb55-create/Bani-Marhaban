import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { StorageManager } from '../lib/storage';
import { Role } from '../types';
import { KeyRound, CheckCircle2, Lock } from 'lucide-react';

export const KataSandiPage: React.FC = () => {
  const { role, isSuperAdmin } = useAuth();

  const [targetRole, setTargetRole] = useState<Role>(role || 'anggota');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successNotification, setSuccessNotification] = useState('');

  const allRoles: { id: Role; label: string }[] = [
    { id: 'anggota', label: 'Akun Bersama Anggota' },
    { id: 'sesepuh', label: 'Sesepuh' },
    { id: 'ketua', label: 'Ketua Paguyuban' },
    { id: 'wakil_ketua', label: 'Wakil Ketua' },
    { id: 'sekretaris', label: 'Sekretaris' },
    { id: 'pengelola_arisan', label: 'Pengelola Arisan' },
    { id: 'admin_khotmil', label: 'Admin Khotmil Qur\'an' },
    { id: 'super_admin', label: 'Super Admin' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (newPassword.length < 8) {
      setErrorMessage('Kata sandi baru minimal 8 karakter');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('Ulangi kata sandi baru tidak cocok');
      return;
    }

    // If not super admin changing another role, check old password
    if (!isSuperAdmin) {
      if (!oldPassword.trim()) {
        setErrorMessage('Kata sandi lama wajib diisi');
        return;
      }
      const verified = await StorageManager.verifyPassword(oldPassword.trim());
      if (verified !== role) {
        setErrorMessage('Kata sandi lama tidak tepat');
        return;
      }
    }

    const changed = await StorageManager.changePassword(targetRole, newPassword);
    if (changed) {
      setSuccessNotification('Kata sandi berhasil diubah');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setSuccessNotification(''), 4000);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-4 pb-20 sm:pb-8">
      <div className="p-5 sm:p-6 rounded-2xl bg-[#FFFFFF] border border-[#E9E4D8] shadow-2xs space-y-4">
        <div className="flex items-center gap-3 border-b border-[#E9E4D8]/60 pb-3">
          <div className="w-10 h-10 rounded-xl bg-[#2F6B4F]/10 flex items-center justify-center text-[#2F6B4F]">
            <KeyRound className="w-5 h-5 text-[#C9A24B]" />
          </div>
          <div>
            <h2 className="text-xl font-bold font-heading text-[#2F6B4F]">
              Ubah Kata Sandi
            </h2>
          </div>
        </div>

        {successNotification && (
          <div className="p-3.5 rounded-xl bg-[#2F6B4F] text-[#FAF5EA] text-sm font-bold flex items-center gap-2 shadow-xs">
            <CheckCircle2 className="w-5 h-5 text-[#C9A24B]" />
            <span>{successNotification}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-sm">
          {/* Super Admin can choose which role to change */}
          {isSuperAdmin && (
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#2B2B26] block">
                Pilih Peran
              </label>
              <select
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value as Role)}
                className="w-full px-3 py-2.5 rounded-xl border border-[#E9E4D8] font-semibold text-[#2B2B26]"
              >
                {allRoles.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Old password (only required if not super admin) */}
          {!isSuperAdmin && (
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#2B2B26] block">
                Kata Sandi Lama <span className="text-[#B3402F]">*</span>
              </label>
              <input
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-[#E9E4D8]"
              />
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-bold text-[#2B2B26] block">
              Kata Sandi Baru <span className="text-[#B3402F]">*</span>
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-[#E9E4D8]"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-[#2B2B26] block">
              Ulangi Kata Sandi Baru <span className="text-[#B3402F]">*</span>
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-[#E9E4D8]"
            />
          </div>

          {errorMessage && (
            <p className="text-xs text-[#B3402F] font-bold">{errorMessage}</p>
          )}

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#2F6B4F] text-[#FAF5EA] hover:bg-[#1E4734] font-bold text-sm transition shadow-xs"
            >
              Simpan Kata Sandi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
