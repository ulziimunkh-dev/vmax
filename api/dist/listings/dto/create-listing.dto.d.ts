import { ListingType, ListingCategory } from '../enums/listing.enums';
export declare class CreateListingDto {
    title: string;
    description: string;
    type: ListingType;
    category: ListingCategory;
    price: number;
    location: string;
    district: string;
    areaSqm: number;
    attributes?: Record<string, any>;
    images?: string[];
}
