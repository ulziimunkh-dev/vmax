import { ListingType, ListingCategory } from '../enums/listing.enums';
export declare class QueryListingDto {
    type?: ListingType;
    category?: ListingCategory;
    location?: string;
    khoroo?: string;
    sortBy?: string;
    priceMin?: number;
    priceMax?: number;
    areaMin?: number;
    areaMax?: number;
    bedrooms?: number;
    bathrooms?: number;
    yearBuiltMin?: number;
    constructionType?: string;
    page?: number;
    limit?: number;
}
