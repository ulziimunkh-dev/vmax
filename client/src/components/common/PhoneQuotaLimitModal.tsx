import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Lock, LogIn, X, CheckCircle2, ShieldCheck, Sparkles, PhoneCall } from 'lucide-react';
import { DAILY_GUEST_PHONE_LIMIT } from '@/utils/phoneQuota';

interface PhoneQuotaLimitModalProps {
  isOpen: boolean;
  onClose: () => void;
  listingTitle?: string;
}

export const PhoneQuotaLimitModal: React.FC<PhoneQuotaLimitModalProps> = ({
  isOpen,
  onClose,
  listingTitle,
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  if (!isOpen) return null;

  const handleGoToLogin = () => {
    onClose();
    const currentPath = encodeURIComponent(location.pathname + location.search);
    navigate(`/login?redirect=${currentPath}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-void/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md rounded-3xl bg-white dark:bg-nebula border border-slate-200 dark:border-white/10 shadow-2xl p-6 sm:p-7 text-slate-900 dark:text-starlight overflow-hidden">
        {/* Glow decoration */}
        <div className="absolute -top-12 -right-12 w-36 h-36 bg-gradient-to-br from-amber-500/20 to-plasma/20 rounded-full blur-2xl pointer-events-none" />
        
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition cursor-pointer"
        >
          <X size={18} />
        </button>

        {/* Header Icon & Tag */}
        <div className="space-y-3 mb-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-black uppercase tracking-wider">
            <Lock size={13} />
            <span>Өдрийн үнэгүй эрх дууслаа ({DAILY_GUEST_PHONE_LIMIT}/{DAILY_GUEST_PHONE_LIMIT})</span>
          </div>

          <h3 className="text-xl font-heading font-black text-slate-900 dark:text-white tracking-tight">
            Зарын дугаарыг хязгааргүй харах уу?
          </h3>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-nebula-text leading-relaxed">
            Та зочин хэрэглэгчийн өдрийн <strong className="text-amber-600 dark:text-amber-400">{DAILY_GUEST_PHONE_LIMIT} зарын дугаар</strong> харах үнэгүй эрхээ ашигласан байна.
            {listingTitle ? (
              <span className="block mt-1 text-slate-700 dark:text-slate-300 font-medium truncate">
                Зар: "{listingTitle}"
              </span>
            ) : null}
          </p>
        </div>

        {/* Benefits list */}
        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-void/60 border border-slate-200 dark:border-white/10 space-y-2.5 mb-5 text-xs">
          <div className="flex items-center gap-2.5 text-slate-700 dark:text-slate-200">
            <CheckCircle2 size={15} className="text-emerald-500 shrink-0" />
            <span className="font-semibold">Бүх зарын утасны дугаарыг хязгааргүй харах</span>
          </div>
          <div className="flex items-center gap-2.5 text-slate-700 dark:text-slate-200">
            <PhoneCall size={15} className="text-plasma shrink-0" />
            <span className="font-semibold">Зарын эзэд болон агентуудтай шууд холбогдох</span>
          </div>
          <div className="flex items-center gap-2.5 text-slate-700 dark:text-slate-200">
            <Sparkles size={15} className="text-amber-500 shrink-0" />
            <span className="font-semibold">Хадгалсан зарууд ба үнийн хямдралын мэдэгдэл авах</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5">
          <button
            type="button"
            onClick={handleGoToLogin}
            className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl font-extrabold text-sm text-white-force bg-gradient-to-r from-plasma via-indigo-600 to-nova hover:from-plasma/90 hover:to-nova/90 shadow-lg shadow-plasma/30 transition-all hover:scale-[1.01] active:scale-[0.98] cursor-pointer"
          >
            <LogIn size={17} />
            <span>Нэвтрэх / Бүртгүүлэх</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 px-4 rounded-2xl font-bold text-xs text-slate-600 dark:text-nebula-text hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition cursor-pointer"
          >
            Дараа болъё
          </button>
        </div>
      </div>
    </div>
  );
};
