import { ListingsService } from './listings.service';
import { CreateListingDto } from './dto/create-listing.dto';
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
    create(createListingDto: CreateListingDto, user: User): Promise<import("./listing.entity").Listing>;
    update(id: string, updateListingDto: UpdateListingDto, user: User): Promise<import("./listing.entity").Listing>;
    remove(id: string, user: User): Promise<{
        deleted: boolean;
    }>;
    close(id: string, user: User): Promise<import("./listing.entity").Listing>;
    renew(id: string, user: User): Promise<import("./listing.entity").Listing>;
    publish(id: string, user: User): Promise<import("./listing.entity").Listing>;
}
