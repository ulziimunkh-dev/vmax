import React, { useState, useEffect } from 'react';
import HeroSection from '@/components/hero/HeroSection';
import SearchBar from '@/components/search/SearchBar';
import type { SearchFilterParams } from '@/components/search/SearchBar';
import ListingGrid from '@/components/listings/ListingGrid';
import PropertyMap from '@/components/map/PropertyMap';
import type { Listing } from '@/types';
import { motion } from 'framer-motion';
import { useI18n } from '@/i18n';
import { listingsAPI } from '@/services/api';
import { LayoutGrid, Map, Sparkles, Zap, Scale } from 'lucide-react';


const MOCK_LISTINGS: Listing[] = [
  { id: '1', title: 'Хан-Уул дүүрэг, 3 өрөө орон сууц', description: 'Хан-Уул дүүргийн 11-р хороонд 3 өрөө байр зарна.', type: 'sale', category: 'apartment', price: 350000000, location: 'Улаанбаатар', district: 'Хан-Уул', latitude: 47.8864, longitude: 106.9056, areaSqm: 80, attributes: { bedrooms: 3, bathrooms: 2 }, images: ['/images/hero_penthouse.png', '/images/hero_villa.png', '/images/hero_tower.png'], status: 'active', userId: '1', isPromoted: true, promotionTier: 'VIP', createdAt: new Date(Date.now() - 3600000).toISOString(), viewsCount: 520, sharesCount: 84 },
  { id: '2', title: 'Сүхбаатар дүүрэг, Оффисын талбай', description: 'Сүхбаатар дүүрэг, Төв талбайн дэргэд оффис түрээслүүлнэ.', type: 'rent', category: 'commercial', price: 5000000, location: 'Улаанбаатар', district: 'Сүхбаатар', latitude: 47.9250, longitude: 106.9200, areaSqm: 120, attributes: {}, images: ['/images/hero_tower.png', '/images/hero_penthouse.png'], status: 'active', userId: '1', isPromoted: true, promotionTier: 'VIP', createdAt: new Date(Date.now() - 7200000).toISOString(), viewsCount: 1420, sharesCount: 195 },
  { id: '3', title: 'Баянзүрх дүүрэг, Сити резиденс Хаус', description: 'Баянзүрх дүүрэгт бие даасан 2 давхар хаус зарна.', type: 'sale', category: 'house', price: 850000000, location: 'Улаанбаатар', district: 'Баянзүрх', latitude: 47.9150, longitude: 106.9600, areaSqm: 250, attributes: { bedrooms: 5, bathrooms: 3 }, images: ['/images/hero_villa.png', '/images/hero_penthouse.png', '/images/hero_tower.png'], status: 'active', userId: '1', isPromoted: true, promotionTier: 'TOP_URGENT', createdAt: new Date(Date.now() - 10800000).toISOString(), viewsCount: 890, sharesCount: 112 },
  { id: '4', title: 'Баянгол дүүрэг, 2 өрөө байр', description: 'Баянгол дүүрэг 3-р хороололд 2 өрөө байр зарна.', type: 'sale', category: 'apartment', price: 210000000, location: 'Улаанбаатар', district: 'Баянгол', latitude: 47.9120, longitude: 106.8700, areaSqm: 56, attributes: { bedrooms: 2, bathrooms: 1 }, images: ['/images/hero_penthouse.png', '/images/hero_tower.png'], status: 'active', userId: '1', createdAt: new Date(Date.now() - 14400000).toISOString(), viewsCount: 310, sharesCount: 28 },
  { id: '5', title: 'Чингэлтэй дүүрэг, 1 өрөө байр түрээс', description: 'Чингэлтэй дүүргийн төвд 1 өрөө тохилог байр түрээслүүлнэ.', type: 'rent', category: 'apartment', price: 1200000, location: 'Улаанбаатар', district: 'Чингэлтэй', latitude: 47.9350, longitude: 106.9100, areaSqm: 38, attributes: { bedrooms: 1, bathrooms: 1 }, images: ['/images/hero_penthouse.png', '/images/hero_villa.png'], status: 'active', userId: '1', createdAt: new Date(Date.now() - 18000000).toISOString(), viewsCount: 2450, sharesCount: 310 },
  { id: '6', title: 'Сонгинохайрхан дүүрэг, 2 өрөө орон сууц', description: 'Сонгинохайрхан дүүрэгт иж бүрэн засвартай 2 өрөө байр зарна.', type: 'sale', category: 'apartment', price: 165000000, location: 'Улаанбаатар', district: 'Сонгинохайрхан', latitude: 47.9100, longitude: 106.7800, areaSqm: 48, attributes: { bedrooms: 2, bathrooms: 1 }, images: ['/images/hero_villa.png', '/images/hero_penthouse.png', '/images/hero_tower.png'], status: 'active', userId: '1', createdAt: new Date(Date.now() - 21600000).toISOString(), viewsCount: 180, sharesCount: 15 },
];


const Home = () => {
  const { t } = useI18n();
  const [listings, setListings] = useState<Listing[]>(MOCK_LISTINGS);
  const [filteredListings, setFilteredListings] = useState<Listing[]>(MOCK_LISTINGS);
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');

  useEffect(() => {
    listingsAPI.getAll({})
      .then((res) => {
        if (res.data?.items && res.data.items.length > 0) {
          setListings(res.data.items);
          setFilteredListings(res.data.items);
        }
      })
      .catch(() => {
        // Fallback to MOCK_LISTINGS
      });
  }, []);

  const handleSearch = (filters: SearchFilterParams) => {
    const { query, type, category, district, priceMin, priceMax, sortBy } = filters;

    // First try backend API query
    listingsAPI.getAll({
      location: district || query,
      type: type || undefined,
      category: category || undefined,
      priceMin: priceMin ? Number(priceMin) : undefined,
      priceMax: priceMax ? Number(priceMax) : undefined,
      sortBy,
    })
      .then((res) => {
        if (res.data?.items && res.data.items.length > 0) {
          setFilteredListings(res.data.items);
          return;
        }
        applyClientFilters(filters);
      })
      .catch(() => {
        applyClientFilters(filters);
      });
  };

  const applyClientFilters = (filters: SearchFilterParams) => {
    const { query, type, category, district, priceMin, priceMax, sortBy } = filters;
    let result = [...listings];

    if (query) {
      const q = query.toLowerCase();
      result = result.filter(item =>
        item.title.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q)
      );
    }

    if (type) {
      result = result.filter(item => item.type.toLowerCase() === type.toLowerCase());
    }

    if (category) {
      result = result.filter(item => item.category.toLowerCase() === category.toLowerCase());
    }

    if (district) {
      result = result.filter(item =>
        item.district.toLowerCase().includes(district.toLowerCase()) ||
        item.title.toLowerCase().includes(district.toLowerCase())
      );
    }

    if (priceMin) {
      const pMin = Number(priceMin);
      result = result.filter(item => Number(item.price) >= pMin);
    }

    if (priceMax) {
      const pMax = Number(priceMax);
      result = result.filter(item => Number(item.price) <= pMax);
    }

    // Sort listings client side fallback
    if (sortBy === 'views') {
      result.sort((a, b) => (b.viewsCount || 0) - (a.viewsCount || 0));
    } else if (sortBy === 'mostShared') {
      result.sort((a, b) => (b.sharesCount || 0) - (a.sharesCount || 0));
    } else if (sortBy === 'priceAsc') {
      result.sort((a, b) => Number(a.price) - Number(b.price));
    } else if (sortBy === 'priceDesc') {
      result.sort((a, b) => Number(b.price) - Number(a.price));
    } else {
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    // Always prioritize promoted listings at top of results
    result.sort((a, b) => {
      if (a.isPromoted && !b.isPromoted) return -1;
      if (!a.isPromoted && b.isPromoted) return 1;
      return 0;
    });

    setFilteredListings(result);
  };

  return (
    <div className="w-full">
      <HeroSection />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-20">
        <SearchBar onSearch={handleSearch} />

        {/* Core Differentiators Highlights Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="glass-card p-4 rounded-2xl border border-white/10 flex items-center space-x-3 bg-cosmic/40">
            <div className="p-2.5 bg-plasma/20 text-plasma rounded-xl flex-shrink-0">
              <Sparkles size={20} />
            </div>
            <div>
              <h4 className="text-starlight font-bold text-sm">Байнга шинэчлэгдэх бодит зарууд</h4>
              <p className="text-nebula-text text-xs">Зарагдсан хуучин заранд цагаа үрэх шаардлагагүй</p>
            </div>
          </div>

          <div className="glass-card p-4 rounded-2xl border border-white/10 flex items-center space-x-3 bg-cosmic/40">
            <div className="p-2.5 bg-aurora/20 text-aurora rounded-xl flex-shrink-0">
              <Zap size={20} />
            </div>
            <div>
              <h4 className="text-starlight font-bold text-sm">Аянга мэт хурдан хайлт</h4>
              <p className="text-nebula-text text-xs">Агшин зуурт шүүх ухаалаг систем</p>
            </div>
          </div>

          <div className="glass-card p-4 rounded-2xl border border-white/10 flex items-center space-x-3 bg-cosmic/40">
            <div className="p-2.5 bg-nova/20 text-nova rounded-xl flex-shrink-0">
              <Scale size={20} />
            </div>
            <div>
              <h4 className="text-starlight font-bold text-sm">Зэрэгцүүлэн харьцуулах боломж</h4>
              <p className="text-nebula-text text-xs">Олон зарыг нэг дор зэрэгцүүлж харьцуулна</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-4">
          <div>
            <h2 className="text-3xl font-heading font-bold text-starlight">{t.listings.newListings}</h2>
            <p className="text-nebula-text text-sm mt-1">Нийт олдсон: {filteredListings.length}</p>
          </div>

          {/* View Mode Switcher (Grid vs Map) */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center bg-void/60 border border-white/10 p-1 rounded-xl">
              <button
                onClick={() => setViewMode('grid')}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  viewMode === 'grid'
                    ? 'bg-plasma text-white-force shadow-lg shadow-plasma/30'
                    : 'text-nebula-text hover:text-plasma'
                }`}
              >
                <LayoutGrid size={14} />
                <span>{t.map.gridView}</span>
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  viewMode === 'map'
                    ? 'bg-plasma text-white-force shadow-lg shadow-plasma/30'
                    : 'text-nebula-text hover:text-plasma'
                }`}
              >
                <Map size={14} />
                <span>{t.map.mapView}</span>
              </button>
            </div>

            <button onClick={() => setFilteredListings(listings)} className="text-plasma hover:underline transition-colors text-sm font-medium">
              {t.listings.viewAll} →
            </button>
          </div>
        </motion.div>

        {/* View Mode Component Switch */}
        {viewMode === 'grid' ? (
          <ListingGrid listings={filteredListings} />
        ) : (
          <PropertyMap listings={filteredListings} height="600px" />
        )}
      </div>
    </div>
  );
};

export default Home;
