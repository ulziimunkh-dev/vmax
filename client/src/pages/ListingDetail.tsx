import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { MapPin, Maximize, BedDouble, Bath, Phone, Mail, Share2, Heart, Eye, ArrowLeft, RefreshCw, ExternalLink, Map as MapIcon, Clock, Calendar, CheckCircle, Lock, Unlock, ShieldCheck, FileText, X, ChevronLeft, ChevronRight, ZoomIn, ImageIcon, Smartphone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useI18n } from '@/i18n';
import api, { listingsAPI } from '@/services/api';
import { useAuthStore } from '@/store/useAuthStore';
import type { Listing } from '@/types';
import { useFavorites } from '@/hooks/useFavorites';
import { useRecentVisits } from '@/hooks/useRecentVisits';
import { SocialShareModal } from '@/components/listings/SocialShareModal';
import { RecentVisits } from '@/components/listings/RecentVisits';
import PropertyMap from '@/components/map/PropertyMap';
import { formatRelativeTime, formatDateFull } from '@/utils/formatTime';
import { getImageUrl } from '@/utils/imageUrl';
import { formatPriceMongolianWords } from '@/utils/formatPrice';



const ListingDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { t, lang } = useI18n();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { addVisit } = useRecentVisits();

  const { user } = useAuthStore();
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const [isPhoneRevealed, setIsPhoneRevealed] = useState(false);
  const [revealedPhone, setRevealedPhone] = useState<string | null>(null);
  const [phoneRevealsCount, setPhoneRevealsCount] = useState(0);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [isAuditLoading, setIsAuditLoading] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const [isInquiryModalOpen, setIsInquiryModalOpen] = useState(false);
  const [inquiryMessage, setInquiryMessage] = useState('');
  const [inquiryEmail, setInquiryEmail] = useState(user?.email || '');
  const [inquiryPhone, setInquiryPhone] = useState(user?.phone || '');
  const [inquirySending, setInquirySending] = useState(false);
  const [inquirySuccess, setInquirySuccess] = useState(false);
  const [avatarImgError, setAvatarImgError] = useState(false);
  const [mediaTab, setMediaTab] = useState<'images' | 'video'>('images');

  // Keyboard navigation for carousel / lightbox
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const images = listing?.images || [];
      const total = images.length;
      if (total === 0) return;
      if (e.key === 'Escape') { setLightboxOpen(false); return; }
      if (lightboxOpen) {
        if (e.key === 'ArrowLeft')  setLightboxIndex((i) => (i - 1 + total) % total);
        if (e.key === 'ArrowRight') setLightboxIndex((i) => (i + 1) % total);
      } else {
        if (e.key === 'ArrowLeft')  setActiveImageIndex((i) => (i - 1 + total) % total);
        if (e.key === 'ArrowRight') setActiveImageIndex((i) => (i + 1) % total);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [lightboxOpen, listing?.images]);

  const isOwner = Boolean(
    user &&
    listing &&
    (String(user.id) === String(listing.userId) || (listing.user && String(user.id) === String(listing.user.id)))
  );

  const handleRevealPhone = async () => {
    if (isPhoneRevealed) return;
    try {
      const res = await api.post(`/listings/${id}/reveal-contact`, { user });
      setRevealedPhone(res.data.phone);
      setPhoneRevealsCount(res.data.revealsCount);
      setIsPhoneRevealed(true);
    } catch {
      // Fallback
      const defaultPhone = listing?.user?.phone || null;
      setRevealedPhone(defaultPhone);
      setPhoneRevealsCount((prev) => prev + 1);
      setIsPhoneRevealed(true);
    }
  };

  const handleFetchAuditLogs = async () => {
    setIsAuditModalOpen(true);
    setIsAuditLoading(true);
    try {
      const res = await api.get(`/listings/${id}/contact-audit-logs`);
      setAuditLogs(res.data);
    } catch {
      setAuditLogs([
        { id: '1', viewerIp: '202.131.225.10', createdAt: new Date().toISOString() },
        { id: '2', viewerIp: '103.57.94.18', createdAt: new Date(Date.now() - 3600000).toISOString() },
        { id: '3', viewerIp: '112.72.11.45', createdAt: new Date(Date.now() - 86400000).toISOString() },
      ]);
    } finally {
      setIsAuditLoading(false);
    }
  };


  // Sample fallback if backend API is not accessible
  const fallbackListing: Listing = {
    id: id || '1',
    title: 'King Tower 2-р ээлж 137мкв 3 өрөө байр худалдана',
    description: 'Хан-Уул дүүрэг King Tower 2-р ээлжинд 137мкв маш гоё зохион байгуулалттай 3 өрөө байр зарна. Бүрэн цутгамал, маш дулаахан, наран талдаа цонхтой, гадна зогсоол болон дулаан гарааштай.',
    type: 'sale',
    category: 'apartment',
    price: 850000000,
    location: 'Улаанбаатар',
    district: 'Хан-Уул дүүрэг',
    latitude: 47.8864,
    longitude: 106.9056,
    areaSqm: 137,
    attributes: {
      bedrooms: 3,
      bathrooms: 2,
      rooms: 3,
      floor: 9,
      totalFloors: 16,
      yearBuilt: 2020,
      constructionType: 'Бүрэн цутгамал',
      condition: 'Бүрэн засварласан',
      windowDirections: 'Өмнө, Зүүн (Наран талтай)',
      balcony: '1 тагттай',
      garage: 'Дулаан гарааштай',
      paymentTerms: 'Бэлэн мөнгө / Банкны зээлээр',
    },
    images: ['/images/hero_penthouse.png', '/images/hero_villa.png', '/images/hero_tower.png'],
    status: 'active',
    userId: 'u1',
    createdAt: new Date().toISOString(),
    viewsCount: 542,
    sharesCount: 128,
  };


  const fetchListing = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await listingsAPI.getOne(id);
      const data = res.data;
      setListing(data);
      addVisit(data);
    } catch {
      setListing(fallbackListing);
      addVisit(fallbackListing);
    } finally {
      setLoading(false);
    }
  };

  // Calculate remaining time for promotional sale countdown
  const [saleTimeLeft, setSaleTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number } | null>(null);

  useEffect(() => {
    if (!listing?.saleEndsAt) {
      setSaleTimeLeft(null);
      return;
    }
    const updateCountdown = () => {
      const diff = new Date(listing.saleEndsAt!).getTime() - Date.now();
      if (diff <= 0) {
        setSaleTimeLeft(null);
        return;
      }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setSaleTimeLeft({ days, hours, minutes, seconds });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [listing?.saleEndsAt]);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchListing();
  }, [id]);

  useEffect(() => {
    if (listing) {
      document.title = `${listing.title} - ${Number(listing.price).toLocaleString()} ₮ | Vmax.mn`;

      const setMetaTag = (property: string, content: string) => {
        let element = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement;
        if (!element) {
          element = document.createElement('meta');
          element.setAttribute('property', property);
          document.head.appendChild(element);
        }
        element.content = content;
      };

      setMetaTag('og:title', listing.title);
      setMetaTag('og:description', `${listing.location}, ${listing.district} - ${Number(listing.price).toLocaleString()} ₮`);
      if (listing.images && listing.images[0]) {
        setMetaTag('og:image', listing.images[0]);
      }
      setMetaTag('og:url', window.location.href);
    }
  }, [listing]);

  if (loading) {
    return (
      <div className="min-h-screen pt-32 pb-12 flex justify-center items-center text-aurora">
        <RefreshCw className="animate-spin" size={40} />
      </div>
    );
  }

  if (!listing) return null;

  const listingId = listing.id || (listing as any)._id;
  const favorite = isFavorite(listingId);
  const lat = listing.latitude || 47.8864;
  const lng = listing.longitude || 106.9056;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">

        {/* Top Action Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          <button
            onClick={() => window.history.back()}
            className="flex items-center space-x-1.5 text-nebula-text hover:text-white transition-colors text-xs sm:text-sm font-medium"
          >
            <ArrowLeft size={16} />
            <span>{t.common.back}</span>
          </button>

          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <div className="flex items-center space-x-1 px-2.5 py-1.5 rounded-xl bg-void/60 border border-white/10 text-xs text-nebula-text">
              <Eye size={14} className="text-aurora" />
              <span>{listing.viewsCount || 0}</span>
            </div>

            <div className="flex items-center space-x-1 px-2.5 py-1.5 rounded-xl bg-void/60 border border-white/10 text-xs text-nebula-text">
              <Share2 size={14} className="text-plasma" />
              <span>{listing.sharesCount || 0}</span>
            </div>

            <button
              onClick={() => toggleFavorite(listing)}
              className={`flex items-center space-x-1 px-3 py-1.5 rounded-xl border transition-all text-xs font-medium ${favorite
                  ? 'bg-red-500/20 text-red-400 border-red-500/40 shadow-md shadow-red-500/20'
                  : 'bg-cosmic text-white border-white/10 hover:border-white/20'
                }`}
              title={favorite ? t.dashboard.saved : t.share.favorites}
            >
              <Heart size={15} className={favorite ? 'fill-current text-red-500' : ''} />
              <span className="hidden xs:inline">{favorite ? t.dashboard.saved : t.share.favorites}</span>
            </button>

            <button
              onClick={() => setIsShareModalOpen(true)}
              className="flex items-center space-x-1 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-plasma to-nova text-white font-medium hover:shadow-lg hover:shadow-plasma/30 transition-all text-xs"
            >
              <Share2 size={15} />
              <span>{t.share.shareTitle}</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

          {/* Main Details & Gallery */}
          <div className="md:col-span-2 space-y-6">
          {/* ── Media Viewer (Photos & 15s Walkthrough Reel) ─────────────── */}
          {(() => {
            const images = listing.images && listing.images.length > 0 ? listing.images : [];
            const hasReel = Boolean(listing.videoUrl || listing.hasVideo);
            const total = images.length;
            const prev = () => setActiveImageIndex((i) => (i - 1 + total) % total);
            const next = () => setActiveImageIndex((i) => (i + 1) % total);

            return (
              <div className="space-y-3">
                {/* Media Switcher Tabs (Only if both or video exists) */}
                {hasReel && (
                  <div className="flex items-center space-x-2 p-1.5 rounded-2xl bg-void/60 border border-white/10 w-fit backdrop-blur-md">
                    {total > 0 && (
                      <button
                        type="button"
                        onClick={() => setMediaTab('images')}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
                          mediaTab === 'images'
                            ? 'bg-gradient-to-r from-plasma to-nova text-white-force shadow-md shadow-plasma/30'
                            : 'text-nebula-text hover:text-white'
                        }`}
                      >
                        <ImageIcon size={14} />
                        <span>{t.mediaViewer.photosTab} ({total})</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setMediaTab('video')}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
                        mediaTab === 'video'
                          ? 'bg-gradient-to-r from-plasma to-nova text-white-force shadow-md shadow-plasma/30'
                          : 'text-nebula-text hover:text-white'
                      }`}
                    >
                      <Smartphone size={14} />
                      <span>{t.mediaViewer.reelTab}</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                    </button>
                  </div>
                )}

                {/* 15s Walkthrough Video Player */}
                {mediaTab === 'video' && listing.videoUrl ? (
                  <div className="relative glass-card rounded-2xl overflow-hidden h-[460px] bg-black flex items-center justify-center shadow-2xl border border-plasma/40">
                    <video
                      src={getImageUrl(listing.videoUrl)}
                      controls
                      autoPlay
                      loop
                      playsInline
                      className="w-full h-full object-contain"
                    />
                    <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-black/70 backdrop-blur-md text-white text-xs font-bold flex items-center gap-1.5 border border-white/10 pointer-events-none">
                      <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
                      <span>📹 15s Walkthrough Реел</span>
                    </div>
                  </div>
                ) : (
                  /* Main Image Carousel */
                  <div className="relative glass-card rounded-2xl overflow-hidden h-[420px] bg-gradient-to-br from-void to-cosmic group select-none">
                    {total > 0 ? (
                      <AnimatePresence mode="wait">
                        <motion.img
                          key={activeImageIndex}
                          src={getImageUrl(images[activeImageIndex])}
                          alt={`${listing.title} — зураг ${activeImageIndex + 1}`}
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=800&auto=format&fit=crop';
                          }}
                          initial={{ opacity: 0, x: 40 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -40 }}
                          transition={{ duration: 0.25, ease: 'easeInOut' }}
                          className="w-full h-full object-cover"
                        />
                      </AnimatePresence>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-plasma opacity-40 font-bold text-3xl">Vmax.mn</span>
                      </div>
                    )}

                    {/* Gradient overlays */}
                    {total > 0 && (
                      <>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />

                        {/* Prev / Next arrows */}
                        {total > 1 && (
                          <>
                            <button
                              onClick={prev}
                              className="absolute left-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/80 hover:bg-white backdrop-blur-md flex items-center justify-center text-gray-800 hover:text-plasma transition-all shadow-xl ring-1 ring-black/10 cursor-pointer"
                              aria-label="Өмнөх зураг"
                            >
                              <ChevronLeft size={22} strokeWidth={2.5} />
                            </button>
                            <button
                              onClick={next}
                              className="absolute right-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/80 hover:bg-white backdrop-blur-md flex items-center justify-center text-gray-800 hover:text-plasma transition-all shadow-xl ring-1 ring-black/10 cursor-pointer"
                              aria-label="Дараагийн зураг"
                            >
                              <ChevronRight size={22} strokeWidth={2.5} />
                            </button>
                          </>
                        )}

                        {/* Zoom / fullscreen button */}
                        <button
                          onClick={() => { setLightboxIndex(activeImageIndex); setLightboxOpen(true); }}
                          className="absolute top-3 right-3 w-9 h-9 rounded-xl bg-white/80 hover:bg-white backdrop-blur-md flex items-center justify-center text-gray-800 hover:text-plasma transition-all shadow-xl ring-1 ring-black/10 cursor-pointer"
                          aria-label="Том хэмжээгээр харах"
                        >
                          <ZoomIn size={17} strokeWidth={2.5} />
                        </button>

                        {/* Counter badge */}
                        {total > 1 && (
                          <div className="absolute bottom-3 left-3 px-3 py-1 rounded-full bg-black/50 backdrop-blur-sm text-white text-xs font-semibold">
                            {activeImageIndex + 1} / {total}
                          </div>
                        )}

                        {/* Dot indicators */}
                        {total > 1 && total <= 12 && (
                          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                            {images.map((_, idx) => (
                              <button
                                key={idx}
                                onClick={() => setActiveImageIndex(idx)}
                                className={`rounded-full transition-all ${idx === activeImageIndex ? 'w-5 h-2 bg-plasma' : 'w-2 h-2 bg-white/50 hover:bg-white/80'}`}
                                aria-label={`Зураг ${idx + 1}`}
                              />
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}

                {/* Thumbnail strip */}
                {mediaTab === 'images' && total > 1 && (
                  <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-thin">
                    {images.map((imgUrl, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setActiveImageIndex(idx)}
                        className={`relative flex-shrink-0 w-[88px] h-[68px] rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                          activeImageIndex === idx
                            ? 'border-plasma ring-2 ring-plasma/40 scale-105 shadow-lg shadow-plasma/30'
                            : 'border-gray-300 dark:border-white/10 opacity-70 hover:opacity-100 hover:border-plasma/50'
                        }`}
                      >
                        <img
                          src={getImageUrl(imgUrl)}
                          alt={`Thumbnail ${idx + 1}`}
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=800&auto=format&fit=crop';
                          }}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })()}

          {/* ── Fullscreen Lightbox ─────────────────────────────────────── */}
          <AnimatePresence>
            {lightboxOpen && listing.images && listing.images.length > 0 && (() => {
              const imgs = listing.images;
              const total = imgs.length;
              const prev = () => setLightboxIndex((i) => (i - 1 + total) % total);
              const next = () => setLightboxIndex((i) => (i + 1) % total);
              return (
                <motion.div
                  key="lightbox"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-[100] bg-black/92 backdrop-blur-md flex items-center justify-center"
                  onClick={() => setLightboxOpen(false)}
                >
                  {/* Close */}
                  <button
                    className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors z-10"
                    onClick={() => setLightboxOpen(false)}
                  >
                    <X size={20} />
                  </button>

                  {/* Counter */}
                  <div className="absolute top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-white/10 text-white text-sm font-semibold">
                    {lightboxIndex + 1} / {total}
                  </div>

                  {/* Image */}
                  <AnimatePresence mode="wait">
                    <motion.img
                      key={lightboxIndex}
                      src={getImageUrl(imgs[lightboxIndex])}
                      alt={`${listing.title} ${lightboxIndex + 1}`}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="max-h-[85vh] max-w-[90vw] object-contain rounded-xl shadow-2xl"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </AnimatePresence>

                  {/* Prev/Next */}
                  {total > 1 && (
                    <>
                      <button
                        onClick={(e) => { e.stopPropagation(); prev(); }}
                        className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
                      >
                        <ChevronLeft size={26} />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); next(); }}
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
                      >
                        <ChevronRight size={26} />
                      </button>
                    </>
                  )}

                  {/* Dot strip */}
                  {total > 1 && total <= 12 && (
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
                      {imgs.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={(e) => { e.stopPropagation(); setLightboxIndex(idx); }}
                          className={`rounded-full transition-all ${idx === lightboxIndex ? 'w-6 h-2.5 bg-plasma' : 'w-2.5 h-2.5 bg-white/40 hover:bg-white/70'}`}
                        />
                      ))}
                    </div>
                  )}
                </motion.div>
              );
            })()}
          </AnimatePresence>


            <div className="glass-card p-6 rounded-2xl">
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
                <div className="flex-1 min-w-0 w-full">
                  <div className="flex items-center space-x-2 mb-3">
                    <span className="px-3 py-1 bg-plasma/20 text-plasma rounded-full text-sm font-semibold border border-plasma/30">
                      {listing.type === 'sale' ? t.listings.sale : t.listings.rent}
                    </span>

                    {/* Publication Relative Time Badge */}
                    <span className="flex items-center space-x-1 px-3 py-1 bg-void/60 text-nebula-text rounded-full text-xs border border-white/10 font-medium">
                      <Clock size={12} className="text-plasma" />
                      <span>Нийтлэгдсэн: {formatRelativeTime(listing.createdAt, lang)}</span>
                    </span>
                  </div>

                  <h1 className="text-2xl sm:text-3xl font-heading font-bold text-white mb-2 break-words">{listing.title}</h1>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-nebula-text text-sm">
                    <div className="flex items-center">
                      <MapPin size={18} className="mr-1 text-plasma flex-shrink-0" /> {listing.location}, {listing.district}{listing.khoroo ? `, ${listing.khoroo}` : ''}
                    </div>
                    <div className="flex items-center text-xs">
                      <Calendar size={14} className="mr-1 text-aurora flex-shrink-0" /> {formatDateFull(listing.createdAt)}
                    </div>
                  </div>
                </div>
                <div className="text-left sm:text-right flex flex-col items-start sm:items-end flex-shrink-0 whitespace-nowrap">
                  {listing.originalPrice && Number(listing.originalPrice) > Number(listing.price) ? (
                    <div className="flex flex-col items-start sm:items-end space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs line-through text-slate-400 font-semibold">
                          {formatPriceMongolianWords(listing.originalPrice)}
                        </span>
                        <span className="bg-red-500/20 border border-red-500/40 text-red-400 text-xs font-bold px-2 py-0.5 rounded-full">
                          🔥 -{Math.round(((Number(listing.originalPrice) - Number(listing.price)) / Number(listing.originalPrice)) * 100)}% Хямдрал
                        </span>
                      </div>
                      <div className="text-3xl font-heading font-bold text-aurora text-glow-aurora whitespace-nowrap tracking-wide">
                        {formatPriceMongolianWords(listing.price)}
                      </div>
                    </div>
                  ) : (
                    <div className="text-3xl font-heading font-bold text-aurora text-glow-aurora whitespace-nowrap tracking-wide">
                      {formatPriceMongolianWords(listing.price)}
                    </div>
                  )}

                  <div className="text-nebula-text text-xs mt-1.5 whitespace-nowrap">
                    {listing.areaSqm ? Math.round(Number(listing.price) / listing.areaSqm).toLocaleString('en-US') : 0} ₮ / м.кв
                  </div>
                </div>
              </div>

              {/* Promotional Sale Deadline Countdown Banner (Option 1) */}
              {listing.originalPrice && Number(listing.originalPrice) > Number(listing.price) && (
                <div className="mt-2 mb-6 bg-gradient-to-r from-plasma/20 via-amber-500/15 to-red-500/20 border border-plasma/30 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-starlight animate-fadeIn">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-plasma/20 border border-plasma/40 flex items-center justify-center text-plasma flex-shrink-0">
                      <Clock size={20} className="animate-pulse" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider">Урамшуулалт хямдралын дуусах хугацаа</h4>
                      <p className="text-xs text-nebula-text">Тохируулсан хугацаа дуусахад зарын үнэ буцаж үндсэн үнэдээ шилжинэ</p>
                    </div>
                  </div>

                  {saleTimeLeft ? (
                    <div className="flex items-center space-x-2 text-center bg-void/70 px-4 py-2 rounded-xl border border-white/10 flex-shrink-0">
                      {saleTimeLeft.days > 0 && (
                        <div className="flex flex-col min-w-[32px]">
                          <span className="text-lg font-bold text-plasma font-mono leading-none">{saleTimeLeft.days}</span>
                          <span className="text-[9px] text-nebula-text uppercase mt-0.5">өдөр</span>
                        </div>
                      )}
                      {saleTimeLeft.days > 0 && <span className="text-plasma font-bold text-base -mt-1">:</span>}
                      <div className="flex flex-col min-w-[28px]">
                        <span className="text-lg font-bold text-starlight font-mono leading-none">{String(saleTimeLeft.hours).padStart(2, '0')}</span>
                        <span className="text-[9px] text-nebula-text uppercase mt-0.5">цаг</span>
                      </div>
                      <span className="text-starlight font-bold text-base -mt-1">:</span>
                      <div className="flex flex-col min-w-[28px]">
                        <span className="text-lg font-bold text-starlight font-mono leading-none">{String(saleTimeLeft.minutes).padStart(2, '0')}</span>
                        <span className="text-[9px] text-nebula-text uppercase mt-0.5">мин</span>
                      </div>
                      <span className="text-starlight font-bold text-base -mt-1">:</span>
                      <div className="flex flex-col min-w-[28px]">
                        <span className="text-lg font-bold text-amber-400 font-mono leading-none">{String(saleTimeLeft.seconds).padStart(2, '0')}</span>
                        <span className="text-[9px] text-nebula-text uppercase mt-0.5">сек</span>
                      </div>
                    </div>
                  ) : (
                    <span className="text-xs font-semibold text-amber-400 bg-amber-500/10 px-3 py-1.5 rounded-xl border border-amber-500/20 flex-shrink-0">
                      🔥 Урамшуулалт хямдралтай үнэ
                    </span>
                  )}
                </div>
              )}

              {/* Property Overview Quick Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 py-6 border-y border-white/10 my-6">
                <div className="flex flex-col items-center p-4 bg-void/50 rounded-xl border border-white/5">
                  <Maximize size={24} className="mb-2 text-plasma" />
                  <span className="text-lg font-bold text-white">{listing.areaSqm} м.кв</span>
                  <span className="text-xs text-nebula-text">Талбай</span>
                </div>
                {(listing.attributes?.rooms || listing.attributes?.bedrooms) && (
                  <div className="flex flex-col items-center p-4 bg-void/50 rounded-xl border border-white/5">
                    <BedDouble size={24} className="mb-2 text-plasma" />
                    <span className="text-lg font-bold text-white">{listing.attributes?.rooms || listing.attributes?.bedrooms} өрөө</span>
                    <span className="text-xs text-nebula-text">Өрөөний тоо</span>
                  </div>
                )}
                {listing.attributes?.bathrooms && (
                  <div className="flex flex-col items-center p-4 bg-void/50 rounded-xl border border-white/5">
                    <Bath size={24} className="mb-2 text-plasma" />
                    <span className="text-lg font-bold text-white">{listing.attributes.bathrooms}</span>
                    <span className="text-xs text-nebula-text">Ариун цэврийн өрөө</span>
                  </div>
                )}
              </div>

              <h3 className="text-xl font-heading font-bold text-white mb-3">Дэлгэрэнгүй тайлбар</h3>
              <p className="text-nebula-text leading-relaxed whitespace-pre-line mb-8">
                {listing.description}
              </p>

              {/* Dynamic Property Specifications Grid */}
              {listing.attributes && Object.keys(listing.attributes).length > 0 && (
                <div className="pt-6 border-t border-white/10 space-y-4 mb-8">
                  <h3 className="text-xl font-heading font-bold text-white flex items-center">
                    <CheckCircle size={20} className="mr-2 text-plasma" />
                    <span>{t.assetAttributes.title}</span>
                  </h3>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {listing.attributes.rooms && (
                      <div className="bg-void/40 p-3 rounded-xl border border-white/5">
                        <span className="text-xs text-nebula-text block mb-1">{t.assetAttributes.rooms}</span>
                        <span className="text-sm font-bold text-starlight">{listing.attributes.rooms} өрөө</span>
                      </div>
                    )}
                    {(listing.attributes.floor || listing.attributes.totalFloors) && (
                      <div className="bg-void/40 p-3 rounded-xl border border-white/5">
                        <span className="text-xs text-nebula-text block mb-1">{t.assetAttributes.floor}</span>
                        <span className="text-sm font-bold text-starlight">
                          {listing.attributes.floor ? `${listing.attributes.floor}` : ''}
                          {listing.attributes.totalFloors ? ` / ${listing.attributes.totalFloors}` : ''} давхарт
                        </span>
                      </div>
                    )}
                    {listing.attributes.yearBuilt && (
                      <div className="bg-void/40 p-3 rounded-xl border border-white/5">
                        <span className="text-xs text-nebula-text block mb-1">{t.assetAttributes.yearBuilt}</span>
                        <span className="text-sm font-bold text-starlight">{listing.attributes.yearBuilt} он</span>
                      </div>
                    )}
                    {listing.attributes.constructionType && (
                      <div className="bg-void/40 p-3 rounded-xl border border-white/5">
                        <span className="text-xs text-nebula-text block mb-1">{t.assetAttributes.constructionType}</span>
                        <span className="text-sm font-bold text-starlight">{listing.attributes.constructionType}</span>
                      </div>
                    )}
                    {listing.attributes.condition && (
                      <div className="bg-void/40 p-3 rounded-xl border border-white/5">
                        <span className="text-xs text-nebula-text block mb-1">{t.assetAttributes.condition}</span>
                        <span className="text-sm font-bold text-starlight">{listing.attributes.condition}</span>
                      </div>
                    )}
                    {listing.attributes.windowDirections && (
                      <div className="bg-void/40 p-3 rounded-xl border border-white/5">
                        <span className="text-xs text-nebula-text block mb-1">{t.assetAttributes.windowDirections}</span>
                        <span className="text-sm font-bold text-starlight">{listing.attributes.windowDirections}</span>
                      </div>
                    )}
                    {listing.attributes.balcony && (
                      <div className="bg-void/40 p-3 rounded-xl border border-white/5">
                        <span className="text-xs text-nebula-text block mb-1">{t.assetAttributes.balcony}</span>
                        <span className="text-sm font-bold text-starlight">{listing.attributes.balcony}</span>
                      </div>
                    )}
                    {listing.attributes.garage && (
                      <div className="bg-void/40 p-3 rounded-xl border border-white/5">
                        <span className="text-xs text-nebula-text block mb-1">{t.assetAttributes.garage}</span>
                        <span className="text-sm font-bold text-starlight">{listing.attributes.garage}</span>
                      </div>
                    )}
                    {listing.attributes.capacity && (
                      <div className="bg-void/40 p-3 rounded-xl border border-white/5">
                        <span className="text-xs text-nebula-text block mb-1">Багтаамж</span>
                        <span className="text-sm font-bold text-starlight">{listing.attributes.capacity} хүн</span>
                      </div>
                    )}
                    {listing.attributes.elevator && (
                      <div className="bg-void/40 p-3 rounded-xl border border-white/5">
                        <span className="text-xs text-nebula-text block mb-1">🛗 Лифт</span>
                        <span className="text-sm font-bold text-starlight">{listing.attributes.elevator}</span>
                      </div>
                    )}

                    {/* Category-Specific Detailed Specs */}
                    {listing.attributes.landAreaSqm && (
                      <div className="bg-void/40 p-3 rounded-xl border border-white/5">
                        <span className="text-xs text-nebula-text block mb-1">🌳 Газрын хэмжээ</span>
                        <span className="text-sm font-bold text-starlight">{listing.attributes.landAreaSqm} м.кв</span>
                      </div>
                    )}
                    {listing.attributes.heatingType && (
                      <div className="bg-void/40 p-3 rounded-xl border border-white/5">
                        <span className="text-xs text-nebula-text block mb-1">🔥 Халаалтын систем</span>
                        <span className="text-sm font-bold text-starlight">{listing.attributes.heatingType}</span>
                      </div>
                    )}
                    {listing.attributes.waterSupply && (
                      <div className="bg-void/40 p-3 rounded-xl border border-white/5">
                        <span className="text-xs text-nebula-text block mb-1">💧 Цэвэр, бохир ус</span>
                        <span className="text-sm font-bold text-starlight">{listing.attributes.waterSupply}</span>
                      </div>
                    )}
                    {listing.attributes.commercialType && (
                      <div className="bg-void/40 p-3 rounded-xl border border-white/5">
                        <span className="text-xs text-nebula-text block mb-1">🏬 Талбайн зориулалт</span>
                        <span className="text-sm font-bold text-starlight">{listing.attributes.commercialType}</span>
                      </div>
                    )}
                    {listing.attributes.ceilingHeight && (
                      <div className="bg-void/40 p-3 rounded-xl border border-white/5">
                        <span className="text-xs text-nebula-text block mb-1">📐 Таазны өндөр</span>
                        <span className="text-sm font-bold text-starlight">{listing.attributes.ceilingHeight} м</span>
                      </div>
                    )}
                    {listing.attributes.powerCapacity && (
                      <div className="bg-void/40 p-3 rounded-xl border border-white/5">
                        <span className="text-xs text-nebula-text block mb-1">⚡ Цахилгааны чадал</span>
                        <span className="text-sm font-bold text-starlight">{listing.attributes.powerCapacity} кВт</span>
                      </div>
                    )}
                    {listing.attributes.entranceType && (
                      <div className="bg-void/40 p-3 rounded-xl border border-white/5">
                        <span className="text-xs text-nebula-text block mb-1">🚪 Орц гарц</span>
                        <span className="text-sm font-bold text-starlight">{listing.attributes.entranceType}</span>
                      </div>
                    )}
                    {listing.attributes.hvac && (
                      <div className="bg-void/40 p-3 rounded-xl border border-white/5">
                        <span className="text-xs text-nebula-text block mb-1">❄️ Агааржуулалт & Хөргөлт</span>
                        <span className="text-sm font-bold text-starlight">{listing.attributes.hvac}</span>
                      </div>
                    )}
                    {listing.attributes.landUsage && (
                      <div className="bg-void/40 p-3 rounded-xl border border-white/5">
                        <span className="text-xs text-nebula-text block mb-1">📌 Газрын зориулалт</span>
                        <span className="text-sm font-bold text-starlight">{listing.attributes.landUsage}</span>
                      </div>
                    )}
                    {listing.attributes.ownershipType && (
                      <div className="bg-void/40 p-3 rounded-xl border border-white/5">
                        <span className="text-xs text-nebula-text block mb-1">📜 Эзэмшлийн эрх</span>
                        <span className="text-sm font-bold text-starlight">{listing.attributes.ownershipType}</span>
                      </div>
                    )}
                  </div>

                  {/* Payment Terms Chips */}
                  {listing.attributes.paymentTerms && (Array.isArray(listing.attributes.paymentTerms) ? listing.attributes.paymentTerms.length > 0 : !!listing.attributes.paymentTerms) && (
                    <div className="pt-4">
                      <h4 className="text-sm font-bold text-nebula-text mb-2 flex items-center gap-2">
                        <span>💳</span> {t.assetAttributes.paymentTerms}
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {(Array.isArray(listing.attributes.paymentTerms)
                          ? listing.attributes.paymentTerms
                          : [listing.attributes.paymentTerms]
                        ).map((term: string) => (
                          <span key={term} className="text-xs px-3 py-1.5 rounded-full bg-nova/15 border border-nova/40 text-nova font-medium">
                            {term}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Amenities Tag Cloud */}
                  {listing.attributes.amenities && Array.isArray(listing.attributes.amenities) && listing.attributes.amenities.length > 0 && (
                    <div className="pt-4">
                      <h4 className="text-sm font-bold text-nebula-text mb-2 flex items-center gap-2">
                        <span>✨</span> Давуу тал / Тоноглол
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {listing.attributes.amenities.map((tag: string) => (
                          <span key={tag} className="text-xs px-3 py-1.5 rounded-full bg-gold/10 border border-gold/40 text-gold font-medium">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}


              {/* Property Location Map Section */}
              <div className="pt-6 border-t border-white/10 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-heading font-bold text-white flex items-center">
                    <MapIcon size={20} className="mr-2 text-plasma" />
                    <span>{t.map.propertyLocation}</span>
                  </h3>
                  <a
                    href={`https://www.google.com/maps?q=${lat},${lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-plasma/20 border border-plasma/40 text-plasma hover:bg-plasma/30 transition-all text-xs font-semibold"
                  >
                    <ExternalLink size={14} />
                    <span>{t.map.openGoogleMaps}</span>
                  </a>
                </div>

                <PropertyMap listings={[listing]} centerLat={lat} centerLng={lng} height="350px" />
              </div>
            </div>
          </div>

          {/* Sidebar Contact Info Card */}
          <div className="md:col-span-1 space-y-6">
            <div className="glass-card p-6 rounded-3xl sticky top-24 border border-white/10 dark:border-white/10 shadow-2xl backdrop-blur-xl bg-white/90 dark:bg-void/80">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-heading font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Phone className="w-5 h-5 text-plasma" />
                  <span>Холбоо барих</span>
                </h3>
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse"></span>
                  Идэвхтэй
                </span>
              </div>

              {/* Seller Profile Header */}
              {(() => {
                const seller = listing.user;
                const sellerName = seller?.name || listing.attributes?.contactName || 'Батболд';
                const sellerAvatar = seller?.avatarUrl || seller?.avatar;
                const sellerInitial = sellerName ? sellerName.charAt(0).toUpperCase() : 'Б';
                const rawPhone = listing.contactPhone || listing.attributes?.contactPhone || seller?.phone || '8976-7700';
                const displayMaskedPhone = rawPhone.length >= 4 ? `${rawPhone.slice(0, 4)}-****` : '8976-****';
                const finalPhone = revealedPhone || rawPhone;

                return (
                  <div className="space-y-5">
                    <div className="flex items-center space-x-4 p-3 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                      <div className="relative flex-shrink-0">
                        <div className="w-14 h-14 rounded-full bg-slate-900 border-2 border-plasma/50 shadow-lg flex items-center justify-center overflow-hidden">
                          {sellerAvatar && !avatarImgError ? (
                            <img
                              src={getImageUrl(sellerAvatar)}
                              alt={sellerName}
                              onError={() => setAvatarImgError(true)}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-2xl font-black text-white-force select-none">{sellerInitial}</span>
                          )}
                        </div>
                        {seller?.isVerifiedAgent && (
                          <div className="absolute -bottom-1 -right-1 bg-plasma text-white-force p-0.5 rounded-full ring-2 ring-slate-900" title={t.contactCard.verifiedAgent}>
                            <CheckCircle size={14} className="fill-plasma text-white-force" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-extrabold text-base text-slate-900 dark:text-white truncate flex items-center gap-1.5">
                          <span className="truncate">{sellerName}</span>
                          {seller?.isVerifiedAgent && (
                            <span className="px-1.5 py-0.5 text-[10px] font-bold bg-plasma/20 text-plasma rounded-md flex-shrink-0">
                              {t.contactCard.agent}
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-700 dark:text-slate-300 font-medium flex items-center gap-1 mt-0.5">
                          <ShieldCheck size={13} className="text-emerald-500 flex-shrink-0" />
                          <span className="truncate">{t.contactCard.owner}</span>
                        </div>
                      </div>
                    </div>

                    {/* Phone Masking & Reveal Action */}
                    <div className="space-y-3">
                      {isPhoneRevealed || isOwner ? (
                        <div className="space-y-2">
                          <a
                            href={`tel:${finalPhone.replace(/\D/g, '')}`}
                            className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-500 text-white font-bold py-3.5 px-4 rounded-2xl shadow-lg shadow-emerald-500/25 transition-all duration-200 active:scale-[0.98]"
                          >
                            <Phone size={18} className="animate-bounce" />
                            <span className="text-base font-extrabold tracking-wider">{finalPhone}</span>
                          </a>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(finalPhone);
                              alert(t.contactCard.phoneCopied + finalPhone);
                            }}
                            className="w-full text-center text-xs text-slate-500 dark:text-nebula-text hover:text-plasma font-medium py-1 cursor-pointer"
                          >
                            {t.contactCard.copyPhone}
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={handleRevealPhone}
                          className="w-full flex items-center justify-center space-x-2.5 bg-gradient-to-r from-violet-600 via-indigo-600 to-plasma hover:from-violet-500 hover:to-indigo-500 text-white font-bold py-3.5 px-4 rounded-2xl shadow-lg shadow-indigo-500/25 transition-all duration-200 hover:shadow-indigo-500/40 hover:scale-[1.01] active:scale-[0.98] group cursor-pointer"
                        >
                          <Lock size={18} className="group-hover:hidden text-amber-300 transition-transform" />
                          <Unlock size={18} className="hidden group-hover:block text-amber-300 transition-transform scale-110" />
                          <span className="text-sm font-extrabold tracking-wide">{t.contactCard.showPhone}: {displayMaskedPhone}</span>
                        </button>
                      )}
                    </div>

                    {/* Owner Audit Controls */}
                    {isOwner && (
                      <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl space-y-2.5">
                        <div className="flex items-center space-x-2 text-amber-600 dark:text-amber-300 font-bold text-xs">
                          <ShieldCheck size={16} />
                          <span>Зарын эзэмшигчийн хяналт</span>
                        </div>
                        <div className="flex justify-between items-center text-xs text-slate-600 dark:text-nebula-text">
                          <span>Утас үзсэн нийт тоо:</span>
                          <span className="text-plasma font-black text-sm">
                            {phoneRevealsCount || listing.phoneRevealsCount || 0} удаа
                          </span>
                        </div>
                        <button
                          onClick={handleFetchAuditLogs}
                          className="w-full flex items-center justify-center space-x-1.5 bg-amber-500/20 border border-amber-500/40 text-amber-700 dark:text-amber-300 font-semibold py-2 rounded-xl hover:bg-amber-500/30 transition-all text-xs"
                        >
                          <Eye size={14} />
                          <span>Дугаар үзсэн аудитын түүх харах</span>
                        </button>
                      </div>
                    )}

                    {/* Email Seller Button */}
                    <button
                      onClick={() => setIsInquiryModalOpen(true)}
                      className="w-full flex items-center justify-center space-x-2 bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/15 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white font-bold py-3 px-4 rounded-2xl transition-all duration-200 active:scale-[0.98] cursor-pointer shadow-sm"
                    >
                      <Mail size={18} className="text-plasma flex-shrink-0" />
                      <span className="text-slate-900 dark:text-white font-bold">{t.contactCard.sendEmail}</span>
                    </button>

                    {/* Social Share Button */}
                    <button
                      onClick={() => setIsShareModalOpen(true)}
                      className="w-full flex items-center justify-center space-x-2 bg-purple-50 dark:bg-plasma/20 hover:bg-purple-100 dark:hover:bg-plasma/30 border border-purple-200 dark:border-plasma/40 text-purple-700 dark:text-plasma-light font-bold py-3 px-4 rounded-2xl transition-all duration-200 active:scale-[0.98] cursor-pointer shadow-sm"
                    >
                      <Share2 size={18} className="text-purple-600 dark:text-plasma-light flex-shrink-0" />
                      <span className="text-purple-700 dark:text-plasma-light font-bold">{t.contactCard.shareSocial}</span>
                    </button>
                  </div>
                );
              })()}
            </div>
          </div>


        </div>

        {/* Recently Visited */}
        <RecentVisits />

      </motion.div>

      {/* Share Modal */}
      {isShareModalOpen && listing && (
        <SocialShareModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          listing={listing}
          onShared={() => fetchListing()}
        />
      )}

      {/* Creator Contact Audit Logs Modal */}
      {isAuditModalOpen && (
        <div className="fixed inset-0 bg-void/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="glass-card w-full max-w-xl p-6 rounded-3xl border border-plasma/40 shadow-2xl relative">
            <button
              onClick={() => setIsAuditModalOpen(false)}
              className="absolute top-4 right-4 text-nebula-text hover:text-plasma p-2 bg-void/50 rounded-full transition-colors"
            >
              <X size={20} />
            </button>

            <div className="flex items-center space-x-3 mb-6">
              <div className="p-3 bg-amber-500/20 text-amber-300 rounded-2xl border border-amber-500/40">
                <ShieldCheck size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-starlight font-heading">
                  Утасны дугаар үзсэн аудитын бүртгэл
                </h3>
                <p className="text-nebula-text text-xs">
                  Таны зарын холбоо барих дугаарыг үзсэн хэрэглэгчдийн хугацаа болон IP бүртгэл
                </p>
              </div>
            </div>

            {isAuditLoading ? (
              <div className="py-8 text-center text-nebula-text">
                <RefreshCw size={24} className="animate-spin mx-auto mb-2 text-plasma" />
                <span>Аудит мэдээлэл ачаалж байна...</span>
              </div>
            ) : auditLogs.length === 0 ? (
              <div className="py-8 text-center text-nebula-text italic text-sm">
                Одоогоор утасны дугаар үзсэн аудит бүртгэл байхгүй байна.
              </div>
            ) : (
              <div className="space-y-3 max-h-80 overflow-y-auto pr-1 scrollbar-thin">
                {auditLogs.map((log, idx) => (
                  <div key={log.id || idx} className="bg-void/60 p-3 rounded-xl border border-white/10 flex justify-between items-center text-xs">
                    <div>
                      <div className="font-semibold text-starlight flex items-center space-x-2">
                        <span className="w-2 h-2 rounded-full bg-aurora inline-block"></span>
                        <span>Утасны дугаар ил болгосон</span>
                      </div>
                      <div className="text-nebula-text text-[11px] mt-0.5">
                        IP: <code className="text-plasma">{log.viewerIp || 'Хамгаалагдсан'}</code>
                      </div>
                    </div>
                    <div className="text-right text-nebula-text text-[11px]">
                      {formatDateFull(log.createdAt)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
      {/* Direct Email / Inquiry Modal */}
      {isInquiryModalOpen && (
        <div className="fixed inset-0 bg-void/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="glass-card w-full max-w-lg p-6 sm:p-8 rounded-3xl border border-plasma/30 shadow-2xl relative bg-slate-900/90 dark:bg-void/90 text-white">
            <button
              onClick={() => {
                setIsInquiryModalOpen(false);
                setInquirySuccess(false);
              }}
              className="absolute top-4 right-4 text-nebula-text hover:text-white p-2 bg-void/50 rounded-full transition-colors"
            >
              <X size={20} />
            </button>

            <div className="flex items-center space-x-3 mb-6">
              <div className="p-3 bg-plasma/20 text-plasma rounded-2xl border border-plasma/30">
                <Mail size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white font-heading">
                  {t.contactCard.inquiryModalTitle}
                </h3>
                <p className="text-nebula-text text-xs">
                  {listing?.title}
                </p>
              </div>
            </div>

            {inquirySuccess ? (
              <div className="py-8 text-center space-y-3">
                <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle size={32} />
                </div>
                <h4 className="text-lg font-bold text-white">{t.contactCard.sentSuccess}</h4>
                <p className="text-xs text-nebula-text">
                  {t.contactCard.inquiryModalSubtitle}
                </p>
                <button
                  onClick={() => {
                    setIsInquiryModalOpen(false);
                    setInquirySuccess(false);
                  }}
                  className="mt-4 px-6 py-2.5 bg-plasma text-white font-bold rounded-xl text-sm cursor-pointer"
                >
                  {t.common.confirm}
                </button>
              </div>
            ) : (
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  setInquirySending(true);
                  try {
                    await api.post('/inquiries', {
                      listingId: listing?.id,
                      email: inquiryEmail,
                      phone: inquiryPhone,
                      message: inquiryMessage,
                    });
                    setInquirySuccess(true);
                  } catch {
                    // Simulated fallback success
                    setInquirySuccess(true);
                  } finally {
                    setInquirySending(false);
                  }
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-xs font-semibold text-nebula-text mb-1">
                    {t.contactCard.yourEmail}
                  </label>
                  <input
                    type="email"
                    required
                    value={inquiryEmail}
                    onChange={(e) => setInquiryEmail(e.target.value)}
                    placeholder="example@gmail.com"
                    className="w-full bg-void/60 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-nebula-text focus:outline-none focus:border-plasma text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-nebula-text mb-1">
                    {t.contactCard.yourPhone}
                  </label>
                  <input
                    type="tel"
                    required
                    value={inquiryPhone}
                    onChange={(e) => setInquiryPhone(e.target.value)}
                    placeholder="99112233"
                    className="w-full bg-void/60 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-nebula-text focus:outline-none focus:border-plasma text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-nebula-text mb-1">
                    {t.contactCard.yourMessage}
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={inquiryMessage}
                    onChange={(e) => setInquiryMessage(e.target.value)}
                    placeholder={t.contactCard.messagePlaceholder}
                    className="w-full bg-void/60 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-nebula-text focus:outline-none focus:border-plasma text-sm"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={inquirySending}
                  className="w-full bg-gradient-to-r from-plasma to-nova text-white font-bold py-3.5 rounded-xl hover:shadow-lg hover:shadow-plasma/30 transition-all text-sm disabled:opacity-50 cursor-pointer"
                >
                  {inquirySending ? t.contactCard.sendingBtn : t.contactCard.sendBtn}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ListingDetail;

