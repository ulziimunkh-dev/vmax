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
}

export interface FilterState {
  type?: string;
  category?: string;
  location?: string;
  priceMin?: number;
  priceMax?: number;
  areaMin?: number;
  areaMax?: number;
  page?: number;
  limit?: number;
}

