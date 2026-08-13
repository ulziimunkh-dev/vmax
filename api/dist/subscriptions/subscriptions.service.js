"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("../users/user.entity");
const listing_entity_1 = require("../listings/listing.entity");
const listing_enums_1 = require("../listings/enums/listing.enums");
const user_enums_1 = require("../users/enums/user.enums");
let SubscriptionsService = class SubscriptionsService {
    usersRepository;
    listingsRepository;
    constructor(usersRepository, listingsRepository) {
        this.usersRepository = usersRepository;
        this.listingsRepository = listingsRepository;
    }
    getPlans() {
        return [
            {
                id: user_enums_1.SubscriptionTier.FREE,
                name: 'Энгийн (Free)',
                priceMnt: 0,
                period: 'Төлбөргүй',
                listingLimit: user_enums_1.SUBSCRIPTION_LIMITS[user_enums_1.SubscriptionTier.FREE],
                features: [
                    '3 хүртэлх идэвхтэй зарын лимит',
                    'Стандарт хайлтын илэрц',
                    'Шууд чат & утасны холбоос',
                ],
            },
            {
                id: user_enums_1.SubscriptionTier.PRO_AGENT,
                name: 'Pro Agent',
                priceMnt: 49000,
                period: 'сар бүр',
                listingLimit: user_enums_1.SUBSCRIPTION_LIMITS[user_enums_1.SubscriptionTier.PRO_AGENT],
                recommended: true,
                features: [
                    '30 хүртэлх идэвхтэй зарын лимит',
                    'Баталгаажсан Риэлтор (Verified Agent) тэмдэг',
                    'Агентын бие даасан профайл хуудас',
                    'Зарын үзэлт & хандалтын аналитик',
                    'Тэргүүн дараалалд эрэмбэлэгдэх боломж',
                ],
            },
            {
                id: user_enums_1.SubscriptionTier.AGENCY,
                name: 'Agency (Үл хөдлөхийн агентлаг)',
                priceMnt: 199000,
                period: 'сар бүр',
                listingLimit: user_enums_1.SUBSCRIPTION_LIMITS[user_enums_1.SubscriptionTier.AGENCY],
                features: [
                    'Хязгааргүй идэвхтэй зарын лимит',
                    'Агентлагийн нэгдсэн лого & профайл',
                    'Олон агентын дэд хаяг удирдлага',
                    'Шууд VIP зарын хөнгөлөлт',
                    '24/7 Тэргүүлэх дэмжлэг & зөвлөгөө',
                ],
            },
        ];
    }
    async getStatus(user) {
        const freshUser = await this.usersRepository.findOne({ where: { id: user.id } });
        if (!freshUser) {
            throw new common_1.NotFoundException('Хэрэглэгч олдсонгүй');
        }
        const activeListingsCount = await this.listingsRepository.count({
            where: { userId: user.id, status: listing_enums_1.ListingStatus.ACTIVE },
        });
        const currentTier = freshUser.subscriptionTier || user_enums_1.SubscriptionTier.FREE;
        const limit = user_enums_1.SUBSCRIPTION_LIMITS[currentTier] || 3;
        return {
            tier: currentTier,
            activeListingsCount,
            listingLimit: limit,
            subscriptionExpiresAt: freshUser.subscriptionExpiresAt,
            isVerifiedAgent: freshUser.isVerifiedAgent,
        };
    }
    async upgrade(user, tier, durationMonths = 1) {
        const freshUser = await this.usersRepository.findOne({ where: { id: user.id } });
        if (!freshUser) {
            throw new common_1.NotFoundException('Хэрэглэгч олдсонгүй');
        }
        freshUser.subscriptionTier = tier;
        const expires = new Date();
        expires.setMonth(expires.getMonth() + durationMonths);
        freshUser.subscriptionExpiresAt = expires;
        if (tier === user_enums_1.SubscriptionTier.PRO_AGENT || tier === user_enums_1.SubscriptionTier.AGENCY) {
            freshUser.isVerifiedAgent = true;
        }
        await this.usersRepository.save(freshUser);
        return {
            success: true,
            message: `Таны эрх амжилттай ${tier} багц болж шинэчлэгдлээ.`,
            user: {
                id: freshUser.id,
                subscriptionTier: freshUser.subscriptionTier,
                subscriptionExpiresAt: freshUser.subscriptionExpiresAt,
                isVerifiedAgent: freshUser.isVerifiedAgent,
            },
        };
    }
};
exports.SubscriptionsService = SubscriptionsService;
exports.SubscriptionsService = SubscriptionsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(listing_entity_1.Listing)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], SubscriptionsService);
//# sourceMappingURL=subscriptions.service.js.map