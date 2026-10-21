import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Volume2, VolumeX, ChevronUp, ChevronDown, Phone, MapPin, ExternalLink, Play, RefreshCw, AlertCircle } from 'lucide-react';
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
  const reelListings = listings.filter((l) => Boolean(l.videoUrl && l.videoUrl.trim().length > 0));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isBuffering, setIsBuffering] = useState(false);
  const [hasError, setHasError] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const progressBarRef = useRef<HTMLDivElement | null>(null);

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
      if (e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault();
        togglePlay();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex, reelListings.length, isPlaying]);

  // Video autoplay & reset on current item change
  useEffect(() => {
    if (!isOpen) return;
    setHasError(false);
    setIsBuffering(true);
    setIsPlaying(true);
    if (progressBarRef.current) {
      progressBarRef.current.style.width = '0%';
    }

    const video = videoRef.current;
    if (video) {
      video.defaultMuted = true;
      video.muted = isMuted;
      video.currentTime = 0;
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
            setIsBuffering(false);
          })
          .catch((err) => {
            console.warn('Autoplay prevented on reel:', err);
            // Fallback to muted autoplay
            video.muted = true;
            setIsMuted(true);
            video.play()
              .then(() => setIsPlaying(true))
              .catch(() => setIsPlaying(false));
            setIsBuffering(false);
          });
      }
    }
  }, [isOpen, currentIndex]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

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
  const sellerPhone = current?.contactPhone || current?.attributes?.contactPhone || seller?.phone || '89767700';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 z-50 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-all border border-white/20 shadow-2xl cursor-pointer"
          title={t.reelsFeed.close}
        >
          <X size={22} />
        </button>

        {/* Up / Down Navigation Controls (Desktop) */}
        {reelListings.length > 1 && (
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
        )}

        {/* 9:16 Vertical Video Frame Container */}
        <div className="relative w-full h-full max-w-sm md:max-w-md md:h-[88vh] md:rounded-3xl overflow-hidden bg-black shadow-2xl border border-white/15 flex items-center justify-center select-none group">
          {current.videoUrl ? (
            <video
              key={`${current.id}-${currentIndex}`}
              ref={videoRef}
              src={getImageUrl(current.videoUrl)}
              autoPlay
              loop
              playsInline
              preload="auto"
              muted={isMuted}
              className="w-full h-full object-cover cursor-pointer transform-gpu"
              onClick={togglePlay}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onWaiting={() => setIsBuffering(true)}
              onPlaying={() => {
                setIsBuffering(false);
                setIsPlaying(true);
              }}
              onCanPlay={() => setIsBuffering(false)}
              onError={(e) => {
                console.error('Reel video playback error:', e);
                setHasError(true);
                setIsBuffering(false);
              }}
              onTimeUpdate={() => {
                if (videoRef.current && videoRef.current.duration && progressBarRef.current) {
                  const pct = (videoRef.current.currentTime / videoRef.current.duration) * 100;
                  progressBarRef.current.style.width = `${pct}%`;
                }
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white/50">
              {t.reelsFeed.noVideo}
            </div>
          )}

          {/* Central Play Indicator Overlay when paused */}
          {!isPlaying && !isBuffering && (
            <div
              onClick={togglePlay}
              className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px] cursor-pointer z-20"
            >
              <div className="w-16 h-16 rounded-full bg-plasma/90 text-white flex items-center justify-center shadow-2xl pl-1 hover:scale-110 transition-transform">
                <Play size={32} fill="currentColor" />
              </div>
            </div>
          )}

          {/* Buffering Spinner */}
          {isBuffering && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
              <div className="p-3 rounded-full bg-black/60 backdrop-blur-md">
                <RefreshCw className="animate-spin text-plasma" size={28} />
              </div>
            </div>
          )}

          {/* Error Message with Retry */}
          {hasError && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-30 p-6 text-center space-y-3">
              <AlertCircle size={32} className="text-red-400" />
              <p className="text-sm font-semibold text-white/90">Бичлэг тоглуулахад алдаа гарлаа</p>
              <button
                type="button"
                onClick={() => {
                  setHasError(false);
                  if (videoRef.current) {
                    videoRef.current.load();
                    videoRef.current.play().catch(() => setIsPlaying(false));
                  }
                }}
                className="px-4 py-2 rounded-xl bg-plasma hover:bg-nova text-white text-xs font-bold transition-all shadow-lg"
              >
                Дахин тоглуулах
              </button>
            </div>
          )}

          {/* Sound Toggle Floating Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (videoRef.current) {
                videoRef.current.muted = !isMuted;
              }
              setIsMuted((m) => !m);
            }}
            className="absolute top-5 left-5 z-30 p-2.5 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-md border border-white/20 shadow-lg cursor-pointer"
            title={isMuted ? t.reelsFeed.unmute : t.reelsFeed.mute}
          >
            {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} className="text-plasma" />}
          </button>

          {/* Reel Duration / Live Indicator */}
          <div className="absolute top-5 right-5 md:right-16 z-30 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-xs font-bold flex items-center gap-1.5 border border-white/20 pointer-events-none">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
            <span>{t.reelsFeed.walkthrough}</span>
          </div>

          {/* Bottom Property Info Glass Card Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-black/95 via-black/75 to-transparent pt-16 z-30 space-y-3 pointer-events-none">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold text-white-force uppercase shadow-md ${
                  String(current.type).toLowerCase() === 'rent'
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-600'
                    : 'bg-gradient-to-r from-plasma to-nova'
                }`}>
                  {String(current.type).toLowerCase() === 'rent' ? t.listings.rent : t.listings.sale}
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
            <div className="flex items-center gap-2 pt-1 pointer-events-auto">
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

          {/* Progress Bar at Bottom */}
          <div className="absolute bottom-0 inset-x-0 h-1 bg-white/20 z-40">
            <div
              ref={progressBarRef}
              className="h-full bg-gradient-to-r from-plasma to-nova transition-[width] duration-75 ease-linear"
              style={{ width: '0%' }}
            />
          </div>
        </div>
      </div>
    </AnimatePresence>
  );
};
