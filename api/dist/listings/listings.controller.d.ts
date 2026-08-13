import { ListingsService } from './listings.service';
import { QueryListingDto } from './dto/query-listing.dto';
import { UpdateListingDto } from './dto/update-listing.dto';
import { User } from '../users/user.entity';
export declare class ListingsController {
    private readonly listingsService;
    constructor(listingsService: ListingsService);
    findAll(queryListingDto: QueryListingDto): Promise<{
        items: import("./listing.entity").Listing[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    findMyListings(user: User): Promise<import("./listing.entity").Listing[]>;
    findOne(id: string): Promise<import("./listing.entity").Listing>;
    share(id: string): Promise<import("./listing.entity").Listing>;
    revealContact(id: string, body: any): Promise<{
        phone: string;
        ownerName: string;
        revealsCount: number;
    }>;
    getContactAuditLogs(id: string, user: User): Promise<import("./listing-contact-log.entity").ListingContactLog[]>;
    create(dto: any, user: User): Promise<import("./listing.entity").Listing>;
    update(id: string, updateListingDto: UpdateListingDto, user: User): Promise<import("./listing.entity").Listing>;
    remove(id: string, user: User): Promise<{
        deleted: boolean;
    }>;
    close(id: string, user: User): Promise<import("./listing.entity").Listing>;
    renew(id: string, user: User): Promise<import("./listing.entity").Listing>;
    publish(id: string, user: User): Promise<import("./listing.entity").Listing>;
    promote(id: string, body: {
        tier?: any;
        durationDays?: number;
    }, user: User): Promise<import("./listing.entity").Listing>;
}
