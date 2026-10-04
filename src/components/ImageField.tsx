import React, { useState, useRef } from 'react';
import { Upload, Link as LinkIcon, Trash2, Loader2, Check } from 'lucide-react';

interface ImageFieldProps {
  label: string;
  value: string;
  sourceType?: 'tautan' | 'drive';
  onChange: (value: string, sourceType: 'tautan' | 'drive') => void;
  required?: boolean;
}

export const ImageField: React.FC<ImageFieldProps> = ({
  label,
  value,
  sourceType = 'tautan',
  onChange,
  required = false,
}) => {
  const [activeTab, setActiveTab] = useState<'unggah' | 'tautan'>(
    sourceType === 'drive' ? 'unggah' : 'tautan'
  );
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMessage('');
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Format file tidak didukung');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('Ukuran file melebihi batas 5 MB');
      return;
    }

    setIsLoading(true);
    const reader = new FileReader();
    reader.onload = () => {
      setIsLoading(false);
      const base64 = reader.result as string;
      onChange(base64, 'drive');
    };
    reader.onerror = () => {
      setIsLoading(false);
      setErrorMessage('Gagal memuat gambar');
    };
    reader.readAsDataURL(file);
  };

  const handleClear = () => {
    onChange('', activeTab === 'unggah' ? 'drive' : 'tautan');
    if (fileInputRef.current) fileInputRef.current.value = '';
    setErrorMessage('');
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-[#2B2B26]">
          {label} {required && <span className="text-[#B3402F]">*</span>}
        </label>
        <div className="inline-flex rounded-lg p-0.5 bg-[#E9E4D8]/80 text-xs font-medium">
          <button
            type="button"
            onClick={() => setActiveTab('unggah')}
            className={`px-2.5 py-1 rounded-md transition ${
              activeTab === 'unggah'
                ? 'bg-[#FFFFFF] text-[#2F6B4F] shadow-xs font-semibold'
                : 'text-[#6B685B] hover:text-[#2B2B26]'
            }`}
          >
            Unggah
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('tautan')}
            className={`px-2.5 py-1 rounded-md transition ${
              activeTab === 'tautan'
                ? 'bg-[#FFFFFF] text-[#2F6B4F] shadow-xs font-semibold'
                : 'text-[#6B685B] hover:text-[#2B2B26]'
            }`}
          >
            Tautan
          </button>
        </div>
      </div>

      {activeTab === 'unggah' ? (
        <div className="flex items-center gap-3">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />
          <button
            type="button"
            disabled={isLoading}
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#2F6B4F] text-[#2F6B4F] hover:bg-[#2F6B4F]/5 transition text-sm font-medium"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Upload className="w-4 h-4" />
            )}
            <span>Pilih Gambar</span>
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <div className="relative grow">
            <LinkIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#6B685B]" />
            <input
              type="url"
              value={value.startsWith('data:') ? '' : value}
              onChange={(e) => onChange(e.target.value, 'tautan')}
              placeholder="https://..."
              className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#E9E4D8] bg-[#FFFFFF] text-[#2B2B26] text-sm focus:outline-hidden focus:border-[#2F6B4F] focus:ring-1 focus:ring-[#2F6B4F]"
            />
          </div>
        </div>
      )}

      {errorMessage && (
        <p className="text-xs text-[#B3402F] font-medium">{errorMessage}</p>
      )}

      {value && (
        <div className="relative inline-flex items-center p-2 rounded-xl border border-[#E9E4D8] bg-[#FFFFFF] mt-2 shadow-xs group">
          <img
            src={value}
            alt=""
            className="w-16 h-16 object-cover rounded-lg bg-[#FAF5EA]"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = 'none';
            }}
          />
          <button
            type="button"
            onClick={handleClear}
            className="ml-3 p-1.5 rounded-lg text-[#B3402F] hover:bg-[#B3402F]/10 transition"
            aria-label="Hapus Gambar"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
