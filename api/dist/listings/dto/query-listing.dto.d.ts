import { ListingType, ListingCategory } from '../enums/listing.enums';
export declare class QueryListingDto {
    type?: ListingType;
    category?: ListingCategory;
    location?: string;
    priceMin?: number;
    priceMax?: number;
    areaMin?: number;
    areaMax?: number;
    page?: number;
    limit?: number;
}
