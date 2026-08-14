import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, Check, Mail, Filter } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import api from '@/services/api';
import type { SearchFilterParams } from './SearchBar';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  filters: SearchFilterParams;
}

export const SaveSearchAlertModal: React.FC<Props> = ({ isOpen, onClose, filters }) => {
  const { user, token } = useAuthStore();
  const [email] = useState(user?.email || '');
  const [title, setTitle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !user.email) {
      setError('Мэдэгдэл захиалахын тулд нэвтэрсэн байх шаардлагатай.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await api.post('/saved-searches', {
        userId: user.id,
        email: user.email,
        title: title || 'Тохируулсан хайлтын мэдэгдэл',
        filters: {
          query: filters.query,
          type: filters.type,
          category: filters.category,
          district: filters.district,
          khoroo: filters.khoroo,
          priceMin: filters.priceMin ? Number(filters.priceMin) : undefined,
          priceMax: filters.priceMax ? Number(filters.priceMax) : undefined,
          areaMin: filters.areaMin ? Number(filters.areaMin) : undefined,
          areaMax: filters.areaMax ? Number(filters.areaMax) : undefined,
          bedrooms: filters.bedrooms ? Number(filters.bedrooms) : undefined,
          bathrooms: filters.bathrooms ? Number(filters.bathrooms) : undefined,
          yearBuiltMin: filters.yearBuiltMin ? Number(filters.yearBuiltMin) : undefined,
          constructionType: filters.constructionType,
        },
        isEmailAlert: true,
      });

      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 3000);
    } catch {
      setError('Мэдэгдэл захиалахад алдаа гарлаа. Нэвтэрсэн эсэхээ шалгаад дахин оролдоно уу.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-void/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="glass-card w-full max-w-lg p-6 rounded-3xl border border-plasma/40 shadow-2xl relative"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-nebula-text hover:text-plasma p-2 bg-void/50 rounded-full transition-colors"
          >
            <X size={20} />
          </button>

          {!token || !user ? (
            <div className="py-8 text-center space-y-4">
              <div className="w-16 h-16 bg-plasma/20 text-plasma rounded-full flex items-center justify-center mx-auto border border-plasma/40">
                <Bell size={32} />
              </div>
              <h3 className="text-2xl font-bold text-starlight">Нэвтрэх шаардлагатай</h3>
              <p className="text-nebula-text text-sm max-w-sm mx-auto">
                Шинэ зарын мэдэгдэл хүлээн авахын тулд та системд өөрийн бүртгэлээрээ нэвтэрсэн байх шаардлагатай.
              </p>
              <a
                href="/login"
                className="inline-block px-8 py-3 bg-gradient-to-r from-plasma to-aurora text-white font-bold rounded-xl shadow-lg shadow-plasma/30 hover:scale-105 transition-all text-sm"
              >
                Нэвтрэх / Бүртгүүлэх
              </a>
            </div>
          ) : isSuccess ? (
            <div className="py-8 text-center space-y-4">
              <div className="w-16 h-16 bg-aurora/20 text-aurora rounded-full flex items-center justify-center mx-auto border border-aurora/40">
                <Check size={32} />
              </div>
              <h3 className="text-2xl font-bold text-starlight">Мэдэгдэл амжилттай захиалагдлаа!</h3>
              <p className="text-nebula-text text-sm max-w-sm mx-auto">
                Таны сонгосон хайлтын шалгуурт тохирох зар ормогц бид баталгаажсан <strong>{user.email}</strong> хаяг руу шууд 1 удаа имэйл мэдэгдэл илгээнэ. Мэдэгдэл 7 хоног хүчинтэй.
              </p>
            </div>
          ) : (
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-3 bg-plasma/20 text-plasma rounded-2xl border border-plasma/40">
                  <Bell size={24} className="animate-pulse" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-starlight font-heading">
                    Хайлтад тохирох зар ормогц мэдээлэх
                  </h3>
                  <p className="text-nebula-text text-xs">
                    7 хоногийн хугацаанд тохирох 1 дэх зар системд ормогц шууд имэйл мэдэгдэл очно.
                  </p>
                </div>
              </div>

              {/* Filter Criteria Summary */}
              <div className="bg-void/60 border border-white/10 rounded-2xl p-4 mb-6">
                <div className="flex items-center space-x-2 text-xs font-semibold text-plasma mb-2">
                  <Filter size={14} />
                  <span>СОНГОСОН ДЭЛГЭРЭНГҮЙ ШАЛГУУР:</span>
                </div>
                <div className="flex flex-wrap gap-2 text-xs">
                  {filters.district && (
                    <span className="px-2.5 py-1 bg-plasma/20 text-plasma rounded-lg border border-plasma/30">
                      📍 {filters.district} {filters.khoroo ? `(${filters.khoroo})` : ''}
                    </span>
                  )}
                  {filters.category && (
                    <span className="px-2.5 py-1 bg-aurora/20 text-aurora rounded-lg border border-aurora/30">
                      🏠 {filters.category}
                    </span>
                  )}
                  {filters.type && (
                    <span className="px-2.5 py-1 bg-nova/20 text-nova rounded-lg border border-nova/30">
                      {filters.type === 'sale' ? '🏷️ Худалдах' : '🔑 Түрээслэх'}
                    </span>
                  )}
                  {filters.bedrooms && (
                    <span className="px-2.5 py-1 bg-amber-500/20 text-amber-300 rounded-lg border border-amber-500/30">
                      🛏️ {filters.bedrooms} өрөө
                    </span>
                  )}
                  {(filters.areaMin || filters.areaMax) && (
                    <span className="px-2.5 py-1 bg-cyan-500/20 text-cyan-300 rounded-lg border border-cyan-500/30">
                      📐 {filters.areaMin || '0'} - {filters.areaMax || '∞'} м.кв
                    </span>
                  )}
                  {(filters.priceMin || filters.priceMax) && (
                    <span className="px-2.5 py-1 bg-white/10 text-starlight rounded-lg border border-white/20">
                      💰 {filters.priceMin ? `${Number(filters.priceMin).toLocaleString()} ₮` : '0 ₮'} - {filters.priceMax ? `${Number(filters.priceMax).toLocaleString()} ₮` : '∞'}
                    </span>
                  )}
                  {filters.constructionType && (
                    <span className="px-2.5 py-1 bg-purple-500/20 text-purple-300 rounded-lg border border-purple-500/30">
                      🏗️ {filters.constructionType}
                    </span>
                  )}
                  {!filters.district && !filters.category && !filters.type && !filters.priceMin && !filters.bedrooms && (
                    <span className="text-nebula-text italic">Бүх шинэ заруудын мэдэгдэл</span>
                  )}
                </div>
              </div>

              {/* Notification terms badge */}
              <div className="mb-4 p-3 bg-plasma/10 border border-plasma/30 rounded-xl text-plasma text-xs leading-relaxed">
                ℹ️ <strong>Мэдэгдлийн журам:</strong> Мэдэгдэл нь захиалснаас хойш <strong>7 хоногийн хугацаанд хүчинтэй</strong> байх ба тохирох зар нийтлэгдмэгц таны имэйл рүү <strong>1 удаа</strong> мэдээлэл илгээгдэнэ.
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-xl text-red-400 text-xs text-center">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-starlight mb-1.5 flex items-center space-x-1">
                    <Mail size={14} className="text-plasma" />
                    <span>Баталгаажсан имэйл хаяг:</span>
                  </label>
                  <input
                    type="email"
                    disabled
                    value={user.email}
                    className="w-full bg-void/90 border border-white/10 rounded-xl px-4 py-3 text-starlight opacity-80 text-sm focus:outline-none cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-nebula-text mb-1.5">
                    Захиалгын нэр (Заавал биш):
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Жишээ: Хан-Уул 3 өрөө байрны зар"
                    className="w-full bg-void/70 border border-white/10 rounded-xl px-4 py-3 text-starlight placeholder-nebula-text text-sm focus:outline-none focus:border-plasma transition-all"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 bg-gradient-to-r from-plasma to-aurora text-white font-bold rounded-xl shadow-lg shadow-plasma/30 hover:scale-[1.02] transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
                >
                  <Bell size={18} />
                  <span>{isSubmitting ? 'Хадгалж байна...' : 'Мэдэгдэл захиалах (7 хоног)'}</span>
                </button>
              </form>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default SaveSearchAlertModal;

