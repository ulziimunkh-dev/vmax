import { User } from '../users/user.entity';
import { ListingType, ListingCategory, ListingStatus, PromotionTier } from './enums/listing.enums';
export declare class Listing {
    id: string;
    title: string;
    description: string;
    type: ListingType;
    category: ListingCategory;
    price: number;
    location: string;
    district: string;
    khoroo: string;
    latitude: number;
    longitude: number;
    areaSqm: number;
    attributes: Record<string, any>;
    images: string[];
    status: ListingStatus;
    user: User;
    userId: string;
    viewsCount: number;
    sharesCount: number;
    phoneRevealsCount: number;
    isPromoted: boolean;
    promotionTier: PromotionTier;
    promotedUntil: Date;
    createdAt: Date;
    expiresAt: Date;
}
