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
import { LayoutGrid, Map, Sparkles, Zap, Scale, ArrowUpDown } from 'lucide-react';


const Home = () => {
  const { t } = useI18n();
  const [listings, setListings] = useState<Listing[]>([]);
  const [filteredListings, setFilteredListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [currentFilters, setCurrentFilters] = useState<SearchFilterParams>({
    query: '',
    type: '',
    category: '',
    district: '',
    priceMin: '',
    priceMax: '',
    sortBy: 'newest',
  });

  const fetchListings = async (filters: SearchFilterParams = currentFilters) => {
    setLoading(true);
    try {
      const activeSort = filters.sortBy || sortBy || 'newest';
      const res = await listingsAPI.getAll({
        location: filters.district || undefined,
        search: filters.query || undefined,
        khoroo: filters.khoroo || undefined,
        type: filters.type || undefined,
        category: filters.category || undefined,
        priceMin: filters.priceMin ? Number(filters.priceMin) : undefined,
        priceMax: filters.priceMax ? Number(filters.priceMax) : undefined,
        areaMin: filters.areaMin ? Number(filters.areaMin) : undefined,
        areaMax: filters.areaMax ? Number(filters.areaMax) : undefined,
        bedrooms: filters.bedrooms ? Number(filters.bedrooms) : undefined,
        bathrooms: filters.bathrooms ? Number(filters.bathrooms) : undefined,
        yearBuiltMin: filters.yearBuiltMin ? Number(filters.yearBuiltMin) : undefined,
        constructionType: filters.constructionType || undefined,
        sortBy: activeSort,
        limit: 50,
      });

      if (res.data?.items) {
        setListings(res.data.items);
        setFilteredListings(res.data.items);
      }
    } catch (err) {
      console.error('Failed to load listings from database:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, []);

  const handleSortChange = (newSort: string) => {
    setSortBy(newSort);
    const updatedFilters = { ...currentFilters, sortBy: newSort };
    setCurrentFilters(updatedFilters);
    fetchListings(updatedFilters);
  };

  const handleSearch = (filters: SearchFilterParams) => {
    const activeSort = filters.sortBy || sortBy || 'newest';
    const mergedFilters = { ...filters, sortBy: activeSort };
    setCurrentFilters(mergedFilters);
    fetchListings(mergedFilters);
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
      // Default: Prioritize promoted listings, then newest
      result.sort((a, b) => {
        const getTierWeight = (item: Listing) => {
          if (item.promotionTier === 'TOP_URGENT') return 3;
          if (item.promotionTier === 'VIP') return 2;
          if (item.isPromoted) return 1;
          return 0;
        };
        const weightDiff = getTierWeight(b) - getTierWeight(a);
        if (weightDiff !== 0) return weightDiff;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
    }

    setFilteredListings(result);
  };

  return (
    <div className="w-full">
      <HeroSection />
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 -mt-8 sm:-mt-20 relative z-20">
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Results Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 mb-8 border-b border-white/10"
        >
          {/* Left: Heading with Icon & Count */}
          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-plasma/20 to-nova/20 border border-plasma/30 flex items-center justify-center text-plasma flex-shrink-0 shadow-md shadow-plasma/10">
              <Sparkles size={18} className="animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2.5">
                <h2 className="text-2xl sm:text-3xl font-heading font-black tracking-tight text-starlight leading-none">
                  {t.listings.newListings}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-plasma/15 text-plasma border border-plasma/30 text-xs font-bold font-mono">
                  {filteredListings.length}
                </span>
              </div>
              <p className="text-nebula-text text-xs sm:text-sm mt-1">
                Улаанбаатар хот болон бүх дүүргийн баталгаажсан үл хөдлөх хөрөнгүүд
              </p>
            </div>
          </div>

          {/* Right: Perfectly Aligned Action Controls (Single Row, Never Wraps) */}
          <div className="flex items-center space-x-2.5 sm:space-x-3 flex-shrink-0 self-end sm:self-center">
            
            {/* Sorting Dropdown Pill */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-plasma">
                <ArrowUpDown size={14} />
              </div>
              <select
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value)}
                className="pl-8 pr-7 py-2 bg-void/60 hover:bg-void/80 border border-white/10 hover:border-plasma/40 rounded-xl text-starlight text-xs font-semibold focus:outline-none focus:border-plasma appearance-none cursor-pointer transition-all shadow-sm"
              >
                <option value="newest">Сүүлд нэмэгдсэн</option>
                <option value="views">Үзэлт ихтэй 🔥</option>
                <option value="priceAsc">Үнэ өсөхөөр</option>
                <option value="priceDesc">Үнэ буурахаар</option>
                <option value="mostShared">Их хуваалцсан</option>
              </select>
            </div>

            {/* View Mode Switcher (Compact & Modern) */}
            <div className="flex items-center bg-void/60 border border-white/10 p-1 rounded-xl shadow-sm">
              <button
                onClick={() => setViewMode('grid')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  viewMode === 'grid'
                    ? 'bg-gradient-to-r from-plasma to-nova text-white-force shadow-md shadow-plasma/30'
                    : 'text-nebula-text hover:text-white'
                }`}
              >
                <LayoutGrid size={14} />
                <span>Жагсаалт</span>
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  viewMode === 'map'
                    ? 'bg-gradient-to-r from-plasma to-nova text-white-force shadow-md shadow-plasma/30'
                    : 'text-nebula-text hover:text-white'
                }`}
              >
                <Map size={14} />
                <span>Газрын зураг</span>
              </button>
            </div>
          </div>
        </motion.div>

        {/* View Mode Component Switch */}
        {viewMode === 'grid' ? (
          <ListingGrid listings={filteredListings} loading={loading} />
        ) : (
          <PropertyMap listings={filteredListings} height="600px" />
        )}
      </div>
    </div>
  );
};

export default Home;
