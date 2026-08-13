import { Repository } from 'typeorm';
import { SavedSearch } from './saved-search.entity';
import { Listing } from '../listings/listing.entity';
export declare class SavedSearchesService {
    private savedSearchesRepository;
    private readonly logger;
    constructor(savedSearchesRepository: Repository<SavedSearch>);
    handleExpiredSearchAlerts(): Promise<void>;
    create(data: {
        userId?: string;
        email?: string;
        title?: string;
        filters: any;
        isEmailAlert?: boolean;
    }): Promise<SavedSearch>;
    findByUserId(userId: string): Promise<SavedSearch[]>;
    delete(id: string, userId?: string): Promise<import("typeorm").DeleteResult>;
    checkAndNotifyMatchingSearches(listing: Listing): Promise<void>;
}
