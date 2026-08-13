import { useState } from 'react';
import type { Listing } from '@/types';

const STORAGE_KEY = 'vmax_recent_visits';

export function useRecentVisits() {
  const [recentVisits, setRecentVisits] = useState<Listing[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const addVisit = (listing: Listing) => {
    if (!listing) return;
    const listingId = listing.id || (listing as any)._id;
    setRecentVisits(prev => {
      const filtered = prev.filter(item => (item.id || (item as any)._id) !== listingId);
      const updated = [listing, ...filtered].slice(0, 10);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
  };

  const clearVisits = () => {
    setRecentVisits([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  return { recentVisits, addVisit, clearVisits };
}
