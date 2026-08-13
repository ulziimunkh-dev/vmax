import { useState, useEffect } from 'react';
import type { Listing } from '@/types';

const STORAGE_KEY = 'vmax_favorites';

export function useFavorites() {
  const [favorites, setFavorites] = useState<Listing[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
    } catch (e) {
      console.error('Failed to save favorites', e);
    }
  }, [favorites]);

  const isFavorite = (id: string) => {
    return favorites.some(item => item.id === id || (item as any)._id === id);
  };

  const toggleFavorite = (listing: Listing) => {
    setFavorites(prev => {
      const listingId = listing.id || (listing as any)._id;
      const exists = prev.some(item => (item.id || (item as any)._id) === listingId);
      if (exists) {
        return prev.filter(item => (item.id || (item as any)._id) !== listingId);
      } else {
        return [listing, ...prev];
      }
    });
  };

  return { favorites, isFavorite, toggleFavorite };
}
