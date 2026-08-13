import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Scale, X, ArrowRight, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCompareStore } from '@/store/useCompareStore';
import { getImageUrl } from '@/utils/imageUrl';

export const CompareFloatingBar: React.FC = () => {
  const { compareListings, removeFromCompare, clearCompare } = useCompareStore();

  if (compareListings.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-4xl px-4"
      >
        <div className="bg-cosmic/90 backdrop-blur-xl border border-plasma/40 shadow-2xl shadow-plasma/20 rounded-2xl p-4 flex items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-plasma/20 rounded-xl text-plasma flex items-center justify-center">
              <Scale size={22} className="animate-pulse" />
            </div>
            <div>
              <h4 className="text-starlight font-bold text-sm flex items-center space-x-2">
                <span>Үл хөдлөх хөрөнгө харьцуулах</span>
                <span className="px-2 py-0.5 bg-plasma text-white text-xs font-black rounded-full">
                  {compareListings.length}/4
                </span>
              </h4>
              <p className="text-nebula-text text-xs">
                {compareListings.length < 2 ? 'Дахин 1-ийг сонгож харьцуулна уу' : 'Зэрэгцүүлэн харьцуулахад бэлэн'}
              </p>
            </div>
          </div>

          {/* Selected Listing Thumbnails */}
          <div className="hidden sm:flex items-center space-x-2">
            {compareListings.map((item) => {
              const id = item.id || (item as any)._id;
              return (
                <div key={id} className="relative group w-12 h-12 rounded-lg overflow-hidden border border-white/20 bg-void">
                  <img
                    src={getImageUrl(item.images?.[0])}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => removeFromCompare(id)}
                    className="absolute inset-0 bg-void/80 text-red-400 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                    title="Хасах"
                  >
                    <X size={16} />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2">
            <button
              onClick={clearCompare}
              className="p-2.5 text-nebula-text hover:text-red-400 hover:bg-void/50 rounded-xl transition-all"
              title="Цэвэрлэх"
            >
              <Trash2 size={18} />
            </button>

            <Link
              to="/compare"
              className="px-5 py-2.5 bg-gradient-to-r from-plasma to-aurora text-white-force text-sm font-bold rounded-xl hover:shadow-lg hover:shadow-plasma/30 transition-all flex items-center space-x-2 active:scale-95"
            >
              <span>Харьцуулах</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
