import { Repository } from 'typeorm';
import { User } from '../users/user.entity';
import { Listing } from '../listings/listing.entity';
import { SubscriptionTier } from '../users/enums/user.enums';
export interface SubscriptionPlan {
    id: SubscriptionTier;
    name: string;
    priceMnt: number;
    period: string;
    listingLimit: number;
    features: string[];
    recommended?: boolean;
}
export declare class SubscriptionsService {
    private usersRepository;
    private listingsRepository;
    constructor(usersRepository: Repository<User>, listingsRepository: Repository<Listing>);
    getPlans(): SubscriptionPlan[];
    getStatus(user: User): Promise<{
        tier: SubscriptionTier;
        activeListingsCount: number;
        listingLimit: number;
        subscriptionExpiresAt: Date | undefined;
        isVerifiedAgent: boolean;
    }>;
    upgrade(user: User, tier: SubscriptionTier, durationMonths?: number): Promise<{
        success: boolean;
        message: string;
        user: {
            id: string;
            subscriptionTier: SubscriptionTier;
            subscriptionExpiresAt: Date;
            isVerifiedAgent: boolean;
        };
    }>;
}
