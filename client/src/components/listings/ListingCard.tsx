import React, { useState } from 'react';
import { MapPin, Maximize, BedDouble, Bath, Heart, Share2, Eye, Clock, Scale } from 'lucide-react';

import { motion } from 'framer-motion';
import type { Listing } from '@/types';
import { Link } from 'react-router-dom';
import { useI18n } from '@/i18n';
import { useFavorites } from '@/hooks/useFavorites';
import { useCompareStore } from '@/store/useCompareStore';
import { SocialShareModal } from './SocialShareModal';
import { formatRelativeTime } from '@/utils/formatTime';
import { getImageUrl } from '@/utils/imageUrl';
import { formatPriceMongolianWords } from '@/utils/formatPrice';

interface Props { listing: Listing; index: number; }

const ListingCard: React.FC<Props> = ({ listing, index }) => {
  const { t, lang } = useI18n();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { isInCompare, toggleCompare } = useCompareStore();
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const listingId = listing.id || (listing as any)._id;
  const favorite = isFavorite(listingId);
  const inCompare = isInCompare(listingId);

  const handleCompareClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleCompare(listing);
  };


  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(listing);
  };

  const handleShareClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsShareModalOpen(true);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        className={`glass-card glass-card-hover rounded-2xl overflow-hidden group cursor-pointer relative transition-all duration-300 ${listing.promotionTier === 'TOP_URGENT'
            ? 'border-red-500/80 ring-2 ring-red-500/50 shadow-lg shadow-red-500/20'
            : listing.promotionTier === 'VIP' || listing.isPromoted
              ? 'border-amber-500/70 ring-2 ring-amber-500/40 shadow-lg shadow-amber-500/20'
              : ''
          }`}
      >
        <Link to={`/listings/${listingId}`}>
          <div className="relative h-48 w-full overflow-hidden">
            {listing.images && listing.images.length > 0 ? (
              <img src={getImageUrl(listing.images[0])} alt={listing.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
            ) : (

              <div className="w-full h-full bg-gradient-to-br from-void to-cosmic flex items-center justify-center">
                <span className="text-plasma opacity-50 font-bold text-xl">Vmax.mn</span>
              </div>
            )}

            {/* Promotion Badges */}
            {listing.promotionTier === 'TOP_URGENT' && (
              <div className="absolute top-3 right-3 z-10 bg-gradient-to-r from-red-600 via-rose-500 to-amber-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center space-x-1 shadow-lg shadow-red-500/50 animate-pulse">
                <span>🔥 ЯАРАЛТАЙ ЗАР</span>
              </div>
            )}
            {(listing.promotionTier === 'VIP' || (listing.isPromoted && listing.promotionTier !== 'TOP_URGENT')) && (
              <div className="absolute top-3 right-3 z-10 bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 text-slate-950 px-3 py-1 rounded-full text-xs font-black flex items-center space-x-1 shadow-lg shadow-amber-500/50">
                <span>⭐ VIP ОНЦЛОХ</span>
              </div>
            )}


            {/* Favorite, Compare & Share Quick Action Buttons */}
            <div className="absolute top-3 left-3 flex items-center space-x-2 z-10">
              <button
                onClick={handleFavoriteClick}
                className={`p-2 rounded-full backdrop-blur-md border transition-all ${favorite
                    ? 'bg-red-500/90 text-white-force border-red-400 shadow-lg shadow-red-500/30'
                    : 'bg-void/70 text-white border-white/10 hover:text-plasma hover:bg-void'
                  }`}
                title={t.share.favorites}
              >
                <Heart size={16} className={favorite ? 'fill-current' : ''} />
              </button>

              <button
                onClick={handleCompareClick}
                className={`p-2 rounded-full backdrop-blur-md border transition-all ${inCompare
                    ? 'bg-plasma text-white border-plasma shadow-lg shadow-plasma/50'
                    : 'bg-void/70 text-white border-white/10 hover:text-plasma hover:bg-void'
                  }`}
                title="Харьцуулах цонхонд нэмэх"
              >
                <Scale size={16} />
              </button>

              <button
                onClick={handleShareClick}
                className="p-2 rounded-full bg-void/70 text-white backdrop-blur-md border border-white/10 hover:text-plasma hover:bg-void transition-all"
                title={t.share.shareTitle}
              >
                <Share2 size={16} />
              </button>
            </div>


            {/* Listing Type Tag */}
            <div className={`absolute bottom-3 right-3 bg-void/80 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold border border-white/10 ${listing.isPromoted ? 'text-amber-400' : 'text-plasma'}`}>
              {listing.type === 'sale' ? t.listings.sale : t.listings.rent}
            </div>

            {/* View & Share Counters Overlay */}
            {(listing.viewsCount !== undefined || listing.sharesCount !== undefined) && (
              <div className="absolute bottom-2 left-3 flex items-center space-x-3 text-[11px] text-white bg-void/80 backdrop-blur-md px-2.5 py-0.5 rounded-md border border-white/10">
                <span className="flex items-center space-x-1">
                  <Eye size={12} className="text-aurora" />
                  <span>{listing.viewsCount || 0}</span>
                </span>
                <span className="flex items-center space-x-1">
                  <Share2 size={12} className="text-plasma" />
                  <span>{listing.sharesCount || 0}</span>
                </span>
              </div>
            )}
          </div>

          <div className="p-5">
            <h3 className="text-xl font-bold text-starlight mb-2 truncate group-hover:text-plasma transition-colors">{listing.title}</h3>
            <p className="text-2xl font-heading font-bold text-aurora text-glow-aurora mb-3">
              {formatPriceMongolianWords(listing.price)}
            </p>

            {/* Location & Published Relative Time */}
            <div className="flex items-center justify-between text-nebula-text text-xs mb-4">
              <div className="flex items-center truncate mr-2">
                <MapPin size={14} className="mr-1 text-plasma flex-shrink-0" />
                <span className="truncate">{listing.district}{listing.khoroo ? `, ${listing.khoroo}` : ''}</span>
              </div>
              <div className="flex items-center text-[11px] text-nebula-text flex-shrink-0 bg-void/40 px-2 py-0.5 rounded-md border border-white/5">
                <Clock size={11} className="mr-1 text-plasma" />
                <span>{formatRelativeTime(listing.createdAt, lang)}</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 border-t border-white/5 pt-4">
              <div className="flex flex-col items-center justify-center text-nebula-text">
                <Maximize size={16} className="mb-1 text-plasma/70" />
                <span className="text-xs">{listing.areaSqm} {t.listings.sqm}</span>
              </div>
              <div className="flex flex-col items-center justify-center text-nebula-text">
                <BedDouble size={16} className="mb-1 text-plasma/70" />
                <span className="text-xs">
                  {listing.attributes?.bedrooms || listing.attributes?.rooms
                    ? `${listing.attributes?.bedrooms || listing.attributes?.rooms} ${t.listings.bedrooms}`
                    : (listing.category || 'Үл хөдлөх')}
                </span>
              </div>
              <div className="flex flex-col items-center justify-center text-nebula-text">
                <Bath size={16} className="mb-1 text-plasma/70" />
                <span className="text-xs">
                  {listing.attributes?.bathrooms
                    ? `${listing.attributes.bathrooms} ${t.listings.bathrooms}`
                    : (listing.district || 'Улаанбаатар')}
                </span>
              </div>
            </div>

          </div>
        </Link>
      </motion.div>

      {/* Share Modal */}
      {isShareModalOpen && (
        <SocialShareModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          listing={listing}
        />
      )}
    </>
  );
};

export default ListingCard;
