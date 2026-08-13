import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useI18n } from '@/i18n';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';

interface Slide {
  id: number;
  image: string;
  badgeKey: string;
  titleKey: string;
  descKey: string;
}

const SLIDES: Slide[] = [
  {
    id: 1,
    image: '/images/hero_penthouse.png',
    badgeKey: 'Шинэ Пентхаус & Орон сууц',
    titleKey: 'Ирээдүйн үл хөдлөх хөрөнгийг эндээс',
    descKey: 'Улаанбаатар хотын хамгийн сүүлийн үеийн тансаг орон сууц, пентхаус, хаусыг хайж олоорой.',
  },
  {
    id: 2,
    image: '/images/hero_villa.png',
    badgeKey: 'Тансаг Зэрэглэлийн Хаус',
    titleKey: 'Таны мөрөөдлийн амар тайван орчин',
    descKey: 'Цэвэр агаар, байгалийн сайханд байрлах орчин үеийн бие даасан хаус болон хашаа байшин.',
  },
  {
    id: 3,
    image: '/images/hero_tower.png',
    badgeKey: 'Оффис & Коммершл Талбай',
    titleKey: 'Бизнесээ амжилттай өргөжүүлээрэй',
    descKey: 'Хотын А зэрэглэлийн бүсэд байрлах орчин үеийн оффис, үйлчилгээний талбайн саналууд.',
  },
];

const HeroSection = () => {
  const { t } = useI18n();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Auto-play slideshow timer
  useEffect(() => {
    if (!isAutoPlaying) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % SLIDES.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [isAutoPlaying]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % SLIDES.length);
  };

  const currentSlide = SLIDES[currentIndex];

  return (
    <div
      className="relative h-[82vh] min-h-[620px] max-h-[800px] w-full overflow-hidden flex flex-col justify-between pt-16 select-none"
      onMouseEnter={() => setIsAutoPlaying(false)}
      onMouseLeave={() => setIsAutoPlaying(true)}
    >
      {/* Background Animated Image Carousel with Ken Burns Effect */}
      <div className="absolute inset-0 z-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide.id}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 1.2, ease: [0.25, 1, 0.5, 1] }}
            className="absolute inset-0 w-full h-full"
          >
            <img
              src={currentSlide.image}
              alt={currentSlide.badgeKey}
              className="w-full h-full object-cover object-center"
            />
          </motion.div>
        </AnimatePresence>

        {/* Ambient Dark Gradient Overlays for High Contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-void via-void/50 to-void/70" />
        <div className="absolute inset-0 bg-gradient-to-r from-void/80 via-transparent to-void/80" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(10,10,15,0.6)_100%)]" />
      </div>

      {/* Hero Central Content with Text Animations */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 text-center mt-12 md:mt-16 flex flex-col items-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="flex flex-col items-center"
          >
            {/* Animated Category Tag Badge */}
            <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-plasma/20 border border-plasma/40 backdrop-blur-md text-plasma text-xs font-semibold uppercase tracking-wider mb-6 shadow-lg shadow-plasma/10">
              <Sparkles size={14} className="animate-spin text-aurora" />
              <span>{currentSlide.badgeKey}</span>
            </div>

            {/* Hero Main Heading */}
            <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-[5rem] font-heading font-black tracking-tight text-starlight mb-6 leading-[1.1] max-w-4xl drop-shadow-2xl">
              <span className="bg-gradient-to-r from-starlight via-white to-plasma bg-clip-text text-transparent">
                {currentSlide.titleKey}
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg md:text-xl text-nebula-text mb-8 max-w-2xl mx-auto leading-relaxed font-normal">
              {currentSlide.descKey}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Carousel Bottom Control Bar & Pagination Indicators */}
      <div className="relative z-10 max-w-7xl mx-auto w-full px-6 mb-24 flex items-center justify-between pointer-events-auto">
        {/* Slide Counter Indicator */}
        <div className="hidden sm:flex items-center space-x-2 text-xs font-mono text-starlight bg-void/60 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 shadow-lg">
          <span className="text-plasma font-bold">0{currentSlide.id}</span>
          <span className="text-nebula-text">/ 0{SLIDES.length}</span>
        </div>

        {/* Center Bullet Progress Indicators */}
        <div className="flex items-center space-x-3 mx-auto sm:mx-0">
          {SLIDES.map((slide, idx) => (
            <button
              key={slide.id}
              onClick={() => setCurrentIndex(idx)}
              className={`h-2.5 rounded-full transition-all duration-500 ${
                currentIndex === idx
                  ? 'w-10 bg-gradient-to-r from-plasma to-aurora shadow-lg shadow-plasma/50'
                  : 'w-2.5 bg-white/20 hover:bg-white/40'
              }`}
              title={`Slide ${idx + 1}`}
            />
          ))}
        </div>

        {/* Left & Right Arrow Controls */}
        <div className="hidden sm:flex items-center space-x-2">
          <button
            onClick={handlePrev}
            className="p-2.5 rounded-xl bg-void/60 backdrop-blur-md text-starlight border border-white/10 hover:border-plasma hover:text-plasma transition-all shadow-lg active:scale-95"
            title="Previous Slide"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={handleNext}
            className="p-2.5 rounded-xl bg-void/60 backdrop-blur-md text-starlight border border-white/10 hover:border-plasma hover:text-plasma transition-all shadow-lg active:scale-95"
            title="Next Slide"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
