import React from 'react';
import HeroSection from '@/components/hero/HeroSection';
import SearchBar from '@/components/search/SearchBar';
import ListingGrid from '@/components/listings/ListingGrid';
import type { Listing } from '@/types';
import { motion } from 'framer-motion';
import { useI18n } from '@/i18n';

const MOCK_LISTINGS: Listing[] = [
  { id: '1', title: 'Хан-Уул дүүрэг, 3 өрөө байр', description: '', type: 'sale', category: 'apartment', price: 350000000, location: 'Хан-Уул', district: 'Улаанбаатар', areaSqm: 80, attributes: { bedrooms: 3, bathrooms: 2 }, images: [], status: 'active', userId: '1', createdAt: '', updatedAt: '' },
  { id: '2', title: 'Сүхбаатар дүүрэг, Оффисын талбай', description: '', type: 'rent', category: 'commercial', price: 5000000, location: 'Сүхбаатар', district: 'Улаанбаатар', areaSqm: 120, attributes: {}, images: [], status: 'active', userId: '1', createdAt: '', updatedAt: '' },
  { id: '3', title: 'Баянзүрх дүүрэг, Хаус', description: '', type: 'sale', category: 'house', price: 850000000, location: 'Баянзүрх', district: 'Улаанбаатар', areaSqm: 250, attributes: { bedrooms: 5, bathrooms: 3 }, images: [], status: 'active', userId: '1', createdAt: '', updatedAt: '' },
];

const Home = () => {
  const { t } = useI18n();

  return (
    <div className="w-full">
      <HeroSection />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-20">
        <SearchBar />
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="flex justify-between items-end mb-8">
          <h2 className="text-3xl font-space font-bold text-glow">{t.listings.newListings}</h2>
          <button className="text-accent-plasma hover:text-white transition-colors">{t.listings.viewAll} →</button>
        </motion.div>
        <ListingGrid listings={MOCK_LISTINGS} />
      </div>
    </div>
  );
};
export default Home;
