export interface FurniturePortfolioItem {
  id: string;
  title: string;
  category: 'KITCHEN' | 'WARDROBE' | 'LIVING_ROOM' | 'KIDS' | 'OFFICE' | 'SOLID_WOOD' | 'CUSTOM' | string;
  description?: string;
  images: string[];
  videoUrl?: string;
  thumbnailUrl?: string;
  materials?: string;
  durationDays?: number;
  location?: string;
  year?: string;
  createdAt?: string;
}

export interface FurnitureArticleItem {
  id: string;
  title: string;
  summary: string;
  content: string;
  category?: string;
  imageUrl?: string;
  readMinutes?: number;
  publishedAt?: string;
  makerId?: string;
  makerName?: string;
  makerLogo?: string;
  makerPhone?: string;
}

export interface FurnitureMaker {
  id: string;
  name: string;
  tagline?: string;
  description: string;
  logoUrl?: string;
  coverUrl?: string;
  categories: string[];
  experienceYears: number;
  warrantyMonths: number;
  city: string;
  district: string;
  addressDetail?: string;
  phone: string;
  secondaryPhone?: string;
  facebookUrl?: string;
  instagramUrl?: string;
  websiteUrl?: string;
  materialsUsed?: string[];
  rating: number;
  reviewsCount: number;
  isVerified: boolean;
  isFeatured: boolean;
  portfolio: FurniturePortfolioItem[];
  articles: FurnitureArticleItem[];
  userId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FurnitureFilterState {
  search?: string;
  category?: string;
  district?: string;
  hasVideo?: boolean;
}
