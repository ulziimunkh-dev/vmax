import React from 'react';
import { motion } from 'framer-motion';
import { useI18n } from '@/i18n';

const HeroSection = () => {
  const { t } = useI18n();

  return (
    <div className="relative h-[80vh] min-h-[600px] flex flex-col items-center justify-center px-4 overflow-hidden pt-16">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-void/50 to-void pointer-events-none" />
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="text-center z-10 max-w-4xl"
      >
        <h1 className="text-5xl md:text-7xl font-heading font-bold text-starlight text-glow mb-6 leading-tight">
          {t.hero.title}
        </h1>
        <p className="text-lg md:text-xl text-nebula-text mb-10 max-w-2xl mx-auto">
          {t.hero.subtitle}
        </p>
      </motion.div>
    </div>
  );
};
export default HeroSection;
