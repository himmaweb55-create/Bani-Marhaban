import React, { useState } from 'react';
import {
  ArisanPeriode,
  ArisanPeserta,
  ArisanPutaran,
  ArisanPembayaran,
  Anggota,
} from '../types';
import { StorageManager } from '../lib/storage';
import { Modal } from '../components/Modal';
import {
  Plus,
  CircleDollarSign,
  CheckCircle2,
  Calendar,
  Award,
  Search,
  Check,
  X,
  Printer,
} from 'lucide-react';

interface KelolaArisanProps {
  period: ArisanPeriode;
  participants: ArisanPeserta[];
  rounds: ArisanPutaran[];
  payments: ArisanPembayaran[];
  members: Anggota[];
}

export const KelolaArisan: React.FC<KelolaArisanProps> = ({
  period,
  participants,
  rounds,
  payments,
  members,
}) => {
  const [activeTab, setActiveTab] = useState<'pembayaran' | 'pengundian' | 'peserta'>('pembayaran');
  const [selectedRound, setSelectedRound] = useState<number>(1);
  const [filterPaymentStatus, setFilterPaymentStatus] = useState<string>('Semua');

  // Record Draw Modal
  const [drawModalOpen, setDrawModalOpen] = useState(false);
  const [drawRound, setDrawRound] = useState<number>(rounds.length + 1);
  const [drawRecipientId, setDrawRecipientId] = useState('');
  const [drawDate, setDrawDate] = useState(new Date().toISOString().split('T')[0]);
  const [drawVideoLink, setDrawVideoLink] = useState('');
  const [drawNotes, setDrawNotes] = useState('');

  // Notification
  const [notification, setNotification] = useState('');

  // Eligible participants who haven't won yet
  const eligibleParticipants = participants.filter((p) => !p.sudahDapat);

  const handleTogglePayment = (pId: string, currentStatus: 'Lunas' | 'Belum') => {
    const newStatus = currentStatus === 'Lunas' ? 'Belum' : 'Lunas';
    const existing = payments.find(
      (pm) => pm.pesertaId === pId && pm.putaranKe === selectedRound
    );

    const paymentToSave: ArisanPembayaran = {
      id: existing ? existing.id : `pay-${pId}-${selectedRound}`,
      periodeId: period.id,
      putaranKe: selectedRound,
      pesertaId: pId,
      status: newStatus,
      tanggalBayar: newStatus === 'Lunas' ? new Date().toISOString().split('T')[0] : undefined,
      nominal: period.nominalIuran,
    };

    StorageManager.saveArisanPayment(paymentToSave);
  };

  const handleSaveDraw = (e: React.FormEvent) => {
    e.preventDefault();
    if (!drawRecipientId) return;

    const recipient = members.find((m) => m.id === drawRecipientId);
    if (!recipient) return;

    const roundToSave: ArisanPutaran = {
      id: `rd-${drawRound}`,
      periodeId: period.id,
      putaranKe: drawRound,
      tanggalUndian: drawDate,
      penerimaAnggotaId: recipient.id,
      penerimaNama: recipient.nama,
      tautanVideo: drawVideoLink.trim() || undefined,
      catatan: drawNotes.trim() || undefined,
    };

    StorageManager.saveArisanRound(roundToSave);
    setDrawModalOpen(false);
    setNotification('Hasil pengundian berhasil disimpan');
    setTimeout(() => setNotification(''), 3000);
  };

  const handlePrintRecap = () => {
    window.print();
  };

  return (
    <div className="space-y-4 pb-20 sm:pb-8">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-2xl bg-[#FFFFFF] border border-[#E9E4D8] shadow-2xs">
        <div className="inline-flex rounded-xl p-1 bg-[#FAF5EA] border border-[#E9E4D8]">
          <button
            type="button"
            onClick={() => setActiveTab('pembayaran')}
            className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition ${
              activeTab === 'pembayaran'
                ? 'bg-[#2F6B4F] text-[#FAF5EA] shadow-xs'
                : 'text-[#2B2B26] hover:text-[#2F6B4F]'
            }`}
          >
            Pembayaran
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('pengundian')}
            className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition ${
              activeTab === 'pengundian'
                ? 'bg-[#2F6B4F] text-[#FAF5EA] shadow-xs'
                : 'text-[#2B2B26] hover:text-[#2F6B4F]'
            }`}
          >
            Catat Pengundian
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('peserta')}
            className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition ${
              activeTab === 'peserta'
                ? 'bg-[#2F6B4F] text-[#FAF5EA] shadow-xs'
                : 'text-[#2B2B26] hover:text-[#2F6B4F]'
            }`}
          >
            Rekap Peserta
          </button>
        </div>

        <button
          type="button"
          onClick={handlePrintRecap}
          className="px-3.5 py-1.5 rounded-xl border border-[#2F6B4F] text-[#2F6B4F] hover:bg-[#2F6B4F]/5 transition text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5"
        >
          <Printer className="w-4 h-4" />
          <span>Cetak Rekap</span>
        </button>
      </div>

      {notification && (
        <div className="p-3.5 rounded-xl bg-[#2F6B4F] text-[#FAF5EA] text-sm font-bold flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="w-5 h-5 text-[#C9A24B]" />
          <span>{notification}</span>
        </div>
      )}

      {/* TAB 1: PEMBAYARAN */}
      {activeTab === 'pembayaran' && (
        <div className="space-y-4">
          {/* Round Selector */}
          <div className="p-4 rounded-2xl bg-[#FFFFFF] border border-[#E9E4D8] shadow-2xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#6B685B] uppercase tracking-wider">
                Pilih Putaran:
              </span>
              <select
                value={selectedRound}
                onChange={(e) => setSelectedRound(parseInt(e.target.value, 10))}
                className="px-3 py-1.5 rounded-xl border border-[#E9E4D8] bg-[#FAF5EA] text-sm font-bold text-[#2F6B4F]"
              >
                {Array.from({ length: period.jumlahPutaran }).map((_, i) => (
                  <option key={i + 1} value={i + 1}>
                    Putaran {i + 1}
                  </option>
                ))}
              </select>
            </div>

            <select
              value={filterPaymentStatus}
              onChange={(e) => setFilterPaymentStatus(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-[#E9E4D8] bg-[#FFFFFF] text-xs font-semibold text-[#2B2B26]"
            >
              <option value="Semua">Semua Status</option>
              <option value="Lunas">Lunas</option>
              <option value="Belum">Belum Bayar</option>
            </select>
          </div>

          {/* Payment List */}
          <div className="space-y-2.5">
            {participants.map((p) => {
              const payment = payments.find(
                (pm) => pm.pesertaId === p.id && pm.putaranKe === selectedRound
              );
              const isPaid = payment?.status === 'Lunas';

              if (filterPaymentStatus === 'Lunas' && !isPaid) return null;
              if (filterPaymentStatus === 'Belum' && isPaid) return null;

              return (
                <div
                  key={p.id}
                  className="p-3.5 rounded-xl bg-[#FFFFFF] border border-[#E9E4D8] shadow-2xs flex items-center justify-between gap-3 text-sm"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-lg bg-[#FAF5EA] border border-[#E9E4D8] flex items-center justify-center font-bold text-xs text-[#6B685B]">
                      {p.nomorUndian}
                    </span>
                    <div>
                      <h4 className="font-bold text-[#2B2B26]">{p.nama}</h4>
                      {isPaid && payment?.tanggalBayar && (
                        <p className="text-[11px] text-[#2F6B4F] font-semibold">
                          Lunas ({payment.tanggalBayar})
                        </p>
                      )}
                      {!isPaid && (
                        <p className="text-[11px] text-[#B3402F] font-semibold">
                          Belum Bayar
                        </p>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleTogglePayment(p.id, isPaid ? 'Lunas' : 'Belum')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                      isPaid
                        ? 'bg-[#2F6B4F] text-[#FAF5EA] hover:bg-[#1E4734]'
                        : 'border border-[#B3402F] text-[#B3402F] hover:bg-[#B3402F]/10'
                    }`}
                  >
                    {isPaid ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                    <span>{isPaid ? 'Lunas' : 'Tandai Lunas'}</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: PENGUNDIAN */}
      {activeTab === 'pengundian' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-2xl bg-[#FFFFFF] border border-[#E9E4D8] shadow-2xs">
            <h3 className="font-heading font-bold text-base text-[#2F6B4F]">
              Hasil Pengundian Arisan
            </h3>
            <button
              type="button"
              onClick={() => {
                setDrawRound(rounds.length + 1);
                setDrawRecipientId(eligibleParticipants[0]?.anggotaId || '');
                setDrawModalOpen(true);
              }}
              disabled={eligibleParticipants.length === 0}
              className="px-4 py-2 rounded-xl bg-[#2F6B4F] text-[#FAF5EA] hover:bg-[#1E4734] font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-xs disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              <span>Catat Pengundian</span>
            </button>
          </div>

          <div className="space-y-3">
            {rounds.map((r) => (
              <div
                key={r.id}
                className="p-4 sm:p-5 rounded-2xl bg-[#FFFFFF] border border-[#E9E4D8] shadow-2xs space-y-2"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold px-2.5 py-0.5 rounded-full bg-[#C9A24B]/15 text-[#9E7A24]">
                    Putaran {r.putaranKe}
                  </span>
                  <span className="text-[#6B685B] font-medium">{r.tanggalUndian}</span>
                </div>
                <h4 className="font-heading font-bold text-base text-[#2B2B26]">
                  {r.penerimaNama}
                </h4>
                {r.catatan && (
                  <p className="text-xs text-[#6B685B] font-medium">{r.catatan}</p>
                )}
                {r.tautanVideo && (
                  <a
                    href={r.tautanVideo}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-[#2F6B4F] font-bold hover:underline inline-block pt-1"
                  >
                    Tautan Video
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: REKAP PESERTA */}
      {activeTab === 'peserta' && (
        <div className="p-5 rounded-2xl bg-[#FFFFFF] border border-[#E9E4D8] shadow-2xs space-y-4">
          <h3 className="font-heading font-bold text-lg text-[#2F6B4F]">
            Rekap Peserta & Status Perolehan
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-[#E9E4D8] text-[#6B685B] font-bold">
                  <th className="py-2.5 pr-2">No</th>
                  <th className="py-2.5 px-2">Nama Peserta</th>
                  <th className="py-2.5 px-2">Nomor Undian</th>
                  <th className="py-2.5 px-2 text-right">Status Undian</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E9E4D8]/60">
                {participants.map((p, idx) => (
                  <tr key={p.id}>
                    <td className="py-3 pr-2 font-bold text-[#6B685B]">{idx + 1}</td>
                    <td className="py-3 px-2 font-bold text-[#2B2B26]">{p.nama}</td>
                    <td className="py-3 px-2 font-semibold text-[#6B685B]">#{p.nomorUndian}</td>
                    <td className="py-3 px-2 text-right">
                      <span
                        className={`px-2 py-0.5 rounded-md font-bold text-xs ${
                          p.sudahDapat
                            ? 'bg-[#2F6B4F]/10 text-[#2F6B4F]'
                            : 'bg-[#6B685B]/10 text-[#6B685B]'
                        }`}
                      >
                        {p.sudahDapat ? `Dapat Putaran ${p.putaranDapat}` : 'Belum Dapat'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Record Draw Modal */}
      <Modal
        isOpen={drawModalOpen}
        onClose={() => setDrawModalOpen(false)}
        title="Catat Pengundian Arisan"
        footer={
          <div className="flex items-center justify-end gap-2 w-full">
            <button
              type="button"
              onClick={() => setDrawModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-[#E9E4D8] text-sm font-semibold"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleSaveDraw}
              className="px-5 py-2 rounded-xl bg-[#2F6B4F] text-[#FAF5EA] font-bold text-sm"
            >
              Simpan
            </button>
          </div>
        }
      >
        <form onSubmit={handleSaveDraw} className="space-y-3 text-sm">
          <div className="space-y-1">
            <label className="text-xs font-bold text-[#2B2B26] block">
              Putaran Ke
            </label>
            <input
              type="number"
              value={drawRound}
              onChange={(e) => setDrawRound(parseInt(e.target.value, 10))}
              className="w-full px-3 py-2 rounded-xl border border-[#E9E4D8]"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-[#2B2B26] block">
              Tanggal Pengundian
            </label>
            <input
              type="date"
              value={drawDate}
              onChange={(e) => setDrawDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-[#E9E4D8]"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-[#2B2B26] block">
              Penerima Undian
            </label>
            <select
              value={drawRecipientId}
              onChange={(e) => setDrawRecipientId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-[#E9E4D8]"
            >
              {eligibleParticipants.map((p) => (
                <option key={p.id} value={p.anggotaId}>
                  {p.nama} (#{p.nomorUndian})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-[#2B2B26] block">
              Tautan Video (Opsional)
            </label>
            <input
              type="url"
              value={drawVideoLink}
              onChange={(e) => setDrawVideoLink(e.target.value)}
              placeholder="https://..."
              className="w-full px-3 py-2 rounded-xl border border-[#E9E4D8]"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-[#2B2B26] block">
              Catatan Pertemuan
            </label>
            <textarea
              value={drawNotes}
              onChange={(e) => setDrawNotes(e.target.value)}
              rows={3}
              placeholder="Catatan hasil pertemuan"
              className="w-full px-3 py-2 rounded-xl border border-[#E9E4D8]"
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};
