import { Listing } from './listing.entity';
export declare class ListingContactLog {
    id: string;
    listingId: string;
    listing: Listing;
    viewerUserId?: string;
    viewerIp?: string;
    userAgent?: string;
    createdAt: Date;
}
