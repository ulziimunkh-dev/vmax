import { create } from 'zustand';
import type { Listing } from '@/types';

interface CompareState {
  compareListings: Listing[];
  addToCompare: (listing: Listing) => void;
  removeFromCompare: (id: string) => void;
  clearCompare: () => void;
  isInCompare: (id: string) => boolean;
  toggleCompare: (listing: Listing) => void;
}

const STORAGE_KEY = 'vmax_compare_items';

const getInitialListings = (): Listing[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

export const useCompareStore = create<CompareState>((set, get) => ({
  compareListings: getInitialListings(),
  addToCompare: (listing: Listing) => {
    const { compareListings } = get();
    const id = listing.id || (listing as any)._id;
    if (compareListings.some((item) => (item.id || (item as any)._id) === id)) return;
    if (compareListings.length >= 4) return;
    const updated = [...compareListings, listing];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    set({ compareListings: updated });
  },
  removeFromCompare: (id: string) => {
    const { compareListings } = get();
    const updated = compareListings.filter((item) => (item.id || (item as any)._id) !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    set({ compareListings: updated });
  },
  clearCompare: () => {
    localStorage.removeItem(STORAGE_KEY);
    set({ compareListings: [] });
  },
  isInCompare: (id: string) => {
    return get().compareListings.some((item) => (item.id || (item as any)._id) === id);
  },
  toggleCompare: (listing: Listing) => {
    const id = listing.id || (listing as any)._id;
    if (get().isInCompare(id)) {
      get().removeFromCompare(id);
    } else {
      get().addToCompare(listing);
    }
  },
}));
