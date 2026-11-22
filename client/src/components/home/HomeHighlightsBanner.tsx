import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Zap, Scale, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useI18n } from '@/i18n';

const STORAGE_KEY_HIDE = 'vmax_hide_home_highlights';
const SESSION_KEY_HIDE = 'vmax_hide_home_highlights_session';

export const HomeHighlightsBanner: React.FC = () => {
  const { t } = useI18n();
  const [isVisible, setIsVisible] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const items = [
    {
      id: 'verified',
      icon: Sparkles,
      iconClass: 'text-plasma bg-plasma/15 border-plasma/30',
      title: t.homeHighlights.verifiedTitle,
      desc: t.homeHighlights.verifiedDesc,
    },
    {
      id: 'fast-search',
      icon: Zap,
      iconClass: 'text-aurora bg-aurora/15 border-aurora/30',
      title: t.homeHighlights.fastSearchTitle,
      desc: t.homeHighlights.fastSearchDesc,
    },
    {
      id: 'compare',
      icon: Scale,
      iconClass: 'text-nova bg-nova/15 border-nova/30',
      title: t.homeHighlights.compareTitle,
      desc: t.homeHighlights.compareDesc,
    },
  ];

  useEffect(() => {
    try {
      const isPermanentlyHidden = localStorage.getItem(STORAGE_KEY_HIDE) === 'true';
      const isSessionHidden = sessionStorage.getItem(SESSION_KEY_HIDE) === 'true';

      if (!isPermanentlyHidden && !isSessionHidden) {
        setIsVisible(true);
      }
    } catch {
      setIsVisible(true);
    }
  }, []);

  // Auto-advance for mobile carousel
  useEffect(() => {
    if (!isVisible || isPaused) return;

    timerRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length);
    }, 4500);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isVisible, isPaused, items.length]);

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
      // ignore in incognito/restricted storage
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
    setIsVisible(false);
  };

  if (!isVisible) return null;

  const currentItem = items[currentIndex];
  const IconComponent = currentItem.icon;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10, height: 0 }}
        animate={{ opacity: 1, y: 0, height: 'auto' }}
        exit={{ opacity: 0, y: -10, height: 0 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="mt-5 overflow-hidden"
      >
        <div
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          className="relative overflow-hidden rounded-2xl border border-plasma/25 bg-gradient-to-r from-plasma/10 via-purple-50/70 to-indigo-50/50 dark:from-cosmic/90 dark:via-[#1a1236]/80 dark:to-cosmic/90 backdrop-blur-md shadow-lg p-3 sm:p-4"
        >
          {/* Subtle background ambient lights */}
          <div className="absolute -right-10 -bottom-10 w-44 h-44 bg-plasma/10 dark:bg-plasma/20 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -left-10 -top-10 w-36 h-36 bg-nova/10 dark:bg-nova/15 rounded-full blur-2xl pointer-events-none" />

          {/* Banner Top Header: Title/Tag + Controls */}
          <div className="relative z-10 flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-200/60 dark:border-white/10">
            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-plasma/15 border border-plasma/30 text-plasma text-[11px] font-black uppercase tracking-wider">
                <Sparkles size={12} />
                <span>Vmax давуу талууд</span>
              </span>
              <span className="hidden sm:inline-block text-slate-500 dark:text-nebula-text text-xs">
                {t.homeHighlights.subheading || 'Баталгаажсан үл хөдлөх хөрөнгийн платформ'}
              </span>
            </div>

            <div className="flex items-center gap-3">
              {/* Don't show next time checkbox */}
              <label className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs text-slate-500 dark:text-nebula-text hover:text-slate-800 dark:hover:text-starlight cursor-pointer select-none transition-colors">
                <input
                  type="checkbox"
                  checked={dontShowAgain}
                  onChange={(e) => handleToggleDontShowAgain(e.target.checked)}
                  className="w-3.5 h-3.5 rounded border-slate-300 dark:border-white/20 text-plasma focus:ring-plasma/30 cursor-pointer accent-purple-600"
                />
                <span>{t.homeHighlights.dontShowAgain || 'Дахин харуулахгүй'}</span>
              </label>

              {/* Close Button */}
              <button
                type="button"
                onClick={handleClose}
                aria-label={t.homeHighlights.close || 'Хаах'}
                title={t.homeHighlights.close || 'Хаах'}
                className="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 text-slate-400 dark:text-nebula-text hover:text-slate-700 dark:hover:text-white transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* 📱 Mobile & Tablet View: Animated Carousel with Controls */}
          <div className="relative z-10 lg:hidden flex flex-col gap-2.5">
            <div className="flex items-center justify-between gap-2">
              {/* Prev Button */}
              <button
                type="button"
                onClick={handlePrev}
                aria-label="Previous highlight"
                className="p-1.5 rounded-xl border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-void/60 text-slate-600 dark:text-nebula-text hover:text-plasma dark:hover:text-white hover:border-plasma/40 transition-all cursor-pointer shrink-0 shadow-xs"
              >
                <ChevronLeft size={16} />
              </button>

              {/* Carousel Content */}
              <div className="flex-1 min-w-0">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentItem.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.25 }}
                    className="flex items-center space-x-3 p-2 rounded-xl bg-white/70 dark:bg-white/5 border border-slate-200/60 dark:border-white/5"
                  >
                    <div
                      className={`p-2.5 rounded-xl border flex-shrink-0 transition-transform duration-300 shadow-xs ${currentItem.iconClass}`}
                    >
                      <IconComponent size={20} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-slate-900 dark:text-starlight font-bold text-xs sm:text-sm tracking-tight truncate">
                        {currentItem.title}
                      </h4>
                      <p className="text-slate-600 dark:text-nebula-text text-[11px] sm:text-xs truncate font-medium">
                        {currentItem.desc}
                      </p>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Next Button */}
              <button
                type="button"
                onClick={handleNext}
                aria-label="Next highlight"
                className="p-1.5 rounded-xl border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-void/60 text-slate-600 dark:text-nebula-text hover:text-plasma dark:hover:text-white hover:border-plasma/40 transition-all cursor-pointer shrink-0 shadow-xs"
              >
                <ChevronRight size={16} />
              </button>
            </div>

            {/* Pagination Dots */}
            <div className="flex items-center justify-center space-x-1.5 pt-0.5">
              {items.map((item, idx) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setCurrentIndex(idx)}
                  aria-label={`Go to slide ${idx + 1}`}
                  className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                    currentIndex === idx
                      ? 'w-6 bg-gradient-to-r from-plasma to-nova shadow-xs'
                      : 'w-1.5 bg-slate-300 dark:bg-white/20 hover:bg-slate-400 dark:hover:bg-white/40'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* 💻 Desktop View: Full 3-Card Carousel List */}
          <div className="relative z-10 hidden lg:grid lg:grid-cols-3 gap-3">
            {items.map((item) => {
              const ItemIcon = item.icon;
              return (
                <div
                  key={item.id}
                  className="flex items-center space-x-3 p-3 rounded-xl bg-white/70 dark:bg-white/5 border border-slate-200/60 dark:border-white/5 hover:border-plasma/30 dark:hover:border-plasma/40 transition-all shadow-xs"
                >
                  <div
                    className={`p-2.5 rounded-xl border flex-shrink-0 shadow-xs ${item.iconClass}`}
                  >
                    <ItemIcon size={20} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-slate-900 dark:text-starlight font-bold text-sm tracking-tight truncate">
                      {item.title}
                    </h4>
                    <p className="text-slate-600 dark:text-nebula-text text-xs truncate font-medium">
                      {item.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
