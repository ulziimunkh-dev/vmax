import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  Star,
  Phone,
  MapPin,
  Clock,
  Sparkles,
  ExternalLink,
  Play,
  Award,
  ChevronLeft,
  Layers,
  BookOpen,
  Calendar,
  Share2,
  CheckCircle2,
  RefreshCw,
  Plus,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { furnitureApi } from '@/services/furnitureApi';
import type { FurnitureMaker, FurniturePortfolioItem, FurnitureArticleItem } from '@/types/furniture';
import { FurnitureReelModal } from '@/components/furniture/FurnitureReelModal';
import { FurnitureArticleModal } from '@/components/furniture/FurnitureArticleModal';
import { AddPortfolioModal } from '@/components/furniture/AddPortfolioModal';
import { getImageUrl } from '@/utils/imageUrl';
import { useAuthStore } from '@/store/useAuthStore';

const CATEGORY_NAMES: Record<string, string> = {
  ALL: 'Бүгд',
  KITCHEN: 'Гал тогоо',
  WARDROBE: 'Шүүгээ & Шкаф',
  LIVING_ROOM: 'Зочны өрөө',
  KIDS: 'Хүүхдийн өрөө',
  OFFICE: 'Оффис тавилга',
  SOLID_WOOD: 'Цэвэр мод',
  CUSTOM: 'Захиалгат хийц',
};

export const FurnitureDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const [maker, setMaker] = useState<FurnitureMaker | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState('ALL');

  // Modals state
  const [selectedReel, setSelectedReel] = useState<FurniturePortfolioItem | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<FurnitureArticleItem | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState<{ item: FurniturePortfolioItem; idx: number } | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  // Ownership verification:
  // Can edit if:
  // 1. maker has no assigned owner (initial demo seed)
  // 2. user is the creator (maker.userId === user?.id)
  // 3. user is an ADMIN
  const isOwner = Boolean(
    !maker?.userId || (user && (maker?.userId === user.id || (user as any).role === 'ADMIN'))
  );

  const handleOpenAddModal = () => {
    if (!isAuthenticated) {
      navigate(`/login?redirect=/furniture/${id}`);
      return;
    }
    setIsAddModalOpen(true);
  };

  useEffect(() => {
    if (id) {
      loadMaker(id);
    }
  }, [id]);

  const loadMaker = async (makerId: string) => {
    setLoading(true);
    try {
      const res = await furnitureApi.getOne(makerId);
      setMaker(res.data);
    } catch (err) {
      console.warn('Failed to load furniture maker:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-void pt-28 pb-20 flex flex-col items-center justify-center space-y-3 text-white">
        <RefreshCw className="animate-spin text-plasma" size={36} />
        <p className="text-sm text-nebula-text">Урлангийн мэдээлэл ачааллаж байна...</p>
      </div>
    );
  }

  if (!maker) {
    return (
      <div className="min-h-screen bg-void pt-28 pb-20 flex flex-col items-center justify-center space-y-4 text-white text-center px-4">
        <h2 className="text-2xl font-bold">Тавилгын газар олдсонгүй</h2>
        <Link
          to="/furniture"
          className="px-5 py-2.5 rounded-xl bg-plasma text-white text-sm font-bold shadow-lg"
        >
          Буцах
        </Link>
      </div>
    );
  }

  const phone = maker.phone || '89117722';
  const portfolio = maker.portfolio || [];
  const articles = maker.articles || [];

  const filteredPortfolio = selectedFilter === 'ALL'
    ? portfolio
    : portfolio.filter((p) => p.category === selectedFilter);

  return (
    <div className="min-h-screen bg-void pt-20 pb-24 text-white">
      {/* ── Breadcrumb & Back ────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <Link
          to="/furniture"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-nebula-text hover:text-white transition-colors"
        >
          <ChevronLeft size={16} />
          <span>Тавилгын сан руу буцах</span>
        </Link>
      </div>

      {/* ── Cover Banner & Header ────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden h-64 sm:h-80 w-full bg-void/50 border border-white/10 shadow-2xl">
          <img
            src={getImageUrl(maker.coverUrl || (portfolio[0]?.images?.[0]))}
            alt={maker.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1400&q=80';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-void via-black/40 to-black/20" />

          {/* Share Button */}
          <button
            onClick={handleShare}
            className="absolute top-4 right-4 z-10 px-3.5 py-2 rounded-xl bg-black/60 hover:bg-black/80 text-white backdrop-blur-md border border-white/20 text-xs font-bold flex items-center gap-1.5 shadow-lg cursor-pointer transition-all active:scale-95"
          >
            <Share2 size={14} />
            <span>{copied ? 'Хуулагдлаа!' : 'Хуваалцах'}</span>
          </button>
        </div>

        {/* Maker Profile Header Row */}
        <div className="relative -mt-16 sm:-mt-20 px-4 sm:px-8 flex flex-col md:flex-row md:items-end justify-between gap-6 z-10">
          <div className="flex items-end gap-5">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl p-1 bg-gradient-to-tr from-plasma via-nova to-aurora shadow-2xl shadow-plasma/40 flex-shrink-0">
              <div className="w-full h-full bg-void rounded-[22px] overflow-hidden">
                <img
                  src={getImageUrl(maker.logoUrl || maker.coverUrl)}
                  alt={maker.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=400&q=80';
                  }}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-black text-white">{maker.name}</h1>
                {maker.isVerified && (
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-black flex items-center gap-1">
                    <ShieldCheck size={13} />
                    <span>Баталгаажсан</span>
                  </span>
                )}
              </div>

              {maker.tagline && (
                <p className="text-sm text-starlight/90 font-medium line-clamp-1">{maker.tagline}</p>
              )}

              <div className="flex items-center gap-3 text-xs text-nebula-text/80 flex-wrap">
                <span className="flex items-center gap-1 text-white">
                  <MapPin size={13} className="text-plasma" />
                  {maker.district} {maker.city ? `• ${maker.city}` : ''}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 text-white">
                  <Clock size={13} className="text-aurora" />
                  {maker.experienceYears}+ жил туршлагатай
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 text-amber-400 font-bold">
                  <Star size={13} fill="currentColor" />
                  {maker.rating.toFixed(1)} ({maker.reviewsCount} үнэлгээ)
                </span>
              </div>
            </div>
          </div>

          {/* Quick Contact Buttons */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <a
              href={`tel:${phone.replace(/\D/g, '')}`}
              className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-sm shadow-xl shadow-emerald-500/25 flex items-center gap-2 active:scale-95 transition-all cursor-pointer"
            >
              <Phone size={16} />
              <span>Шууд залгах ({phone})</span>
            </a>

            {maker.facebookUrl && (
              <a
                href={maker.facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3.5 rounded-2xl bg-blue-600/20 border border-blue-500/40 hover:bg-blue-600 hover:text-white text-blue-300 transition-all shadow-md active:scale-95"
                title="Facebook хуудас"
              >
                <ExternalLink size={16} />
              </a>
            )}

            {maker.instagramUrl && (
              <a
                href={maker.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3.5 rounded-2xl bg-pink-600/20 border border-pink-500/40 hover:bg-pink-600 hover:text-white text-pink-300 transition-all shadow-md active:scale-95"
                title="Instagram хуудас"
              >
                <ExternalLink size={16} />
              </a>
            )}
          </div>
        </div>
      </div>

      {/* ── Main Layout: Content Grid & Sticky Info ─────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Left Column (2 cols): Portfolio Works & Articles */}
          <div className="lg:col-span-2 space-y-10">
            {/* Overview / About */}
            <div className="glass-card rounded-3xl p-6 border border-white/10 space-y-4">
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <Sparkles size={18} className="text-plasma" />
                <span>Урлангийн тухай</span>
              </h3>
              <p className="text-sm text-starlight/90 leading-relaxed whitespace-pre-line">
                {maker.description}
              </p>

              {/* Badges / Guarantees Row */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-3 border-t border-white/5">
                <div className="p-3 rounded-2xl bg-white/5 border border-white/5 text-center">
                  <Award size={20} className="text-plasma mx-auto mb-1" />
                  <span className="text-xs font-bold text-white block">{maker.warrantyMonths} сарын</span>
                  <span className="text-[11px] text-nebula-text/70">Чанарын баталгаа</span>
                </div>

                <div className="p-3 rounded-2xl bg-white/5 border border-white/5 text-center">
                  <Clock size={20} className="text-aurora mx-auto mb-1" />
                  <span className="text-xs font-bold text-white block">{maker.experienceYears}+ жил</span>
                  <span className="text-[11px] text-nebula-text/70">Салбарын туршлага</span>
                </div>

                <div className="p-3 rounded-2xl bg-white/5 border border-white/5 text-center col-span-2 sm:col-span-1">
                  <CheckCircle2 size={20} className="text-emerald-400 mx-auto mb-1" />
                  <span className="text-xs font-bold text-white block">{portfolio.length}+ хийсэн ажил</span>
                  <span className="text-[11px] text-nebula-text/70">Хийц гүйцэтгэл</span>
                </div>
              </div>
            </div>

            {/* 📸 Portfolio Section */}
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h3 className="text-xl font-black text-white flex items-center gap-2">
                    <Layers size={20} className="text-plasma" />
                    <span>Хийсэн ажлын сан & Бичлэгүүд</span>
                  </h3>
                  <p className="text-xs text-nebula-text/80 mt-0.5">
                    Бодит орон сууцанд хийгдсэн зураг болон бичлэгүүдтэй танилцана уу.
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {isOwner && (
                    <button
                      type="button"
                      onClick={handleOpenAddModal}
                      className="px-3.5 py-1.5 rounded-xl bg-plasma/20 hover:bg-plasma/30 border border-plasma/40 text-plasma font-bold text-xs flex items-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer whitespace-nowrap"
                    >
                      <Plus size={14} />
                      <span>+ Шинэ ажил нэмэх</span>
                    </button>
                  )}

                  {/* Category filter pills */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                    {['ALL', ...maker.categories].map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setSelectedFilter(cat)}
                        className={`px-3 py-1 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                          selectedFilter === cat
                            ? 'bg-plasma text-white shadow-md shadow-plasma/30'
                            : 'bg-white/5 text-nebula-text hover:text-white'
                        }`}
                      >
                        {CATEGORY_NAMES[cat] || cat}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {filteredPortfolio.length === 0 ? (
                <div className="text-center py-12 bg-white/5 rounded-3xl border border-white/10 p-6 space-y-2">
                  <p className="text-sm font-bold text-white">Энэ ангилалд ажил бүртгэгдээгүй байна</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {filteredPortfolio.map((item) => {
                    const hasVideo = Boolean(item.videoUrl);
                    const thumb = item.thumbnailUrl || (item.images && item.images[0]) || maker.coverUrl;

                    return (
                      <div
                        key={item.id}
                        onClick={() => setSelectedReel(item)}
                        className="glass-card rounded-2xl overflow-hidden border border-white/10 hover:border-plasma transition-all shadow-xl group cursor-pointer flex flex-col justify-between"
                      >
                        <div className="relative aspect-[16/10] bg-black overflow-hidden">
                          <img
                            src={getImageUrl(thumb)}
                            alt={item.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=600&q=80';
                            }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />

                          {hasVideo && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="w-12 h-12 rounded-full bg-plasma/90 text-white flex items-center justify-center shadow-xl shadow-plasma/40 group-hover:scale-110 transition-transform">
                                <Play size={20} fill="currentColor" className="translate-x-0.5" />
                              </div>
                            </div>
                          )}

                          {hasVideo && (
                            <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md text-white text-[10px] font-bold flex items-center gap-1 border border-white/20">
                              <span className="w-1.5 h-1.5 rounded-full bg-plasma animate-ping" />
                              <span>Реел бичлэг</span>
                            </span>
                          )}

                          {item.durationDays && (
                            <span className="absolute bottom-3 right-3 px-2 py-0.5 rounded-md bg-void/80 backdrop-blur-md text-white text-[10px] font-bold">
                              ⏱️ {item.durationDays} хоногт хийсэн
                            </span>
                          )}
                        </div>

                        <div className="p-4 space-y-2">
                          <h4 className="text-sm font-bold text-white group-hover:text-plasma transition-colors line-clamp-1">
                            {item.title}
                          </h4>

                          {item.materials && (
                            <p className="text-xs text-nebula-text/80 line-clamp-1">
                              🛠️ {item.materials}
                            </p>
                          )}

                          {item.location && (
                            <div className="flex items-center gap-1 text-[11px] text-white/60 pt-1">
                              <MapPin size={11} className="text-aurora flex-shrink-0" />
                              <span className="truncate">{item.location} {item.year ? `• ${item.year}` : ''}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 💡 Expert Tips & Articles Section */}
            {articles.length > 0 && (
              <div className="space-y-4 pt-6 border-t border-white/10">
                <h3 className="text-xl font-black text-white flex items-center gap-2">
                  <BookOpen size={20} className="text-aurora" />
                  <span>Урлангаас өгөх зөвлөгөө, мэдээлэл</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {articles.map((article) => (
                    <div
                      key={article.id}
                      onClick={() => setSelectedArticle({ ...article, makerName: maker.name, makerPhone: maker.phone, makerLogo: maker.logoUrl })}
                      className="glass-card rounded-2xl p-4 border border-white/10 hover:border-aurora/50 transition-all cursor-pointer group space-y-2 bg-void/70"
                    >
                      <div className="flex items-center gap-2 text-xs text-nebula-text/70">
                        <span className="px-2 py-0.5 rounded-md bg-aurora/20 text-aurora text-[10px] font-bold">
                          {article.category || 'ЗӨВЛӨГӨӨ'}
                        </span>
                        {article.readMinutes && <span>⏱️ {article.readMinutes} мин</span>}
                      </div>

                      <h4 className="text-sm font-bold text-white group-hover:text-aurora transition-colors line-clamp-2">
                        {article.title}
                      </h4>

                      <p className="text-xs text-nebula-text/80 line-clamp-2">
                        {article.summary}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Sticky Contact & Workshop Details */}
          <div className="space-y-6 lg:sticky lg:top-24">
            {/* Direct Contact Card */}
            <div className="glass-card rounded-3xl p-6 border border-white/10 space-y-5 bg-void/90 shadow-2xl">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <Phone size={18} className="text-emerald-400" />
                <span>Шууд холбогдох</span>
              </h3>

              <div className="space-y-3">
                <a
                  href={`tel:${phone.replace(/\D/g, '')}`}
                  className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black py-3.5 px-4 rounded-2xl flex items-center justify-center gap-2 text-sm shadow-xl shadow-emerald-500/25 active:scale-95 transition-all cursor-pointer"
                >
                  <Phone size={16} />
                  <span>Утсаар залгах ({phone})</span>
                </a>

                {maker.secondaryPhone && (
                  <a
                    href={`tel:${maker.secondaryPhone.replace(/\D/g, '')}`}
                    className="w-full bg-white/10 hover:bg-white/20 text-white font-bold py-3 px-4 rounded-2xl flex items-center justify-center gap-2 text-xs border border-white/10 transition-all"
                  >
                    <Phone size={14} />
                    <span>Нэмэлт утас: {maker.secondaryPhone}</span>
                  </a>
                )}
              </div>

              {/* Social Channels */}
              <div className="space-y-2 pt-2 border-t border-white/5">
                <span className="text-xs text-nebula-text/70 font-semibold block">Сошиал сувгууд:</span>
                <div className="flex flex-col gap-2">
                  {maker.facebookUrl && (
                    <a
                      href={maker.facebookUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 rounded-xl bg-blue-600/10 border border-blue-500/30 hover:bg-blue-600 hover:text-white text-blue-300 text-xs font-bold transition-all flex items-center justify-between"
                    >
                      <span>Facebook хуудас</span>
                      <ExternalLink size={14} />
                    </a>
                  )}

                  {maker.instagramUrl && (
                    <a
                      href={maker.instagramUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 rounded-xl bg-pink-600/10 border border-pink-500/30 hover:bg-pink-600 hover:text-white text-pink-300 text-xs font-bold transition-all flex items-center justify-between"
                    >
                      <span>Instagram хаяг</span>
                      <ExternalLink size={14} />
                    </a>
                  )}

                  {maker.websiteUrl && (
                    <a
                      href={maker.websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/15 text-starlight text-xs font-bold transition-all flex items-center justify-between"
                    >
                      <span>Вэбсайт зочлох</span>
                      <ExternalLink size={14} />
                    </a>
                  )}
                </div>
              </div>

              {/* Address details */}
              <div className="space-y-2 pt-2 border-t border-white/5 text-xs">
                <span className="text-nebula-text/70 font-semibold block">Байршил / Хаяг:</span>
                <div className="flex items-start gap-2 text-starlight/90">
                  <MapPin size={15} className="text-plasma flex-shrink-0 mt-0.5" />
                  <span>
                    {maker.city}, {maker.district} дүүрэг
                    {maker.addressDetail ? `, ${maker.addressDetail}` : ''}
                  </span>
                </div>
              </div>

              {/* Materials Used */}
              {maker.materialsUsed && maker.materialsUsed.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-white/5 text-xs">
                  <span className="text-nebula-text/70 font-semibold block">Ашигладаг стандартууд:</span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {maker.materialsUsed.map((mat) => (
                      <span
                        key={mat}
                        className="px-2.5 py-1 rounded-lg bg-plasma/10 border border-plasma/20 text-plasma text-[11px] font-semibold"
                      >
                        ✓ {mat}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Reel Modal */}
      <FurnitureReelModal
        isOpen={Boolean(selectedReel)}
        onClose={() => setSelectedReel(null)}
        item={selectedReel}
        maker={maker}
      />

      {/* Article Modal */}
      <FurnitureArticleModal
        isOpen={Boolean(selectedArticle)}
        onClose={() => setSelectedArticle(null)}
        article={selectedArticle}
      />

      {/* Add Portfolio Project Modal */}
      <AddPortfolioModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        makerId={maker.id}
        defaultDistrict={maker.district}
        onSuccess={(updatedMaker) => setMaker(updatedMaker)}
      />
    </div>
  );
};

export default FurnitureDetail;
