import { Repository } from 'typeorm';
import { Listing } from './listing.entity';
import { CreateListingDto } from './dto/create-listing.dto';
import { QueryListingDto } from './dto/query-listing.dto';
import { UpdateListingDto } from './dto/update-listing.dto';
import { User } from '../users/user.entity';
import { PromotionTier } from './enums/listing.enums';
import { ListingContactLog } from './listing-contact-log.entity';
import { SavedSearchesService } from '../saved-searches/saved-searches.service';
export declare class ListingsService {
    private listingsRepository;
    private usersRepository;
    private contactLogsRepository;
    private savedSearchesService;
    constructor(listingsRepository: Repository<Listing>, usersRepository: Repository<User>, contactLogsRepository: Repository<ListingContactLog>, savedSearchesService: SavedSearchesService);
    handleExpiredAndPromotedListings(): Promise<void>;
    private checkUserQuota;
    findAll(query: QueryListingDto): Promise<{
        items: Listing[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    findOne(id: string): Promise<Listing>;
    incrementShares(id: string): Promise<Listing>;
    revealPhoneContact(id: string, viewerUser?: any, reqIp?: string, userAgent?: string): Promise<{
        phone: string;
        ownerName: string;
        revealsCount: number;
    }>;
    getContactAuditLogs(id: string, currentUser: any): Promise<ListingContactLog[]>;
    create(createListingDto: CreateListingDto, user: User): Promise<Listing>;
    close(id: string, user: User): Promise<Listing>;
    findMyListings(user: User): Promise<Listing[]>;
    update(id: string, updateDto: UpdateListingDto, user: User): Promise<Listing>;
    remove(id: string, user: User): Promise<{
        deleted: boolean;
    }>;
    renew(id: string, user: User): Promise<Listing>;
    publish(id: string, user: User): Promise<Listing>;
    promote(id: string, user: User, tier?: PromotionTier, durationDays?: number): Promise<Listing>;
}
