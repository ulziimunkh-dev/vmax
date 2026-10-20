import React, { useState, useEffect } from 'react';
import HeroSection from '@/components/hero/HeroSection';
import SearchBar from '@/components/search/SearchBar';
import type { SearchFilterParams } from '@/components/search/SearchBar';
import ListingGrid from '@/components/listings/ListingGrid';
import PropertyMap from '@/components/map/PropertyMap';
import { ReelsFeedModal } from '@/components/listings/ReelsFeedModal';
import { Link } from 'react-router-dom';
import type { Listing, Project } from '@/types';
import { motion } from 'framer-motion';
import { useI18n } from '@/i18n';
import { listingsAPI, projectsAPI } from '@/services/api';
import { ProjectCard } from '@/components/projects/ProjectCard';
import { LayoutGrid, Map, Sparkles, Zap, Scale, ArrowUpDown, Smartphone, Play, Building2, ArrowRight, Handshake, Phone, Mail } from 'lucide-react';


const Home = () => {
  const { t } = useI18n();
  const [listings, setListings] = useState<Listing[]>([]);
  const [filteredListings, setFilteredListings] = useState<Listing[]>([]);
  const [featuredProjects, setFeaturedProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [isReelsModalOpen, setIsReelsModalOpen] = useState(false);
  const [selectedReelId, setSelectedReelId] = useState<string | undefined>(undefined);
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
        district: filters.district || undefined,
        khoroo: filters.khoroo || undefined,
        search: filters.query || undefined,
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

      const items = res.data?.items || (Array.isArray(res.data) ? res.data : []);
      setListings(items);
      setFilteredListings(items);
    } catch (err) {
      console.error('Failed to load listings from database:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
    projectsAPI.getAll({ limit: 3 }).then((res) => {
      setFeaturedProjects(res.data?.items || []);
    }).catch((err) => console.warn('Featured projects load:', err));
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
    const { query, type, category, district, khoroo, priceMin, priceMax, sortBy } = filters;
    let result = [...listings];

    if (query) {
      const q = query.toLowerCase();
      result = result.filter(item =>
        item.title?.toLowerCase().includes(q) ||
        item.description?.toLowerCase().includes(q) ||
        item.location?.toLowerCase().includes(q) ||
        item.district?.toLowerCase().includes(q) ||
        item.khoroo?.toLowerCase().includes(q)
      );
    }

    if (type) {
      result = result.filter(item => item.type?.toLowerCase() === type.toLowerCase());
    }

    if (category) {
      result = result.filter(item => item.category?.toLowerCase() === category.toLowerCase());
    }

    if (district) {
      result = result.filter(item =>
        item.district?.toLowerCase().includes(district.toLowerCase())
      );
    }

    if (khoroo) {
      result = result.filter(item =>
        item.khoroo?.toLowerCase().includes(khoroo.toLowerCase())
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
              <h4 className="text-starlight font-bold text-sm">{t.homeHighlights.verifiedTitle}</h4>
              <p className="text-nebula-text text-xs">{t.homeHighlights.verifiedDesc}</p>
            </div>
          </div>

          <div className="glass-card p-4 rounded-2xl border border-white/10 flex items-center space-x-3 bg-cosmic/40">
            <div className="p-2.5 bg-aurora/20 text-aurora rounded-xl flex-shrink-0">
              <Zap size={20} />
            </div>
            <div>
              <h4 className="text-starlight font-bold text-sm">{t.homeHighlights.fastSearchTitle}</h4>
              <p className="text-nebula-text text-xs">{t.homeHighlights.fastSearchDesc}</p>
            </div>
          </div>

          <div className="glass-card p-4 rounded-2xl border border-white/10 flex items-center space-x-3 bg-cosmic/40">
            <div className="p-2.5 bg-nova/20 text-nova rounded-xl flex-shrink-0">
              <Scale size={20} />
            </div>
            <div>
              <h4 className="text-starlight font-bold text-sm">{t.homeHighlights.compareTitle}</h4>
              <p className="text-nebula-text text-xs">{t.homeHighlights.compareDesc}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 🏢 New Projects & Developments Showcase on Home */}
      {featuredProjects.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-plasma/10 border border-plasma/30 text-plasma text-[11px] font-bold uppercase tracking-wider">
                <Building2 size={13} />
                <span>Барилгын төслүүд</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-heading font-black text-starlight tracking-tight">
                Шилдэг хотхон & <span className="bg-gradient-to-r from-plasma via-nova to-aurora bg-clip-text text-transparent">Шинэ орон сууцууд</span>
              </h2>
            </div>
            <Link
              to="/projects"
              className="text-xs font-bold text-plasma hover:text-white flex items-center gap-1.5 transition-colors self-start sm:self-auto group"
            >
              <span>Бүх төслийг үзэх ({featuredProjects.length}+)</span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProjects.map((p) => (
              <ProjectCard key={p.id} project={p} />
            ))}
          </div>

          {/* 🤝 Project Cooperation & Partnership Banner on Home */}
          <div className="mt-6 relative overflow-hidden rounded-2xl border border-plasma/30 bg-gradient-to-r from-plasma/15 via-cosmic/70 to-nova/15 p-5 sm:p-6 shadow-xl backdrop-blur-md">
            <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-plasma/20 rounded-full blur-2xl pointer-events-none" />
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
              <div className="space-y-1.5 max-w-2xl">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-plasma/20 border border-plasma/40 text-plasma text-[11px] font-bold uppercase tracking-wider">
                  <Handshake size={13} />
                  <span>Барилга угсралт & Захиалагч нарт</span>
                </div>
                <h3 className="text-lg sm:text-xl font-heading font-black text-starlight tracking-tight">
                  Барилгын төсөл, хотхоноо Vmax дээр байршуулж хамтран ажиллах
                </h3>
                <p className="text-xs sm:text-sm text-nebula-text leading-relaxed">
                  Хотхоны албан ёсны үнэ, 3D аялал, өрөөний төлөвлөлтөө нийтлэн зорилтот худалдан авагчдад шууд хүргэхээр хамтран ажиллах бол бидэнтэй холбогдоорой.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                <a
                  href="tel:+97689767700"
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-plasma to-nova hover:opacity-95 text-white font-bold text-xs sm:text-sm shadow-md shadow-plasma/30 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Phone size={15} />
                  <span>Холбогдох (8976-7700)</span>
                </a>
                <Link
                  to="/create-project"
                  className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-plasma/40 text-starlight hover:text-white font-bold text-xs sm:text-sm transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Төсөл нийтлэх</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

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
                {t.homeHighlights.subheading}
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
                <option value="newest">{t.sort.newest}</option>
                <option value="views">{t.sort.mostViewed}</option>
                <option value="priceAsc">{t.sort.priceLowHigh}</option>
                <option value="priceDesc">{t.sort.priceHighLow}</option>
                <option value="mostShared">{t.sort.mostShared}</option>
              </select>
            </div>

            {/* 15s Walkthrough Reels Quick Trigger */}
            {filteredListings.some((l) => l.videoUrl || l.hasVideo) && (
              <button
                onClick={() => {
                  const firstReel = filteredListings.find((l) => l.videoUrl || l.hasVideo);
                  setSelectedReelId(firstReel?.id);
                  setIsReelsModalOpen(true);
                }}
                className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-red-600 via-rose-500 to-amber-500 text-white font-bold text-xs shadow-lg shadow-red-500/25 hover:shadow-red-500/40 hover:scale-105 active:scale-95 transition-all cursor-pointer"
              >
                <Play size={13} className="fill-white text-white" />
                <span>🎬 Reels</span>
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
              </button>
            )}

            {/* View Mode Switcher (Compact & Modern) */}
            <div className="flex items-center bg-void/60 border border-white/10 p-1 rounded-xl shadow-sm">
              <button
                onClick={() => setViewMode('grid')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-gradient-to-r from-plasma to-nova text-white-force shadow-md shadow-plasma/30'
                    : 'text-nebula-text hover:text-white'
                }`}
              >
                <LayoutGrid size={14} />
                <span>{t.homeHighlights.listMode}</span>
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  viewMode === 'map'
                    ? 'bg-gradient-to-r from-plasma to-nova text-white-force shadow-md shadow-plasma/30'
                    : 'text-nebula-text hover:text-white'
                }`}
              >
                <Map size={14} />
                <span>{t.homeHighlights.mapMode}</span>
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

        {/* Full-Screen 9:16 Real Estate Reels Modal Feed */}
        <ReelsFeedModal
          isOpen={isReelsModalOpen}
          onClose={() => setIsReelsModalOpen(false)}
          initialListingId={selectedReelId}
          listings={filteredListings}
        />
      </div>
    </div>
  );
};

export default Home;
