import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, BookOpen, Phone, ExternalLink, ShieldCheck } from 'lucide-react';
import type { FurnitureArticleItem } from '@/types/furniture';
import { getImageUrl } from '@/utils/imageUrl';

interface FurnitureArticleModalProps {
  isOpen: boolean;
  onClose: () => void;
  article: FurnitureArticleItem | null;
}

export const FurnitureArticleModal: React.FC<FurnitureArticleModalProps> = ({
  isOpen,
  onClose,
  article,
}) => {
  if (!isOpen || !article) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-2xl max-h-[85vh] bg-void border border-white/15 rounded-3xl overflow-hidden shadow-2xl flex flex-col"
        >
          {/* Header image if exists */}
          {article.imageUrl && (
            <div className="relative w-full h-48 sm:h-56 overflow-hidden flex-shrink-0">
              <img
                src={getImageUrl(article.imageUrl)}
                alt={article.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-void via-void/40 to-transparent" />
            </div>
          )}

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-black/60 hover:bg-black/90 text-white backdrop-blur-md border border-white/20 transition-all cursor-pointer shadow-lg"
            title="Хаах"
          >
            <X size={18} />
          </button>

          {/* Content Body */}
          <div className="p-6 overflow-y-auto space-y-5">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-plasma/20 text-plasma border border-plasma/30 uppercase">
                  {article.category || 'ЗӨВЛӨГӨӨ'}
                </span>
                {article.readMinutes && (
                  <span className="flex items-center gap-1 text-xs text-nebula-text/70">
                    <Clock size={12} />
                    <span>{article.readMinutes} мин унших</span>
                  </span>
                )}
                {article.publishedAt && (
                  <span className="text-xs text-nebula-text/50">• {article.publishedAt}</span>
                )}
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-white leading-tight">
                {article.title}
              </h2>
            </div>

            {/* Author Workshop Card */}
            {article.makerName && (
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-3">
                  {article.makerLogo && (
                    <img
                      src={getImageUrl(article.makerLogo)}
                      alt={article.makerName}
                      className="w-10 h-10 rounded-full object-cover border border-white/20"
                    />
                  )}
                  <div>
                    <span className="text-xs text-nebula-text/70 block">Нийтэлсэн урлан:</span>
                    <span className="text-sm font-bold text-white flex items-center gap-1">
                      {article.makerName}
                      <ShieldCheck size={14} className="text-plasma" />
                    </span>
                  </div>
                </div>

                {article.makerPhone && (
                  <a
                    href={`tel:${article.makerPhone.replace(/\D/g, '')}`}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600/20 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-600 hover:text-white text-xs font-bold transition-all flex items-center gap-1.5"
                  >
                    <Phone size={13} />
                    <span>Залгах</span>
                  </a>
                )}
              </div>
            )}

            {/* Summary */}
            <p className="text-sm font-semibold text-plasma/90 italic bg-plasma/5 p-3 rounded-xl border border-plasma/20">
              "{article.summary}"
            </p>

            {/* Full text */}
            <div className="text-sm text-starlight/90 leading-relaxed space-y-3 whitespace-pre-line font-normal">
              {article.content}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
