import React, { useState, useEffect } from 'react';
import { Download, X, WifiOff, CheckCircle2, Share2, Smartphone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export const PWAInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSPrompt, setShowIOSPrompt] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [showOnlineToast, setShowOnlineToast] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Check if dismissed previously
    const dismissedAt = localStorage.getItem('vmax_pwa_dismissed');
    if (dismissedAt) {
      const hoursPassed = (Date.now() - parseInt(dismissedAt, 10)) / (1000 * 60 * 60);
      if (hoursPassed < 48) {
        setIsDismissed(true);
      }
    }

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    const isInStandaloneMode = ('standalone' in window.navigator) && (window.navigator as any).standalone;
    
    if (isIosDevice && !isInStandaloneMode) {
      setIsIOS(true);
    }

    // Handle BeforeInstallPrompt for Chrome / Android / Edge
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Online / Offline Listeners
    const handleOnline = () => {
      setIsOffline(false);
      setShowOnlineToast(true);
      setTimeout(() => setShowOnlineToast(false), 4000);
    };

    const handleOffline = () => {
      setIsOffline(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      if (isIOS) {
        setShowIOSPrompt(true);
      }
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstallable(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    localStorage.setItem('vmax_pwa_dismissed', Date.now().toString());
  };

  return (
    <>
      {/* Offline Status Warning Bar */}
      <AnimatePresence>
        {isOffline && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-20 md:bottom-4 left-4 right-4 md:left-auto md:right-4 z-50 bg-rose-500/90 backdrop-blur-md text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center space-x-3 border border-rose-400/40 text-sm max-w-md"
          >
            <WifiOff className="w-5 h-5 flex-shrink-0 animate-pulse" />
            <div className="flex-1 text-xs">
              <span className="font-bold">Интернэт холболт тасарлаа.</span>
              <p className="opacity-90">Та оффлайн горимд өмнө үзсэн зарууд руугаа хандах боломжтой.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Online Restored Toast */}
      <AnimatePresence>
        {showOnlineToast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-20 md:bottom-4 left-4 right-4 md:left-auto md:right-4 z-50 bg-emerald-600/90 backdrop-blur-md text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center space-x-3 border border-emerald-400/40 text-sm max-w-md"
          >
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            <span className="font-semibold text-xs">Интернэт холболт сэргэлээ. Систем хэвийн ажиллаж байна.</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* PWA Floating Install Banner */}
      <AnimatePresence>
        {(isInstallable || isIOS) && !isDismissed && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            transition={{ type: 'spring', damping: 20 }}
            className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-40 max-w-sm w-[calc(100%-2rem)] md:w-auto"
          >
            <div className="glass-card p-4 rounded-2xl border-glow shadow-2xl bg-void/90 backdrop-blur-xl border border-plasma/30 relative overflow-hidden">
              {/* Background gradient orb */}
              <div className="absolute -top-10 -right-10 w-24 h-24 bg-plasma/20 rounded-full blur-xl pointer-events-none" />

              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center space-x-3">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-plasma via-nova to-aurora p-0.5 flex-shrink-0 shadow-lg shadow-plasma/30 flex items-center justify-center">
                    <div className="w-full h-full bg-void rounded-[10px] flex items-center justify-center">
                      <Smartphone className="w-5 h-5 text-plasma" />
                    </div>
                  </div>
                  <div>
                    <h4 className="text-starlight font-bold text-sm leading-snug">Vmax Апп Суулгах</h4>
                    <p className="text-nebula-text text-xs">Утсан дээрээ хурдан нээх, зар шууд үзэх</p>
                  </div>
                </div>

                <button
                  onClick={handleDismiss}
                  className="text-nebula-text hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors"
                  aria-label="Хаах"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="mt-3 flex items-center space-x-2">
                <button
                  onClick={handleInstallClick}
                  className="flex-1 py-2 px-4 bg-gradient-to-r from-plasma to-nova text-white text-xs font-semibold rounded-xl hover:shadow-lg hover:shadow-plasma/30 transition-all flex items-center justify-center space-x-2 active:scale-95"
                >
                  <Download size={14} />
                  <span>{isIOS ? 'Суулгах заавар' : 'Апп суулгах'}</span>
                </button>
                <button
                  onClick={handleDismiss}
                  className="py-2 px-3 bg-white/5 hover:bg-white/10 text-nebula-text hover:text-starlight text-xs font-medium rounded-xl transition-all"
                >
                  Дараа
                </button>
              </div>

              {/* iOS Guide Modal / Dropdown */}
              {showIOSPrompt && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-3 pt-3 border-t border-white/10 text-xs text-nebula-text space-y-1.5"
                >
                  <p className="font-semibold text-starlight">iOS Safari дээр суулгах:</p>
                  <div className="flex items-center space-x-1.5 text-[11px]">
                    <span>1. Доорх</span>
                    <span className="p-1 bg-white/10 rounded inline-flex items-center text-plasma"><Share2 size={12} /></span>
                    <span>(Share) товчийг дарна</span>
                  </div>
                  <div className="text-[11px]">
                    2. Цэснээс <strong className="text-plasma">"Add to Home Screen"</strong> (Үндсэн дэлгэцэнд нэмэх) сонгоно.
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
