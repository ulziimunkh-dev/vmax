import { Repository } from 'typeorm';
import { Listing } from './listing.entity';
import { CreateListingDto } from './dto/create-listing.dto';
import { QueryListingDto } from './dto/query-listing.dto';
import { UpdateListingDto } from './dto/update-listing.dto';
import { User } from '../users/user.entity';
export declare class ListingsService {
    private listingsRepository;
    constructor(listingsRepository: Repository<Listing>);
    findAll(query: QueryListingDto): Promise<{
        items: Listing[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    findOne(id: string): Promise<Listing>;
    create(createListingDto: CreateListingDto, user: User): Promise<Listing>;
    close(id: string, user: User): Promise<Listing>;
    findMyListings(user: User): Promise<Listing[]>;
    update(id: string, updateDto: UpdateListingDto, user: User): Promise<Listing>;
    remove(id: string, user: User): Promise<{
        deleted: boolean;
    }>;
    renew(id: string, user: User): Promise<Listing>;
    publish(id: string, user: User): Promise<Listing>;
}
