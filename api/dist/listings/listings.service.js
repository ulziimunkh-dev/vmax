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
const listing_entity_1 = require("./listing.entity");
const listing_enums_1 = require("./enums/listing.enums");
let ListingsService = class ListingsService {
    listingsRepository;
    constructor(listingsRepository) {
        this.listingsRepository = listingsRepository;
    }
    async findAll(query) {
        const { type, category, location, priceMin, priceMax, areaMin, areaMax } = query;
        const page = query.page ?? 1;
        const limit = query.limit ?? 12;
        const queryBuilder = this.listingsRepository.createQueryBuilder('listing');
        queryBuilder.where('listing.status = :status', { status: listing_enums_1.ListingStatus.ACTIVE });
        if (type)
            queryBuilder.andWhere('listing.type = :type', { type });
        if (category)
            queryBuilder.andWhere('listing.category = :category', { category });
        if (location)
            queryBuilder.andWhere('listing.location ILIKE :location', { location: `%${location}%` });
        if (priceMin !== undefined)
            queryBuilder.andWhere('listing.price >= :priceMin', { priceMin });
        if (priceMax !== undefined)
            queryBuilder.andWhere('listing.price <= :priceMax', { priceMax });
        if (areaMin !== undefined)
            queryBuilder.andWhere('listing.areaSqm >= :areaMin', { areaMin });
        if (areaMax !== undefined)
            queryBuilder.andWhere('listing.areaSqm <= :areaMax', { areaMax });
        queryBuilder.orderBy('listing.createdAt', 'DESC');
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
        return listing;
    }
    async create(createListingDto, user) {
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);
        const listing = this.listingsRepository.create({
            ...createListingDto,
            user,
            expiresAt,
        });
        return this.listingsRepository.save(listing);
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
        listing.expiresAt.setDate(listing.expiresAt.getDate() + 7);
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
            listing.status = listing_enums_1.ListingStatus.ACTIVE;
            listing.expiresAt = new Date();
            listing.expiresAt.setDate(listing.expiresAt.getDate() + 7);
        }
        return this.listingsRepository.save(listing);
    }
};
exports.ListingsService = ListingsService;
exports.ListingsService = ListingsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(listing_entity_1.Listing)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], ListingsService);
//# sourceMappingURL=listings.service.js.map