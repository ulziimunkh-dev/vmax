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
var SavedSearchesService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SavedSearchesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const schedule_1 = require("@nestjs/schedule");
const saved_search_entity_1 = require("./saved-search.entity");
let SavedSearchesService = SavedSearchesService_1 = class SavedSearchesService {
    savedSearchesRepository;
    logger = new common_1.Logger(SavedSearchesService_1.name);
    constructor(savedSearchesRepository) {
        this.savedSearchesRepository = savedSearchesRepository;
    }
    async handleExpiredSearchAlerts() {
        const now = new Date();
        await this.savedSearchesRepository
            .createQueryBuilder()
            .update(saved_search_entity_1.SavedSearch)
            .set({ isActive: false })
            .where('expiresAt <= :now AND isActive = true', { now })
            .execute();
        this.logger.log('🧹 Cleaned up expired 7-day search alert subscriptions');
    }
    async create(data) {
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);
        const savedSearch = this.savedSearchesRepository.create({
            userId: data.userId,
            email: data.email,
            title: data.title || 'Тохируулсан хайлтын мэдэгдэл',
            filters: data.filters,
            isEmailAlert: data.isEmailAlert ?? true,
            isActive: true,
            isTriggered: false,
            expiresAt,
        });
        return this.savedSearchesRepository.save(savedSearch);
    }
    async findByUserId(userId) {
        return this.savedSearchesRepository.find({
            where: { userId },
            order: { createdAt: 'DESC' },
        });
    }
    async delete(id, userId) {
        if (userId) {
            return this.savedSearchesRepository.delete({ id, userId });
        }
        return this.savedSearchesRepository.delete({ id });
    }
    async checkAndNotifyMatchingSearches(listing) {
        try {
            const now = new Date();
            const activeSavedSearches = await this.savedSearchesRepository
                .createQueryBuilder('alert')
                .where('alert.isActive = true')
                .andWhere('alert.isTriggered = false')
                .andWhere('(alert.expiresAt IS NULL OR alert.expiresAt >= :now)', { now })
                .getMany();
            if (activeSavedSearches.length === 0)
                return;
            const matchingAlerts = [];
            for (const alert of activeSavedSearches) {
                const f = alert.filters || {};
                const listingPrice = Number(listing.price);
                if (f.type && listing.type && f.type.toLowerCase() !== listing.type.toLowerCase()) {
                    continue;
                }
                if (f.category && listing.category && f.category.toLowerCase() !== listing.category.toLowerCase()) {
                    continue;
                }
                if (f.district && listing.district && !listing.district.toLowerCase().includes(f.district.toLowerCase())) {
                    continue;
                }
                if (f.khoroo && listing.khoroo && !listing.khoroo.toLowerCase().includes(f.khoroo.toLowerCase())) {
                    continue;
                }
                if (f.priceMin && listingPrice < Number(f.priceMin)) {
                    continue;
                }
                if (f.priceMax && listingPrice > Number(f.priceMax)) {
                    continue;
                }
                if (f.areaMin && Number(listing.areaSqm) < Number(f.areaMin)) {
                    continue;
                }
                if (f.areaMax && Number(listing.areaSqm) > Number(f.areaMax)) {
                    continue;
                }
                const attrs = listing.attributes || {};
                const listingBedrooms = attrs.bedrooms || attrs.rooms || 0;
                if (f.bedrooms && listingBedrooms < Number(f.bedrooms)) {
                    continue;
                }
                if (f.bathrooms && (attrs.bathrooms || 0) < Number(f.bathrooms)) {
                    continue;
                }
                if (f.yearBuiltMin && (attrs.yearBuilt || 0) < Number(f.yearBuiltMin)) {
                    continue;
                }
                if (f.constructionType && attrs.constructionType) {
                    if (!attrs.constructionType.toLowerCase().includes(f.constructionType.toLowerCase())) {
                        continue;
                    }
                }
                if (f.query) {
                    const q = f.query.toLowerCase();
                    const matchTitle = listing.title.toLowerCase().includes(q);
                    const matchDesc = listing.description?.toLowerCase().includes(q);
                    if (!matchTitle && !matchDesc)
                        continue;
                }
                matchingAlerts.push(alert);
            }
            if (matchingAlerts.length > 0) {
                this.logger.log(`🔔 Found ${matchingAlerts.length} matching search alerts for new listing "${listing.title}" (ID: ${listing.id})`);
                for (const alert of matchingAlerts) {
                    const recipient = alert.email || `User #${alert.userId}`;
                    this.logger.log(`📧 [INSTANT SINGLE ALERT SENT] Notified ${recipient}: New property match "${listing.title}" (${listing.price} ₮)`);
                    alert.isTriggered = true;
                    alert.isActive = false;
                    await this.savedSearchesRepository.save(alert);
                }
            }
        }
        catch (error) {
            this.logger.error(`Failed to check saved search alerts: ${error.message}`);
        }
    }
};
exports.SavedSearchesService = SavedSearchesService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_DAY_AT_MIDNIGHT),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SavedSearchesService.prototype, "handleExpiredSearchAlerts", null);
exports.SavedSearchesService = SavedSearchesService = SavedSearchesService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(saved_search_entity_1.SavedSearch)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], SavedSearchesService);
//# sourceMappingURL=saved-searches.service.js.map