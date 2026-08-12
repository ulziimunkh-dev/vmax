import React from 'react';
import { MapPin, Maximize, BedDouble, Bath } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Listing } from '@/types';
import { Link } from 'react-router-dom';
import { useI18n } from '@/i18n';

interface Props { listing: Listing; index: number; }

const ListingCard: React.FC<Props> = ({ listing, index }) => {
  const { t } = useI18n();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="glass-card glass-card-hover rounded-2xl overflow-hidden group cursor-pointer"
    >
      <Link to={`/listings/${listing.id}`}>
        <div className="relative h-48 w-full overflow-hidden">
          {listing.images && listing.images.length > 0 ? (
            <img src={listing.images[0]} alt={listing.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-void to-cosmic flex items-center justify-center">
              <span className="text-plasma opacity-50 font-bold text-xl">Vmax.mn</span>
            </div>
          )}
          <div className="absolute top-4 right-4 bg-void/80 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold border border-white/10 text-glow">
            {listing.type === 'sale' ? t.listings.sale : t.listings.rent}
          </div>
        </div>
        <div className="p-5">
          <h3 className="text-xl font-bold text-white mb-2 truncate group-hover:text-plasma transition-colors">{listing.title}</h3>
          <p className="text-2xl font-heading font-bold text-aurora text-glow-aurora mb-4">
            {Number(listing.price).toLocaleString('mn-MN')} ₮
          </p>
          <div className="flex items-center text-nebula-text text-sm mb-4">
            <MapPin size={16} className="mr-1 text-plasma" />
            <span className="truncate">{listing.location}, {listing.district}</span>
          </div>
          <div className="grid grid-cols-3 gap-2 border-t border-white/5 pt-4">
            <div className="flex flex-col items-center justify-center text-nebula-text">
              <Maximize size={16} className="mb-1" />
              <span className="text-xs">{listing.areaSqm} {t.listings.sqm}</span>
            </div>
            <div className="flex flex-col items-center justify-center text-nebula-text">
              <BedDouble size={16} className="mb-1" />
              <span className="text-xs">{listing.attributes?.bedrooms || 0} {t.listings.bedrooms}</span>
            </div>
            <div className="flex flex-col items-center justify-center text-nebula-text">
              <Bath size={16} className="mb-1" />
              <span className="text-xs">{listing.attributes?.bathrooms || 0} {t.listings.bathrooms}</span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};
export default ListingCard;
