import React, { useState } from 'react';
import { Anggota } from '../types';
import { Modal } from './Modal';
import { useAuth } from '../context/AuthContext';
import { Search, Heart, Check, X } from 'lucide-react';

interface MyMemberPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  members: Anggota[];
}

export const MyMemberPickerModal: React.FC<MyMemberPickerModalProps> = ({
  isOpen,
  onClose,
  members,
}) => {
  const { myMemberId, setMyMemberId } = useAuth();
  const [search, setSearch] = useState('');

  const activeMembers = members.filter((m) => !m.diarsipkan);

  const filtered = search.trim()
    ? activeMembers.filter((m) =>
        m.nama.toLowerCase().includes(search.toLowerCase()) ||
        m.cabang.toLowerCase().includes(search.toLowerCase())
      )
    : activeMembers.slice(0, 15);

  const handleSelect = (id: string) => {
    setMyMemberId(id);
    onClose();
  };

  const handleClear = () => {
    setMyMemberId(null);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Pilih Nama Saya" maxWidth="md">
      <div className="space-y-4">
        {/* Search input - required per prompt: "Pemilih nama anggota memakai kolom cari, bukan daftar panjang" */}
        <div className="relative">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-[#6B685B]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama Anda di keluarga"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E9E4D8] bg-[#FAF5EA]/50 text-sm focus:outline-hidden focus:border-[#2F6B4F]"
            autoFocus
          />
        </div>

        {/* Results */}
        <div className="space-y-1 max-h-60 overflow-y-auto">
          {filtered.length === 0 ? (
            <p className="text-center py-6 text-xs text-[#6B685B] font-semibold">
              Belum ada data
            </p>
          ) : (
            filtered.map((m) => {
              const isSelected = myMemberId === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => handleSelect(m.id)}
                  className={`w-full p-3 rounded-xl flex items-center justify-between text-left transition ${
                    isSelected
                      ? 'bg-[#2F6B4F] text-[#FAF5EA]'
                      : 'hover:bg-[#FAF5EA] text-[#2B2B26]'
                  }`}
                >
                  <div>
                    <h4 className="font-bold text-sm leading-tight">{m.nama}</h4>
                    <p className={`text-xs ${isSelected ? 'text-[#FAF5EA]/80' : 'text-[#6B685B]'}`}>
                      {m.cabang} • Generasi {m.generasi}
                    </p>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-[#C9A24B]" />}
                </button>
              );
            })
          )}
        </div>

        {myMemberId && (
          <div className="pt-2 border-t border-[#E9E4D8] flex justify-between items-center">
            <span className="text-xs text-[#6B685B] font-medium">Tersimpan di perangkat</span>
            <button
              type="button"
              onClick={handleClear}
              className="text-xs font-bold text-[#B3402F] hover:underline"
            >
              Hapus Pilihan
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
};
