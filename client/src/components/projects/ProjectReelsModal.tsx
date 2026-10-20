import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Volume2,
  VolumeX,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Phone,
  Building2,
  Sparkles,
  Play,
  Pause,
} from 'lucide-react';
import type { Project, ProjectReelItem } from '@/types';
import { getImageUrl } from '@/utils/imageUrl';

interface ProjectReelsModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
  initialIndex?: number;
}

export const ProjectReelsModal: React.FC<ProjectReelsModalProps> = ({
  isOpen,
  onClose,
  project,
  initialIndex = 0,
}) => {
  const reels: ProjectReelItem[] = project.reels || [];
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressBarsRef = useRef<(HTMLDivElement | null)[]>([]);

  const syncBars = (activeIdx: number) => {
    reels.forEach((_, i) => {
      const bar = progressBarsRef.current[i];
      if (bar) {
        bar.style.width = i < activeIdx ? '100%' : '0%';
      }
    });
  };

  useEffect(() => {
    setCurrentIndex(initialIndex);
    setIsPlaying(true);
    syncBars(initialIndex);
  }, [initialIndex, isOpen]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') handleNext();
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') handlePrev();
      if (e.key === 'm' || e.key === 'M') setIsMuted((m) => !m);
      if (e.key === ' ') {
        e.preventDefault();
        togglePlay();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex, reels.length]);

  const handleNext = () => {
    if (currentIndex < reels.length - 1) {
      const nextIdx = currentIndex + 1;
      setCurrentIndex(nextIdx);
      setIsPlaying(true);
      syncBars(nextIdx);
    } else {
      // Loop to first or close
      setCurrentIndex(0);
      syncBars(0);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      const prevIdx = currentIndex - 1;
      setCurrentIndex(prevIdx);
      setIsPlaying(true);
      syncBars(prevIdx);
    }
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const current = videoRef.current.currentTime;
    const total = videoRef.current.duration;
    if (total > 0) {
      const bar = progressBarsRef.current[currentIndex];
      if (bar) {
        bar.style.width = `${(current / total) * 100}%`;
      }
    }
  };

  if (!isOpen || reels.length === 0) return null;

  const currentReel = reels[currentIndex];
  const videoSrc = getImageUrl(currentReel?.videoUrl);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm p-2 sm:p-4 media-player-dark">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 z-50 p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-white-force backdrop-blur-md transition-all border border-white/20 shadow-2xl cursor-pointer"
          title="Хаах (Esc)"
        >
          <X size={20} className="text-white text-white-force" />
        </button>

        {/* Navigation Arrows for Desktop */}
        <div className="hidden md:flex items-center gap-3 absolute left-6 top-1/2 -translate-y-1/2 z-40">
          <button
            type="button"
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="p-3 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-20 text-white text-white-force backdrop-blur-md transition-all border border-white/20 shadow-xl cursor-pointer"
            title="Өмнөх Reel"
          >
            <ChevronLeft size={28} className="text-white text-white-force" />
          </button>
        </div>

        <div className="hidden md:flex items-center gap-3 absolute right-6 top-1/2 -translate-y-1/2 z-40">
          <button
            type="button"
            onClick={handleNext}
            className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white text-white-force backdrop-blur-md transition-all border border-white/20 shadow-xl cursor-pointer"
            title="Дараах Reel"
          >
            <ChevronRight size={28} className="text-white text-white-force" />
          </button>
        </div>

        {/* 9:16 Vertical Reel Player Container */}
        <div className="relative w-full max-w-[380px] h-[82vh] max-h-[780px] bg-void rounded-3xl overflow-hidden shadow-2xl border border-white/15 flex flex-col justify-between select-none">
          {/* Top Story/Reel Progress Segments */}
          <div className="absolute top-3 left-3 right-3 z-30 flex items-center gap-1.5 pointer-events-none">
            {reels.map((_, i) => (
              <div key={i} className="flex-1 h-1 rounded-full bg-white/30 overflow-hidden backdrop-blur-md">
                <div
                  ref={(el) => { progressBarsRef.current[i] = el; }}
                  className="h-full bg-plasma transition-[width] duration-75 ease-linear"
                  style={{
                    width: i < currentIndex ? '100%' : '0%',
                  }}
                />
              </div>
            ))}
          </div>

          {/* Top Header Controls */}
          <div className="absolute top-7 left-3 right-3 z-30 flex items-center justify-between text-white text-white-force pointer-events-auto">
            <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20">
              <Building2 size={13} className="text-plasma" />
              <span className="text-xs font-bold truncate max-w-[170px] text-white text-white-force">{project.name}</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsMuted(!isMuted)}
                className="p-2 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md border border-white/20 text-white text-white-force transition-all cursor-pointer"
                title={isMuted ? 'Дуу асаах' : 'Дуу хаах'}
              >
                {isMuted ? <VolumeX size={16} className="text-white text-white-force" /> : <Volume2 size={16} className="text-white text-white-force" />}
              </button>
            </div>
          </div>

          {/* Video Player */}
          <div
            className="relative w-full h-full flex items-center justify-center bg-black cursor-pointer overflow-hidden"
            onClick={togglePlay}
          >
            <video
              ref={videoRef}
              key={videoSrc}
              src={videoSrc}
              autoPlay
              playsInline
              preload="auto"
              loop
              muted={isMuted}
              onTimeUpdate={handleTimeUpdate}
              onEnded={handleNext}
              className="w-full h-full object-cover transform-gpu"
            />

            {/* Play/Pause Overlay indicator */}
            {!isPlaying && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="absolute inset-0 flex items-center justify-center bg-black/30 pointer-events-none"
              >
                <div className="p-4 rounded-full bg-plasma/90 text-white text-white-force shadow-2xl backdrop-blur-md">
                  <Play size={32} className="translate-x-0.5 text-white text-white-force" />
                </div>
              </motion.div>
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/40 pointer-events-none" />
          </div>

          {/* Bottom Info & Contact Bar */}
          <div className="absolute bottom-0 left-0 right-0 p-4 z-30 space-y-3 pointer-events-auto">
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-plasma uppercase tracking-wider block">
                {project.developerName} • REEL {currentIndex + 1}/{reels.length}
              </span>
              <h3 className="text-sm sm:text-base font-bold text-white text-white-force leading-snug line-clamp-2">
                {currentReel?.title || project.name}
              </h3>
            </div>

            <div className="flex items-center gap-2 pt-1">
              {project.salesPhone && (
                <a
                  href={`tel:${project.salesPhone.split(',')[0].trim()}`}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-plasma to-nova hover:from-plasma/90 hover:to-nova/90 text-white text-white-force font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-plasma/30 transition-all cursor-pointer"
                >
                  <Phone size={14} className="text-white-force" />
                  <span className="text-white-force">Шууд залгах ({project.salesPhone.split(',')[0].trim()})</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </AnimatePresence>
  );
};
