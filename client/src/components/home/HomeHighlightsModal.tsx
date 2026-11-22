import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Zap, Scale, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useI18n } from '@/i18n';

const STORAGE_KEY_HIDE = 'vmax_hide_home_highlights';
const SESSION_KEY_HIDE = 'vmax_hide_home_highlights_session';

export const HomeHighlightsModal: React.FC = () => {
  const { t } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const items = [
    {
      id: 'verified',
      icon: Sparkles,
      iconClass: 'text-plasma bg-plasma/15 border-plasma/30',
      shortLabel: 'Бодит зар',
      tag: '100% Баталгаажсан',
      title: t.homeHighlights.verifiedTitle,
      desc: t.homeHighlights.verifiedDesc,
    },
    {
      id: 'fast-search',
      icon: Zap,
      iconClass: 'text-aurora bg-aurora/15 border-aurora/30',
      shortLabel: 'Хурдан хайлт',
      tag: 'Ухаалаг систем',
      title: t.homeHighlights.fastSearchTitle,
      desc: t.homeHighlights.fastSearchDesc,
    },
    {
      id: 'compare',
      icon: Scale,
      iconClass: 'text-nova bg-nova/15 border-nova/30',
      shortLabel: 'Харьцуулалт',
      tag: 'Зэрэгцүүлэн үзэх',
      title: t.homeHighlights.compareTitle,
      desc: t.homeHighlights.compareDesc,
    },
  ];

  // Check on mount whether to show modal
  useEffect(() => {
    try {
      const isPermanentlyHidden = localStorage.getItem(STORAGE_KEY_HIDE) === 'true';
      const isSessionHidden = sessionStorage.getItem(SESSION_KEY_HIDE) === 'true';

      if (!isPermanentlyHidden && !isSessionHidden) {
        // Small delay so page renders first
        const timer = setTimeout(() => {
          setIsOpen(true);
        }, 350);
        return () => clearTimeout(timer);
      }
    } catch {
      setIsOpen(true);
    }
  }, []);

  // Auto-advance carousel
  useEffect(() => {
    if (!isOpen || isPaused) return;

    timerRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length);
    }, 4500);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isOpen, isPaused, items.length]);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % items.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
  };

  const handleToggleDontShowAgain = (checked: boolean) => {
    setDontShowAgain(checked);
    try {
      if (checked) {
        localStorage.setItem(STORAGE_KEY_HIDE, 'true');
      } else {
        localStorage.removeItem(STORAGE_KEY_HIDE);
      }
    } catch {
      // ignore
    }
  };

  const handleClose = () => {
    try {
      if (dontShowAgain) {
        localStorage.setItem(STORAGE_KEY_HIDE, 'true');
      } else {
        sessionStorage.setItem(SESSION_KEY_HIDE, 'true');
      }
    } catch {
      // ignore
    }
    setIsOpen(false);
  };

  if (!isOpen) return null;

  const currentItem = items[currentIndex];
  const IconComponent = currentItem.icon;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-void/70 dark:bg-black/75 backdrop-blur-md animate-fade-in">
        {/* Backdrop click to close */}
        <div
          className="fixed inset-0 -z-10"
          onClick={handleClose}
          aria-hidden="true"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 12 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-[#12121f] border border-slate-200 dark:border-white/10 shadow-2xl p-6 sm:p-7 text-slate-900 dark:text-starlight overflow-hidden"
        >
          {/* Ambient Glows */}
          <div className="absolute -top-14 -right-14 w-44 h-44 bg-gradient-to-br from-plasma/20 to-nova/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-14 -left-14 w-44 h-44 bg-gradient-to-tr from-aurora/15 to-plasma/15 rounded-full blur-3xl pointer-events-none" />

          {/* Close Button (X) */}
          <button
            type="button"
            onClick={handleClose}
            aria-label="Хаах"
            className="absolute top-4 right-4 sm:top-5 sm:right-5 p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition cursor-pointer"
          >
            <X size={18} />
          </button>

          {/* Modal Header */}
          <div className="space-y-1.5 mb-5 pr-8">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-plasma/15 border border-plasma/30 text-plasma text-[11px] font-black uppercase tracking-wider">
              <Sparkles size={13} />
              <span>Vmax.mn-д тавтай морилно уу</span>
            </div>
            <h3 className="text-lg sm:text-xl font-heading font-black text-slate-900 dark:text-white tracking-tight">
              Үл хөдлөх хөрөнгийн ухаалаг платформ
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-nebula-text">
              Таны цаг хугацаа, сонголтод зориулсан давуу талууд
            </p>
          </div>

          {/* Interactive Carousel Showcase */}
          <div className="relative overflow-hidden rounded-2xl border border-plasma/20 bg-gradient-to-br from-plasma/5 via-slate-50 to-indigo-50/40 dark:from-cosmic/70 dark:via-[#1a1236]/50 dark:to-cosmic/70 p-4 sm:p-5 mb-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentItem.id}
                initial={{ opacity: 0, x: 18 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -18 }}
                transition={{ duration: 0.25 }}
                className="flex items-start space-x-3.5"
              >
                <div className={`p-3 rounded-2xl border shrink-0 shadow-xs ${currentItem.iconClass}`}>
                  <IconComponent size={24} />
                </div>
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-plasma bg-plasma/10 dark:bg-plasma/20 px-2 py-0.5 rounded-full">
                      {currentItem.tag}
                    </span>
                    <span className="text-[11px] text-slate-400 dark:text-nebula-text font-mono">
                      {currentIndex + 1} / {items.length}
                    </span>
                  </div>
                  <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white tracking-tight">
                    {currentItem.title}
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-nebula-text leading-relaxed">
                    {currentItem.desc}
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Carousel navigation controls */}
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-200/60 dark:border-white/10">
              {/* Pagination Dots */}
              <div className="flex items-center space-x-1.5">
                {items.map((item, idx) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setCurrentIndex(idx)}
                    aria-label={`Slide ${idx + 1}`}
                    className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                      currentIndex === idx
                        ? 'w-6 bg-gradient-to-r from-plasma to-nova shadow-xs'
                        : 'w-2 bg-slate-300 dark:bg-white/20 hover:bg-slate-400 dark:hover:bg-white/40'
                    }`}
                  />
                ))}
              </div>

              {/* Prev / Next Buttons */}
              <div className="flex items-center space-x-1.5">
                <button
                  type="button"
                  onClick={handlePrev}
                  aria-label="Өмнөх"
                  className="p-1.5 rounded-xl border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-void/60 hover:border-plasma/40 text-slate-600 dark:text-nebula-text hover:text-plasma dark:hover:text-white transition cursor-pointer shadow-xs"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  aria-label="Дараах"
                  className="p-1.5 rounded-xl border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-void/60 hover:border-plasma/40 text-slate-600 dark:text-nebula-text hover:text-plasma dark:hover:text-white transition cursor-pointer shadow-xs"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Quick Select Tabs */}
          <div className="grid grid-cols-3 gap-2 mb-5">
            {items.map((item, idx) => {
              const TabIcon = item.icon;
              const isSelected = currentIndex === idx;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setCurrentIndex(idx)}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'border-plasma/60 bg-plasma/10 dark:bg-plasma/20 shadow-xs'
                      : 'border-slate-200/80 dark:border-white/5 bg-slate-50/60 dark:bg-white/5 hover:border-slate-300 dark:hover:border-white/15'
                  }`}
                >
                  <div className="flex items-center space-x-1.5">
                    <TabIcon
                      size={14}
                      className={isSelected ? 'text-plasma' : 'text-slate-400 dark:text-nebula-text'}
                    />
                    <span
                      className={`text-[11px] font-bold truncate ${
                        isSelected
                          ? 'text-plasma font-black'
                          : 'text-slate-700 dark:text-starlight'
                      }`}
                    >
                      {item.shortLabel}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Modal Footer: Don't show again checkbox & Action button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3.5 border-t border-slate-200/60 dark:border-white/10">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={dontShowAgain}
                onChange={(e) => handleToggleDontShowAgain(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 dark:border-white/20 text-plasma focus:ring-plasma/30 cursor-pointer accent-purple-600"
              />
              <span className="text-xs sm:text-sm font-medium text-slate-600 dark:text-nebula-text hover:text-slate-900 dark:hover:text-white transition-colors">
                {t.homeHighlights.dontShowAgain || 'Дахин харуулахгүй'}
              </span>
            </label>

            <button
              type="button"
              onClick={handleClose}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-plasma to-nova hover:from-plasma/90 hover:to-nova/90 text-white-force font-bold text-xs sm:text-sm shadow-md shadow-plasma/30 transition-all flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.02] active:scale-95"
            >
              <span>Ойлголоо</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
