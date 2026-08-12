import { User } from '../users/user.entity';
import { ListingType, ListingCategory, ListingStatus } from './enums/listing.enums';
export declare class Listing {
    id: string;
    title: string;
    description: string;
    type: ListingType;
    category: ListingCategory;
    price: number;
    location: string;
    district: string;
    areaSqm: number;
    attributes: Record<string, any>;
    images: string[];
    status: ListingStatus;
    user: User;
    userId: string;
    createdAt: Date;
    expiresAt: Date;
}
