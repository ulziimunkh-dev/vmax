import React from 'react';
import ListingCard from './ListingCard';
import type { Listing } from '@/types';
import { useI18n } from '@/i18n';

interface Props {
  listings: Listing[];
  loading?: boolean;
}

const ListingGrid: React.FC<Props> = ({ listings, loading }) => {
  const { t } = useI18n();

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="glass-card rounded-2xl overflow-hidden border border-white/10 animate-pulse">
            <div className="h-60 bg-white/5" />
            <div className="p-5 space-y-3">
              <div className="h-6 bg-white/10 rounded-md w-3/4" />
              <div className="h-4 bg-white/5 rounded-md w-1/2" />
              <div className="pt-4 border-t border-white/5 flex justify-between items-center">
                <div className="h-7 bg-white/10 rounded-md w-1/3" />
                <div className="h-5 bg-white/5 rounded-md w-1/4" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!listings || listings.length === 0) {
    return (
      <div className="text-center py-20 text-nebula-text">
        <p className="text-lg font-medium">{t.listings.noResults}</p>
        <p className="text-xs text-nebula-text/70 mt-1">Хайлтын утгаа өөрчлөн дахин хайна уу</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {listings.map((listing, index) => (
        <ListingCard key={listing.id} listing={listing} index={index} />
      ))}
    </div>
  );
};

export default ListingGrid;

