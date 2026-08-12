export interface User { id: string; email: string; name: string; phone?: string; avatar?: string; }
export interface Listing {
  id: string; title: string; description: string; type: 'sale' | 'rent';
  category: 'apartment' | 'house' | 'land' | 'commercial';
  price: number; location: string; district: string; areaSqm: number;
  attributes: Record<string, any>; images: string[]; status: 'active' | 'expired' | 'closed';
  userId: string; createdAt: string; updatedAt: string;
}
export interface FilterState {
  type?: string; category?: string; location?: string; priceMin?: number;
  priceMax?: number; areaMin?: number; areaMax?: number; page?: number; limit?: number;
}
