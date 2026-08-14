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
exports.ListingsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const schedule_1 = require("@nestjs/schedule");
const listing_entity_1 = require("./listing.entity");
const user_entity_1 = require("../users/user.entity");
const listing_enums_1 = require("./enums/listing.enums");
const user_enums_1 = require("../users/enums/user.enums");
const listing_contact_log_entity_1 = require("./listing-contact-log.entity");
const saved_searches_service_1 = require("../saved-searches/saved-searches.service");
let ListingsService = class ListingsService {
    listingsRepository;
    usersRepository;
    contactLogsRepository;
    savedSearchesService;
    constructor(listingsRepository, usersRepository, contactLogsRepository, savedSearchesService) {
        this.listingsRepository = listingsRepository;
        this.usersRepository = usersRepository;
        this.contactLogsRepository = contactLogsRepository;
        this.savedSearchesService = savedSearchesService;
    }
    async handleExpiredAndPromotedListings() {
        const now = new Date();
        await this.listingsRepository
            .createQueryBuilder()
            .update(listing_entity_1.Listing)
            .set({ status: listing_enums_1.ListingStatus.EXPIRED })
            .where('expiresAt <= :now AND status = :activeStatus', {
            now,
            activeStatus: listing_enums_1.ListingStatus.ACTIVE,
        })
            .execute();
        await this.listingsRepository
            .createQueryBuilder()
            .update(listing_entity_1.Listing)
            .set({ isPromoted: false, promotionTier: listing_enums_1.PromotionTier.STANDARD })
            .where('promotedUntil <= :now AND isPromoted = true', { now })
            .execute();
    }
    async checkUserQuota(user) {
        const freshUser = await this.usersRepository.findOne({ where: { id: user.id } });
        const tier = freshUser?.subscriptionTier || user_enums_1.SubscriptionTier.FREE;
        const limit = user_enums_1.SUBSCRIPTION_LIMITS[tier] || 3;
        const activeCount = await this.listingsRepository.count({
            where: { userId: user.id, status: listing_enums_1.ListingStatus.ACTIVE },
        });
        if (activeCount >= limit) {
            throw new common_1.ForbiddenException(`Зарын хязгаар хэтэрсэн байна. Таны (${tier}) багцын зөвшөөрөгдөх идэвхтэй зарын хязгаар ${limit} байна. Та багцаа ахиулна уу.`);
        }
    }
    async findAll(query) {
        const { type, category, location, priceMin, priceMax, areaMin, areaMax, sortBy } = query;
        const page = query.page ?? 1;
        const limit = query.limit ?? 50;
        const queryBuilder = this.listingsRepository.createQueryBuilder('listing');
        queryBuilder.leftJoinAndSelect('listing.user', 'user');
        queryBuilder.where('listing.status = :status', { status: listing_enums_1.ListingStatus.ACTIVE });
        if (type)
            queryBuilder.andWhere('listing.type = :type', { type });
        if (category)
            queryBuilder.andWhere('listing.category = :category', { category });
        if (location)
            queryBuilder.andWhere('(listing.location ILIKE :location OR listing.district ILIKE :location OR listing.khoroo ILIKE :location)', { location: `%${location}%` });
        if (query.khoroo)
            queryBuilder.andWhere('listing.khoroo ILIKE :khoroo', { khoroo: `%${query.khoroo}%` });
        if (priceMin !== undefined)
            queryBuilder.andWhere('listing.price >= :priceMin', { priceMin });
        if (priceMax !== undefined)
            queryBuilder.andWhere('listing.price <= :priceMax', { priceMax });
        if (areaMin !== undefined)
            queryBuilder.andWhere('listing.areaSqm >= :areaMin', { areaMin });
        if (areaMax !== undefined)
            queryBuilder.andWhere('listing.areaSqm <= :areaMax', { areaMax });
        if (query.bedrooms !== undefined) {
            queryBuilder.andWhere("CAST(listing.attributes->>'bedrooms' AS INTEGER) >= :bedrooms", { bedrooms: query.bedrooms });
        }
        if (query.bathrooms !== undefined) {
            queryBuilder.andWhere("CAST(listing.attributes->>'bathrooms' AS INTEGER) >= :bathrooms", { bathrooms: query.bathrooms });
        }
        if (query.yearBuiltMin !== undefined) {
            queryBuilder.andWhere("CAST(listing.attributes->>'yearBuilt' AS INTEGER) >= :yearBuiltMin", { yearBuiltMin: query.yearBuiltMin });
        }
        if (query.constructionType) {
            queryBuilder.andWhere("listing.attributes->>'constructionType' ILIKE :constructionType", { constructionType: `%${query.constructionType}%` });
        }
        if (query.search) {
            queryBuilder.andWhere('(listing.title ILIKE :search OR listing.description ILIKE :search)', { search: `%${query.search}%` });
        }
        if (sortBy === 'views') {
            queryBuilder.orderBy('listing.viewsCount', 'DESC');
        }
        else if (sortBy === 'mostShared') {
            queryBuilder.orderBy('listing.sharesCount', 'DESC');
        }
        else if (sortBy === 'priceAsc') {
            queryBuilder.orderBy('listing.price', 'ASC');
        }
        else if (sortBy === 'priceDesc') {
            queryBuilder.orderBy('listing.price', 'DESC');
        }
        else {
            queryBuilder.orderBy('listing.isPromoted', 'DESC');
            queryBuilder.addOrderBy('listing.createdAt', 'DESC');
        }
        const [items, total] = await queryBuilder
            .skip((page - 1) * limit)
            .take(limit)
            .getManyAndCount();
        return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
    }
    async findOne(id) {
        const listing = await this.listingsRepository.findOne({
            where: { id },
            relations: { user: true },
        });
        if (!listing) {
            throw new common_1.NotFoundException('Listing not found');
        }
        listing.viewsCount = (listing.viewsCount || 0) + 1;
        await this.listingsRepository.save(listing);
        return listing;
    }
    async incrementShares(id) {
        const listing = await this.listingsRepository.findOne({ where: { id } });
        if (!listing) {
            throw new common_1.NotFoundException('Listing not found');
        }
        listing.sharesCount = (listing.sharesCount || 0) + 1;
        return this.listingsRepository.save(listing);
    }
    async revealPhoneContact(id, viewerUser, reqIp, userAgent) {
        const listing = await this.listingsRepository.findOne({
            where: { id },
            relations: { user: true },
        });
        if (!listing) {
            throw new common_1.NotFoundException('Listing not found');
        }
        listing.phoneRevealsCount = (listing.phoneRevealsCount || 0) + 1;
        await this.listingsRepository.save(listing);
        const log = this.contactLogsRepository.create({
            listingId: id,
            viewerUserId: viewerUser?.id,
            viewerIp: reqIp || '127.0.0.1',
            userAgent,
        });
        await this.contactLogsRepository.save(log);
        return {
            phone: listing.user?.phone || '99110000',
            ownerName: listing.user?.name || 'Зар байршуулагч',
            revealsCount: listing.phoneRevealsCount,
        };
    }
    async getContactAuditLogs(id, currentUser) {
        const listing = await this.findOne(id);
        if (listing.userId !== currentUser.id) {
            throw new common_1.ForbiddenException('You can only view audit logs for your own listing');
        }
        return this.contactLogsRepository.find({
            where: { listingId: id },
            order: { createdAt: 'DESC' },
            take: 50,
        });
    }
    async create(createListingDto, user) {
        await this.checkUserQuota(user);
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30);
        const listing = this.listingsRepository.create({
            ...createListingDto,
            user,
            expiresAt,
        });
        const savedListing = await this.listingsRepository.save(listing);
        this.savedSearchesService.checkAndNotifyMatchingSearches(savedListing);
        return savedListing;
    }
    async close(id, user) {
        const listing = await this.findOne(id);
        if (listing.userId !== user.id) {
            throw new common_1.ForbiddenException('You can only close your own listings');
        }
        listing.status = listing_enums_1.ListingStatus.CLOSED;
        return this.listingsRepository.save(listing);
    }
    async findMyListings(user) {
        return this.listingsRepository.find({ where: { userId: user.id }, order: { createdAt: 'DESC' } });
    }
    async update(id, updateDto, user) {
        const listing = await this.findOne(id);
        if (listing.userId !== user.id) {
            throw new common_1.ForbiddenException('You can only edit your own listings');
        }
        Object.assign(listing, updateDto);
        return this.listingsRepository.save(listing);
    }
    async remove(id, user) {
        const listing = await this.findOne(id);
        if (listing.userId !== user.id) {
            throw new common_1.ForbiddenException('You can only delete your own listings');
        }
        await this.listingsRepository.remove(listing);
        return { deleted: true };
    }
    async renew(id, user) {
        const listing = await this.findOne(id);
        if (listing.userId !== user.id) {
            throw new common_1.ForbiddenException('You can only renew your own listings');
        }
        listing.status = listing_enums_1.ListingStatus.ACTIVE;
        listing.expiresAt = new Date();
        listing.expiresAt.setDate(listing.expiresAt.getDate() + 30);
        return this.listingsRepository.save(listing);
    }
    async publish(id, user) {
        const listing = await this.findOne(id);
        if (listing.userId !== user.id) {
            throw new common_1.ForbiddenException('You can only publish your own listings');
        }
        if (listing.status === listing_enums_1.ListingStatus.ACTIVE) {
            listing.status = listing_enums_1.ListingStatus.CLOSED;
        }
        else {
            await this.checkUserQuota(user);
            listing.status = listing_enums_1.ListingStatus.ACTIVE;
            listing.expiresAt = new Date();
            listing.expiresAt.setDate(listing.expiresAt.getDate() + 30);
        }
        return this.listingsRepository.save(listing);
    }
    async promote(id, user, tier = listing_enums_1.PromotionTier.VIP, durationDays = 7) {
        const listing = await this.findOne(id);
        if (listing.userId !== user.id) {
            throw new common_1.ForbiddenException('You can only promote your own listings');
        }
        listing.isPromoted = tier !== listing_enums_1.PromotionTier.STANDARD;
        listing.promotionTier = tier;
        const promotedUntil = new Date();
        promotedUntil.setDate(promotedUntil.getDate() + durationDays);
        listing.promotedUntil = promotedUntil;
        return this.listingsRepository.save(listing);
    }
};
exports.ListingsService = ListingsService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_HOUR),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ListingsService.prototype, "handleExpiredAndPromotedListings", null);
exports.ListingsService = ListingsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(listing_entity_1.Listing)),
    __param(1, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(2, (0, typeorm_1.InjectRepository)(listing_contact_log_entity_1.ListingContactLog)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        saved_searches_service_1.SavedSearchesService])
], ListingsService);
//# sourceMappingURL=listings.service.js.map