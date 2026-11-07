import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  Search,
  PlusCircle,
  Play,
  BookOpen,
  Filter,
  CheckCircle,
  ShieldCheck,
  Award,
  Clock,
  Layers,
  MapPin,
  ChevronRight,
  RefreshCw,
  Phone,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { furnitureApi } from '@/services/furnitureApi';
import type { FurnitureMaker, FurniturePortfolioItem, FurnitureArticleItem } from '@/types/furniture';
import { FurnitureCard } from '@/components/furniture/FurnitureCard';
import { FurnitureReelModal } from '@/components/furniture/FurnitureReelModal';
import { FurnitureArticleModal } from '@/components/furniture/FurnitureArticleModal';
import { getImageUrl } from '@/utils/imageUrl';

const CATEGORIES = [
  { id: 'ALL', label: 'Бүгд' },
  { id: 'KITCHEN', label: 'Гал тогоо' },
  { id: 'WARDROBE', label: 'Шүүгээ & Шкаф' },
  { id: 'LIVING_ROOM', label: 'Зочны өрөө' },
  { id: 'KIDS', label: 'Хүүхдийн өрөө' },
  { id: 'OFFICE', label: 'Оффис тавилга' },
  { id: 'SOLID_WOOD', label: 'Цэвэр мод' },
  { id: 'CUSTOM', label: 'Захиалгат хийц' },
];

const DISTRICTS = [
  'Бүх дүүрэг',
  'Хан-Уул',
  'Баянзүрх',
  'Сүхбаатар',
  'Баянгол',
  'Чингэлтэй',
  'Сонгинохайрхан',
];

export const Furniture: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'makers' | 'reels' | 'tips'>('makers');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedDistrict, setSelectedDistrict] = useState('Бүх дүүрэг');
  const [onlyVideo, setOnlyVideo] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [makers, setMakers] = useState<FurnitureMaker[]>([]);
  const [tips, setTips] = useState<FurnitureArticleItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [selectedReel, setSelectedReel] = useState<{ item: FurniturePortfolioItem; maker?: FurnitureMaker } | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<FurnitureArticleItem | null>(null);

  useEffect(() => {
    loadData();
  }, [selectedCategory, selectedDistrict, onlyVideo]);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await furnitureApi.getAll({
        search: searchQuery.trim() || undefined,
        category: selectedCategory === 'ALL' ? undefined : selectedCategory,
        district: selectedDistrict === 'Бүх дүүрэг' ? undefined : selectedDistrict,
        hasVideo: onlyVideo ? true : undefined,
      });
      setMakers(res.data.items || []);

      const tipsRes = await furnitureApi.getTips();
      setTips(tipsRes.data || []);
    } catch (err) {
      console.warn('Failed to load furniture data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadData();
  };

  // Collect all portfolio items across all makers for the "Хийсэн ажлууд & Реел" tab
  const allPortfolioItems: { item: FurniturePortfolioItem; maker: FurnitureMaker }[] = [];
  makers.forEach((m) => {
    (m.portfolio || []).forEach((p) => {
      if (selectedCategory === 'ALL' || p.category === selectedCategory) {
        if (!onlyVideo || (onlyVideo && p.videoUrl)) {
          allPortfolioItems.push({ item: p, maker: m });
        }
      }
    });
  });

  return (
    <div className="min-h-screen bg-void pt-20 pb-24 text-white">
      {/* ── Top Hero Banner ──────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-white/10 bg-gradient-to-b from-void via-cosmic/30 to-void py-12 md:py-16">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-plasma/15 via-transparent to-transparent pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-plasma/20 border border-plasma/30 text-plasma text-xs font-black uppercase tracking-wider">
                <Sparkles size={13} />
                <span>Захиалгат Тавилга & Интерьер Урлангууд</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black font-heading tracking-tight leading-tight">
                Шилдэг тавилгын урлан,{' '}
                <span className="bg-gradient-to-r from-plasma via-nova to-aurora bg-clip-text text-transparent">
                  бодит хийсэн ажлууд
                </span>
              </h1>

              <p className="text-sm sm:text-base text-nebula-text/90 leading-relaxed">
                Шинэ орон сууц, байрандаа тохирсон гал тогоо, шкаф, цэвэр модон тавилгын урлангуудыг бодит реел бичлэг, зураг, хэрэглэгчийн зөвлөгөөтэй нь хамт харьцуулан шууд холбогдоорой.
              </p>
            </div>

            {/* Maker Register CTA */}
            <div className="flex-shrink-0">
              <Link
                to="/create-furniture-profile"
                className="inline-flex items-center gap-2.5 px-5 py-3.5 rounded-2xl bg-gradient-to-r from-plasma via-nova to-aurora hover:opacity-95 text-white font-extrabold text-sm shadow-xl shadow-plasma/30 active:scale-95 transition-all"
              >
                <PlusCircle size={18} />
                <span>Урлан бүртгүүлэх</span>
              </Link>
            </div>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="mt-8 flex flex-col sm:flex-row items-center gap-2.5">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-nebula-text" size={18} />
              <input
                type="text"
                placeholder="Тавилгын газар, ажлын чиглэл эсвэл хаягаар хайх..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-nebula-text/60 focus:outline-none focus:border-plasma text-sm transition-all"
              />
            </div>

            {/* District Dropdown */}
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="w-full sm:w-auto px-4 py-3 rounded-2xl bg-void border border-white/10 text-white text-sm focus:outline-none focus:border-plasma"
            >
              {DISTRICTS.map((d) => (
                <option key={d} value={d} className="bg-void text-white">
                  {d}
                </option>
              ))}
            </select>

            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm border border-white/15 transition-all"
            >
              Хайх
            </button>
          </form>

          {/* Category Pills & Filters */}
          <div className="mt-6 flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none flex-nowrap sm:flex-wrap">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    selectedCategory === cat.id
                      ? 'bg-plasma text-white shadow-lg shadow-plasma/30 scale-105'
                      : 'bg-white/5 text-nebula-text hover:text-white hover:bg-white/10 border border-white/5'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Only with video toggle */}
            <button
              type="button"
              onClick={() => setOnlyVideo(!onlyVideo)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
                onlyVideo
                  ? 'bg-plasma/20 border-plasma text-plasma shadow-md shadow-plasma/20'
                  : 'bg-white/5 border-white/10 text-nebula-text hover:text-white'
              }`}
            >
              <Play size={12} fill={onlyVideo ? 'currentColor' : 'none'} />
              <span>Зөвхөн Реел бичлэгтэй</span>
            </button>
          </div>
        </div>
      </section>

      {/* ── Main Tabs: Directory | Portfolio Reels | Tips ─────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="flex items-center border-b border-white/10 gap-8">
          <button
            type="button"
            onClick={() => setActiveTab('makers')}
            className={`pb-3 text-sm sm:text-base font-extrabold transition-all relative cursor-pointer ${
              activeTab === 'makers' ? 'text-white' : 'text-nebula-text hover:text-white'
            }`}
          >
            <span>Тавилгын урлангууд ({makers.length})</span>
            {activeTab === 'makers' && (
              <motion.div layoutId="tab-underline" className="absolute bottom-0 inset-x-0 h-0.5 bg-plasma" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('reels')}
            className={`pb-3 text-sm sm:text-base font-extrabold transition-all relative flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'reels' ? 'text-white' : 'text-nebula-text hover:text-white'
            }`}
          >
            <Play size={14} className="text-plasma" />
            <span>Хийсэн ажлууд & Реел ({allPortfolioItems.length})</span>
            {activeTab === 'reels' && (
              <motion.div layoutId="tab-underline" className="absolute bottom-0 inset-x-0 h-0.5 bg-plasma" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('tips')}
            className={`pb-3 text-sm sm:text-base font-extrabold transition-all relative flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'tips' ? 'text-white' : 'text-nebula-text hover:text-white'
            }`}
          >
            <BookOpen size={14} className="text-aurora" />
            <span>Зөвлөгөө & Мэдээлэл ({tips.length})</span>
            {activeTab === 'tips' && (
              <motion.div layoutId="tab-underline" className="absolute bottom-0 inset-x-0 h-0.5 bg-plasma" />
            )}
          </button>
        </div>

        {/* ── Tab Content ─────────────────────────────────────────────────── */}
        <div className="mt-8">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 space-y-3">
              <RefreshCw className="animate-spin text-plasma" size={32} />
              <p className="text-sm text-nebula-text">Тавилгын мэдээлэл ачааллаж байна...</p>
            </div>
          ) : (
            <>
              {/* TAB 1: MAKERS DIRECTORY */}
              {activeTab === 'makers' && (
                <div>
                  {makers.length === 0 ? (
                    <div className="text-center py-20 bg-white/5 rounded-3xl border border-white/10 p-8 space-y-3">
                      <Sparkles size={36} className="text-plasma mx-auto opacity-70" />
                      <h3 className="text-lg font-bold">Одоогоор илэрц олдсонгүй</h3>
                      <p className="text-xs text-nebula-text max-w-sm mx-auto">
                        Сонгосон дүүрэг эсвэл ангилалд тавилгын газар олдсонгүй. Шүүлтүүрээ өөрчлөөд үзнэ үү.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {makers.map((maker) => (
                        <FurnitureCard
                          key={maker.id}
                          maker={maker}
                          onOpenReel={(item, m) => setSelectedReel({ item, maker: m })}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: PORTFOLIO & REELS GALLERY */}
              {activeTab === 'reels' && (
                <div>
                  {allPortfolioItems.length === 0 ? (
                    <div className="text-center py-20 bg-white/5 rounded-3xl border border-white/10 p-8 space-y-3">
                      <Play size={36} className="text-plasma mx-auto opacity-70" />
                      <h3 className="text-lg font-bold">Хийсэн ажил олдсонгүй</h3>
                      <p className="text-xs text-nebula-text">Шүүлтүүрээ цэвэрлэж бүх ажлыг харна уу.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                      {allPortfolioItems.map(({ item, maker }) => {
                        const hasVideo = Boolean(item.videoUrl);
                        const thumb = item.thumbnailUrl || (item.images && item.images[0]) || maker.coverUrl;

                        return (
                          <div
                            key={item.id}
                            onClick={() => setSelectedReel({ item, maker })}
                            className="glass-card rounded-2xl overflow-hidden border border-white/10 hover:border-plasma transition-all duration-300 shadow-xl group cursor-pointer flex flex-col justify-between"
                          >
                            <div className="relative aspect-[4/3] bg-black overflow-hidden">
                              <img
                                src={getImageUrl(thumb)}
                                alt={item.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                onError={(e) => {
                                  e.currentTarget.src = 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=600&q=80';
                                }}
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />

                              {/* Play Button Indicator */}
                              {hasVideo && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <div className="w-12 h-12 rounded-full bg-plasma/90 text-white flex items-center justify-center shadow-xl shadow-plasma/40 group-hover:scale-110 transition-transform">
                                    <Play size={20} fill="currentColor" className="translate-x-0.5" />
                                  </div>
                                </div>
                              )}

                              {/* Video Reel Tag */}
                              {hasVideo && (
                                <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md text-white text-[10px] font-bold flex items-center gap-1 border border-white/20">
                                  <span className="w-1.5 h-1.5 rounded-full bg-plasma animate-ping" />
                                  <span>Реел бичлэг</span>
                                </span>
                              )}

                              {item.category && (
                                <span className="absolute top-3 right-3 px-2 py-0.5 rounded-md bg-void/80 backdrop-blur-md text-white/90 text-[10px] font-bold">
                                  {item.category}
                                </span>
                              )}
                            </div>

                            <div className="p-4 space-y-2">
                              <h4 className="text-sm font-bold text-white line-clamp-1 group-hover:text-plasma transition-colors">
                                {item.title}
                              </h4>

                              {item.materials && (
                                <p className="text-xs text-nebula-text/80 line-clamp-1">
                                  🛠️ {item.materials}
                                </p>
                              )}

                              <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs">
                                <span className="text-starlight/90 font-semibold truncate max-w-[150px]">
                                  {maker.name}
                                </span>
                                <a
                                  href={`tel:${maker.phone.replace(/\D/g, '')}`}
                                  onClick={(e) => e.stopPropagation()}
                                  className="text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1"
                                >
                                  <Phone size={11} />
                                  <span>Залгах</span>
                                </a>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: EXPERT TIPS & ADVICE */}
              {activeTab === 'tips' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {tips.map((tip) => (
                    <div
                      key={tip.id}
                      onClick={() => setSelectedArticle(tip)}
                      className="glass-card rounded-3xl overflow-hidden border border-white/10 hover:border-aurora/50 transition-all p-5 flex flex-col justify-between space-y-4 cursor-pointer group bg-void/70 hover:shadow-xl"
                    >
                      {tip.imageUrl && (
                        <div className="relative h-40 rounded-2xl overflow-hidden bg-void/50">
                          <img
                            src={getImageUrl(tip.imageUrl)}
                            alt={tip.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            onError={(e) => {
                              e.currentTarget.src = 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=600&q=80';
                            }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                          <span className="absolute bottom-2.5 left-2.5 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-aurora/30 text-aurora border border-aurora/40 backdrop-blur-md uppercase">
                            {tip.category || 'ЗӨВЛӨМЖ'}
                          </span>
                        </div>
                      )}

                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-xs text-nebula-text/60">
                          {tip.readMinutes && <span>⏱️ {tip.readMinutes} мин унших</span>}
                          {tip.publishedAt && <span>• {tip.publishedAt}</span>}
                        </div>

                        <h3 className="text-base font-bold text-white group-hover:text-aurora transition-colors leading-snug">
                          {tip.title}
                        </h3>

                        <p className="text-xs text-nebula-text/80 line-clamp-3 leading-relaxed">
                          {tip.summary}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs">
                        <span className="font-semibold text-white/80 line-clamp-1">
                          ✍️ {tip.makerName}
                        </span>
                        <span className="text-aurora font-bold flex items-center gap-0.5 group-hover:translate-x-1 transition-transform">
                          <span>Унших</span>
                          <ChevronRight size={13} />
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Reel Walkthrough Modal */}
      <FurnitureReelModal
        isOpen={Boolean(selectedReel)}
        onClose={() => setSelectedReel(null)}
        item={selectedReel?.item || null}
        maker={selectedReel?.maker || null}
      />

      {/* Article Reader Modal */}
      <FurnitureArticleModal
        isOpen={Boolean(selectedArticle)}
        onClose={() => setSelectedArticle(null)}
        article={selectedArticle}
      />
    </div>
  );
};

export default Furniture;
