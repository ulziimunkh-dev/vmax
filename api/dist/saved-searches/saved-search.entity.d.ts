export declare class SavedSearch {
    id: string;
    userId?: string;
    email?: string;
    title: string;
    filters: {
        query?: string;
        type?: string;
        category?: string;
        district?: string;
        khoroo?: string;
        priceMin?: number;
        priceMax?: number;
        areaMin?: number;
        areaMax?: number;
        bedrooms?: number;
        bathrooms?: number;
        yearBuiltMin?: number;
        constructionType?: string;
    };
    isEmailAlert: boolean;
    isTriggered: boolean;
    isActive: boolean;
    expiresAt: Date;
    createdAt: Date;
}
