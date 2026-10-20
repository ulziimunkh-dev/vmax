export type SubscriptionTier = 'FREE' | 'PRO_AGENT' | 'AGENCY';
export type PromotionTier = 'STANDARD' | 'VIP' | 'TOP_URGENT';

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  avatar?: string;
  avatarUrl?: string;
  subscriptionTier?: SubscriptionTier;
  subscriptionExpiresAt?: string;
  isVerifiedAgent?: boolean;
  isEmailVerified?: boolean;
  isPhoneVerified?: boolean;
  agentVerificationStatus?: 'NONE' | 'PENDING' | 'VERIFIED' | 'REJECTED';
  agencyName?: string;
  agentLicenseNo?: string;
}

export interface Listing {
  id: string;
  title: string;
  description: string;
  type: 'sale' | 'rent' | 'SALE' | 'RENT' | string;
  category: 'apartment' | 'house' | 'commercial' | 'APARTMENT' | 'HOUSE' | 'COMMERCIAL' | string;

  price: number;
  location: string;
  district: string;
  khoroo?: string;
  areaSqm: number;
  latitude?: number;
  longitude?: number;
  attributes: Record<string, any>;
  images: string[];
  videoUrl?: string;
  videoThumbnailUrl?: string;
  hasVideo?: boolean;
  contactPhone?: string;
  status: 'active' | 'expired' | 'closed' | 'ACTIVE' | 'EXPIRED' | 'CLOSED' | string;
  userId: string;
  user?: User;
  createdAt: string;
  updatedAt?: string;
  viewsCount?: number;
  sharesCount?: number;
  phoneRevealsCount?: number;
  isPromoted?: boolean;

  promotionTier?: PromotionTier;
  promotedUntil?: string;
  originalPrice?: number;
  saleEndsAt?: string;
  isOnSale?: boolean;
}

export interface FilterState {
  type?: string;
  category?: string;
  location?: string;
  hasVideo?: string;
  priceMin?: number;
  priceMax?: number;
  areaMin?: number;
  areaMax?: number;
  page?: number;
  limit?: number;
}

export interface FloorPlanItem {
  id?: string;
  title: string;
  rooms: number;
  areaSqm: number;
  pricePerSqm?: number;
  startingPrice: number;
  image2dUrl: string;
  image3dUrl?: string;
  availableCount?: number;
  description?: string;
}

export interface ProjectReelItem {
  id?: string;
  title: string;
  videoUrl: string;
  thumbnailUrl?: string;
  durationSeconds?: number;
}

export interface Project {
  id: string;
  name: string;
  developerName: string;
  developerLogo?: string;
  tagline?: string;
  description: string;
  status: 'PLANNING' | 'CONSTRUCTING' | 'READY_TO_MOVE' | 'COMPLETED' | string;
  completionYearQuarter?: string;
  city: string;
  district: string;
  khoroo?: string;
  addressDetail?: string;
  latitude?: number;
  longitude?: number;
  salesPhone: string;
  salesEmail?: string;
  websiteUrl?: string;
  facebookPageUrl?: string;
  instagramHandle?: string;
  viberOrTelegramUrl?: string;
  minPricePerSqm?: number;
  maxPricePerSqm?: number;
  startingPrice?: number;
  paymentTerms: string[];
  specialOffers: string[];
  amenities: string[];
  tour3dUrl?: string;
  videoUrl?: string;
  videoThumbnailUrl?: string;
  reels?: ProjectReelItem[];
  coverImage: string;
  galleryImages: string[];
  brochurePdfUrl?: string;
  floorPlans: FloorPlanItem[];
  viewsCount?: number;
  inquiriesCount?: number;
  isFeatured?: boolean;
  createdAt: string;
  updatedAt?: string;
}


