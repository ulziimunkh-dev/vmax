import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Volume2, VolumeX, Play, Phone, ExternalLink, ShieldCheck, Sparkles, MapPin, Tag } from 'lucide-react';
import type { FurniturePortfolioItem, FurnitureMaker } from '@/types/furniture';
import { getImageUrl } from '@/utils/imageUrl';

interface FurnitureReelModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: FurniturePortfolioItem | null;
  maker?: FurnitureMaker | null;
}

export const FurnitureReelModal: React.FC<FurnitureReelModalProps> = ({
  isOpen,
  onClose,
  item,
  maker,
}) => {
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const progressBarRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'm' || e.key === 'M') setIsMuted((m) => !m);
      if (e.key === ' ') {
        e.preventDefault();
        togglePlay();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isPlaying]);

  useEffect(() => {
    if (!isOpen || !item?.videoUrl) return;

    if (progressBarRef.current) {
      progressBarRef.current.style.width = '0%';
    }

    const video = videoRef.current;
    if (video) {
      video.defaultMuted = true;
      video.muted = isMuted;
      video.currentTime = 0;
      video.play().catch(() => setIsPlaying(false));
    }
  }, [isOpen, item]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  if (!isOpen || !item) return null;

  const phone = maker?.phone || '89117722';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm p-3">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 z-50 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-all border border-white/20 shadow-2xl cursor-pointer"
          title="Хаах"
        >
          <X size={22} />
        </button>

        {/* 9:16 Reel Player Frame */}
        <div className="relative w-full h-full max-w-sm md:max-w-md md:h-[88vh] md:rounded-3xl overflow-hidden bg-black shadow-2xl border border-white/15 flex items-center justify-center select-none group">
          {item.videoUrl ? (
            <video
              ref={videoRef}
              src={getImageUrl(item.videoUrl)}
              autoPlay
              loop
              playsInline
              preload="auto"
              muted={isMuted}
              className="w-full h-full object-cover cursor-pointer transform-gpu"
              onClick={togglePlay}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onTimeUpdate={() => {
                if (videoRef.current && videoRef.current.duration && progressBarRef.current) {
                  const pct = (videoRef.current.currentTime / videoRef.current.duration) * 100;
                  progressBarRef.current.style.width = `${pct}%`;
                }
              }}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-white/70 p-6 text-center space-y-3">
              <Sparkles size={40} className="text-plasma opacity-80" />
              <p className="font-semibold">{item.title}</p>
              <p className="text-xs text-white/50">Энэ ажилд видео оруулаагүй байна</p>
            </div>
          )}

          {/* Central Play indicator when paused */}
          {!isPlaying && item.videoUrl && (
            <div
              onClick={togglePlay}
              className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px] cursor-pointer z-20"
            >
              <div className="w-16 h-16 rounded-full bg-plasma/90 text-white flex items-center justify-center shadow-2xl pl-1 hover:scale-110 transition-transform">
                <Play size={32} fill="currentColor" />
              </div>
            </div>
          )}

          {/* Sound Toggle Floating Button */}
          {item.videoUrl && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (videoRef.current) videoRef.current.muted = !isMuted;
                setIsMuted((m) => !m);
              }}
              className="absolute top-5 left-5 z-30 p-2.5 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-md border border-white/20 shadow-lg cursor-pointer"
              title={isMuted ? 'Дуу асаах' : 'Дуу хаах'}
            >
              {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} className="text-plasma" />}
            </button>
          )}

          {/* Reel Category Badge */}
          <div className="absolute top-5 right-5 z-30 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-xs font-bold flex items-center gap-1.5 border border-white/20 pointer-events-none">
            <span className="w-2 h-2 rounded-full bg-plasma animate-ping" />
            <span>Walkthrough Reel</span>
          </div>

          {/* Bottom Overlay: Maker Info & Direct Call Action */}
          <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-black/95 via-black/80 to-transparent pt-20 z-30 space-y-3 pointer-events-none">
            {maker && (
              <div className="flex items-center gap-2.5 pointer-events-auto">
                <div className="w-9 h-9 rounded-full overflow-hidden border border-white/30 bg-void flex-shrink-0">
                  <img
                    src={getImageUrl(maker.logoUrl || maker.coverUrl)}
                    alt={maker.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1540518614846-7ede433c4ef4?auto=format&fit=crop&w=200&q=80';
                    }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-bold text-white truncate">{maker.name}</span>
                    {maker.isVerified && <ShieldCheck size={14} className="text-plasma flex-shrink-0" />}
                  </div>
                  <span className="text-[11px] text-white/70 block truncate">
                    {maker.district} • {maker.experienceYears}+ жил туршлагатай
                  </span>
                </div>
              </div>
            )}

            <div className="space-y-1">
              <h3 className="text-sm font-bold text-white line-clamp-2 leading-snug">
                {item.title}
              </h3>
              {item.materials && (
                <div className="flex items-center gap-1.5 text-xs text-white/80">
                  <Tag size={12} className="text-plasma flex-shrink-0" />
                  <span className="truncate">{item.materials}</span>
                </div>
              )}
              {item.location && (
                <div className="flex items-center gap-1 text-xs text-white/60">
                  <MapPin size={12} className="text-aurora flex-shrink-0" />
                  <span className="truncate">{item.location} {item.durationDays ? `• ${item.durationDays} хоногт хийсэн` : ''}</span>
                </div>
              )}
            </div>

            {/* Direct Contact Button */}
            <div className="pt-1 pointer-events-auto flex items-center gap-2">
              <a
                href={`tel:${phone.replace(/\D/g, '')}`}
                className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 text-xs shadow-lg shadow-emerald-500/25 active:scale-95 transition-all cursor-pointer"
              >
                <Phone size={14} />
                <span>Шууд залгах ({phone})</span>
              </a>

              {maker?.facebookUrl && (
                <a
                  href={maker.facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-xl bg-blue-600/80 hover:bg-blue-600 text-white transition-all shadow-md active:scale-95"
                  title="Facebook хуудас"
                >
                  <ExternalLink size={14} />
                </a>
              )}
            </div>
          </div>

          {/* Progress Bar */}
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
