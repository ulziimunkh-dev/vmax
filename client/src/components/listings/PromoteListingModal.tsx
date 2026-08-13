import React, { useState } from 'react';
import { X, Sparkles, Flame, CheckCircle, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/services/api';
import type { Listing } from '@/types';


interface Props {
  isOpen: boolean;
  onClose: () => void;
  listing: Listing;
  onSuccess?: () => void;
}

export const PromoteListingModal: React.FC<Props> = ({ isOpen, onClose, listing, onSuccess }) => {
  const [selectedTier, setSelectedTier] = useState<'VIP' | 'TOP_URGENT'>('VIP');
  const [durationDays, setDurationDays] = useState<number>(7);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const prices = {
    VIP: { 7: 9900, 14: 17900, 30: 29900 },
    TOP_URGENT: { 7: 19900, 14: 34900, 30: 59900 },
  };

  const currentPrice = prices[selectedTier][durationDays as 7 | 14 | 30] || 9900;

  const handlePromote = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      await api.patch(`/listings/${listing.id}/promote`, {
        tier: selectedTier,
        durationDays,
      });
      setSuccessMsg('Таны зар амжилттай VIP / Яартай төлөвт шинэчлэгдлээ!');
      setTimeout(() => {
        if (onSuccess) onSuccess();
        onClose();
      }, 1500);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'VIP идэвхжүүлэхэд алдаа гарлаа.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-void/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="glass-card relative w-full max-w-lg p-6 rounded-3xl border border-white/10 shadow-2xl overflow-hidden"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-nebula-text hover:text-white rounded-full hover:bg-white/10 transition-all"
          >
            <X size={20} />
          </button>

          <div className="flex items-center space-x-2 text-amber-400 mb-2">
            <Sparkles className="animate-spin" size={24} />
            <h2 className="text-2xl font-bold font-heading text-starlight">Зараа VIP / Онцлох болгох</h2>
          </div>
          <p className="text-xs text-nebula-text mb-6">
            Зараа илүү олон хүнд харуулж, 5X хурдан борлуулах боломж.
          </p>

          {successMsg ? (
            <div className="py-8 text-center space-y-3">
              <CheckCircle size={48} className="mx-auto text-emerald-400 animate-bounce" />
              <p className="text-emerald-400 font-bold text-lg">{successMsg}</p>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Promotion Tier Select */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedTier('VIP')}
                  className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden ${
                    selectedTier === 'VIP'
                      ? 'border-amber-500 bg-amber-500/10 ring-2 ring-amber-500/30'
                      : 'border-white/10 bg-void/40 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center space-x-2 mb-2">
                    <Sparkles className="text-amber-400" size={20} />
                    <span className="font-bold text-starlight text-sm">⭐ VIP Онцлох</span>
                  </div>
                  <p className="text-[11px] text-nebula-text">
                    Хайлтын илэрцийн эхэнд байнга харагдана. Тэргүүн эрэмбэ.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedTier('TOP_URGENT')}
                  className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden ${
                    selectedTier === 'TOP_URGENT'
                      ? 'border-red-500 bg-red-500/10 ring-2 ring-red-500/30'
                      : 'border-white/10 bg-void/40 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center space-x-2 mb-2">
                    <Flame className="text-red-500" size={20} />
                    <span className="font-bold text-starlight text-sm">🔥 Яаралтай зар</span>
                  </div>
                  <p className="text-[11px] text-nebula-text">
                    Улаан яаралтай тэмдэгтэй, хамгийн өндөр хандалтын эрэмбэ.
                  </p>
                </button>
              </div>

              {/* Duration select */}
              <div>
                <label className="block text-xs font-semibold text-starlight mb-2">Хугацаа сонгох:</label>
                <div className="grid grid-cols-3 gap-2">
                  {[7, 14, 30].map((days) => (
                    <button
                      key={days}
                      type="button"
                      onClick={() => setDurationDays(days)}
                      className={`py-2 rounded-xl border text-xs font-semibold transition-all ${
                        durationDays === days
                          ? 'border-plasma bg-plasma/20 text-plasma'
                          : 'border-white/10 bg-void/40 text-nebula-text hover:border-white/20'
                      }`}
                    >
                      {days} хоног
                    </button>
                  ))}
                </div>
              </div>

              {/* Summary & Price */}
              <div className="p-4 rounded-2xl bg-void/60 border border-white/10 flex items-center justify-between">
                <div>
                  <span className="text-xs text-nebula-text block">Төлөх дүнг:</span>
                  <span className="text-2xl font-bold font-heading text-aurora">
                    {currentPrice.toLocaleString('mn-MN')} ₮
                  </span>
                </div>
                <div className="flex items-center space-x-1 text-xs text-emerald-400">
                  <ShieldCheck size={16} />
                  <span>Шууд идэвхжих</span>
                </div>
              </div>

              {errorMsg && <p className="text-xs text-red-400 text-center">{errorMsg}</p>}

              {/* Submit button */}
              <button
                type="button"
                onClick={handlePromote}
                disabled={loading}
                className={`w-full py-3.5 rounded-2xl font-bold text-sm transition-all shadow-lg ${
                  selectedTier === 'TOP_URGENT'
                    ? 'bg-gradient-to-r from-red-600 to-rose-500 hover:from-red-500 hover:to-rose-400 text-white shadow-red-500/30'
                    : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 shadow-amber-500/30'
                }`}
              >
                {loading ? 'Идэвхжүүлж байна...' : 'Идэвхжүүлэх & Төлөх'}
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
