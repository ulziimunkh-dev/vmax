import React from 'react';
import ListingCard from './ListingCard';
import type { Listing } from '@/types';
import { useI18n } from '@/i18n';

interface Props { listings: Listing[]; }

const ListingGrid: React.FC<Props> = ({ listings }) => {
  const { t } = useI18n();

  if (!listings || listings.length === 0) {
    return (
      <div className="text-center py-20 text-nebula-text">
        {t.listings.noResults}
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
