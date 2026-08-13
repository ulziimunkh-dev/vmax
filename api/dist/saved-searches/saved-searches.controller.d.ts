import { SavedSearchesService } from './saved-searches.service';
export declare class SavedSearchesController {
    private readonly savedSearchesService;
    constructor(savedSearchesService: SavedSearchesService);
    create(body: {
        userId?: string;
        email?: string;
        title?: string;
        filters: {
            query?: string;
            type?: string;
            category?: string;
            district?: string;
            priceMin?: number;
            priceMax?: number;
        };
        isEmailAlert?: boolean;
    }): Promise<import("./saved-search.entity").SavedSearch>;
    getMySavedSearches(user: any): Promise<import("./saved-search.entity").SavedSearch[]>;
    delete(id: string, user: any): Promise<import("typeorm").DeleteResult>;
}
