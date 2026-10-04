import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, Lock, Loader2 } from 'lucide-react';

interface LoginProps {
  onSuccess: () => void;
  cmsName?: string;
  cmsSlogan?: string;
}

export const Login: React.FC<LoginProps> = ({
  onSuccess,
  cmsName = 'BANI MARHABAN',
  cmsSlogan = 'Mengenal Asal • Menjaga Silaturahim • Mewariskan Cerita',
}) => {
  const { login } = useAuth();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    if (!password.trim()) {
      setErrorMessage('Kata sandi wajib diisi');
      return;
    }

    setIsSubmitting(true);
    const result = await login(password.trim());
    setIsSubmitting(false);

    if (result.success) {
      onSuccess();
    } else {
      setErrorMessage(result.error || 'Kata sandi salah');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#FAF5EA]">
      <div className="w-full max-w-md bg-[#FFFFFF] rounded-2xl shadow-xl border border-[#E9E4D8] p-6 sm:p-8 space-y-6">
        {/* Monogram and Title */}
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#2F6B4F] border-4 border-[#C9A24B] flex items-center justify-center shadow-md">
            <span className="font-heading font-bold text-2xl sm:text-3xl text-[#FAF5EA] tracking-wider">
              BM
            </span>
          </div>

          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-bold font-heading text-[#2F6B4F]">
              {cmsName}
            </h1>
            <p className="text-xs sm:text-sm text-[#6B685B] font-medium max-w-xs mx-auto">
              {cmsSlogan}
            </p>
          </div>
        </div>

        {/* Clean Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-[#2B2B26] block">
              Kata Sandi <span className="text-[#B3402F]">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#6B685B]">
                <Lock className="w-5 h-5" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errorMessage) setErrorMessage('');
                }}
                className="w-full pl-11 pr-11 py-3 min-h-[48px] rounded-xl border border-[#E9E4D8] bg-[#FAF5EA]/30 text-[#2B2B26] text-base focus:outline-hidden focus:border-[#2F6B4F] focus:ring-1 focus:ring-[#2F6B4F] transition"
                autoComplete="current-password"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#6B685B] hover:text-[#2B2B26] transition"
                aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {errorMessage && (
              <p className="text-xs text-[#B3402F] font-semibold mt-1">
                {errorMessage}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full min-h-[48px] py-3 px-4 rounded-xl bg-[#2F6B4F] text-[#FAF5EA] hover:bg-[#1E4734] font-bold text-base transition shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
          >
            {isSubmitting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <span>Masuk</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
