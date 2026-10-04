import React, { useState } from 'react';
import { SejarahBab, TimelineEntry } from '../types';
import { useAuth } from '../context/AuthContext';
import { BookOpen, History, Calendar, CheckCircle2, AlertCircle } from 'lucide-react';

interface SejarahProps {
  chapters: SejarahBab[];
  timeline: TimelineEntry[];
}

export const SejarahPage: React.FC<SejarahProps> = ({ chapters, timeline }) => {
  const [activeTab, setActiveTab] = useState<'bab' | 'timeline'>('bab');

  return (
    <div className="space-y-4 pb-20 sm:pb-8">
      {/* Top Tab Bar */}
      <div className="flex items-center justify-between p-4 rounded-2xl bg-[#FFFFFF] border border-[#E9E4D8] shadow-2xs">
        <div className="inline-flex rounded-xl p-1 bg-[#FAF5EA] border border-[#E9E4D8]">
          <button
            type="button"
            onClick={() => setActiveTab('bab')}
            className={`px-4 py-1.5 rounded-lg text-xs sm:text-sm font-bold flex items-center gap-1.5 transition ${
              activeTab === 'bab'
                ? 'bg-[#2F6B4F] text-[#FAF5EA] shadow-xs'
                : 'text-[#2B2B26] hover:text-[#2F6B4F]'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Bab Sejarah</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('timeline')}
            className={`px-4 py-1.5 rounded-lg text-xs sm:text-sm font-bold flex items-center gap-1.5 transition ${
              activeTab === 'timeline'
                ? 'bg-[#2F6B4F] text-[#FAF5EA] shadow-xs'
                : 'text-[#2B2B26] hover:text-[#2F6B4F]'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Lini Masa</span>
          </button>
        </div>
      </div>

      {/* TAB 1: BAB SEJARAH */}
      {activeTab === 'bab' && (
        <div className="space-y-4">
          {chapters.map((chap) => (
            <div
              key={chap.id}
              className="p-5 sm:p-6 rounded-2xl bg-[#FFFFFF] border border-[#E9E4D8] shadow-2xs space-y-3"
            >
              <div className="flex items-center justify-between border-b border-[#E9E4D8]/60 pb-2.5">
                <span className="text-xs font-bold text-[#C9A24B] uppercase tracking-wider">
                  Bab {chap.babNomor}
                </span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    chap.statusVerifikasi === 'Terverifikasi'
                      ? 'bg-[#2F6B4F]/10 text-[#2F6B4F]'
                      : 'bg-[#D9822B]/10 text-[#D9822B]'
                  }`}
                >
                  {chap.statusVerifikasi}
                </span>
              </div>

              <h3 className="font-heading font-bold text-lg sm:text-xl text-[#2F6B4F]">
                {chap.judulBab}
              </h3>

              <p className="text-sm sm:text-base text-[#2B2B26] leading-relaxed">
                {chap.isi}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* TAB 2: LINI MASA VERTIKAL */}
      {activeTab === 'timeline' && (
        <div className="p-5 sm:p-6 rounded-2xl bg-[#FFFFFF] border border-[#E9E4D8] shadow-2xs">
          <div className="relative pl-6 sm:pl-8 space-y-8 before:absolute before:left-2 sm:before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#C9A24B]/40">
            {timeline.map((item) => {
              const isUnverified = item.statusVerifikasi === 'Belum Terverifikasi';

              return (
                <div key={item.id} className="relative space-y-1.5">
                  {/* Dot on line */}
                  <div
                    className={`absolute -left-[30px] sm:-left-[35px] top-1.5 w-4 h-4 rounded-full border-2 border-[#FAF5EA] ${
                      isUnverified ? 'bg-[#D9822B]' : 'bg-[#2F6B4F]'
                    } shadow-xs`}
                  />

                  <div className="flex items-center gap-2">
                    <span className="font-heading font-black text-lg text-[#2F6B4F]">
                      {item.tahun}
                    </span>
                    {isUnverified && (
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#D9822B]/15 text-[#D9822B] font-bold">
                        Belum Terverifikasi
                      </span>
                    )}
                  </div>

                  <h4 className="font-heading font-bold text-base text-[#2B2B26]">
                    {item.judul}
                  </h4>

                  <p className="text-xs sm:text-sm text-[#6B685B] leading-relaxed">
                    {item.deskripsi}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
