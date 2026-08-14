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
      className="relative h-[60vh] min-h-[420px] md:h-[82vh] md:min-h-[620px] max-h-[800px] w-full overflow-hidden flex flex-col justify-between pt-16 select-none"
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
      <div className="relative z-10 max-w-5xl mx-auto px-4 text-center mt-6 sm:mt-12 md:mt-16 flex flex-col items-center">
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
            <div className="inline-flex items-center space-x-2 px-3.5 py-1 sm:px-4 sm:py-1.5 rounded-full bg-plasma/20 border border-plasma/40 backdrop-blur-md text-plasma text-[11px] sm:text-xs font-semibold uppercase tracking-wider mb-3 sm:mb-6 shadow-lg shadow-plasma/10">
              <Sparkles size={13} className="animate-spin text-aurora" />
              <span>{currentSlide.badgeKey}</span>
            </div>

            {/* Hero Main Heading */}
            <h1 className="text-2xl sm:text-5xl md:text-7xl lg:text-[5rem] font-heading font-black tracking-tight text-starlight mb-3 sm:mb-6 leading-[1.15] max-w-4xl drop-shadow-2xl">
              <span className="bg-gradient-to-r from-starlight via-white to-plasma bg-clip-text text-transparent">
                {currentSlide.titleKey}
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-xs sm:text-base md:text-xl text-nebula-text mb-4 sm:mb-8 max-w-2xl mx-auto leading-relaxed font-normal line-clamp-2 sm:line-clamp-none">
              {currentSlide.descKey}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Luxurious Glass Carousel Controller: [ < ] • • • [ > ] */}
      <div className="relative z-10 max-w-7xl mx-auto w-full px-6 mb-16 sm:mb-24 flex items-center justify-center pointer-events-auto">
        <div className="flex items-center space-x-3 bg-void/80 backdrop-blur-2xl px-3.5 py-2 rounded-full border border-plasma/30 shadow-2xl shadow-plasma/15 ring-1 ring-white/10">
          {/* Previous Circular Button */}
          <button
            onClick={handlePrev}
            className="w-7 h-7 rounded-full bg-plasma/15 hover:bg-plasma text-plasma hover:text-white border border-plasma/30 flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-90 shadow-sm"
            title="Өмнөх слайд"
          >
            <ChevronLeft size={15} className="stroke-[2.5]" />
          </button>

          {/* Glowing Pill Indicators */}
          <div className="flex items-center space-x-2 px-1.5">
            {SLIDES.map((slide, idx) => (
              <button
                key={slide.id}
                onClick={() => setCurrentIndex(idx)}
                className={`h-2 rounded-full transition-all duration-500 ${
                  currentIndex === idx
                    ? 'w-8 bg-gradient-to-r from-plasma via-nova to-aurora shadow-md shadow-plasma/50 ring-1 ring-white/40'
                    : 'w-2 bg-plasma/25 hover:bg-plasma/50'
                }`}
                title={`Слайд ${idx + 1}`}
              />
            ))}
          </div>

          {/* Next Circular Button */}
          <button
            onClick={handleNext}
            className="w-7 h-7 rounded-full bg-plasma/15 hover:bg-plasma text-plasma hover:text-white border border-plasma/30 flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-90 shadow-sm"
            title="Дараах слайд"
          >
            <ChevronRight size={15} className="stroke-[2.5]" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
