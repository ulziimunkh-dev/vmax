import { SubscriptionsService } from './subscriptions.service';
import { User } from '../users/user.entity';
import { SubscriptionTier } from '../users/enums/user.enums';
export declare class SubscriptionsController {
    private readonly subscriptionsService;
    constructor(subscriptionsService: SubscriptionsService);
    getPlans(): import("./subscriptions.service").SubscriptionPlan[];
    getStatus(user: User): Promise<{
        tier: SubscriptionTier;
        activeListingsCount: number;
        listingLimit: number;
        subscriptionExpiresAt: Date | undefined;
        isVerifiedAgent: boolean;
    }>;
    upgrade(body: {
        tier: SubscriptionTier;
        durationMonths?: number;
    }, user: User): Promise<{
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
