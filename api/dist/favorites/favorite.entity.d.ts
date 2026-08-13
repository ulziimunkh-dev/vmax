import { User } from '../users/user.entity';
import { Listing } from '../listings/listing.entity';
export declare class Favorite {
    id: string;
    userId: string;
    user: User;
    listingId: string;
    listing: Listing;
    createdAt: Date;
}
