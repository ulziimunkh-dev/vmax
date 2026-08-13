import { User } from '../users/user.entity';
import { Listing } from '../listings/listing.entity';
export declare class Inquiry {
    id: string;
    name: string;
    email: string;
    phone?: string;
    message: string;
    listingId: string;
    listing: Listing;
    userId?: string;
    user?: User;
    createdAt: Date;
}
