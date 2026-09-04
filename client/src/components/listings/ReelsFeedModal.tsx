import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Volume2, VolumeX, ChevronUp, ChevronDown, Phone, MapPin, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Listing } from '@/types';
import { useI18n } from '@/i18n';
import { getImageUrl } from '../../utils/imageUrl';

interface ReelsFeedModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialListingId?: string;
  listings: Listing[];
}

export const ReelsFeedModal: React.FC<ReelsFeedModalProps> = ({
  isOpen,
  onClose,
  initialListingId,
  listings,
}) => {
  const { t } = useI18n();
  const reelListings = listings.filter((l) => Boolean(l.videoUrl || l.hasVideo));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const videoRefs = useRef<{ [key: number]: HTMLVideoElement | null }>({});

  useEffect(() => {
    if (initialListingId) {
      const idx = reelListings.findIndex((l) => l.id === initialListingId);
      if (idx !== -1) setCurrentIndex(idx);
    }
  }, [initialListingId, reelListings]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowUp') handlePrev();
      if (e.key === 'ArrowDown') handleNext();
      if (e.key === 'm' || e.key === 'M') setIsMuted((m) => !m);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex, reelListings.length]);

  const handleNext = () => {
    if (currentIndex < reelListings.length - 1) {
      setCurrentIndex((i) => i + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1);
    }
  };

  if (!isOpen || reelListings.length === 0) return null;

  const current = reelListings[currentIndex];
  const seller = current?.user;
  const sellerPhone = seller?.phone || current?.contactPhone || '89767700';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 z-50 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-all border border-white/20 shadow-2xl cursor-pointer"
          title={t.reelsFeed.close}
        >
          <X size={22} />
        </button>

        {/* Up / Down Navigation Controls (Desktop) */}
        <div className="hidden md:flex flex-col gap-3 absolute right-8 top-1/2 -translate-y-1/2 z-40">
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="p-3 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-30 text-white backdrop-blur-md transition-all border border-white/20 shadow-xl cursor-pointer"
            title={t.reelsFeed.prev}
          >
            <ChevronUp size={24} />
          </button>
          <div className="text-center text-xs font-bold text-white/80 select-none py-1">
            {currentIndex + 1} / {reelListings.length}
          </div>
          <button
            onClick={handleNext}
            disabled={currentIndex === reelListings.length - 1}
            className="p-3 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-30 text-white backdrop-blur-md transition-all border border-white/20 shadow-xl cursor-pointer"
            title={t.reelsFeed.next}
          >
            <ChevronDown size={24} />
          </button>
        </div>

        {/* 9:16 Vertical Video Frame Container */}
        <div className="relative w-full h-full max-w-sm md:max-w-md md:h-[88vh] md:rounded-3xl overflow-hidden bg-black shadow-2xl border border-white/15 flex items-center justify-center">
          {current.videoUrl ? (
            <video
              ref={(el) => {
                videoRefs.current[currentIndex] = el;
              }}
              src={getImageUrl(current.videoUrl)}
              autoPlay
              loop
              playsInline
              muted={isMuted}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white/50">
              {t.reelsFeed.noVideo}
            </div>
          )}

          {/* Sound Toggle Floating Button */}
          <button
            onClick={() => setIsMuted((m) => !m)}
            className="absolute top-5 left-5 z-30 p-2.5 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-md border border-white/20 shadow-lg cursor-pointer"
            title={isMuted ? t.reelsFeed.unmute : t.reelsFeed.mute}
          >
            {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} className="text-plasma" />}
          </button>

          {/* Reel Duration / Live Indicator */}
          <div className="absolute top-5 right-5 md:right-16 z-30 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-xs font-bold flex items-center gap-1.5 border border-white/20">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
            <span>{t.reelsFeed.walkthrough}</span>
          </div>

          {/* Bottom Property Info Glass Card Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-black/95 via-black/70 to-transparent pt-16 z-30 space-y-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-plasma text-white-force uppercase">
                  {current.type === 'RENT' || current.type === 'rent' ? t.listings.rent : t.listings.sale}
                </span>
                <span className="text-xl font-black text-white">
                  {Number(current.price).toLocaleString()} ₮
                </span>
              </div>
              <h3 className="text-sm font-bold text-white line-clamp-1">
                {current.title}
              </h3>
              <div className="flex items-center text-xs text-white/80 gap-1">
                <MapPin size={13} className="text-plasma flex-shrink-0" />
                <span className="truncate">{current.district} {current.khoroo ? `• ${current.khoroo}` : ''} • {current.areaSqm} {t.listings.sqm}</span>
              </div>
            </div>

            {/* Quick Actions Row */}
            <div className="flex items-center gap-2 pt-1">
              <a
                href={`tel:${sellerPhone.replace(/\D/g, '')}`}
                className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 text-xs shadow-lg shadow-emerald-500/25 active:scale-95 transition-all"
              >
                <Phone size={14} />
                <span>{t.reelsFeed.call} ({sellerPhone})</span>
              </a>

              <Link
                to={`/listings/${current.id}`}
                onClick={onClose}
                className="bg-white/20 hover:bg-white/30 text-white font-bold py-2.5 px-3.5 rounded-xl flex items-center justify-center gap-1 text-xs border border-white/20 active:scale-95 transition-all"
              >
                <span>{t.reelsFeed.details}</span>
                <ExternalLink size={13} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </AnimatePresence>
  );
};
