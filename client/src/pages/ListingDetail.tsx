import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { MapPin, Maximize, BedDouble, Bath, Phone, Mail, Share2, Heart, Eye, ArrowLeft, RefreshCw, ExternalLink, Map as MapIcon, Clock, Calendar, CheckCircle, Lock, Unlock, ShieldCheck, FileText, X } from 'lucide-react';
import { motion } from 'framer-motion';
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
      const defaultPhone = listing?.user?.phone || '9911-8888';
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

  useEffect(() => {
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
        <div className="flex flex-wrap items-center justify-between gap-4">
          <button
            onClick={() => window.history.back()}
            className="flex items-center space-x-2 text-nebula-text hover:text-white transition-colors text-sm font-medium"
          >
            <ArrowLeft size={18} />
            <span>{t.common.back}</span>
          </button>

          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-void/60 border border-white/10 text-xs text-nebula-text">
              <Eye size={16} className="text-aurora" />
              <span>{listing.viewsCount || 0} {t.share.views}</span>
            </div>

            <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-void/60 border border-white/10 text-xs text-nebula-text">
              <Share2 size={16} className="text-plasma" />
              <span>{listing.sharesCount || 0} {t.share.shares}</span>
            </div>

            <button
              onClick={() => toggleFavorite(listing)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl border transition-all text-sm font-medium ${
                favorite
                  ? 'bg-red-500/20 text-red-400 border-red-500/40 shadow-lg shadow-red-500/20'
                  : 'bg-cosmic text-white border-white/10 hover:border-white/20'
              }`}
            >
              <Heart size={18} className={favorite ? 'fill-current text-red-500' : ''} />
              <span>{favorite ? t.dashboard.saved : t.share.favorites}</span>
            </button>

            <button
              onClick={() => setIsShareModalOpen(true)}
              className="flex items-center space-x-2 px-5 py-2 rounded-xl bg-gradient-to-r from-plasma to-nova text-white font-medium hover:shadow-lg hover:shadow-plasma/30 transition-all text-sm"
            >
              <Share2 size={18} />
              <span>{t.share.shareTitle}</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

          {/* Main Details & Gallery */}
          <div className="md:col-span-2 space-y-6">
            {/* Main Image Display */}
            <div className="glass-card rounded-2xl overflow-hidden h-[420px] flex items-center justify-center bg-gradient-to-br from-void to-cosmic relative group">
              {listing.images && listing.images.length > 0 ? (
                <img
                  src={getImageUrl(listing.images[activeImageIndex] || listing.images[0])}
                  alt={listing.title}
                  className="w-full h-full object-cover transition-all duration-300"
                />
              ) : (
                <span className="text-plasma opacity-50 font-bold text-3xl">Vmax.mn Real Estate</span>
              )}
            </div>

            {/* Thumbnail Gallery Row */}
            {listing.images && listing.images.length > 1 && (
              <div className="flex space-x-3 overflow-x-auto pb-2 scrollbar-thin">
                {listing.images.map((imgUrl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative w-24 h-20 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all cursor-pointer ${
                      activeImageIndex === idx
                        ? 'border-plasma ring-2 ring-plasma/50 scale-105 shadow-lg shadow-plasma/30'
                        : 'border-white/10 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={getImageUrl(imgUrl)} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}


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
                  <div className="text-3xl font-heading font-bold text-aurora text-glow-aurora whitespace-nowrap tracking-wide">
                    {formatPriceMongolianWords(listing.price)}
                  </div>
                  <div className="text-nebula-text text-xs mt-1.5 whitespace-nowrap">
                    {listing.areaSqm ? Math.round(Number(listing.price) / listing.areaSqm).toLocaleString('en-US') : 0} ₮ / м.кв
                  </div>
                </div>
              </div>

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
                    {listing.attributes.paymentTerms && (
                      <div className="bg-void/40 p-3 rounded-xl border border-white/5">
                        <span className="text-xs text-nebula-text block mb-1">{t.assetAttributes.paymentTerms}</span>
                        <span className="text-sm font-bold text-starlight">{listing.attributes.paymentTerms}</span>
                      </div>
                    )}
                  </div>
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

          {/* Sidebar Contact Info */}
          <div className="md:col-span-1 space-y-6">
            <div className="glass-card p-6 rounded-2xl sticky top-24">
              <h3 className="text-xl font-heading font-bold text-white mb-6">Холбоо барих</h3>

              <div className="flex items-center space-x-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-plasma to-nova p-1">
                  <div className="w-full h-full rounded-full bg-cosmic flex items-center justify-center">
                    <span className="text-xl font-bold text-white">Б</span>
                  </div>
                </div>
                <div>
                  <div className="font-bold text-lg text-white">Батболд</div>
                  <div className="text-sm text-nebula-text">Үл хөдлөх хөрөнгийн эзэн</div>
                </div>
              </div>

              {/* Phone Masking & Reveal Section */}
              <div className="space-y-3 mb-4">
                {isPhoneRevealed || isOwner ? (
                  <a
                    href={`tel:${revealedPhone || listing?.user?.phone || '9911-8888'}`}
                    className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-aurora via-plasma to-nova text-white font-bold py-3.5 rounded-xl shadow-lg shadow-aurora/30 transition-all"
                  >
                    <Phone size={18} />
                    <span>Залгах: {revealedPhone || listing?.user?.phone || '9911-8888'}</span>
                  </a>
                ) : (
                  <button
                    onClick={handleRevealPhone}
                    className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-plasma to-nova text-white font-bold py-3.5 rounded-xl shadow-lg shadow-plasma/30 hover:scale-[1.02] transition-all group"
                  >
                    <Lock size={18} className="group-hover:hidden text-amber-300" />
                    <Unlock size={18} className="hidden group-hover:block text-amber-300" />
                    <span>Дугаар харах: 9911-****</span>
                  </button>
                )}
              </div>

              {/* Creator-only Audit & Phone Stats Section (Strictly for Listing Owner) */}
              {isOwner && (
                <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-2xl mb-4 space-y-2.5">
                  <div className="flex items-center space-x-2 text-amber-300 font-bold text-xs">
                    <ShieldCheck size={16} />
                    <span>Зарын эзэмшигчийн хяналт</span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-nebula-text">
                    <span>Утас үзсэн нийт тоо:</span>
                    <span className="text-plasma font-black text-sm">
                      {phoneRevealsCount || listing.phoneRevealsCount || 0} удаа
                    </span>
                  </div>
                  <button
                    onClick={handleFetchAuditLogs}
                    className="w-full flex items-center justify-center space-x-1.5 bg-amber-500/20 border border-amber-500/40 text-amber-300 font-semibold py-2 rounded-xl hover:bg-amber-500/30 transition-all text-xs"
                  >
                    <Eye size={14} />
                    <span>Дугаар үзсэн аудитын түүх харах</span>
                  </button>
                </div>
              )}

              <button className="w-full flex items-center justify-center space-x-2 bg-void/50 border border-white/10 text-white font-medium py-3 rounded-xl hover:bg-void transition-all mb-4">
                <Mail size={18} /> <span>Имэйл илгээх</span>
              </button>

              <button
                onClick={() => setIsShareModalOpen(true)}
                className="w-full flex items-center justify-center space-x-2 bg-plasma/20 border border-plasma/40 text-plasma font-medium py-3 rounded-xl hover:bg-plasma/30 transition-all"
              >
                <Share2 size={18} /> <span>Сошиалд хуваалцах</span>
              </button>
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
    </div>
  );
};

export default ListingDetail;

